import re
from flask import Blueprint, request, jsonify
from sqlalchemy import or_, func, case, desc, asc
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.dictionary_entry import DictionaryEntry
from app.models.hsk_word import HskWord


dictionary_bp = Blueprint(
    "dictionary",
    __name__,
    url_prefix="/api/v1/dictionary"
)

# Common compound words and typos in English queries
COMPOUNDS = {
    "thankyou": "thank you",
    "howareyou": "how are you",
    "goodmorning": "good morning",
    "goodafternoon": "good afternoon",
    "goodnight": "good night",
    "excuseme": "excuse me",
    "yourewelcome": "you're welcome",
    "youarewelcome": "you are welcome",
    "seeyou": "see you",
    "nevermind": "never mind",
    "allright": "all right",
    "alright": "all right",
}


# ==========================================
# HELPER: FORMAT RESPONS DATA KAMUS
# ==========================================

def serialize_dictionary_entry(entry):
    hsk_level = None
    if entry.hsk_words:
        hsk_level = entry.hsk_words[0].level

    return {
        "id": entry.id,
        "simplified": entry.simplified,
        "traditional": entry.traditional,
        "pinyin_display": entry.pinyin_display,
        "pinyin_numbered": entry.pinyin_numbered,
        "meanings": entry.meanings or [],
        "hsk_level": hsk_level
    }


# ==========================================
# HELPER: VALIDASI PAGINATION
# ==========================================

def validate_pagination():

    page_value = request.args.get("page", "1")
    per_page_value = request.args.get("per_page", "20")

    if not page_value.isdigit() or not per_page_value.isdigit():
        return None, None

    page = int(page_value)
    per_page = int(per_page_value)

    if page < 1 or per_page < 1 or per_page > 100:
        return None, None

    return page, per_page


# ==========================================
# 1. GET DAFTAR / PENCARIAN KAMUS
# ==========================================

@dictionary_bp.route("", methods=["GET"])
def get_dictionary():

    keyword = request.args.get("q", "").strip()

    # Validasi panjang keyword
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
                "sedangkan per_page harus berupa angka antara 1 sampai 100."
            )
        }), 400

    try:
        query = (
            DictionaryEntry.query
            .outerjoin(HskWord, DictionaryEntry.id == HskWord.entry_id)
        )

        if keyword:
            kw = keyword.strip()
            norm_kw = COMPOUNDS.get(kw.lower(), kw)
            search = f"%{norm_kw}%"
            compact_kw = "".join(norm_kw.split()).lower()
            compact_search = f"%{compact_kw}%"

            # Regex aman untuk pencarian di PostgreSQL
            escaped_kw = re.escape(norm_kw)
            regex_meaning_pure = rf'(^|;)\s*{escaped_kw}\s*(;|$)'
            regex_meaning_exact = rf'(^|;)\s*{escaped_kw}(\s*\([^)]*\))?\s*(;|$)'
            regex_meaning_verb = rf'(^|;)\s*to {escaped_kw}(\s*\([^)]*\))?\s*(;|$)'
            regex_starts = rf'(^|;)\s*{escaped_kw}\y'
            regex_word = rf'\m{escaped_kw}\M'

            meaning_str = func.array_to_string(DictionaryEntry.meanings, "; ")
            pinyin_toneless = func.regexp_replace(DictionaryEntry.pinyin_numbered, r"[0-9]+", "", "g")
            pinyin_toneless_compact = func.regexp_replace(pinyin_toneless, r"\s+", "", "g")

            conditions = [
                DictionaryEntry.simplified.ilike(search),
                DictionaryEntry.traditional.ilike(search),
                DictionaryEntry.pinyin_display.ilike(search),
                DictionaryEntry.pinyin_numbered.ilike(search),
                pinyin_toneless.ilike(search),
                pinyin_toneless_compact.ilike(compact_search),
                meaning_str.ilike(search)
            ]
            if kw != norm_kw:
                conditions.append(meaning_str.ilike(f"%{kw}%"))

            query = query.filter(or_(*conditions))

            # -----------------------------------------------------------------
            # PERHITUNGAN SKOR RELEVANSI
            # -----------------------------------------------------------------
            # 1. Kecocokan persis pada Hanzi (Sederhana atau Tradisional)
            score_exact_hanzi = case(
                (DictionaryEntry.simplified == kw, 2500),
                (DictionaryEntry.simplified == norm_kw, 2400),
                (DictionaryEntry.traditional == kw, 2300),
                else_=0
            )

            # 2. Kecocokan pada Pinyin (bernomor/bertanda nada, atau tanpa nada)
            score_pinyin = case(
                (DictionaryEntry.pinyin_display.ilike(kw), 1800),
                (DictionaryEntry.pinyin_numbered.ilike(kw), 1800),
                (pinyin_toneless.ilike(kw), 1000),
                (pinyin_toneless_compact.ilike(compact_kw), 950),
                else_=0
            )

            # 3. Kecocokan pada Arti Bahasa Inggris
            score_meaning = case(
                (meaning_str.op("~*")(regex_meaning_pure), 1800),
                (meaning_str.op("~*")(regex_meaning_exact), 1600),
                (meaning_str.op("~*")(regex_meaning_verb), 1500),
                (meaning_str.op("~*")(regex_starts), 800),
                (meaning_str.op("~*")(regex_word), 400),
                (meaning_str.ilike(search), 100),
                else_=0
            )

            # 4. Bobot Prioritas Kurikulum HSK (Kata dasar sehari-hari muncul lebih awal)
            score_hsk = case(
                (HskWord.level == 1, 500),
                (HskWord.level == 2, 450),
                (HskWord.level == 3, 400),
                (HskWord.level == 4, 350),
                (HskWord.level == 5, 300),
                (HskWord.level == 6, 250),
                else_=0
            )

            total_score = score_exact_hanzi + score_pinyin + score_meaning + score_hsk

            query = query.order_by(
                desc(total_score),
                asc(func.length(DictionaryEntry.simplified)),
                asc(DictionaryEntry.id)
            )

        else:
            # When browsing without search query, filter out number-based entries like '119', '110'
            # and display randomized, genuine Chinese words with HSK priority
            query = query.filter(
                DictionaryEntry.simplified.op('~')(r'^[一-鿿]')
            ).order_by(
                desc(HskWord.id.isnot(None)),
                func.random()
            )

        # Hitung total hasil pencarian
        total = query.count()

        # Ambil data sesuai pagination
        entries = (
            query
            .options(joinedload(DictionaryEntry.hsk_words))
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        total_pages = (total + per_page - 1) // per_page

        return jsonify({
            "status": "success",
            "data": [
                serialize_dictionary_entry(entry)
                for entry in entries
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
            "message": "Terjadi kesalahan saat mengambil data kamus."
        }), 500


# ==========================================
# 2. GET DETAIL KAMUS BERDASARKAN ID
# ==========================================

@dictionary_bp.route("/<int:entry_id>", methods=["GET"])
def get_dictionary_detail(entry_id):

    if entry_id < 1:
        return jsonify({
            "status": "error",
            "message": "ID kosakata tidak valid."
        }), 400

    try:
        entry = (
            DictionaryEntry.query
            .options(joinedload(DictionaryEntry.hsk_words))
            .filter_by(id=entry_id)
            .first()
        )

        if not entry:
            return jsonify({
                "status": "error",
                "message": "Kosakata tidak ditemukan."
            }), 404

        return jsonify({
            "status": "success",
            "data": serialize_dictionary_entry(entry)
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan saat mengambil detail kosakata."
        }), 500
