
from flask import Flask, jsonify
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import RequestEntityTooLarge

from config import Config
from app.extensions import db, cors, jwt

# Import model agar seluruh tabel terdaftar pada metadata SQLAlchemy.
from app import models  # noqa: F401

from app.routes.auth import auth_bp
from app.routes.dictionary import dictionary_bp
from app.routes.hsk import hsk_bp
from app.routes.saved_character import saved_character_bp
from app.routes.daily_word import daily_word_bp
from app.routes.flashcard import flashcard_bp
from app.routes.statistics import statistics_bp
from app.routes.handwriting import handwriting_bp


# Batas keseluruhan HTTP request: 6 MB.
# Batas file gambar pada endpoint handwriting tetap 5 MB.
MAX_CONTENT_LENGTH = 6 * 1024 * 1024


def create_app(config_object=Config):

    app = Flask(__name__)

    app.config.from_object(config_object)

    # -----------------------------------------------------
    # VALIDASI KONFIGURASI
    # -----------------------------------------------------

    if hasattr(config_object, "validate"):
        config_object.validate()

    # -----------------------------------------------------
    # BATAS UKURAN REQUEST
    # -----------------------------------------------------

    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # -----------------------------------------------------
    # INISIALISASI EXTENSIONS
    # -----------------------------------------------------

    db.init_app(app)

    cors.init_app(
        app,
        resources=app.config.get("CORS_RESOURCES", {})
    )

    jwt.init_app(app)

    # -----------------------------------------------------
    # ERROR HANDLER
    # -----------------------------------------------------

    @app.errorhandler(RequestEntityTooLarge)
    def handle_request_too_large(error):

        return jsonify({
            "status": "error",
            "message": (
                "Ukuran keseluruhan request terlalu besar. "
                "Maksimal ukuran request adalah 6 MB."
            )
        }), 413

    # -----------------------------------------------------
    # REGISTRASI BLUEPRINT
    # -----------------------------------------------------

    app.register_blueprint(
        auth_bp,
        url_prefix="/api/v1/auth"
    )

    app.register_blueprint(
        dictionary_bp,
        url_prefix="/api/v1/dictionary"
    )

    app.register_blueprint(
        hsk_bp,
        url_prefix="/api/v1/hsk"
    )

    app.register_blueprint(
        saved_character_bp,
        url_prefix="/api/v1/saved-characters"
    )

    app.register_blueprint(
        daily_word_bp,
        url_prefix="/api/v1/daily-words"
    )

    app.register_blueprint(
        flashcard_bp,
        url_prefix="/api/v1/flashcards"
    )

    app.register_blueprint(
        statistics_bp,
        url_prefix="/api/v1/statistics"
    )

    app.register_blueprint(
        handwriting_bp,
        url_prefix="/api/v1/handwriting"
    )

    # -----------------------------------------------------
    # HOME
    # -----------------------------------------------------

    @app.get("/")
    def home():

        return jsonify({
            "status": "success",
            "message": "HanziPath API berhasil dijalankan."
        }), 200

    # -----------------------------------------------------
    # DATABASE HEALTH CHECK
    # -----------------------------------------------------

    @app.get("/api/v1/health/database")
    def test_db():

        try:

            total_dictionary = db.session.execute(
                text("SELECT COUNT(*) FROM dictionary_entries")
            ).scalar_one()

            total_hsk = db.session.execute(
                text("SELECT COUNT(*) FROM hsk_words")
            ).scalar_one()

            return jsonify({
                "status": "success",
                "message": "Koneksi PostgreSQL berhasil.",
                "data": {
                    "total_dictionary": total_dictionary,
                    "total_hsk": total_hsk
                }
            }), 200

        except SQLAlchemyError:

            db.session.rollback()

            app.logger.exception(
                "Pemeriksaan koneksi database gagal."
            )

            return jsonify({
                "status": "error",
                "message": "Tidak dapat mengakses database."
            }), 503

    return app
