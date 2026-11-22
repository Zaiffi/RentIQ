from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from app.db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notif_type = Column(String(50), default="booking_confirmation")
    is_read = Column(Boolean, default=False)
    action_status = Column(
        String(30), default="pending"
    )  # pending, confirmed, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
