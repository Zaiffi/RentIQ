import pandas as pd
import os
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.property import Property as PropertyModel


def import_csv_data():
    file_path = "data/zameen-updated.csv"

    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    print("Reading CSV file...")
    df = pd.read_csv(file_path)

    # Testing ke liye pehli 500 rows import karte hain taake fast chale
    df = df.head(500)
    print(f"Processing {len(df)} rows into database...")

    db: Session = SessionLocal()

    count = 0
    for index, row in df.iterrows():
        try:
            # 1. Title generate karna
            prop_type = str(row.get("property_type", "House"))
            location = str(row.get("location", "Prime Location"))
            area_size = str(row.get("Area Size", ""))
            area_type = str(row.get("Area Type", ""))
            generated_title = f"{area_size} {area_type} {prop_type} in {location}"[:200]

            # 2. City aur Address
            city = str(row.get("city", "Lahore"))
            address = str(row.get("location", "Pakistan"))[:255]

            # 3. Price (price_per_night)
            price_val = (
                float(row.get("price", 50000)) if pd.notna(row.get("price")) else 50000
            )

            # 4. Bedrooms, Bathrooms & Guests
            beds_val = (
                int(row.get("bedrooms", 2))
                if pd.notna(row.get("bedrooms")) and row.get("bedrooms") > 0
                else 2
            )
            baths_val = (
                int(row.get("baths", 2))
                if pd.notna(row.get("baths")) and row.get("baths") > 0
                else 2
            )
            guests_val = beds_val * 2  # Har bedroom ke hisaab se guests ka anuman

            # 5. Description
            purpose = str(row.get("purpose", "For Rent"))
            generated_desc = f"Beautiful {prop_type} available {purpose} in {location}, {city}. Features {beds_val} bedrooms and {baths_val} bathrooms."[
                :500
            ]

            # 6. Default Amenities & Photos
            default_amenities = "Wi-Fi,Kitchen,Air Conditioning,Parking,TV"
            default_photo = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"

            # Database Model Mapping (Aapke exact table columns ke mutabiq)
            db_property = PropertyModel(
                title=generated_title,
                description=generated_desc,
                property_type=prop_type,
                city=city,
                address=address,
                price_per_night=price_val,
                max_guests=guests_val,
                bedrooms=beds_val,
                beds=beds_val,
                bathrooms=baths_val,
                amenities=default_amenities,
                photos=default_photo,
                host_id=12,  # Host ID 12 assigned
                is_active=True,
            )

            db.add(db_property)
            db.commit()
            count += 1

            if count % 50 == 0:
                print(f"Successfully saved {count} properties...")

        except Exception as e:
            db.rollback()
            print(f"Error at row {index}: {e}")

    db.close()
    print(f"🎉 Success! Total {count} properties successfully imported into database!")


if __name__ == "__main__":
    import_csv_data()
