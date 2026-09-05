from typing import Optional, Literal

from pydantic import BaseModel, EmailStr


class ContactCreate(BaseModel):
    name: str
    type: Literal["CUSTOMER", "VENDOR", "BOTH"]

    email: Optional[EmailStr] = None
    mobile: Optional[str] = None

    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

    profile_image: Optional[str] = None


class ContactResponse(ContactCreate):
    id: int
    is_active: bool

    class Config:
        from_attributes = True