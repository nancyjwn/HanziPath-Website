from app.extensions import db


class DailyWord(db.Model):
    __tablename__ = "daily_words"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    tanggal = db.Column(db.Date, nullable=False)
    hsk_word_id = db.Column(
        db.BigInteger,
        db.ForeignKey("hsk_words.id", name="fk_daily_hsk_word"),
        nullable=False,
    )
    urutan = db.Column(db.SmallInteger, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
    )

    __table_args__ = (
        db.UniqueConstraint("tanggal", "urutan", name="uq_daily_date_order"),
        db.UniqueConstraint("tanggal", "hsk_word_id", name="uq_daily_date_word"),
        db.CheckConstraint("urutan >= 1 AND urutan <= 3", name="chk_daily_order"),
    )

    hsk_word = db.relationship("HskWord", back_populates="daily_words")
