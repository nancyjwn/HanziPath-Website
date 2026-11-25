
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)
from sqlalchemy.exc import IntegrityError
import re

from app.extensions import db
from app.models.user import User


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/v1/auth"
)


# ==========================================
# VALIDASI INPUT
# ==========================================

def get_json_data():
    """Memastikan request berisi JSON object."""
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return None

    return data


def validate_email(email):
    """Validasi format email sederhana."""
    pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    return bool(re.fullmatch(pattern, email))


# ==========================================
# 1. REGISTER
# ==========================================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = get_json_data()

    if data is None:
        return jsonify({
            "status": "error",
            "message": "Request harus berupa JSON object."
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # Validasi tipe data
    if not isinstance(name, str):
        return jsonify({
            "status": "error",
            "message": "Nama harus berupa teks."
        }), 400

    if not isinstance(email, str):
        return jsonify({
            "status": "error",
            "message": "Email harus berupa teks."
        }), 400

    if not isinstance(password, str):
        return jsonify({
            "status": "error",
            "message": "Password harus berupa teks."
        }), 400

    name = name.strip()
    email = email.strip().lower()

    # Validasi wajib diisi
    if not name or not email or not password:
        return jsonify({
            "status": "error",
            "message": "Nama, email, dan password wajib diisi."
        }), 400

    # Validasi panjang nama
    if len(name) > 100:
        return jsonify({
            "status": "error",
            "message": "Nama maksimal 100 karakter."
        }), 400

    # Validasi panjang email
    if len(email) > 255:
        return jsonify({
            "status": "error",
            "message": "Email maksimal 255 karakter."
        }), 400

    # Validasi format email
    if not validate_email(email):
        return jsonify({
            "status": "error",
            "message": "Format email tidak valid."
        }), 400

    # Validasi password
    if len(password) < 8:
        return jsonify({
            "status": "error",
            "message": "Password minimal 8 karakter."
        }), 400

    if len(password) > 128:
        return jsonify({
            "status": "error",
            "message": "Password maksimal 128 karakter."
        }), 400

    # Pemeriksaan email yang sudah terdaftar
    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:
        return jsonify({
            "status": "error",
            "message": "Email sudah terdaftar."
        }), 409

    new_user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password)
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Registrasi berhasil.",
            "data": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }), 201

    except IntegrityError:
        db.session.rollback()

        # Menangani duplikasi email akibat request bersamaan
        return jsonify({
            "status": "error",
            "message": "Email sudah terdaftar."
        }), 409

    except Exception:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": "Registrasi gagal. Silakan coba kembali."
        }), 500


# ==========================================
# 2. LOGIN
# ==========================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = get_json_data()

    if data is None:
        return jsonify({
            "status": "error",
            "message": "Request harus berupa JSON object."
        }), 400

    email = data.get("email")
    password = data.get("password")

    # Validasi tipe data
    if not isinstance(email, str):
        return jsonify({
            "status": "error",
            "message": "Email harus berupa teks."
        }), 400

    if not isinstance(password, str):
        return jsonify({
            "status": "error",
            "message": "Password harus berupa teks."
        }), 400

    email = email.strip().lower()

    # Validasi wajib diisi
    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email dan password wajib diisi."
        }), 400

    if len(email) > 255 or len(password) > 128:
        return jsonify({
            "status": "error",
            "message": "Email atau password tidak valid."
        }), 400

    if not validate_email(email):
        return jsonify({
            "status": "error",
            "message": "Format email tidak valid."
        }), 400

    user = User.query.filter_by(
        email=email
    ).first()

    if (
        not user
        or not check_password_hash(
            user.password_hash,
            password
        )
    ):
        return jsonify({
            "status": "error",
            "message": "Email atau password salah."
        }), 401

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "status": "success",
        "message": "Login berhasil.",
        "data": {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }
    }), 200


# ==========================================
# 3. PROFILE
# ==========================================

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = get_jwt_identity()

    try:
        user = db.session.get(
            User,
            int(user_id)
        )

    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Identitas pengguna tidak valid."
        }), 401

    if not user:
        return jsonify({
            "status": "error",
            "message": "Pengguna tidak ditemukan."
        }), 404

    return jsonify({
        "status": "success",
        "data": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200


# ==========================================
# 4. UPDATE PROFILE (NAME)
# ==========================================

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():

    user_id = get_jwt_identity()

    try:
        user = db.session.get(
            User,
            int(user_id)
        )
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Identitas pengguna tidak valid."
        }), 401

    if not user:
        return jsonify({
            "status": "error",
            "message": "Pengguna tidak ditemukan."
        }), 404

    data = get_json_data()
    if not data or not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Data harus berupa JSON object."
        }), 400

    name = data.get("name")
    if name is None or not isinstance(name, str):
        return jsonify({
            "status": "error",
            "message": "Nama wajib diisi."
        }), 400

    name = name.strip()
    if not name or len(name) < 2 or len(name) > 100:
        return jsonify({
            "status": "error",
            "message": "Nama harus terdiri dari 2 hingga 100 karakter."
        }), 400

    try:
        user.name = name
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Profil berhasil diperbarui.",
            "data": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Gagal memperbarui profil."
        }), 500


# ==========================================
# 5. CHANGE PASSWORD
# ==========================================

@auth_bp.route("/password", methods=["PUT"])
@jwt_required()
def change_password():

    user_id = get_jwt_identity()

    try:
        user = db.session.get(
            User,
            int(user_id)
        )
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Identitas pengguna tidak valid."
        }), 401

    if not user:
        return jsonify({
            "status": "error",
            "message": "Pengguna tidak ditemukan."
        }), 404

    data = get_json_data()
    if not data or not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Data harus berupa JSON object."
        }), 400

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not isinstance(current_password, str):
        return jsonify({
            "status": "error",
            "message": "Kata sandi saat ini wajib diisi."
        }), 400

    if not new_password or not isinstance(new_password, str):
        return jsonify({
            "status": "error",
            "message": "Kata sandi baru wajib diisi."
        }), 400

    if len(new_password) < 6 or len(new_password) > 128:
        return jsonify({
            "status": "error",
            "message": "Kata sandi baru minimal 6 karakter."
        }), 400

    if not check_password_hash(user.password_hash, current_password):
        return jsonify({
            "status": "error",
            "message": "Kata sandi saat ini tidak sesuai."
        }), 400

    if current_password == new_password:
        return jsonify({
            "status": "error",
            "message": "Kata sandi baru tidak boleh sama dengan kata sandi saat ini."
        }), 400

    try:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Kata sandi berhasil diperbarui."
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Gagal memperbarui kata sandi."
        }), 500
