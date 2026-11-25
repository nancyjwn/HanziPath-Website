
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from flask import Blueprint, request, jsonify
from sqlalchemy import func, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.daily_word import DailyWord
from app.models.hsk_word import HskWord


daily_word_bp = Blueprint(
    "daily_word",
    __name__,
    url_prefix="/api/v1/daily-words"
)


def get_makassar_date():
    """Mengambil tanggal berdasarkan zona waktu Makassar (WITA)."""
    return datetime.now(ZoneInfo("Asia/Makassar")).date()


def ensure_daily_words(target_date):
    """
    Memastikan tersedia 3 kosakata HSK 1-6 untuk tanggal tertentu.

    Kosakata yang digunakan dalam 30 hari terakhir tidak boleh
    dipilih kembali.
    """

    try:
        # Mengunci proses pembentukan kata harian agar request
        # bersamaan tidak membuat data ganda.
        db.session.execute(
            text("SELECT pg_advisory_xact_lock(20261107)")
        )

        existing_words = (
            DailyWord.query
            .filter_by(tanggal=target_date)
            .all()
        )

        if len(existing_words) >= 3:
            return

        used_hsk_ids = {
            item.hsk_word_id
            for item in existing_words
        }

        used_orders = {
            item.urutan
            for item in existing_words
        }

        missing_orders = [
            order for order in [1, 2, 3]
            if order not in used_orders
        ]

        # Mengambil ID kosakata yang telah digunakan
        # selama 30 hari terakhir sebelum tanggal target.
        start_date = target_date - timedelta(days=30)

        recent_hsk_ids = (
            db.session.query(DailyWord.hsk_word_id)
            .filter(
                DailyWord.tanggal >= start_date,
                DailyWord.tanggal <= target_date
            )
            .distinct()
            .all()
        )

        excluded_ids = {
            row[0] for row in recent_hsk_ids
        }

        excluded_ids.update(used_hsk_ids)

        # Memilih kosakata yang belum digunakan dalam
        # rentang 30 hari terakhir.
        candidates = (
            HskWord.query
            .filter(~HskWord.id.in_(excluded_ids))
            .order_by(func.random())
            .limit(len(missing_orders))
            .all()
        )

        if len(candidates) < len(missing_orders):
            raise ValueError(
                "Jumlah kosakata yang tersedia tidak mencukupi."
            )

        for order, hsk_word in zip(missing_orders, candidates):
            db.session.add(
                DailyWord(
                    tanggal=target_date,
                    hsk_word_id=hsk_word.id,
                    urutan=order
                )
            )

        db.session.commit()

    except Exception:
        db.session.rollback()
        raise


def format_daily_words(target_date):
    """Mengambil dan memformat tiga kosakata harian."""

    ensure_daily_words(target_date)

    daily_words = (
        DailyWord.query
        .options(
            joinedload(DailyWord.hsk_word)
            .joinedload(HskWord.dictionary_entry)
        )
        .filter(DailyWord.tanggal == target_date)
        .order_by(DailyWord.urutan.asc())
        .all()
    )

    data = []

    for item in daily_words:
        hsk = item.hsk_word
        entry = hsk.dictionary_entry

        data.append({
            "id": entry.id,
            "daily_word_id": item.id,
            "hsk_id": hsk.id,
            "level": hsk.level,
            "urutan": item.urutan,
            "simplified": entry.simplified,
            "traditional": entry.traditional,
            "pinyin_display": entry.pinyin_display,
            "pinyin_numbered": entry.pinyin_numbered,
            "meanings": entry.meanings or []
        })

    return jsonify({
        "status": "success",
        "tanggal": target_date.isoformat(),
        "total": len(data),
        "data": data
    }), 200


def handle_daily_words(target_date):
    """Menangani pengambilan data kata harian."""

    try:
        return format_daily_words(target_date)

    except ValueError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan database saat mengambil kata harian."
        }), 500

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Terjadi kesalahan saat memproses kata harian."
        }), 500


# GET: Menampilkan kata harian berdasarkan tanggal
@daily_word_bp.route("", methods=["GET"])
def get_daily_words():

    tanggal_param = request.args.get("tanggal")

    if tanggal_param:
        try:
            target_date = datetime.strptime(
                tanggal_param, "%Y-%m-%d"
            ).date()

            # Memastikan format tanggal benar-benar YYYY-MM-DD.
            if target_date.isoformat() != tanggal_param:
                raise ValueError

        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Format tanggal harus YYYY-MM-DD."
            }), 400

    else:
        target_date = get_makassar_date()

    return handle_daily_words(target_date)


# GET: Menampilkan tiga kata harian untuk hari ini
@daily_word_bp.route("/today", methods=["GET"])
def get_today_daily_words():

    target_date = get_makassar_date()

    return handle_daily_words(target_date)
