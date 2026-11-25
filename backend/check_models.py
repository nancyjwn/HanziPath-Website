from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app import create_app
from app.extensions import db
from app import models  # noqa: F401


app = create_app()


with app.app_context():
    print("\n=== PEMERIKSAAN MODEL ===")
    for table_name in sorted(db.metadata.tables):
        print(f"[OK] {table_name}")
    print("Total tabel terdaftar:", len(db.metadata.tables))

    print("\n=== PEMERIKSAAN DATABASE ===")
    try:
        total_dictionary = db.session.execute(
            text("SELECT COUNT(*) FROM dictionary_entries")
        ).scalar_one()
        total_hsk = db.session.execute(
            text("SELECT COUNT(*) FROM hsk_words")
        ).scalar_one()

        print("Total dictionary:", total_dictionary)
        print("Total HSK:", total_hsk)
        print("\nKoneksi database berhasil!")
    except SQLAlchemyError:
        db.session.rollback()
        print("Koneksi database gagal. Periksa konfigurasi .env dan PostgreSQL.")
        raise
    finally:
        db.session.remove()
