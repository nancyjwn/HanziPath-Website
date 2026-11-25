
import random
import re
from datetime import datetime, timezone, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, case
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import joinedload

from app.extensions import db
from app.models.user import User
from app.models.quiz import (
    QuizSession,
    QuizSessionQuestion,
    QuizAnswer
)
from app.models.hsk_word import HskWord
from app.models.card_progress import CardProgress


flashcard_bp = Blueprint(
    "flashcard",
    __name__,
    url_prefix="/api/v1/flashcards"
)


# ==========================================
# HELPER
# ==========================================

TONE_MARKS = {
    'a': ['ā', 'á', 'ǎ', 'à'],
    'e': ['ē', 'é', 'ě', 'è'],
    'i': ['ī', 'í', 'ǐ', 'ì'],
    'o': ['ō', 'ó', 'ǒ', 'ò'],
    'u': ['ū', 'ú', 'ǔ', 'ù'],
    'v': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
    'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
}

REVERSE_TONES = {}
for base, tones in TONE_MARKS.items():
    for tone_idx, accented in enumerate(tones, start=1):
        REVERSE_TONES[accented] = (base, tone_idx)
        REVERSE_TONES[accented.upper()] = (base.upper(), tone_idx)


def extract_vowel_tones(pinyin_display):
    """
    Mendeteksi posisi huruf vokal bernada pada teks Pinyin display.
    """
    results = []
    for idx, ch in enumerate(pinyin_display):
        if ch in REVERSE_TONES:
            base, tone = REVERSE_TONES[ch]
            results.append((idx, ch, base, tone))
    return results


def replace_vowel_tone(pinyin_display, char_idx, base_vowel, new_tone):
    """
    Mengganti vokal bernada pada posisi char_idx dengan nada baru (1-4).
    """
    accented = TONE_MARKS.get(base_vowel.lower(), [base_vowel] * 4)[new_tone - 1]
    return pinyin_display[:char_idx] + accented + pinyin_display[char_idx + 1:]


def generate_flashcard_options(pinyin_display, pinyin_numbered="", pool_pinyins=None):
    """
    Menghasilkan 4 opsi pilihan ganda yang terdiri dari 1 jawaban benar
    dan 3 pengecoh (variasi nada atau kosakata selevel).
    """
    if pool_pinyins is None:
        pool_pinyins = []

    tones_info = extract_vowel_tones(pinyin_display or "")
    options = []
    seen_values = set()

    # 1. Jika kata bersuku kata tunggal dengan 1 penanda nada
    if len(tones_info) == 1:
        idx, ch, base, curr_tone = tones_info[0]
        for t in [1, 2, 3, 4]:
            t_pinyin = replace_vowel_tone(pinyin_display, idx, base, t)
            options.append({
                "value": t_pinyin,
                "label": f"{t_pinyin} (nada {t})",
                "pinyin": t_pinyin
            })
        random.shuffle(options)
        return options

    # 2. Untuk kata dengan beberapa suku kata atau tanpa vokal nada langsung:
    # Masukkan jawaban benar terlebih dahulu
    options.append({
        "value": pinyin_display,
        "label": pinyin_display,
        "pinyin": pinyin_display
    })
    seen_values.add(normalize_pinyin(pinyin_display))

    # Coba variasikan nada pada suku kata yang terdeteksi
    for idx, ch, base, curr_tone in tones_info:
        for t in [1, 2, 3, 4]:
            if t != curr_tone:
                candidate = replace_vowel_tone(pinyin_display, idx, base, t)
                norm = normalize_pinyin(candidate)
                if norm not in seen_values:
                    seen_values.add(norm)
                    options.append({
                        "value": candidate,
                        "label": candidate,
                        "pinyin": candidate
                    })
            if len(options) >= 4:
                break
        if len(options) >= 4:
            break

    # 3. Jika belum mencapai 4 opsi, lengkapi dengan pengecoh dari kata lain di pool
    random_pool = list(pool_pinyins)
    random.shuffle(random_pool)
    for p in random_pool:
        if len(options) >= 4:
            break
        norm = normalize_pinyin(p)
        if norm and norm not in seen_values:
            seen_values.add(norm)
            options.append({
                "value": p,
                "label": p,
                "pinyin": p
            })

    # 4. Fallback jika masih kurang dari 4 opsi
    generic_distractors = ["mā", "má", "mǎ", "mà", "hǎo", "nǐ", "xiè", "zài", "shuǐ", "shū"]
    for g in generic_distractors:
        if len(options) >= 4:
            break
        norm = normalize_pinyin(g)
        if norm not in seen_values:
            seen_values.add(norm)
            options.append({
                "value": g,
                "label": g,
                "pinyin": g
            })

    random.shuffle(options)
    return options[:4]


