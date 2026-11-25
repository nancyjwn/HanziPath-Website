from sqlalchemy.dialects.postgresql import ARRAY
from app.extensions import db


class DictionaryEntry(db.Model):
    __tablename__ = "dictionary_entries"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    simplified = db.Column(db.String, nullable=False)
    traditional = db.Column(db.String, nullable=False)
    pinyin_display = db.Column(db.String, nullable=False)
    pinyin_numbered = db.Column(db.String, nullable=False)
    meanings = db.Column(
        ARRAY(db.Text), nullable=False, server_default=db.text("'{}'::text[]")
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
    )

    __table_args__ = (
        db.UniqueConstraint(
            "simplified", "pinyin_numbered", name="uq_dictionary_entry"
        ),
    )

    hsk_words = db.relationship("HskWord", back_populates="dictionary_entry")
    saved_characters = db.relationship(
        "SavedCharacter", back_populates="dictionary_entry"
    )
