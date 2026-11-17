from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.db.session import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in = Column(String(50), nullable=False)
    check_out = Column(String(50), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), default="Pending") # Confirmed, Pending, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)