def normalize_pinyin(value):
    """
    Menormalisasi Pinyin:
    - Mengubah huruf menjadi lowercase.
    - Menghapus spasi berlebih.
    - Mempertahankan tanda nada Pinyin.
    """
    if not isinstance(value, str):
        return ""

    return " ".join(value.strip().casefold().split())


def is_correct_pinyin(user_answer, correct_display, correct_numbered):
    """
    Membandingkan jawaban dengan Pinyin bertanda nada
    maupun Pinyin bernomor. Mendukung pembersihan tag seperti '(nada 1)'.
    """
    if not isinstance(user_answer, str):
        return False

    # Bersihkan keterangan seperti "(nada 1)" atau kurung lainnya
    cleaned_user = re.sub(r'\(.*?\)', '', user_answer).strip()

    user_normalized = normalize_pinyin(cleaned_user or user_answer)
    display_normalized = normalize_pinyin(correct_display)
    numbered_normalized = normalize_pinyin(correct_numbered)

    if not user_normalized:
        return False

    # Perbandingan dengan Pinyin bertanda nada.
    if user_normalized == display_normalized:
        return True

    # Perbandingan dengan Pinyin bernomor.
    if numbered_normalized and user_normalized == numbered_normalized:
        return True

    # Mendukung variasi spasi, misalnya:
    # "ni3 hao3" dan "ni3hao3".
    user_compact = user_normalized.replace(" ", "")

    if display_normalized:
        if user_compact == display_normalized.replace(" ", ""):
            return True

    if numbered_normalized:
        if user_compact == numbered_normalized.replace(" ", ""):
            return True

    return False


def error_response(message, status_code):
    return jsonify({
        "status": "error",
        "message": message
    }), status_code


# ==========================================
# 1. MEMBUAT SESI FLASHCARD
# ==========================================

