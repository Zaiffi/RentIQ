from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.user_schema import UserRegister, UserLogin, Token, ResetPasswordRequest
from app.core.security import hash_password, verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = (
        db.query(UserModel).filter(UserModel.email == user_data.email).first()
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Email pehle se registered hai!")

    hashed_pwd = hash_password(user_data.password)
    is_user_approved = True if user_data.role in ["guest", "admin"] else False

    new_user = UserModel(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=user_data.role,
        is_approved=is_user_approved,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    msg = (
        "User successfully registered!"
        if is_user_approved
        else "Host registered successfully! Please wait for admin approval to login."
    )
    return {"message": msg}


@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if user.role == "host" and not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your host account is pending admin approval. Please wait until approved.",
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_approved": user.is_approved,
        },
    }


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email.ilike(data.email.strip())).first()
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="Is email par koi account registered nahi hai!"
        )
    
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password successfully updated!"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
