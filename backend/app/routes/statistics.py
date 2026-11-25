from datetime import datetime, timedelta, time
from zoneinfo import ZoneInfo

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, case
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.quiz import QuizSession, QuizSessionQuestion, QuizAnswer
from app.models.card_progress import CardProgress
from app.models.hsk_word import HskWord


statistics_bp = Blueprint(
    "statistics",
    __name__,
    url_prefix="/api/v1/statistics"
)

# Seluruh batas hari dan tanggal statistik menggunakan waktu Makassar (WITA).
WITA = ZoneInfo("Asia/Makassar")


def get_user_id():
    identity = get_jwt_identity()

    try:
        return int(identity)
    except (TypeError, ValueError):
        return None


def error_response(message, status_code):
    return jsonify({
        "status": "error",
        "message": message
    }), status_code


def get_today_range():
    """
    Menghasilkan rentang awal hari ini sampai awal hari berikutnya
    dalam zona waktu Asia/Makassar.
    """
    now = datetime.now(WITA)
    start = datetime.combine(now.date(), time.min, tzinfo=WITA)
    end = start + timedelta(days=1)

    return start, end


def get_answer_statistics_query(user_id):
    """
    Query agregasi jawaban milik satu pengguna.
    Satu QuizAnswer terhubung ke satu QuizSessionQuestion,
    dan setiap pertanyaan terhubung ke satu QuizSession.
    """
    return (
        db.session.query(
            func.count(QuizAnswer.id).label("total_dijawab"),
            func.coalesce(
                func.sum(
                    case((QuizAnswer.benar.is_(True), 1), else_=0)
                ),
                0
            ).label("total_benar"),
            func.coalesce(
                func.sum(
                    case((QuizAnswer.benar.is_(False), 1), else_=0)
                ),
                0
            ).label("total_salah")
        )
        .join(
            QuizSessionQuestion,
            QuizAnswer.session_question_id == QuizSessionQuestion.id
        )
        .join(
            QuizSession,
            QuizSessionQuestion.session_id == QuizSession.id
        )
        .filter(QuizSession.user_id == user_id)
    )


# =========================================================
# 1. OVERVIEW
# =========================================================

