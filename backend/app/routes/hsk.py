
from flask import Blueprint, request, jsonify
from sqlalchemy import or_, func
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.hsk_word import HskWord
from app.models.dictionary_entry import DictionaryEntry


hsk_bp = Blueprint(
    "hsk",
    __name__,
    url_prefix="/api/v1/hsk"
)


def serialize_hsk_word(word):
    entry = word.dictionary_entry

    return {
        "id": entry.id,
        "hsk_id": word.id,
        "level": word.level,
        "simplified": entry.simplified,
        "traditional": entry.traditional,
        "pinyin_display": entry.pinyin_display,
        "pinyin_numbered": entry.pinyin_numbered,
        "meanings": entry.meanings or []
    }


def validate_pagination():
    page_value = request.args.get("page", "1")
    per_page_value = request.args.get("per_page", "20")

    if not page_value.isdigit() or not per_page_value.isdigit():
        return None, None

    page = int(page_value)
    per_page = int(per_page_value)

    if page < 1 or per_page < 1 or per_page > 3000:
        return None, None

    return page, per_page


@hsk_bp.route("/<int:level>", methods=["GET"])
def get_hsk_words(level):

    # Validasi level HSK
    if level < 1 or level > 6:
        return jsonify({
            "status": "error",
            "message": "Level HSK harus berada antara 1 sampai 6."
        }), 400

    # Parameter pencarian
    keyword = request.args.get("q", "").strip()

    if len(keyword) > 100:
        return jsonify({
            "status": "error",
            "message": "Kata pencarian maksimal 100 karakter."
        }), 400

    # Validasi pagination
    page, per_page = validate_pagination()

    if page is None:
        return jsonify({
            "status": "error",
            "message": (
                "Parameter page harus berupa angka minimal 1, "
                "sedangkan per_page harus berupa angka antara 1 sampai 3000."
            )
        }), 400

    try:
        # Query HSK dan kamus
        query = (
            HskWord.query
            .join(
                DictionaryEntry,
                HskWord.entry_id == DictionaryEntry.id
            )
            .filter(HskWord.level == level)
        )

        # Pencarian kosakata
        if keyword:
            search = f"%{keyword}%"
            compact_keyword = "".join(keyword.split())
            compact_search = f"%{compact_keyword}%"

            query = query.filter(
                or_(
                    DictionaryEntry.simplified.ilike(search),
                    DictionaryEntry.traditional.ilike(search),
                    DictionaryEntry.pinyin_display.ilike(search),
                    DictionaryEntry.pinyin_numbered.ilike(search),

                    func.regexp_replace(
                        DictionaryEntry.pinyin_display,
                        r'\s+',
                        '',
                        'g'
                    ).ilike(compact_search),

                    func.regexp_replace(
                        DictionaryEntry.pinyin_numbered,
                        r'\s+',
                        '',
                        'g'
                    ).ilike(compact_search),

                    func.array_to_string(
                        DictionaryEntry.meanings,
                        " "
                    ).ilike(search)
                )
            )

        # Hitung total data
        total = query.count()

        # Ambil data sesuai pagination
        results = (
            query
            .order_by(HskWord.id)
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        total_pages = (total + per_page - 1) // per_page

        return jsonify({
            "status": "success",
            "level": level,
            "data": [
                serialize_hsk_word(word)
                for word in results
            ],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total,
                "total_pages": total_pages
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan saat mengambil data HSK."
        }), 500


@hsk_bp.route("/<int:level>/<int:entry_id>", methods=["GET"])
def get_hsk_word_detail(level, entry_id):

    # Validasi level HSK
    if level < 1 or level > 6:
        return jsonify({
            "status": "error",
            "message": "Level HSK harus berada antara 1 sampai 6."
        }), 400

    if entry_id < 1:
        return jsonify({
            "status": "error",
            "message": "ID kosakata tidak valid."
        }), 400

    try:
        # Cari kosakata berdasarkan level dan dictionary entry ID
        word = (
            HskWord.query
            .filter_by(
                level=level,
                entry_id=entry_id
            )
            .first()
        )

        if not word:
            return jsonify({
                "status": "error",
                "message": "Kosakata tidak ditemukan pada level HSK tersebut."
            }), 404

        return jsonify({
            "status": "success",
            "data": serialize_hsk_word(word)
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan saat mengambil detail kosakata HSK."
        }), 500
