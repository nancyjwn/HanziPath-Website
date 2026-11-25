from app.extensions import db


class HskWord(db.Model):
    __tablename__ = "hsk_words"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    entry_id = db.Column(
        db.BigInteger,
        db.ForeignKey("dictionary_entries.id", name="fk_hsk_entry"),
        nullable=False,
    )
    level = db.Column(db.SmallInteger, nullable=False, index=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
    )

    __table_args__ = (
        db.UniqueConstraint("entry_id", "level", name="uq_hsk_entry_level"),
        db.CheckConstraint("level >= 1 AND level <= 6", name="chk_hsk_level"),
    )

    dictionary_entry = db.relationship(
        "DictionaryEntry", back_populates="hsk_words"
    )
    card_progress = db.relationship("CardProgress", back_populates="hsk_word")
    daily_words = db.relationship("DailyWord", back_populates="hsk_word")
    quiz_questions = db.relationship(
        "QuizSessionQuestion", back_populates="hsk_word"
    )
