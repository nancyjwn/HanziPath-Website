import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL


# Struktur proyek:
# ChineseLearning/
# ├── backend/config.py
# └── ChineseLearningDataset/.env
PROJECT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_DIR / "ChineseLearningDataset" / ".env"
load_dotenv(ENV_FILE)


def _get_database_url():
    """Membangun URL PostgreSQL dengan aman, termasuk password bersimbol."""
    return URL.create(
        drivername="postgresql+psycopg2",
        username=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME", "chineselearning"),
    )


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = 3600

    SQLALCHEMY_DATABASE_URI = _get_database_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
    }

    # Mengizinkan origin frontend dari localhost dan jaringan lokal (IP WiFi / LAN)
    CORS_RESOURCES = {
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        },
    }

    @staticmethod
    def validate():
        required = {
            "SECRET_KEY": os.getenv("SECRET_KEY"),
            "JWT_SECRET_KEY": os.getenv("JWT_SECRET_KEY"),
            "DB_USER": os.getenv("DB_USER"),
            "DB_PASSWORD": os.getenv("DB_PASSWORD"),
            "DB_NAME": os.getenv("DB_NAME"),
        }
        missing = [key for key, value in required.items() if not value]
        if missing:
            raise RuntimeError(
                "Konfigurasi .env belum lengkap. Variabel wajib: "
                + ", ".join(missing)
            )

        try:
            port = int(os.getenv("DB_PORT", "5432"))
        except ValueError as exc:
            raise RuntimeError("DB_PORT harus berupa angka.") from exc

        if not 1 <= port <= 65535:
            raise RuntimeError("DB_PORT harus berada pada rentang 1-65535.")