@flashcard_bp.route("/sessions", methods=["POST"])
@jwt_required()
def create_flashcard_session():

    user_id = int(get_jwt_identity())

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error_response(
            "Request harus berupa JSON object.",
            400
        )

    level = data.get("level")
    jumlah_soal = data.get("jumlah_soal")

    # Validasi field wajib.
    if level is None or jumlah_soal is None:
        return error_response(
            "Level dan jumlah_soal wajib diisi.",
            400
        )

    # Hanya menerima integer JSON asli.
    if type(level) is not int or type(jumlah_soal) is not int:
        return error_response(
            "Level dan jumlah_soal harus berupa bilangan bulat.",
            400
        )

    if not 1 <= level <= 6:
        return error_response(
            "Level HSK harus antara 1 sampai 6.",
            400
        )

    if not 1 <= jumlah_soal <= 50:
        return error_response(
            "Jumlah soal harus antara 1 sampai 50.",
            400
        )

    try:
        # 1. Pilih kosakata dari level ini yang BELUM pernah dikerjakan oleh pengguna
        unpracticed_words = (
            HskWord.query
            .options(
                joinedload(HskWord.dictionary_entry)
            )
            .filter(
                HskWord.level == level,
                ~HskWord.id.in_(
                    db.session.query(CardProgress.hsk_word_id)
                    .filter(CardProgress.user_id == user_id)
                )
            )
            .order_by(func.random())
            .limit(jumlah_soal)
            .all()
        )

        selected_words = list(unpracticed_words)

        # 2. Jika kata yang belum dikerjakan kurang dari jumlah_soal
        # (misalnya pengguna sudah mempelajari sebagian besar atau seluruh kata di level ini),
        # lengkapi dengan kata yang sudah dipelajari sebelumnya, diprioritaskan
        # dari box_level terendah (kata yang masih sering salah / butuh pengulangan)
        if len(selected_words) < jumlah_soal:
            needed = jumlah_soal - len(selected_words)
            already_ids = [w.id for w in selected_words]

            review_query = (
                HskWord.query
                .options(
                    joinedload(HskWord.dictionary_entry)
                )
                .join(CardProgress, CardProgress.hsk_word_id == HskWord.id)
                .filter(
                    HskWord.level == level,
                    CardProgress.user_id == user_id
                )
            )
            if already_ids:
                review_query = review_query.filter(~HskWord.id.in_(already_ids))

            review_words = (
                review_query
                .order_by(
                    CardProgress.box_level.asc(),
                    CardProgress.terakhir_dilihat.asc().nullsfirst(),
                    func.random()
                )
                .limit(needed)
                .all()
            )
            selected_words.extend(review_words)

        # 3. Fallback jika masih kurang dari jumlah_soal
        if len(selected_words) < jumlah_soal:
            already_ids = [w.id for w in selected_words]
            fallback_query = (
                HskWord.query
                .options(
                    joinedload(HskWord.dictionary_entry)
                )
                .filter(HskWord.level == level)
            )
            if already_ids:
                fallback_query = fallback_query.filter(~HskWord.id.in_(already_ids))

            fallback_words = (
                fallback_query
                .order_by(func.random())
                .limit(jumlah_soal - len(selected_words))
                .all()
            )
            selected_words.extend(fallback_words)

        if len(selected_words) < jumlah_soal:
            return error_response(
                "Jumlah kosakata dalam level ini tidak mencukupi untuk jumlah soal yang diminta.",
                400
            )

        # Membuat sesi baru.
        session = QuizSession(
            user_id=user_id,
            level=level,
            jumlah_soal=jumlah_soal,
            status="in_progress"
        )

        db.session.add(session)
        db.session.flush()

        questions_data = []

        pool_pinyins = [
            w.dictionary_entry.pinyin_display
            for w in selected_words
            if w.dictionary_entry and w.dictionary_entry.pinyin_display
        ]

        # Membuat soal berdasarkan kosakata terpilih.
        for nomor, word in enumerate(selected_words, start=1):

            entry = word.dictionary_entry

            question = QuizSessionQuestion(
                session_id=session.id,
                hsk_word_id=word.id,
                nomor_soal=nomor
            )

            db.session.add(question)

            options = generate_flashcard_options(
                entry.pinyin_display,
                entry.pinyin_numbered,
                pool_pinyins
            )

            questions_data.append({
                "question": question,
                "nomor_soal": nomor,
                "entry_id": entry.id,
                "simplified": entry.simplified,
                "traditional": entry.traditional,
                "options": options
            })

        # Membentuk ID soal.
        db.session.flush()

        for item in questions_data:
            question = item.pop("question")
            item["question_id"] = question.id
            item["id"] = question.id

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Sesi flashcard berhasil dibuat.",
            "data": {
                "id": session.id,
                "session_id": session.id,
                "level": session.level,
                "jumlah_soal": session.jumlah_soal,
                "status": session.status,
                "questions": questions_data
            }
        }), 201

    except SQLAlchemyError:
        db.session.rollback()

        return error_response(
            "Terjadi kesalahan database saat membuat sesi flashcard.",
            500
        )

    except Exception:
        db.session.rollback()

        return error_response(
            "Gagal membuat sesi flashcard.",
            500
        )


# ==========================================
# 2. MENGIRIM JAWABAN FLASHCARD
# ==========================================

