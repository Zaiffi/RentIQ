from pydantic import BaseModel
from typing import List, Optional

class PropertyCreate(BaseModel):
    title: str
    description: str
    property_type: str
    city: str
    address: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: int
    amenities: List[str] = []
    photos: List[str] = []

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[int] = None
    amenities: Optional[List[str]] = None
    photos: Optional[List[str]] = None