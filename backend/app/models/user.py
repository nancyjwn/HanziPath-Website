from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    password_hash = db.Column(db.Text, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp(),
    )

    saved_characters = db.relationship(
        "SavedCharacter", back_populates="user", cascade="all, delete-orphan"
    )
    quiz_sessions = db.relationship(
        "QuizSession", back_populates="user", cascade="all, delete-orphan"
    )
    card_progress = db.relationship(
        "CardProgress", back_populates="user", cascade="all, delete-orphan"
    )