@flashcard_bp.route(
    "/sessions/<int:session_id>/answer",
    methods=["POST"]
)
@flashcard_bp.route(
    "/sessions/<int:session_id>/answers",
    methods=["POST"]
)
@jwt_required()
def submit_flashcard_answer(session_id):

    user_id = int(get_jwt_identity())

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return error_response(
            "Request harus berupa JSON object.",
            400
        )

    question_id = data.get("question_id")
    jawaban_pengguna = data.get("jawaban_pengguna")

    # Validasi field wajib.
    if question_id is None or "jawaban_pengguna" not in data:
        return error_response(
            "question_id dan jawaban_pengguna wajib diisi.",
            400
        )

    try:
        question_id = int(question_id)
        if question_id <= 0:
            raise ValueError()
    except (TypeError, ValueError):
        return error_response(
            "question_id harus berupa bilangan bulat positif.",
            400
        )

    if not isinstance(jawaban_pengguna, str):
        return error_response(
            "jawaban_pengguna harus berupa teks.",
            400
        )

    jawaban_pengguna = jawaban_pengguna.strip()

    if not jawaban_pengguna:
        return error_response(
            "Jawaban tidak boleh kosong.",
            400
        )

    try:
        # Mengunci baris pengguna agar pembaruan progres
        # dari beberapa sesi milik pengguna yang sama
        # diproses secara bergantian.
        user = (
            User.query
            .filter_by(id=user_id)
            .with_for_update()
            .first()
        )

        if not user:
            return error_response(
                "Pengguna tidak ditemukan.",
                404
            )

        # Mengunci sesi untuk mencegah dua request
        # memproses jawaban sesi yang sama bersamaan.
        session = (
            QuizSession.query
            .filter_by(
                id=session_id,
                user_id=user_id
            )
            .with_for_update()
            .first()
        )

        if not session:
            return error_response(
                "Sesi flashcard tidak ditemukan.",
                404
            )

        if session.status != "in_progress":
            return error_response(
                "Sesi flashcard sudah tidak aktif.",
                400
            )

        # Mengambil soal beserta data kamus.
        question = (
            QuizSessionQuestion.query
            .options(
                joinedload(QuizSessionQuestion.hsk_word)
                .joinedload(HskWord.dictionary_entry)
            )
            .filter_by(
                id=question_id,
                session_id=session_id
            )
            .first()
        )

        if not question:
            return error_response(
                "Soal tidak ditemukan dalam sesi ini.",
                404
            )

        # Memeriksa apakah soal sudah pernah dijawab.
        existing_answer = QuizAnswer.query.filter_by(
            session_question_id=question.id
        ).first()

        if existing_answer:
            return error_response(
                "Soal ini sudah dijawab.",
                409
            )

        entry = question.hsk_word.dictionary_entry

        # Membandingkan jawaban Pinyin.
        is_correct = is_correct_pinyin(
            jawaban_pengguna,
            entry.pinyin_display,
            entry.pinyin_numbered
        )

        now = datetime.now(timezone.utc)

        # Menyimpan jawaban.
        answer = QuizAnswer(
            session_question_id=question.id,
            jawaban_pengguna=jawaban_pengguna,
            benar=is_correct
        )

        db.session.add(answer)

        # Mengambil progres kartu dengan row lock.
        progress = (
            CardProgress.query
            .filter_by(
                user_id=user_id,
                hsk_word_id=question.hsk_word_id
            )
            .with_for_update()
            .first()
        )

        # Membuat progres jika belum tersedia.
        if not progress:
            progress = CardProgress(
                user_id=user_id,
                hsk_word_id=question.hsk_word_id,
                jumlah_benar=0,
                jumlah_salah=0,
                box_level=1
            )

            db.session.add(progress)

        # Memperbarui progres.
        if is_correct:
            progress.jumlah_benar += 1

            progress.box_level = min(
                progress.box_level + 1,
                5
            )

        else:
            progress.jumlah_salah += 1
            progress.box_level = 1

        # Interval pengulangan berdasarkan box level.
        review_intervals = {
            1: 1,
            2: 3,
            3: 7,
            4: 14,
            5: 30
        }

        progress.next_review_at = (
            now + timedelta(
                days=review_intervals[progress.box_level]
            )
        )

        progress.terakhir_dilihat = now
        progress.updated_at = now

        # Memastikan jawaban dan progres tersimpan
        # sebelum menghitung jumlah jawaban.
        db.session.flush()

        answered_count = (
            db.session.query(func.count(QuizAnswer.id))
            .join(
                QuizSessionQuestion,
                QuizAnswer.session_question_id
                == QuizSessionQuestion.id
            )
            .filter(
                QuizSessionQuestion.session_id == session_id
            )
            .scalar()
        )

        # Menyelesaikan sesi ketika seluruh soal dijawab.
        if answered_count == session.jumlah_soal:
            session.status = "completed"
            session.finished_at = now

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Jawaban berhasil disimpan.",
            "data": {
                "id": session.id,
                "session_id": session.id,
                "question_id": question.id,
                "nomor_soal": question.nomor_soal,
                "entry_id": entry.id,
                "simplified": entry.simplified,
                "jawaban_pengguna": jawaban_pengguna,
                "benar": is_correct,
                "is_correct": is_correct,
                "jawaban_benar": entry.pinyin_display,
                "pinyin_display": entry.pinyin_display,
                "pinyin_numbered": entry.pinyin_numbered,
                "meanings": entry.meanings or [],
                "progress": {
                    "jumlah_benar": progress.jumlah_benar,
                    "jumlah_salah": progress.jumlah_salah,
                    "box_level": progress.box_level,
                    "next_review_at": (
                        progress.next_review_at.isoformat()
                        if progress.next_review_at else None
                    )
                },
                "jumlah_dijawab": answered_count,
                "jumlah_soal": session.jumlah_soal,
                "status_sesi": session.status
            }
        }), 200

    except IntegrityError:
        db.session.rollback()

        return error_response(
            "Jawaban atau progres sudah tercatat. Silakan periksa kembali hasil kuis.",
            409
        )

    except SQLAlchemyError:
        db.session.rollback()

        return error_response(
            "Terjadi kesalahan database saat menyimpan jawaban.",
            500
        )

    except Exception:
        db.session.rollback()

        return error_response(
            "Gagal menyimpan jawaban flashcard.",
            500
        )


