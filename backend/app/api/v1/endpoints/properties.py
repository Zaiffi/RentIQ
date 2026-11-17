from fastapi import APIRouter, Depends, status, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.property import Property
from app.models.review import Review
from app.schemas.property_schema import PropertyCreate
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from typing import List, Optional
import json
import shutil
import os

router = APIRouter()

# Uploaded images ko save karne ke liye directory
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def property_to_dict(p, db: Session = None):
    # Calculate average rating and review count dynamically if db session is provided
    avg_rating = 0.0
    review_count = 0
    if db:
        avg_rating = (
            db.query(func.avg(Review.rating))
            .filter(Review.property_id == p.id)
            .scalar()
            or 0.0
        )
        review_count = (
            db.query(func.count(Review.id)).filter(Review.property_id == p.id).scalar()
            or 0
        )

    return {
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "property_type": p.property_type,
        "city": p.city,
        "address": p.address,
        "price_per_night": p.price_per_night,
        "max_guests": p.max_guests,
        "bedrooms": p.bedrooms,
        "beds": p.beds,
        "bathrooms": p.bathrooms,
        "amenities": p.amenities,
        "photos": p.photos,
        "host_id": p.host_id,
        "is_active": getattr(p, "is_active", True),  # Status return karne ke liye
        "average_rating": round(float(avg_rating), 1),
        "review_count": review_count,
    }


# 1. Get all properties of the host
@router.get("/my-properties", status_code=status.HTTP_200_OK)
def get_host_properties(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    host_properties = (
        db.query(Property).filter(Property.host_id == current_user.id).all()
    )
    return [property_to_dict(p, db) for p in host_properties]


# 2. YouTube-style Live Search & Filter API Endpoint (Sab properties ya filtered properties laane ke liye)
@router.get("/", status_code=status.HTTP_200_OK)
def search_properties(
    search: Optional[str] = None,  # Title, description, ya city mein keyword search
    city: Optional[str] = None,  # City ke mutabiq filter
    property_type: Optional[str] = None,  # Property type (House, Flat, etc.)
    min_price: Optional[float] = None,  # Minimum price range
    max_price: Optional[float] = None,  # Maximum price range
    bedrooms: Optional[int] = None,  # Bedrooms count
    db: Session = Depends(get_db),
):
    query = db.query(Property).filter(Property.is_active == True)

    # Agar user ne search bar mein kuch type kiya ho (Keyword search)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Property.title.ilike(search_filter))
            | (Property.description.ilike(search_filter))
            | (Property.city.ilike(search_filter))
        )

    # City filter
    if city and city.lower() != "all":
        query = query.filter(Property.city.ilike(f"%{city}%"))

    # Property Type filter
    if property_type and property_type.lower() != "all":
        query = query.filter(Property.property_type.ilike(f"%{property_type}%"))

    # Price Range filters
    if min_price is not None:
        query = query.filter(Property.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Property.price_per_night <= max_price)

    # Bedrooms filter
    if bedrooms is not None:
        query = query.filter(Property.bedrooms >= bedrooms)

    properties = query.all()
    return [property_to_dict(p, db) for p in properties]


