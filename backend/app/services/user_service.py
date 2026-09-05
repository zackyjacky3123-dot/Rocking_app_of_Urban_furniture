import hashlib
import hmac
import secrets

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User


# =========================================================
# PASSWORD HASHING
# =========================================================

def hash_password(password: str) -> str:

    salt = secrets.token_bytes(16)

    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100_000,
    )

    return (
        salt.hex()
        + ":"
        + derived_key.hex()
    )


# =========================================================
# PASSWORD VERIFY
# =========================================================

def verify_password(
    password: str,
    stored_hash: str
) -> bool:

    try:
        salt_hex, hash_hex = stored_hash.split(":")

        salt = bytes.fromhex(salt_hex)

        derived_key = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            100_000,
        )

        return hmac.compare_digest(
            derived_key.hex(),
            hash_hex
        )

    except ValueError:
        return False


# =========================================================
# CREATE USER
# =========================================================

def create_user(
    db: Session,
    data
):

    # -----------------------------------------------------
    # CHECK USERNAME
    # -----------------------------------------------------

    existing_username = (
        db.query(User)
        .filter(
            User.username == data.username
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # -----------------------------------------------------
    # CHECK EMAIL
    # -----------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(
            User.email == data.email
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

    user = User(
        username=data.username,
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(
            data.password
        ),
        role=data.role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# =========================================================
# GET ALL USERS
# =========================================================

def get_all_users(
    db: Session
):

    return (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )


# =========================================================
# GET USER
# =========================================================

def get_user(
    db: Session,
    user_id: int
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =========================================================
# LOGIN
# =========================================================

def login_user(
    db: Session,
    data
):

    user = (
        db.query(User)
        .filter(
            User.username == data.username
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return {
        "message": "Login successful",
        "user": user,
    }


# =========================================================
# CHANGE ROLE
# =========================================================

def update_user_role(
    db: Session,
    user_id: int,
    data
):

    user = get_user(
        db,
        user_id
    )

    user.role = data.role

    db.commit()
    db.refresh(user)

    return user


# =========================================================
# DEACTIVATE USER
# =========================================================

def deactivate_user(
    db: Session,
    user_id: int
):

    user = get_user(
        db,
        user_id
    )

    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


# =========================================================
# ACTIVATE USER
# =========================================================

def activate_user(
    db: Session,
    user_id: int
):

    user = get_user(
        db,
        user_id
    )

    user.is_active = True

    db.commit()
    db.refresh(user)

    return user