# ==========================================
# 3. REKAP HASIL KUIS FLASHCARD
# ==========================================

@flashcard_bp.route(
    "/sessions/<int:session_id>/result",
    methods=["GET"]
)
@jwt_required()
def get_flashcard_result(session_id):

    user_id = int(get_jwt_identity())

    # Memeriksa kepemilikan sesi.
    session = QuizSession.query.filter_by(
        id=session_id,
        user_id=user_id
    ).first()

    if not session:
        return error_response(
            "Sesi flashcard tidak ditemukan.",
            404
        )

    # Hasil lengkap dan kunci jawaban hanya tersedia setelah
    # seluruh soal dalam sesi berhasil dijawab.
    if session.status != "completed":
        return error_response(
            "Kuis belum selesai. Selesaikan seluruh soal terlebih dahulu.",
            400
        )

    try:
        # Mengambil soal beserta jawaban dan data kamus.
        questions = (
            QuizSessionQuestion.query
            .options(
                joinedload(QuizSessionQuestion.answer),
                joinedload(QuizSessionQuestion.hsk_word)
                .joinedload(HskWord.dictionary_entry)
            )
            .filter_by(session_id=session_id)
            .order_by(
                QuizSessionQuestion.nomor_soal.asc()
            )
            .all()
        )

        jumlah_benar = 0
        jumlah_salah = 0
        belum_dijawab = 0

        hasil_soal = []

        for question in questions:

            entry = question.hsk_word.dictionary_entry
            answer = question.answer

            if answer:
                jawaban_pengguna = answer.jawaban_pengguna
                is_correct = answer.benar

                if is_correct:
                    jumlah_benar += 1
                else:
                    jumlah_salah += 1

            else:
                jawaban_pengguna = None
                is_correct = None
                belum_dijawab += 1

            hasil_soal.append({
                "question_id": question.id,
                "nomor_soal": question.nomor_soal,
                "entry_id": entry.id,
                "simplified": entry.simplified,
                "traditional": entry.traditional,
                "pinyin": entry.pinyin_display,
                "jawaban_pengguna": jawaban_pengguna,
                "jawaban_benar": entry.pinyin_display,
                "benar": is_correct,
                "meanings": entry.meanings or []
            })

        total_soal = len(questions)

        persentase = (
            round(
                (jumlah_benar / total_soal) * 100,
                2
            )
            if total_soal > 0
            else 0
        )

        return jsonify({
            "status": "success",
            "message": "Rekap hasil kuis berhasil diambil.",
            "data": {
                "session_id": session.id,
                "level": session.level,
                "total_soal": total_soal,
                "jumlah_benar": jumlah_benar,
                "jumlah_salah": jumlah_salah,
                "belum_dijawab": belum_dijawab,
                "persentase": persentase,
                "status_sesi": session.status,
                "started_at": (
                    session.started_at.isoformat()
                    if session.started_at else None
                ),
                "finished_at": (
                    session.finished_at.isoformat()
                    if session.finished_at else None
                ),
                "hasil": hasil_soal
            }
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return error_response(
            "Terjadi kesalahan database saat mengambil rekap hasil kuis.",
            500
        )

    except Exception:
        db.session.rollback()

        return error_response(
            "Gagal mengambil rekap hasil kuis.",
            500
        )


# ==========================================
# 3B. DETAIL & PEMBATALAN SESI KUIS
# ==========================================

@flashcard_bp.route("/sessions/<int:session_id>", methods=["GET"])
@jwt_required()
def get_flashcard_session(session_id):
    user_id = int(get_jwt_identity())
    session = QuizSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return error_response("Sesi flashcard tidak ditemukan.", 404)

    return jsonify({
        "status": "success",
        "data": {
            "id": session.id,
            "session_id": session.id,
            "level": session.level,
            "jumlah_soal": session.jumlah_soal,
            "status": session.status,
            "started_at": session.started_at.isoformat() if session.started_at else None,
            "finished_at": session.finished_at.isoformat() if session.finished_at else None,
        }
    }), 200


@flashcard_bp.route("/sessions/<int:session_id>/cancel", methods=["POST"])
@jwt_required()
def cancel_flashcard_session(session_id):
    user_id = int(get_jwt_identity())
    session = QuizSession.query.filter_by(id=session_id, user_id=user_id).first()
    if not session:
        return error_response("Sesi flashcard tidak ditemukan.", 404)

    if session.status == "in_progress":
        session.status = "cancelled"
        db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Sesi kuis berhasil dibatalkan."
    }), 200


