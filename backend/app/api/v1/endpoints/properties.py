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
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import re
import json
import shutil
import os

router = APIRouter()

# Uploaded images ko save karne ke liye directory
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Trained Filter/Search Relevance Model ka path
CANDIDATE_MODEL_PATHS = [
    Path(__file__).resolve().parents[3] / "ml_models" / "filter_ranker.pkl",
    Path(__file__).resolve().parents[4] / "ml_models" / "filter_ranker.pkl",
]
MODEL_PATH = next(
    (p for p in CANDIDATE_MODEL_PATHS if p.exists()), CANDIDATE_MODEL_PATHS[0]
)
ranker_bundle = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None

CITY_ALIASES = {
    "islamabad": "Islamabad",
    "islamabd": "Islamabad",
    "isb": "Islamabad",
    "lahore": "Lahore",
    "lhr": "Lahore",
    "karachi": "Karachi",
    "khi": "Karachi",
    "murree": "Murree",
    "rawalpindi": "Rawalpindi",
    "rwp": "Rawalpindi",
}

TYPE_ALIASES = {
    "house": "House",
    "houses": "House",
    "apartment": "Apartment",
    "apartments": "Apartment",
    "flat": "Apartment",
    "flats": "Apartment",
    "villa": "Villa",
    "villas": "Villa",
    "portion": "Portion",
    "portions": "Portion",
    "family portion": "Portion",
    "penthouse": "Penthouse",
    "penthouses": "Penthouse",
}

STOP_WORDS = {
    "in",
    "at",
    "for",
    "with",
    "the",
    "and",
    "a",
    "an",
    "of",
    "to",
    "near",
    "me",
}


def parse_search_intent(search_text: Optional[str]):
    if not search_text or not search_text.strip():
        return {"inferred_city": None, "inferred_type": None, "keywords": []}

    raw_lower = search_text.strip().lower()
    tokens = re.findall(r"[a-z0-9]+", raw_lower)

    inferred_city = None
    inferred_type = None

    if "family portion" in raw_lower:
        inferred_type = "Portion"

    for tok in tokens:
        if tok in CITY_ALIASES and not inferred_city:
            inferred_city = CITY_ALIASES[tok]
        if tok in TYPE_ALIASES and not inferred_type:
            inferred_type = TYPE_ALIASES[tok]

    keywords = [
        tok
        for tok in tokens
        if tok not in STOP_WORDS
        and tok not in CITY_ALIASES
        and tok not in TYPE_ALIASES
        and len(tok) > 1
    ]

    return {
        "inferred_city": inferred_city,
        "inferred_type": inferred_type,
        "keywords": keywords,
    }


def _score_and_sort_with_model(
    items: list,
    query_text: str,
    city_target: Optional[str],
    type_target: Optional[str],
    min_price: Optional[float],
    max_price: Optional[float],
    bedrooms: Optional[int],
    bedrooms_plus: bool,
):
    if not items:
        return []

    global ranker_bundle
    if ranker_bundle is None and MODEL_PATH.exists():
        ranker_bundle = joblib.load(MODEL_PATH)

    if not ranker_bundle:
        for item in items:
            item["relevance_score"] = 0.5
        return items

    model = ranker_bundle["model"]
    vectorizer = ranker_bundle["vectorizer"]

    q_vec = vectorizer.transform([query_text]) if query_text else None
    prop_texts = [
        f"{p.get('title', '')} {p.get('city', '')} {p.get('property_type', '')} {p.get('address', '')} {p.get('description', '')} {p.get('amenities', '') or ''}"
        for p in items
    ]
    prop_matrix = vectorizer.transform(prop_texts)
    sims = (
        cosine_similarity(q_vec, prop_matrix).flatten()
        if q_vec is not None
        else np.zeros(len(items))
    )

    rows = []
    for idx, p in enumerate(items):
        price_val = float(p.get("price_per_night") or 0)
        beds_val = float(p.get("bedrooms") or 0)
        baths_val = float(p.get("bathrooms") or 0)
        area_val = float(p.get("area_size") or p.get("area") or 0)

        city_match = (
            1.0
            if (
                city_target
                and str(p.get("city", "")).strip().lower() == city_target.lower()
            )
            else 0.0
        )
        type_match = (
            1.0
            if (
                type_target
                and str(p.get("property_type", "")).strip().lower()
                == type_target.lower()
            )
            else 0.0
        )

        within_min = min_price is None or price_val >= float(min_price)
        within_max = max_price is None or price_val <= float(max_price)
        price_fit = 1.0 if (within_min and within_max) else 0.0

        if bedrooms is None:
            beds_fit = 1.0
        elif bedrooms_plus:
            beds_fit = 1.0 if beds_val >= float(bedrooms) else 0.0
        else:
            beds_fit = 1.0 if beds_val == float(bedrooms) else 0.0

        req_baths = max(1.0, float(bedrooms) - 1.0) if bedrooms is not None else 0.0
        baths_fit = 1.0 if (bedrooms is None or baths_val >= req_baths) else 0.0

        rows.append(
            [
                float(sims[idx]),
                city_match,
                type_match,
                price_fit,
                beds_fit,
                baths_fit,
                min(area_val, 100.0),
            ]
        )

    feature_cols = ranker_bundle.get(
        "features",
        [
            "tfidf_sim",
            "city_match",
            "type_match",
            "price_fit",
            "beds_fit",
            "baths_fit",
            "area_size",
        ],
    )
    X_live = pd.DataFrame(rows, columns=feature_cols)
    scores = model.predict_proba(X_live)[:, 1]

    scored_properties = sorted(
        zip(items, scores),
        key=lambda pair: pair[1],
        reverse=True,
    )

    ranked_results = []
    for prop_dict, score in scored_properties:
        prop_dict["relevance_score"] = round(float(score), 4)
        ranked_results.append(prop_dict)

    return ranked_results


