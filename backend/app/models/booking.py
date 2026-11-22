from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from app.db.session import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    check_in = Column(String(50), nullable=False)
    check_out = Column(String(50), nullable=False)
    nights_count = Column(Integer, default=1)
    guests_count = Column(Integer, default=1)
    group_type = Column(String(50), default="Solo Stay")
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(100), nullable=True)
    payment_status = Column(String(30), default="Paid")
    host_confirmed = Column(Boolean, default=False)
    status = Column(String(40), default="Pending Host Confirmation")
    current_step = Column(Integer, default=3)
    primary_guest_json = Column(Text, nullable=True)
    accompanying_guests_json = Column(Text, nullable=True)
    emergency_contact_json = Column(Text, nullable=True)
    marriage_certificate_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