# ==========================================
# 4. PROGRES FLASHCARD PER LEVEL HSK
# ==========================================

@flashcard_bp.route("/progress", methods=["GET"])
@jwt_required()
def get_flashcard_progress():
    user_id = int(get_jwt_identity())

    try:
        # Total kata per level HSK di database
        total_counts = (
            db.session.query(
                HskWord.level,
                func.count(HskWord.id).label("total")
            )
            .group_by(HskWord.level)
            .all()
        )
        total_dict = {lvl: count for lvl, count in total_counts}

        # Kata yang sudah dikerjakan pengguna per level HSK
        studied_rows = (
            db.session.query(
                HskWord.level,
                func.count(CardProgress.id).label("studied"),
                func.coalesce(
                    func.sum(case((CardProgress.box_level >= 3, 1), else_=0)),
                    0
                ).label("mastered"),
                func.coalesce(
                    func.sum(case((CardProgress.box_level < 3, 1), else_=0)),
                    0
                ).label("learning")
            )
            .join(CardProgress, CardProgress.hsk_word_id == HskWord.id)
            .filter(CardProgress.user_id == user_id)
            .group_by(HskWord.level)
            .all()
        )

        studied_dict = {
            lvl: {
                "studied": int(studied),
                "mastered": int(mastered),
                "learning": int(learning)
            }
            for lvl, studied, mastered, learning in studied_rows
        }

        levels_data = []
        overall_total = 0
        overall_studied = 0
        overall_mastered = 0

        # Standar jumlah kata jika bank database belum lengkap
        default_totals = {1: 150, 2: 150, 3: 300, 4: 600, 5: 1300, 6: 2500}

        for lvl in range(1, 7):
            total = total_dict.get(lvl) or default_totals.get(lvl, 150)
            user_stat = studied_dict.get(lvl, {"studied": 0, "mastered": 0, "learning": 0})
            studied = user_stat["studied"]
            mastered = user_stat["mastered"]
            learning = user_stat["learning"]
            remaining = max(0, total - studied)
            percentage = round((studied / total) * 100) if total > 0 else 0

            overall_total += total
            overall_studied += studied
            overall_mastered += mastered

            levels_data.append({
                "level": lvl,
                "total_words": total,
                "studied_count": studied,
                "mastered_count": mastered,
                "learning_count": learning,
                "remaining_count": remaining,
                "percentage": percentage
            })

        overall_percentage = (
            round((overall_studied / overall_total) * 100)
            if overall_total > 0 else 0
        )

        return jsonify({
            "status": "success",
            "message": "Progres flashcard berhasil dimuat.",
            "data": {
                "overall": {
                    "total_words": overall_total,
                    "studied_count": overall_studied,
                    "mastered_count": overall_mastered,
                    "percentage": overall_percentage
                },
                "levels": levels_data
            }
        }), 200

    except SQLAlchemyError:
        return error_response(
            "Gagal memuat progres flashcard dari database.",
            500
        )
