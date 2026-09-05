from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactResponse


router = APIRouter(
    prefix="/contacts",
    tags=["Contacts"]
)


# GET all active contacts
@router.get("/", response_model=List[ContactResponse])
def get_contacts(db: Session = Depends(get_db)):
    contacts = (
        db.query(Contact)
        .filter(Contact.is_active == True)
        .order_by(Contact.id)
        .all()
    )

    return contacts


# GET one contact
@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = (
        db.query(Contact)
        .filter(
            Contact.id == contact_id,
            Contact.is_active == True
        )
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    return contact


# CREATE contact
@router.post(
    "/",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED
)
def create_contact(
    contact_data: ContactCreate,
    db: Session = Depends(get_db)
):
    contact = Contact(
        name=contact_data.name,
        type=contact_data.type,
        email=contact_data.email,
        mobile=contact_data.mobile,
        city=contact_data.city,
        state=contact_data.state,
        pincode=contact_data.pincode,
        profile_image=contact_data.profile_image
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


# UPDATE contact
@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact_data: ContactCreate,
    db: Session = Depends(get_db)
):
    contact = (
        db.query(Contact)
        .filter(
            Contact.id == contact_id,
            Contact.is_active == True
        )
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    contact.name = contact_data.name
    contact.type = contact_data.type
    contact.email = contact_data.email
    contact.mobile = contact_data.mobile
    contact.city = contact_data.city
    contact.state = contact_data.state
    contact.pincode = contact_data.pincode
    contact.profile_image = contact_data.profile_image

    db.commit()
    db.refresh(contact)

    return contact


# ARCHIVE contact
@router.patch("/{contact_id}/archive", response_model=ContactResponse)
def archive_contact(
    contact_id: int,
    db: Session = Depends(get_db)
):
    contact = (
        db.query(Contact)
        .filter(Contact.id == contact_id)
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found"
        )

    contact.is_active = False

    db.commit()
    db.refresh(contact)

    return contact