from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.db.session import engine, Base
from app.models.user import User
from app.models.property import Property
from app.models.review import Review
from app.models.booking import Booking
from app.models.notification import Notification
from app.api.v1.endpoints import (
    auth,
    properties,
    admin,
    reviews,
    bookings,
    notifications,
)

app = FastAPI(title="RentIQ API", version="1.0")

# Explicit CORS origins for React Frontend (localhost:3000 & Vite:5173)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static/uploads directory exists
os.makedirs("static/uploads", exist_ok=True)

# Mount static files directory so images can be served via URL
app.mount("/static", StaticFiles(directory="static"), name="static")


# Automatically create tables in MySQL on startup
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created successfully in MySQL (rentiq_db)!")


# Registering Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(properties.router, prefix="/api/v1/properties", tags=["Properties"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(reviews.router, prefix="/api/v1/properties", tags=["Reviews"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(
    notifications.router, prefix="/api/v1/notifications", tags=["Notifications"]
)


@app.get("/")
def read_root():
    return {"message": "Welcome to RentIQ Backend API!"}
