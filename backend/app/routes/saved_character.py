
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.saved_character import SavedCharacter
from app.models.dictionary_entry import DictionaryEntry


saved_character_bp = Blueprint(
    "saved_character",
    __name__,
    url_prefix="/api/v1/saved-characters"
)


VALID_SOURCES = {
    "pengenalan",
    "kamus",
    "flashcard",
    "hasil_kuis",
    "kata_harian"
}


# =========================================================
# HELPER: VALIDASI IDENTITAS PENGGUNA
# =========================================================

def get_user_id():
    identity = get_jwt_identity()

    try:
        user_id = int(identity)

        if user_id < 1:
            return None

        return user_id

    except (TypeError, ValueError):
        return None


# =========================================================
# HELPER: FORMAT RESPONS ERROR
# =========================================================

def error_response(message, status_code):
    return jsonify({
        "status": "error",
        "message": message
    }), status_code


# =========================================================
# HELPER: FORMAT RESPONS DATA
# =========================================================

def serialize_saved_character(item):
    entry = item.dictionary_entry

    return {
        "id": item.id,
        "entry_id": entry.id,
        "source": item.source,
        "created_at": (
            item.created_at.isoformat()
            if item.created_at else None
        ),
        "simplified": entry.simplified,
        "traditional": entry.traditional,
        "pinyin_display": entry.pinyin_display,
        "pinyin_numbered": entry.pinyin_numbered,
        "meanings": entry.meanings or []
    }


# =========================================================
# 1. GET: MENAMPILKAN KOSAKATA TERSIMPAN
# =========================================================

@saved_character_bp.route("", methods=["GET"])
@jwt_required()
def get_saved_characters():

    user_id = get_user_id()

    if user_id is None:
        return error_response(
            "Identitas pengguna tidak valid.",
            401
        )

    try:
        source = request.args.get("source", "").strip()
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)

        query = (
            SavedCharacter.query
            .options(
                joinedload(SavedCharacter.dictionary_entry)
            )
            .filter_by(user_id=user_id)
        )

        if source:
            if source == "flashcard":
                query = query.filter(SavedCharacter.source.in_(["flashcard", "hasil_kuis"]))
            else:
                query = query.filter(SavedCharacter.source == source)

        query = query.order_by(
            SavedCharacter.created_at.desc(),
            SavedCharacter.id.desc()
        )

        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        data = [
            serialize_saved_character(item)
            for item in pagination.items
        ]

        # Agregasi jumlah kartu per sumber untuk label tab
        counts_by_source = (
            db.session.query(
                SavedCharacter.source,
                func.count(SavedCharacter.id)
            )
            .filter_by(user_id=user_id)
            .group_by(SavedCharacter.source)
            .all()
        )
        counts_dict = {s: int(c) for s, c in counts_by_source}
        total_all = sum(counts_dict.values())

        return jsonify({
            "status": "success",
            "total": pagination.total,
            "data": data,
            "counts": {
                "semua": total_all,
                "pengenalan": counts_dict.get("pengenalan", 0),
                "kamus": counts_dict.get("kamus", 0),
                "flashcard": counts_dict.get("flashcard", 0) + counts_dict.get("hasil_kuis", 0),
                "kata_harian": counts_dict.get("kata_harian", 0),
            },
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_pages": pagination.pages,
                "total_items": pagination.total
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return error_response(
            "Terjadi kesalahan saat mengambil kosakata tersimpan.",
            500
        )


# =========================================================
# 2. POST: MENYIMPAN KOSAKATA
# =========================================================

@saved_character_bp.route("", methods=["POST"])
@jwt_required()
def add_saved_character():

    user_id = get_user_id()

    if user_id is None:
        return error_response(
            "Identitas pengguna tidak valid.",
            401
        )

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error_response(
            "Data harus berupa JSON object.",
            400
        )

    entry_id = data.get("entry_id")
    source = data.get("source")

    # -----------------------------------------------------
    # VALIDASI ENTRY ID
    # -----------------------------------------------------

    if entry_id is None or isinstance(entry_id, bool):
        return error_response(
            "entry_id wajib diisi dan harus berupa angka.",
            400
        )

    try:
        if isinstance(entry_id, str):
            entry_id = entry_id.strip()

        entry_id = int(entry_id)

        if entry_id < 1:
            raise ValueError

    except (ValueError, TypeError, OverflowError):
        return error_response(
            "entry_id harus berupa angka positif.",
            400
        )

    # -----------------------------------------------------
    # VALIDASI SOURCE
    # -----------------------------------------------------

    if not isinstance(source, str):
        return error_response(
            "source wajib diisi.",
            400
        )

    source = source.strip()

    if source not in VALID_SOURCES:
        return jsonify({
            "status": "error",
            "message": "Source tidak valid.",
            "allowed_sources": sorted(VALID_SOURCES)
        }), 400

    # -----------------------------------------------------
    # PROSES PENYIMPANAN
    # -----------------------------------------------------

    try:
        # Periksa keberadaan kosakata.
        entry = db.session.get(
            DictionaryEntry,
            entry_id
        )

        if not entry:
            return error_response(
                "Kosakata tidak ditemukan.",
                404
            )

        # Periksa apakah kosakata sudah tersimpan
        # oleh pengguna yang sedang login.
        existing = SavedCharacter.query.filter_by(
            user_id=user_id,
            entry_id=entry_id
        ).first()

        if existing:
            return error_response(
                "Kosakata sudah tersimpan.",
                409
            )

        saved_character = SavedCharacter(
            user_id=user_id,
            entry_id=entry_id,
            source=source
        )

        db.session.add(saved_character)
        db.session.commit()

        # Muat relasi kamus sebelum serialisasi.
        db.session.refresh(saved_character)

        return jsonify({
            "status": "success",
            "message": "Kosakata berhasil disimpan.",
            "data": serialize_saved_character(saved_character)
        }), 201

    except IntegrityError:
        db.session.rollback()

        return error_response(
            "Kosakata sudah tersimpan atau terdapat konflik data.",
            409
        )

    except SQLAlchemyError:
        db.session.rollback()

        return error_response(
            "Terjadi kesalahan saat menyimpan kosakata.",
            500
        )


# =========================================================
# 3. DELETE: MENGHAPUS KOSAKATA TERSIMPAN
# =========================================================

@saved_character_bp.route(
    "/<int:target_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_saved_character(target_id):

    user_id = get_user_id()

    if user_id is None:
        return error_response(
            "Identitas pengguna tidak valid.",
            401
        )

    if target_id < 1:
        return error_response(
            "ID harus berupa angka positif.",
            400
        )

    try:
        # Mendukung penghapusan dengan ID SavedCharacter maupun ID DictionaryEntry
        saved_character = SavedCharacter.query.filter(
            SavedCharacter.user_id == user_id,
            or_(
                SavedCharacter.id == target_id,
                SavedCharacter.entry_id == target_id
            )
        ).first()

        if not saved_character:
            return error_response(
                "Kosakata tersimpan tidak ditemukan.",
                404
            )

        db.session.delete(saved_character)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Kosakata berhasil dihapus dari daftar tersimpan."
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return error_response(
            "Terjadi kesalahan saat menghapus kosakata.",
            500
        )
