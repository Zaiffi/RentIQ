from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.review import Review
from app.models.property import Property
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


# 1. Get all reviews for the logged-in host's properties (With Property Title & City)
@router.get("/host/reviews", status_code=status.HTTP_200_OK)
def get_host_property_reviews(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "host":
        raise HTTPException(status_code=403, detail="Not authorized as host")

    host_properties = (
        db.query(Property).filter(Property.host_id == current_user.id).all()
    )
    property_ids = [p.id for p in host_properties]

    # Map property ID to both title and city
    property_map = {
        p.id: {
            "title": p.title,
            "city": getattr(p, "city", "") or getattr(p, "location", ""),
        }
        for p in host_properties
    }

    reviews = (
        db.query(Review).filter(Review.property_id.in_(property_ids)).all()
        if property_ids
        else []
    )

    result = []
    for rev in reviews:
        user_obj = db.query(User).filter(User.id == rev.user_id).first()
        real_user_name = "Guest User"
        if user_obj:
            real_user_name = getattr(user_obj, "full_name", None) or getattr(
                user_obj, "name", "Guest User"
            )

        prop_info = property_map.get(
            rev.property_id, {"title": "Unknown Property", "city": ""}
        )

        result.append(
            {
                "id": rev.id,
                "property_id": rev.property_id,
                "property_title": prop_info["title"],
                "property_city": prop_info["city"],
                "user_name": real_user_name,
                "rating": rev.rating,
                "comment": rev.comment,
                "created_at": rev.created_at,
            }
        )

    return result


# 2. Get reviews for a specific property (Public)
@router.get("/{property_id}/reviews", status_code=status.HTTP_200_OK)
def get_property_reviews(property_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.property_id == property_id).all()

    result = []
    for rev in reviews:
        user_obj = db.query(User).filter(User.id == rev.user_id).first()
        real_user_name = "Guest User"
        if user_obj:
            real_user_name = getattr(user_obj, "full_name", None) or getattr(
                user_obj, "name", "Guest User"
            )

        result.append(
            {
                "id": rev.id,
                "property_id": rev.property_id,
                "user_name": real_user_name,
                "rating": rev.rating,
                "comment": rev.comment,
                "created_at": rev.created_at,
            }
        )
    return result


# 3. Create review using JSON body (For logged-in guests)
@router.post("/{property_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_review(
    property_id: int,
    review_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    property_item = db.query(Property).filter(Property.id == property_id).first()
    if not property_item:
        raise HTTPException(status_code=404, detail="Property not found")

    rating = review_data.get("rating", 5)
    comment = review_data.get("comment", "")

    new_review = Review(
        property_id=property_id,
        user_id=current_user.id,
        rating=int(rating),
        comment=str(comment),
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    user_obj = db.query(User).filter(User.id == current_user.id).first()
    real_user_name = "Guest User"
    if user_obj:
        real_user_name = getattr(user_obj, "full_name", None) or getattr(
            user_obj, "name", "Guest User"
        )

    return {
        "message": "Review submitted successfully!",
        "review": {
            "id": new_review.id,
            "property_id": new_review.property_id,
            "user_name": real_user_name,
            "rating": new_review.rating,
            "comment": new_review.comment,
            "created_at": new_review.created_at,
        },
    }


@router.delete("/reviews/{review_id}", status_code=status.HTTP_200_OK)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review_item = db.query(Review).filter(Review.id == review_id).first()
    if not review_item:
        raise HTTPException(status_code=404, detail="Review not found")

    if review_item.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this review"
        )

    db.delete(review_item)
    db.commit()
    return {"message": "Review deleted successfully"}
