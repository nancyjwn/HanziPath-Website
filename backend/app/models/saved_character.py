from app.extensions import db


class SavedCharacter(db.Model):
    __tablename__ = "saved_characters"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.BigInteger, db.ForeignKey("users.id", name="fk_saved_user"), nullable=False
    )
    entry_id = db.Column(
        db.BigInteger,
        db.ForeignKey("dictionary_entries.id", name="fk_saved_entry"),
        nullable=False,
    )
    source = db.Column(db.String, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
    )

    __table_args__ = (
        db.UniqueConstraint("user_id", "entry_id", name="uq_saved_user_entry"),
        db.CheckConstraint(
            "source IN ('pengenalan', 'kamus', 'flashcard', 'hasil_kuis', 'kata_harian')",
            name="chk_saved_source",
        ),
    )

    user = db.relationship("User", back_populates="saved_characters")
    dictionary_entry = db.relationship(
        "DictionaryEntry", back_populates="saved_characters"
    )
