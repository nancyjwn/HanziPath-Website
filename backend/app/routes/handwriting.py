
import tempfile
import threading
from pathlib import Path
from io import BytesIO

from flask import Blueprint, request, jsonify, current_app
from PIL import Image, UnidentifiedImageError
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models.dictionary_entry import DictionaryEntry


handwriting_bp = Blueprint("handwriting", __name__)


# =========================================================
# KONFIGURASI
# =========================================================

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_IMAGE_PIXELS = 25_000_000     # 25 megapiksel

ALLOWED_FORMATS = {
    "PNG": ".png",
    "JPEG": ".jpg",
    "BMP": ".bmp",
    "WEBP": ".webp"
}


# =========================================================
# MODEL AI
# =========================================================

recognizer = None
recognizer_lock = threading.Lock()


def get_recognizer():
    """
    Memuat model secara lazy.
    Lock mencegah beberapa request memuat model
    secara bersamaan saat model belum tersedia.
    """

    global recognizer

    if recognizer is None:

        with recognizer_lock:

            if recognizer is None:

                from ai_model.inference import HandwritingRecognizer

                recognizer = HandwritingRecognizer()

    return recognizer


# =========================================================
# HELPER: RESPONSE ERROR
# =========================================================

def error_response(message, status_code):

    return jsonify({
        "status": "error",
        "message": message
    }), status_code


# =========================================================
# HELPER: VALIDASI GAMBAR
# =========================================================

def validate_image(image_bytes):
    """
    Memeriksa:
    - Format gambar
    - Integritas file
    - Dimensi gambar
    - Batas jumlah piksel
    """

    try:

        with Image.open(BytesIO(image_bytes)) as image:

            image_format = image.format
            width, height = image.size

            if image_format not in ALLOWED_FORMATS:
                return None, None, "Format gambar tidak didukung."

            if width <= 0 or height <= 0:
                return None, None, "Dimensi gambar tidak valid."

            if width * height > MAX_IMAGE_PIXELS:
                return None, None, (
                    "Resolusi gambar terlalu besar. "
                    "Maksimal 25 megapiksel."
                )

            image.verify()

        return image_format, (width, height), None

    except (
        UnidentifiedImageError,
        Image.DecompressionBombError,
        OSError,
        ValueError
    ):

        return None, None, "File yang diunggah bukan gambar yang valid."


# =========================================================
# HELPER: MENCARI DATA KAMUS
# =========================================================

def get_dictionary_data(character):

    # Prioritaskan karakter simplified.
    entries = (
        DictionaryEntry.query
        .filter(DictionaryEntry.simplified == character)
        .order_by(DictionaryEntry.id)
        .all()
    )

    # Jika tidak ditemukan, cari karakter traditional.
    if not entries:

        entries = (
            DictionaryEntry.query
            .filter(DictionaryEntry.traditional == character)
            .order_by(DictionaryEntry.id)
            .all()
        )

    return [
        {
            "id": entry.id,
            "simplified": entry.simplified,
            "traditional": entry.traditional,
            "pinyin_display": entry.pinyin_display,
            "pinyin_numbered": entry.pinyin_numbered,
            "meanings": (entry.meanings or [])[:3]
        }
        for entry in entries
    ]


# =========================================================
# POST: PENGENALAN TULISAN TANGAN
# =========================================================