def rank_properties_with_model(
    properties: list,
    search: Optional[str] = None,
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bedrooms_plus: bool = False,
    db: Session = None,
):
    if not properties:
        return []

    prop_dicts = [property_to_dict(p, db) for p in properties]

    clean_city = (
        city.strip() if city and city.strip().lower() not in ("", "all") else None
    )
    clean_type = (
        property_type.strip()
        if property_type and property_type.strip().lower() not in ("", "all")
        else None
    )
    clean_search = search.strip() if search and search.strip() else None

    intent = parse_search_intent(clean_search)
    effective_city = clean_city or intent["inferred_city"]
    effective_type = clean_type or intent["inferred_type"]
    search_keywords = intent["keywords"]

    has_active_filters = bool(
        clean_search
        or clean_city
        or clean_type
        or min_price is not None
        or max_price is not None
        or bedrooms is not None
    )
    if not has_active_filters:
        return prop_dicts

    # 1. Hard filtering for explicit/inferred city, type, price, and bedrooms
    base_filtered = []
    for p in prop_dicts:
        p_city = str(p.get("city") or "").strip().lower()
        p_type = str(p.get("property_type") or "").strip().lower()
        price_val = float(p.get("price_per_night") or 0)
        beds_val = float(p.get("bedrooms") or 0)

        if effective_city and p_city != effective_city.lower():
            continue

        if effective_type and p_type != effective_type.lower():
            continue

        if min_price is not None and price_val < float(min_price):
            continue

        if max_price is not None and price_val > float(max_price):
            continue

        if bedrooms is not None:
            if bedrooms_plus:
                if beds_val < float(bedrooms):
                    continue
            else:
                if beds_val != float(bedrooms):
                    continue

        base_filtered.append(p)

    # 2. Check remaining non-stop keywords against property fields
    strict_matches = []
    for p in base_filtered:
        combined_text = (
            f"{p.get('title', '')} {p.get('city', '')} {p.get('property_type', '')} "
            f"{p.get('address', '')} {p.get('description', '')} {p.get('amenities', '') or ''}"
        ).lower()

        if search_keywords:
            if all(kw in combined_text for kw in search_keywords):
                strict_matches.append(p)
        else:
            strict_matches.append(p)

    query_parts = []
    if clean_search:
        query_parts.append(clean_search)
    if effective_city:
        query_parts.append(effective_city)
    if effective_type:
        query_parts.append(effective_type)
    query_text = " ".join(query_parts).strip()

    # Agar matching properties mil jayein toh sirf wahi rank karke return karein
    if strict_matches:
        return _score_and_sort_with_model(
            items=strict_matches,
            query_text=query_text,
            city_target=effective_city,
            type_target=effective_type,
            min_price=min_price,
            max_price=max_price,
            bedrooms=bedrooms,
            bedrooms_plus=bedrooms_plus,
        )

    # Agar koi exact scenario match na kare toh fallback ke tor par most related properties return karein
    fallback_candidates = base_filtered if base_filtered else prop_dicts
    ranked_fallback = _score_and_sort_with_model(
        items=fallback_candidates,
        query_text=query_text,
        city_target=effective_city,
        type_target=effective_type,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bedrooms_plus=bedrooms_plus,
    )
    return ranked_fallback[:9]


def property_to_dict(p, db: Session = None):
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
        "is_active": getattr(p, "is_active", True),
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


# 2. ML Relevance Ranking Search & Filter API Endpoint
@router.get("/", status_code=status.HTTP_200_OK)
def search_properties(
    search: Optional[str] = None,
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    bedrooms_plus: bool = False,
    db: Session = Depends(get_db),
):
    active_properties = db.query(Property).filter(Property.is_active == True).all()

    return rank_properties_with_model(
        properties=active_properties,
        search=search,
        city=city,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bedrooms_plus=bedrooms_plus,
        db=db,
    )


# 3. Property create karne ka endpoint
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
        am_string = ""
        if amenities:
            try:
                am_list = json.loads(amenities)
                am_string = (
                    ",".join(am_list) if isinstance(am_list, list) else str(amenities)
                )
            except Exception:
                am_string = amenities

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
            is_active=True,
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
    is_active: Optional[bool] = Form(None),
    existing_photos: Optional[str] = Form(None),
    photos: Optional[List[UploadFile]] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    property_item = db.query(Property).filter(Property.id == property_id).first()
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")

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

        if is_active is not None:
            property_item.is_active = is_active

        if amenities is not None:
            try:
                am_list = json.loads(amenities)
                property_item.amenities = (
                    ",".join(am_list) if isinstance(am_list, list) else str(am_list)
                )
            except Exception:
                property_item.amenities = amenities

        final_photos = []
        if existing_photos:
            try:
                parsed_existing = json.loads(existing_photos)
                if isinstance(parsed_existing, list):
                    final_photos.extend(parsed_existing)
            except Exception:
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
    property_item = db.query(Property).filter(Property.id == property_id).first()
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")

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
