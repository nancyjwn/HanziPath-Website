from app.extensions import db


class CardProgress(db.Model):
    __tablename__ = "card_progress"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.BigInteger, db.ForeignKey("users.id", name="fk_progress_user"), nullable=False
    )
    hsk_word_id = db.Column(
        db.BigInteger,
        db.ForeignKey("hsk_words.id", name="fk_progress_hsk_word"),
        nullable=False,
    )
    jumlah_benar = db.Column(db.Integer, nullable=False, server_default="0")
    jumlah_salah = db.Column(db.Integer, nullable=False, server_default="0")
    box_level = db.Column(db.SmallInteger, nullable=False, server_default="1")
    next_review_at = db.Column(db.DateTime(timezone=True), index=True)
    terakhir_dilihat = db.Column(db.DateTime(timezone=True))
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    __table_args__ = (
        db.UniqueConstraint("user_id", "hsk_word_id", name="uq_user_hsk_progress"),
        db.CheckConstraint("box_level >= 1 AND box_level <= 5", name="chk_box_level"),
        db.CheckConstraint(
            "jumlah_benar >= 0 AND jumlah_salah >= 0", name="chk_progress_counts"
        ),
    )

    user = db.relationship("User", back_populates="card_progress")
    hsk_word = db.relationship("HskWord", back_populates="card_progress")
