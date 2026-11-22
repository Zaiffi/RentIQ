import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.security import ALGORITHM, SECRET_KEY
from app.db.session import get_db
from app.models.booking import Booking
from app.models.notification import Notification
from app.models.property import Property
from app.models.user import User
from app.schemas.booking_schema import BookingCreate

router = APIRouter()

optional_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login", auto_error=False
)


def get_optional_current_user(
    token: Optional[str] = Depends(optional_oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            return None
        return db.query(User).filter(User.id == int(user_id)).first()
    except (JWTError, ValueError, TypeError):
        return None


def _extract_first_photo(property_obj: Optional[Property]) -> Optional[str]:
    if not property_obj:
        return None
    for attr in ("photos", "image", "property_image"):
        val = getattr(property_obj, attr, None)
        if isinstance(val, str) and val.strip():
            return val.split(",")[0].strip()
    return None


def _parse_date_safe(date_str: Optional[str]):
    if not date_str:
        return None
    cleaned = date_str.strip()[:19]
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue
    return None


def _compute_live_step_and_status(booking: Booking):
    today = datetime.utcnow().date()
    check_in_date = _parse_date_safe(booking.check_in)
    check_out_date = _parse_date_safe(booking.check_out)

    if not bool(getattr(booking, "host_confirmed", False)):
        return 3, "Pending Host Confirmation"

    if check_out_date and today > check_out_date:
        return 5, "Completed"

    if check_in_date and today >= check_in_date:
        return 5, "Move-In Active"

    return 4, "Host Confirmed"


def _resolve_host_id(property_obj: Optional[Property]) -> Optional[int]:
    if not property_obj:
        return None
    for attr in ("host_id", "owner_id", "user_id"):
        val = getattr(property_obj, attr, None)
        if val is not None:
            return int(val)
    return None


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    valid_property_id = None
    property_obj = None

    if booking_data.property_id:
        property_obj = (
            db.query(Property).filter(Property.id == booking_data.property_id).first()
        )
        if property_obj:
            valid_property_id = property_obj.id

    if not property_obj and booking_data.property_title:
        property_obj = (
            db.query(Property)
            .filter(Property.title == booking_data.property_title.strip())
            .first()
        )
        if property_obj:
            valid_property_id = property_obj.id

    resolved_guest_id = current_user.id if current_user else None
    if (
        not resolved_guest_id
        and booking_data.primary_guest
        and booking_data.primary_guest.email
    ):
        matched_user = (
            db.query(User)
            .filter(User.email == booking_data.primary_guest.email.strip().lower())
            .first()
        )
        if matched_user:
            resolved_guest_id = matched_user.id

    new_booking = Booking(
        property_id=valid_property_id,
        guest_id=resolved_guest_id,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        nights_count=booking_data.nights_count or 1,
        guests_count=booking_data.guests_count or 1,
        group_type=booking_data.group_type or "Solo Stay",
        total_amount=booking_data.total_amount,
        payment_method=booking_data.payment_method or "Credit / Debit Card",
        payment_status=booking_data.payment_status or "Paid",
        host_confirmed=False,
        status="Pending Host Confirmation",
        current_step=3,
        primary_guest_json=(
            json.dumps(booking_data.primary_guest.model_dump())
            if booking_data.primary_guest
            else None
        ),
        accompanying_guests_json=json.dumps(
            [g.model_dump() for g in booking_data.accompanying_guests]
        ),
        emergency_contact_json=(
            json.dumps(booking_data.emergency_contact.model_dump())
            if booking_data.emergency_contact
            else None
        ),
        marriage_certificate_name=booking_data.marriage_certificate_name,
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    host_user_id = _resolve_host_id(property_obj)
    if host_user_id:
        prop_name = (
            property_obj.title
            if property_obj and getattr(property_obj, "title", None)
            else (booking_data.property_title or "Property Stay")
        )
        guest_label = (
            booking_data.primary_guest.full_name
            if booking_data.primary_guest and booking_data.primary_guest.full_name
            else (current_user.full_name if current_user else "Guest")
        )
        notif = Notification(
            user_id=host_user_id,
            booking_id=new_booking.id,
            title="New Payment Received — Confirmation Required",
            message=(
                f"{guest_label} paid Rs. {int(new_booking.total_amount):,} for "
                f"{prop_name} ({new_booking.check_in} → {new_booking.check_out}). "
                f"Please confirm to unlock keys & move-in."
            ),
            notif_type="booking_confirmation",
            is_read=False,
            action_status="pending",
        )
        db.add(notif)
        db.commit()

    step_num, live_status = _compute_live_step_and_status(new_booking)
    photo_val = _extract_first_photo(property_obj)

    formatted_booking = {
        "id": new_booking.id,
        "property_id": new_booking.property_id,
        "guest_id": new_booking.guest_id,
        "propertyTitle": (
            property_obj.title
            if property_obj and getattr(property_obj, "title", None)
            else (booking_data.property_title or "Property Stay")
        ),
        "city": (
            property_obj.city
            if property_obj and getattr(property_obj, "city", None)
            else (
                property_obj.address
                if property_obj and getattr(property_obj, "address", None)
                else (booking_data.location or "Pakistan")
            )
        ),
        "property_image": photo_val,
        "check_in": new_booking.check_in,
        "check_out": new_booking.check_out,
        "nights_count": getattr(new_booking, "nights_count", 1) or 1,
        "guests_count": getattr(new_booking, "guests_count", 1) or 1,
        "group_type": getattr(new_booking, "group_type", None) or "Solo Stay",
        "total_amount": new_booking.total_amount,
        "payment_method": getattr(new_booking, "payment_method", None)
        or "Credit / Debit Card",
        "payment_status": getattr(new_booking, "payment_status", None) or "Paid",
        "host_confirmed": bool(getattr(new_booking, "host_confirmed", False)),
        "status": live_status,
        "current_step": step_num,
        "created_at": (
            new_booking.created_at.isoformat()
            if getattr(new_booking, "created_at", None)
            else None
        ),
    }

    return {
        "message": "Booking saved & sent to host for confirmation!",
        "booking": formatted_booking,
    }


@router.get("/my")
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view personal bookings.",
        )

    rows = (
        db.query(Booking, Property)
        .outerjoin(Property, Booking.property_id == Property.id)
        .filter(Booking.guest_id == current_user.id)
        .order_by(Booking.id.desc())
        .all()
    )

    result = []
    for booking, prop in rows:
        step_num, live_status = _compute_live_step_and_status(booking)
        photo_val = _extract_first_photo(prop)
        result.append(
            {
                "id": booking.id,
                "property_id": booking.property_id,
                "guest_id": booking.guest_id,
                "propertyTitle": (
                    prop.title
                    if prop and getattr(prop, "title", None)
                    else "Property Stay"
                ),
                "city": (
                    prop.city
                    if prop and getattr(prop, "city", None)
                    else (
                        prop.address
                        if prop and getattr(prop, "address", None)
                        else "Pakistan"
                    )
                ),
                "property_image": photo_val,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "nights_count": getattr(booking, "nights_count", 1) or 1,
                "guests_count": getattr(booking, "guests_count", 1) or 1,
                "group_type": getattr(booking, "group_type", None) or "Solo Stay",
                "total_amount": booking.total_amount,
                "payment_method": getattr(booking, "payment_method", None)
                or "SafePay Protected",
                "payment_status": getattr(booking, "payment_status", None) or "Paid",
                "host_confirmed": bool(getattr(booking, "host_confirmed", False)),
                "status": live_status,
                "current_step": step_num,
                "created_at": (
                    booking.created_at.isoformat()
                    if getattr(booking, "created_at", None)
                    else None
                ),
            }
        )

    return result


@router.post("/{booking_id}/confirm")
def confirm_booking_by_host(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user and booking.property_id:
        prop = db.query(Property).filter(Property.id == booking.property_id).first()
        prop_host_id = _resolve_host_id(prop)
        if (
            prop
            and prop_host_id is not None
            and prop_host_id != current_user.id
            and getattr(current_user, "role", None) != "admin"
        ):
            raise HTTPException(
                status_code=403, detail="Not authorized to confirm this booking"
            )

    booking.host_confirmed = True
    step_num, live_status = _compute_live_step_and_status(booking)
    booking.status = live_status
    booking.current_step = step_num

    related_notifs = (
        db.query(Notification).filter(Notification.booking_id == booking.id).all()
    )
    for n in related_notifs:
        n.action_status = "confirmed"
        n.is_read = True

    if booking.guest_id:
        db.add(
            Notification(
                user_id=booking.guest_id,
                booking_id=booking.id,
                title="Host Confirmed Your Booking",
                message=f"Your booking #{booking.id} is confirmed by the host.",
                notif_type="booking_confirmed_guest",
                is_read=False,
                action_status="confirmed",
            )
        )

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking confirmed by host!",
        "booking_id": booking.id,
        "host_confirmed": booking.host_confirmed,
        "status": booking.status,
        "current_step": booking.current_step,
    }