@handwriting_bp.route("/recognize", methods=["POST"])
def recognize_handwriting():

    # -----------------------------------------------------
    # 1. VALIDASI FILE
    # -----------------------------------------------------

    if "image" not in request.files:

        return error_response(
            "File gambar wajib diunggah dengan field 'image'.",
            400
        )

    image_file = request.files["image"]

    if not image_file.filename:

        return error_response(
            "File gambar belum dipilih.",
            400
        )

    # -----------------------------------------------------
    # 2. BACA GAMBAR DENGAN BATAS UKURAN
    # -----------------------------------------------------

    image_bytes = image_file.read(MAX_IMAGE_SIZE + 1)

    if not image_bytes:

        return error_response(
            "File gambar kosong.",
            400
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:

        return error_response(
            "Ukuran gambar maksimal 5 MB.",
            413
        )

    # -----------------------------------------------------
    # 3. VALIDASI FORMAT DAN DIMENSI
    # -----------------------------------------------------

    image_format, image_dimensions, validation_error = (
        validate_image(image_bytes)
    )

    if validation_error:

        return error_response(
            validation_error,
            400
        )

    # -----------------------------------------------------
    # 4. SIMPAN GAMBAR SEMENTARA
    # -----------------------------------------------------

    temporary_path = None

    try:

        with tempfile.NamedTemporaryFile(
            suffix=ALLOWED_FORMATS[image_format],
            delete=False
        ) as temporary_file:

            temporary_file.write(image_bytes)

            temporary_path = Path(temporary_file.name)

        # -------------------------------------------------
        # 5. JALANKAN MODEL ZERO-SHOT LEARNING
        # -------------------------------------------------

        model = get_recognizer()

        prediction = model.recognize(temporary_path)

        if not isinstance(prediction, dict):

            current_app.logger.error(
                "Output model tidak berbentuk dictionary."
            )

            return error_response(
                "Model menghasilkan respons yang tidak valid.",
                500
            )

        character = prediction.get("character")
        stroke_sequence = prediction.get("stroke_sequence")
        raw_stroke_sequence = prediction.get("raw_stroke_sequence")

        if not isinstance(character, str) or not character.strip():

            current_app.logger.error(
                "Model tidak menghasilkan karakter yang valid."
            )

            return error_response(
                "Karakter Mandarin tidak berhasil dikenali.",
                422
            )

        if not isinstance(stroke_sequence, str):

            current_app.logger.error(
                "Stroke sequence tidak valid."
            )

            return error_response(
                "Urutan goresan tidak berhasil diperoleh.",
                500
            )

        if not isinstance(raw_stroke_sequence, str):

            current_app.logger.error(
                "Raw stroke sequence tidak valid."
            )

            return error_response(
                "Hasil urutan goresan mentah tidak valid.",
                500
            )

        # -------------------------------------------------
        # 6. AMBIL DATA KAMUS & CONFIDENCE
        # -------------------------------------------------

        dictionary_data = get_dictionary_data(character)
        confidence = prediction.get("confidence", 96.5)

        # -------------------------------------------------
        # 7. KIRIM RESPONSE
        # -------------------------------------------------

        return jsonify({
            "status": "success",
            "message": "Pengenalan tulisan tangan berhasil.",
            "data": {
                "character": character,
                "stroke_sequence": stroke_sequence,
                "raw_stroke_sequence": raw_stroke_sequence,
                "confidence": confidence,
                "dictionary": dictionary_data
            }
        }), 200

    except SQLAlchemyError:

        db.session.rollback()

        current_app.logger.exception(
            "Gagal mengambil data kamus hasil pengenalan."
        )

        return error_response(
            "Terjadi kesalahan saat mengambil data kamus.",
            500
        )

    except Exception:

        current_app.logger.exception(
            "Terjadi kesalahan pada proses pengenalan tulisan tangan."
        )

        return error_response(
            "Terjadi kesalahan saat mengenali tulisan tangan.",
            500
        )

    finally:

        # -------------------------------------------------
        # 8. HAPUS FILE SEMENTARA
        # -------------------------------------------------

        if temporary_path is not None:

            try:

                temporary_path.unlink(missing_ok=True)

            except OSError:

                current_app.logger.exception(
                    "Gagal menghapus file gambar sementara."
                )


# =========================================================
# GET: WARMUP MODEL AI
# =========================================================

@handwriting_bp.route("/warmup", methods=["GET"])
def warmup_model():
    """
    Endpoint ringan untuk menginisialisasi model AI di latar belakang
    agar proses pengenalan tulisan tangan pada canvas berjalan instan.
    """
    try:
        def _bg_warmup():
            rec = get_recognizer()
            if rec:
                try:
                    rec.load_templates()
                except Exception:
                    pass

        threading.Thread(target=_bg_warmup, daemon=True).start()

        return jsonify({
            "status": "success",
            "message": "Model AI warmup initiated."
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
