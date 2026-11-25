from app.extensions import db


class QuizSession(db.Model):
    __tablename__ = "quiz_sessions"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(
        db.BigInteger, db.ForeignKey("users.id", name="fk_session_user"), nullable=False
    )
    level = db.Column(db.SmallInteger, nullable=False)
    jumlah_soal = db.Column(db.SmallInteger, nullable=False)
    status = db.Column(
        db.String, nullable=False, server_default=db.text("'in_progress'")
    )
    started_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
    )
    finished_at = db.Column(db.DateTime(timezone=True), nullable=True)

    __table_args__ = (
        db.CheckConstraint("level >= 1 AND level <= 6", name="chk_session_level"),
        db.CheckConstraint(
            "jumlah_soal >= 1 AND jumlah_soal <= 50",
            name="chk_session_question_count",
        ),
        db.CheckConstraint(
            "status IN ('in_progress', 'completed', 'cancelled')",
            name="chk_session_status",
        ),
        db.CheckConstraint(
            "(status = 'completed' AND finished_at IS NOT NULL) "
            "OR (status <> 'completed' AND finished_at IS NULL)",
            name="chk_session_finished",
        ),
        db.Index("ix_quiz_sessions_user_started", "user_id", "started_at"),
    )

    user = db.relationship("User", back_populates="quiz_sessions")
    questions = db.relationship(
        "QuizSessionQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class QuizSessionQuestion(db.Model):
    __tablename__ = "quiz_session_questions"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    session_id = db.Column(
        db.BigInteger,
        db.ForeignKey("quiz_sessions.id", name="fk_question_session"),
        nullable=False,
    )
    hsk_word_id = db.Column(
        db.BigInteger,
        db.ForeignKey("hsk_words.id", name="fk_question_hsk_word"),
        nullable=False,
    )
    nomor_soal = db.Column(db.SmallInteger, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("session_id", "hsk_word_id", name="uq_session_hsk_word"),
        db.UniqueConstraint(
            "session_id", "nomor_soal", name="uq_session_question_number"
        ),
        db.CheckConstraint("nomor_soal > 0", name="chk_question_number"),
    )

    session = db.relationship("QuizSession", back_populates="questions")
    hsk_word = db.relationship("HskWord", back_populates="quiz_questions")
    answer = db.relationship(
        "QuizAnswer",
        back_populates="session_question",
        uselist=False,
        cascade="all, delete-orphan",
    )


class QuizAnswer(db.Model):
    __tablename__ = "quiz_answers"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    session_question_id = db.Column(
        db.BigInteger,
        db.ForeignKey("quiz_session_questions.id", name="fk_answer_question"),
        nullable=False,
        unique=True,
    )
    jawaban_pengguna = db.Column(db.String, nullable=False)
    benar = db.Column(db.Boolean, nullable=False)
    dijawab_pada = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
        index=True,
    )

    session_question = db.relationship(
        "QuizSessionQuestion", back_populates="answer"
    )
