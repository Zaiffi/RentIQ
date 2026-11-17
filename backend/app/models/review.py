from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 se 5 tak stars
    comment = Column(Text, nullable=False)  # Review message
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships (Optional but good for easy joining)
    property = relationship("Property", backref="reviews")
    user = relationship("User", backref="reviews")
