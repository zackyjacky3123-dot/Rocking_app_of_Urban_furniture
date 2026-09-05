from typing import List

from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserRoleUpdate,
    UserResponse,
    LoginResponse,
)

from app.services.user_service import (
    create_user,
    get_all_users,
    get_user,
    login_user,
    update_user_role,
    deactivate_user,
    activate_user,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# =========================================================
# CREATE USER
# =========================================================

@router.post(
    "/",
    response_model=UserResponse,
    status_code=201,
)
def create_user_route(
    data: UserCreate,
    db: Session = Depends(get_db),
):

    return create_user(
        db,
        data
    )


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login_route(
    data: UserLogin,
    db: Session = Depends(get_db),
):

    return login_user(
        db,
        data
    )


# =========================================================
# GET ALL USERS
# =========================================================

@router.get(
    "/",
    response_model=List[UserResponse],
)
def get_users(
    db: Session = Depends(get_db),
):

    return get_all_users(db)


# =========================================================
# GET USER
# =========================================================

@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
def get_user_route(
    user_id: int,
    db: Session = Depends(get_db),
):

    return get_user(
        db,
        user_id
    )


# =========================================================
# CHANGE ROLE
# =========================================================

@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
)
def change_role_route(
    user_id: int,
    data: UserRoleUpdate,
    db: Session = Depends(get_db),
):

    return update_user_role(
        db,
        user_id,
        data
    )


# =========================================================
# DEACTIVATE
# =========================================================

@router.patch(
    "/{user_id}/deactivate",
    response_model=UserResponse,
)
def deactivate_user_route(
    user_id: int,
    db: Session = Depends(get_db),
):

    return deactivate_user(
        db,
        user_id
    )


# =========================================================
# ACTIVATE
# =========================================================

@router.patch(
    "/{user_id}/activate",
    response_model=UserResponse,
)
def activate_user_route(
    user_id: int,
    db: Session = Depends(get_db),
):

    return activate_user(
        db,
        user_id
    )