# 3. Property create karne ka endpoint (FormData & Files handle karne ke liye)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_property(
    title: str = Form(...),
    description: str = Form(...),
    property_type: str = Form(...),
    city: str = Form(...),
    address: str = Form(...),
    price_per_night: float = Form(...),
    max_guests: int = Form(...),
    bedrooms: int = Form(...),
    beds: int = Form(...),
    bathrooms: int = Form(...),
    amenities: Optional[str] = Form(None),
    photos: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # Amenities parsing
        am_string = ""
        if amenities:
            try:
                am_list = json.loads(amenities)
                am_string = (
                    ",".join(am_list) if isinstance(am_list, list) else str(amenities)
                )
            except:
                am_string = amenities

        # Photos saving logic
        final_photos = []
        if photos is not None:
            for photo in photos:
                file_path = os.path.join(UPLOAD_DIR, photo.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(photo.file, buffer)
                final_photos.append(f"static/uploads/{photo.filename}")

        new_property = Property(
            title=title,
            description=description,
            property_type=property_type,
            city=city,
            address=address,
            price_per_night=price_per_night,
            max_guests=max_guests,
            bedrooms=bedrooms,
            beds=beds,
            bathrooms=bathrooms,
            amenities=am_string,
            photos=",".join(final_photos),
            host_id=current_user.id,
            is_active=True,  # Default active state
        )
        db.add(new_property)
        db.commit()
        db.refresh(new_property)
        return {
            "message": "Property created successfully!",
            "property_id": new_property.id,
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating property: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# 4. Property update karne ka endpoint
@router.put("/{property_id}", status_code=status.HTTP_200_OK)
def update_property(
    property_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    property_type: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    price_per_night: Optional[float] = Form(None),
    max_guests: Optional[int] = Form(None),
    bedrooms: Optional[int] = Form(None),
    beds: Optional[int] = Form(None),
    bathrooms: Optional[int] = Form(None),
    amenities: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),  # Status update karne ke liye parameter
    existing_photos: Optional[str] = Form(None),
    photos: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Pehle check karein ke property ID database mein mojood hai ya nahi
    property_item = db.query(Property).filter(Property.id == property_id).first()
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")

    # Phir check karein ke kya yeh property isi logged-in host ki hai
    if property_item.host_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Unauthorized: You do not own this property"
        )

    try:
        if title is not None:
            property_item.title = title
        if description is not None:
            property_item.description = description
        if property_type is not None:
            property_item.property_type = property_type
        if city is not None:
            property_item.city = city
        if address is not None:
            property_item.address = address
        if price_per_night is not None:
            property_item.price_per_night = price_per_night
        if max_guests is not None:
            property_item.max_guests = max_guests
        if bedrooms is not None:
            property_item.bedrooms = bedrooms
        if beds is not None:
            property_item.beds = beds
        if bathrooms is not None:
            property_item.bathrooms = bathrooms

        # Status update check
        if is_active is not None:
            property_item.is_active = is_active

        if amenities is not None:
            try:
                am_list = json.loads(amenities)
                property_item.amenities = (
                    ",".join(am_list) if isinstance(am_list, list) else str(am_list)
                )
            except:
                property_item.amenities = amenities

        final_photos = []
        if existing_photos:
            try:
                parsed_existing = json.loads(existing_photos)
                if isinstance(parsed_existing, list):
                    final_photos.extend(parsed_existing)
            except:
                final_photos.append(existing_photos)

        if photos is not None:
            for photo in photos:
                file_path = os.path.join(UPLOAD_DIR, photo.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(photo.file, buffer)
                final_photos.append(f"static/uploads/{photo.filename}")

        if final_photos:
            property_item.photos = ",".join(final_photos)

        db.commit()
        db.refresh(property_item)
        return {
            "message": "Property updated successfully!",
            "property": property_to_dict(property_item, db),
        }
    except Exception as e:
        db.rollback()
        print(f"Error updating property: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# 5. Property delete karne ka endpoint
@router.delete("/{property_id}", status_code=status.HTTP_200_OK)
def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Pehle check karein ke property ID database mein mojood hai ya nahi
    property_item = db.query(Property).filter(Property.id == property_id).first()
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")

    # Phir check karein ke kya yeh property isi logged-in host ki hai
    if property_item.host_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Unauthorized: You do not own this property"
        )

    db.delete(property_item)
    db.commit()
    return {"message": "Property deleted successfully"}


# 6. Single property detail get karne ka endpoint
@router.get("/{property_id}")
def get_property_detail(property_id: int, db: Session = Depends(get_db)):
    property_item = db.query(Property).filter(Property.id == property_id).first()
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_to_dict(property_item, db)
