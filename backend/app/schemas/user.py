from typing import Literal, Optional

from pydantic import BaseModel, Field


RoleType = Literal[
    "ADMIN",
    "ACCOUNTANT",
    "SALES",
    "PURCHASE",
]


# =========================================================
# CREATE USER
# =========================================================

class UserCreate(BaseModel):

    username: str = Field(
        ...,
        min_length=3,
        max_length=50
    )

    full_name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    email: str = Field(
        ...,
        max_length=120
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=100
    )

    role: RoleType = "SALES"


# =========================================================
# LOGIN
# =========================================================

class UserLogin(BaseModel):

    username: str = Field(
        ...,
        min_length=1
    )

    password: str = Field(
        ...,
        min_length=1
    )


# =========================================================
# UPDATE ROLE
# =========================================================

class UserRoleUpdate(BaseModel):

    role: RoleType


# =========================================================
# USER RESPONSE
# =========================================================

class UserResponse(BaseModel):

    id: int

    username: str

    full_name: str

    email: str

    role: RoleType

    is_active: bool

    class Config:
        from_attributes = True


# =========================================================
# LOGIN RESPONSE
# =========================================================

class LoginResponse(BaseModel):

    message: str

    user: UserResponse