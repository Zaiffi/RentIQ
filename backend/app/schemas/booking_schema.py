from typing import List, Optional, Any
from pydantic import BaseModel


class PrimaryGuestInfo(BaseModel):
    full_name: str
    email: str
    phone: str
    address: str


class AccompanyingGuestInfo(BaseModel):
    name: str = ""
    relation: str = ""
    cnic_or_passport: str = ""


class EmergencyContactInfo(BaseModel):
    name: str
    relation: str
    phone: str


class BookingCreate(BaseModel):
    property_id: Optional[int] = None
    property_title: Optional[str] = None
    location: Optional[str] = None
    check_in: str
    check_out: str
    nights_count: Optional[int] = 1
    guests_count: Optional[int] = 1
    group_type: Optional[str] = "Solo Stay"
    total_amount: float
    payment_method: Optional[str] = "Credit / Debit Card"
    payment_status: Optional[str] = "Paid"
    status: Optional[str] = "Confirmed & Paid"
    primary_guest: Optional[PrimaryGuestInfo] = None
    accompanying_guests: List[AccompanyingGuestInfo] = []
    marriage_certificate_name: Optional[str] = None
    emergency_contact: Optional[EmergencyContactInfo] = None


class BookingResponse(BaseModel):
    id: int
    property_id: Optional[int] = None
    guest_id: Optional[int] = None
    check_in: str
    check_out: str
    nights_count: int
    guests_count: int
    group_type: str
    total_amount: float
    payment_method: Optional[str] = None
    payment_status: str
    status: str
    current_step: int
    booking: Optional[Any] = None

    class Config:
        from_attributes = True