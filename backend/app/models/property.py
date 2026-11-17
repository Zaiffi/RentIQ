from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Boolean
from app.db.session import Base  # base_class ki jagah session ya base use karein


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False)
    city = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)
    price_per_night = Column(Float, nullable=False)
    max_guests = Column(Integer, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    beds = Column(Integer, nullable=False)
    bathrooms = Column(Integer, nullable=False)
    amenities = Column(String(500), nullable=True)
    photos = Column(Text, nullable=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