@statistics_bp.route("/overview", methods=["GET"])
@jwt_required()
def get_overview():
    user_id = get_user_id()

    if user_id is None:
        return error_response("Identitas pengguna tidak valid.", 401)

    try:
        total_sesi = QuizSession.query.filter_by(
            user_id=user_id,
            status="completed"
        ).count()

        answer_stats = (
            get_answer_statistics_query(user_id)
            .one()
        )

        total_dijawab = int(answer_stats.total_dijawab or 0)
        total_benar = int(answer_stats.total_benar or 0)
        total_salah = int(answer_stats.total_salah or 0)

        akurasi = (
            round((total_benar / total_dijawab) * 100, 2)
            if total_dijawab > 0 else 0
        )

        return jsonify({
            "status": "success",
            "data": {
                "total_sesi_selesai": total_sesi,
                "total_dijawab": total_dijawab,
                "total_benar": total_benar,
                "total_salah": total_salah,
                "akurasi": akurasi
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return error_response(
            "Gagal mengambil statistik pengguna.",
            500
        )


# =========================================================
# 2. DAILY
# =========================================================

@statistics_bp.route("/daily", methods=["GET"])
@jwt_required()
def get_daily_statistics():
    user_id = get_user_id()

    if user_id is None:
        return error_response("Identitas pengguna tidak valid.", 401)

    try:
        start, end = get_today_range()

        stats = (
            get_answer_statistics_query(user_id)
            .filter(
                QuizAnswer.dijawab_pada >= start,
                QuizAnswer.dijawab_pada < end
            )
            .one()
        )

        return jsonify({
            "status": "success",
            "data": {
                "tanggal": start.date().isoformat(),
                "total_dijawab": int(stats.total_dijawab or 0),
                "total_benar": int(stats.total_benar or 0),
                "total_salah": int(stats.total_salah or 0)
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return error_response(
            "Gagal mengambil statistik harian.",
            500
        )


# =========================================================
# 3. WEEKLY
# =========================================================

@statistics_bp.route("/weekly", methods=["GET"])
@jwt_required()
def get_weekly_statistics():
    user_id = get_user_id()

    if user_id is None:
        return error_response("Identitas pengguna tidak valid.", 401)

    try:
        today = datetime.now(WITA).date()
        first_day = today - timedelta(days=6)

        start = datetime.combine(
            first_day,
            time.min,
            tzinfo=WITA
        )
        end = datetime.combine(
            today + timedelta(days=1),
            time.min,
            tzinfo=WITA
        )

        # dijawab_pada bertipe timestamptz di PostgreSQL.
        # Konversi dahulu ke waktu lokal Makassar, lalu ambil tanggalnya.
        local_answer_date = func.date(
            func.timezone("Asia/Makassar", QuizAnswer.dijawab_pada)
        )

        rows = (
            db.session.query(
                local_answer_date.label("tanggal"),
                func.count(QuizAnswer.id).label("total_dijawab"),
                func.coalesce(
                    func.sum(
                        case((QuizAnswer.benar.is_(True), 1), else_=0)
                    ),
                    0
                ).label("total_benar"),
                func.coalesce(
                    func.sum(
                        case((QuizAnswer.benar.is_(False), 1), else_=0)
                    ),
                    0
                ).label("total_salah")
            )
            .join(
                QuizSessionQuestion,
                QuizAnswer.session_question_id == QuizSessionQuestion.id
            )
            .join(
                QuizSession,
                QuizSessionQuestion.session_id == QuizSession.id
            )
            .filter(
                QuizSession.user_id == user_id,
                QuizAnswer.dijawab_pada >= start,
                QuizAnswer.dijawab_pada < end
            )
            # Gunakan ekspresi tanggal lokal yang sama dengan SELECT.
            .group_by(local_answer_date)
            .order_by(local_answer_date)
            .all()
        )

        daily_map = {
            row.tanggal.isoformat(): {
                "total_dijawab": int(row.total_dijawab or 0),
                "total_benar": int(row.total_benar or 0),
                "total_salah": int(row.total_salah or 0)
            }
            for row in rows
        }

        # Selalu kembalikan tepat tujuh tanggal, termasuk hari tanpa aktivitas.
        hasil = []

        for i in range(7):
            tanggal = first_day + timedelta(days=i)
            key = tanggal.isoformat()

            hasil.append({
                "tanggal": key,
                **daily_map.get(key, {
                    "total_dijawab": 0,
                    "total_benar": 0,
                    "total_salah": 0
                })
            })

        return jsonify({
            "status": "success",
            "data": hasil
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return error_response(
            "Gagal mengambil statistik mingguan.",
            500
        )


# =========================================================
# 4. PROGRESS
# =========================================================

@statistics_bp.route("/progress", methods=["GET"])
@statistics_bp.route("/leitner-boxes", methods=["GET"])
@jwt_required()
def get_progress_statistics():
    user_id = get_user_id()

    if user_id is None:
        return error_response("Identitas pengguna tidak valid.", 401)

    try:
        rows = (
            db.session.query(
                CardProgress.box_level,
                func.count(CardProgress.id).label("total_kosakata"),
                func.coalesce(
                    func.sum(CardProgress.jumlah_benar), 0
                ).label("total_benar"),
                func.coalesce(
                    func.sum(CardProgress.jumlah_salah), 0
                ).label("total_salah")
            )
            .filter(CardProgress.user_id == user_id)
            .group_by(CardProgress.box_level)
            .order_by(CardProgress.box_level)
            .all()
        )

        progress_map = {
            int(row.box_level): {
                "total_kosakata": int(row.total_kosakata or 0),
                "total_benar": int(row.total_benar or 0),
                "total_salah": int(row.total_salah or 0)
            }
            for row in rows
        }

        # box_level pada model dibatasi oleh database pada rentang 1–5.
        hasil = []

        for level in range(1, 6):
            hasil.append({
                "box_level": level,
                **progress_map.get(level, {
                    "total_kosakata": 0,
                    "total_benar": 0,
                    "total_salah": 0
                })
            })

        total_kosakata = sum(
            item["total_kosakata"] for item in hasil
        )

        return jsonify({
            "status": "success",
            "data": {
                "total_kosakata_dipelajari": total_kosakata,
                "box_progress": hasil
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return error_response(
            "Gagal mengambil progress belajar.",
            500
        )


# =========================================================
# 5. HISTORY
# =========================================================

@statistics_bp.route("/history", methods=["GET"])
@jwt_required()
def get_quiz_history():
    user_id = get_user_id()

    if user_id is None:
        return error_response("Identitas pengguna tidak valid.", 401)

    try:
        try:
            page = int(request.args.get("page", 1))
            per_page = int(request.args.get("per_page", 10))
        except (TypeError, ValueError):
            return error_response(
                "page dan per_page harus berupa bilangan bulat.",
                400
            )

        if page < 1 or per_page < 1 or per_page > 50:
            return error_response(
                "page minimal 1 dan per_page harus antara 1 sampai 50.",
                400
            )

        query = (
            db.session.query(
                QuizSession,
                func.count(QuizAnswer.id).label("total_dijawab"),
                func.coalesce(
                    func.sum(
                        case((QuizAnswer.benar.is_(True), 1), else_=0)
                    ),
                    0
                ).label("total_benar"),
                func.coalesce(
                    func.sum(
                        case((QuizAnswer.benar.is_(False), 1), else_=0)
                    ),
                    0
                ).label("total_salah")
            )
            .outerjoin(
                QuizSessionQuestion,
                QuizSession.id == QuizSessionQuestion.session_id
            )
            .outerjoin(
                QuizAnswer,
                QuizSessionQuestion.id == QuizAnswer.session_question_id
            )
            .filter(QuizSession.user_id == user_id)
            .group_by(QuizSession.id)
            .order_by(
                QuizSession.started_at.desc(),
                QuizSession.id.desc()
            )
        )

        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        hasil = []

        for session, total_dijawab, total_benar, total_salah in pagination.items:
            total_dijawab = int(total_dijawab or 0)
            total_benar = int(total_benar or 0)
            total_salah = int(total_salah or 0)

            hasil.append({
                "session_id": session.id,
                "level": session.level,
                "jumlah_soal": session.jumlah_soal,
                "total_dijawab": total_dijawab,
                "total_benar": total_benar,
                "total_salah": total_salah,
                "belum_dijawab": max(
                    session.jumlah_soal - total_dijawab,
                    0
                ),
                "status": session.status,
                "started_at": (
                    session.started_at.isoformat()
                    if session.started_at else None
                ),
                "finished_at": (
                    session.finished_at.isoformat()
                    if session.finished_at else None
                )
            })

        return jsonify({
            "status": "success",
            "data": hasil,
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return error_response(
            "Gagal mengambil riwayat kuis.",
            500
        )


@statistics_bp.route("/history/<int:session_id>", methods=["GET"])
@jwt_required()
def get_quiz_session_detail(session_id):
    user_id = get_user_id()

    if user_id is None:
        return error_response("Identitas pengguna tidak valid.", 401)

    try:
        session = QuizSession.query.filter_by(
            id=session_id,
            user_id=user_id
        ).first()

        if not session:
            return error_response("Sesi kuis tidak ditemukan.", 404)

        questions = (
            QuizSessionQuestion.query
            .options(
                joinedload(QuizSessionQuestion.answer),
                joinedload(QuizSessionQuestion.hsk_word)
                .joinedload(HskWord.dictionary_entry)
            )
            .filter_by(session_id=session_id)
            .order_by(QuizSessionQuestion.nomor_soal.asc())
            .all()
        )

        hasil_soal = []
        jumlah_benar = 0
        jumlah_salah = 0
        belum_dijawab = 0

        for q in questions:
            entry = (
                q.hsk_word.dictionary_entry
                if (q.hsk_word and q.hsk_word.dictionary_entry)
                else None
            )
            ans = q.answer

            if ans:
                jawaban_pengguna = ans.jawaban_pengguna
                is_correct = ans.benar
                dijawab_pada = (
                    ans.dijawab_pada.isoformat()
                    if ans.dijawab_pada
                    else None
                )
                if is_correct:
                    jumlah_benar += 1
                else:
                    jumlah_salah += 1
            else:
                jawaban_pengguna = None
                is_correct = None
                dijawab_pada = None
                belum_dijawab += 1

            hasil_soal.append({
                "question_id": q.id,
                "nomor_soal": q.nomor_soal,
                "entry_id": entry.id if entry else None,
                "simplified": entry.simplified if entry else "",
                "traditional": entry.traditional if entry else "",
                "pinyin": entry.pinyin_display if entry else "",
                "jawaban_pengguna": jawaban_pengguna,
                "jawaban_benar": entry.pinyin_display if entry else "",
                "benar": is_correct,
                "meanings": entry.meanings if (entry and entry.meanings) else [],
                "dijawab_pada": dijawab_pada
            })

        total_soal = len(questions) or session.jumlah_soal
        akurasi = round((jumlah_benar / total_soal) * 100) if total_soal > 0 else 0

        return jsonify({
            "status": "success",
            "message": "Detail sesi kuis berhasil diambil.",
            "data": {
                "session_id": session.id,
                "level": session.level,
                "jumlah_soal": session.jumlah_soal,
                "total_soal": total_soal,
                "total_dijawab": jumlah_benar + jumlah_salah,
                "total_benar": jumlah_benar,
                "total_salah": jumlah_salah,
                "belum_dijawab": belum_dijawab,
                "akurasi": akurasi,
                "status": session.status,
                "started_at": (
                    session.started_at.isoformat()
                    if session.started_at else None
                ),
                "finished_at": (
                    session.finished_at.isoformat()
                    if session.finished_at else None
                ),
                "soal": hasil_soal
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return error_response(
            "Terjadi kesalahan saat mengambil detail sesi kuis.",
            500
        )
