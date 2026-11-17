from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


# 1. Pending hosts ki list get karne ka endpoint
@router.get("/pending-hosts", status_code=status.HTTP_200_OK)
def get_pending_hosts(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    pending_hosts = (
        db.query(User).filter(User.role == "host", User.is_approved == False).all()
    )
    return pending_hosts


# 2. Host ko Approve karne ka endpoint
@router.put("/approve-host/{user_id}", status_code=status.HTTP_200_OK)
def approve_host(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    host_user = db.query(User).filter(User.id == user_id, User.role == "host").first()
    if not host_user:
        raise HTTPException(status_code=404, detail="Host not found")

    host_user.is_approved = True
    db.commit()
    return {"message": f"Host {host_user.full_name} approved successfully!"}
