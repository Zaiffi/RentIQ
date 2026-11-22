from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import GroupShuffleSplit

BASE_DIR = Path(__file__).resolve().parent

# Apni CSV file ka exact naam yahan set karein (agar ml_models ya backend folder mein pari ho)
CANDIDATE_CSV_PATHS = [
    BASE_DIR.parent / "data" / "zameen-updated.csv",  # backend/data/zameen-updated.csv
    BASE_DIR.parent.parent
    / "data"
    / "zameen-updated.csv",  # RentIQ/data/zameen-updated.csv
    BASE_DIR / "zameen-updated.csv",
    BASE_DIR.parent / "zameen-updated.csv",
    BASE_DIR / "properties.csv",
    BASE_DIR.parent / "properties.csv",
]

csv_path = next((p for p in CANDIDATE_CSV_PATHS if p.exists()), None)
if csv_path is None:
    raise FileNotFoundError(
        "CSV file nahi mili! Kripya train_filter_ranker.py mein apni CSV file ka exact path dein."
    )

print(f"Loading dataset from: {csv_path}")
df = pd.read_csv(csv_path, low_memory=False).fillna("")

# Text columns combine karke TF-IDF matrix banana
text_cols = [
    "property_type",
    "location",
    "city",
    "province_name",
    "purpose",
    "Area Type",
    "Area Category",
]
available_text_cols = [c for c in text_cols if c in df.columns]

combined_text = pd.Series([""] * len(df), index=df.index)
for col in available_text_cols:
    combined_text = combined_text + " " + df[col].astype(str)

vectorizer = TfidfVectorizer(stop_words="english")
prop_matrix = vectorizer.fit_transform(combined_text)

# Filter & search scenarios (aapke CSV ke cities, types aur budget ke mutabiq)
FILTER_SCENARIOS = [
    {
        "query_id": 1,
        "text": "House Lahore DHA Marla",
        "city": "Lahore",
        "property_type": "House",
        "max_price": 150000,
        "bedrooms": 4,
    },
    {
        "query_id": 2,
        "text": "Flat Islamabad apartment",
        "city": "Islamabad",
        "property_type": "Flat",
        "max_price": 90000,
        "bedrooms": 2,
    },
    {
        "query_id": 3,
        "text": "House Karachi family portion",
        "city": "Karachi",
        "property_type": "House",
        "max_price": 120000,
        "bedrooms": 3,
    },
    {
        "query_id": 4,
        "text": "House Rawalpindi Bahria",
        "city": "Rawalpindi",
        "property_type": "House",
        "max_price": 130000,
        "bedrooms": 3,
    },
]

price_series = pd.to_numeric(df.get("price", 0), errors="coerce").fillna(0.0)
beds_series = pd.to_numeric(df.get("bedrooms", 0), errors="coerce").fillna(0.0)
baths_series = pd.to_numeric(df.get("baths", 0), errors="coerce").fillna(0.0)
area_size_series = pd.to_numeric(df.get("Area Size", 0), errors="coerce").fillna(0.0)

rows = []
for sc in FILTER_SCENARIOS:
    q_vec = vectorizer.transform([sc["text"]])
    sims = cosine_similarity(q_vec, prop_matrix).flatten()

    for pos, (idx, prop) in enumerate(df.iterrows()):
        prop_city = str(prop.get("city", "")).strip().lower()
        prop_type = str(prop.get("property_type", "")).strip().lower()
        price_val = float(price_series.iloc[pos])
        beds_val = float(beds_series.iloc[pos])
        baths_val = float(baths_series.iloc[pos])
        area_val = float(area_size_series.iloc[pos])

        city_match = 1.0 if prop_city == sc["city"].lower() else 0.0
        type_match = 1.0 if prop_type == sc["property_type"].lower() else 0.0
        price_fit = 1.0 if (0 < price_val <= sc["max_price"]) else 0.0
        beds_fit = 1.0 if beds_val >= sc["bedrooms"] else 0.0
        baths_fit = 1.0 if baths_val >= max(1.0, sc["bedrooms"] - 1.0) else 0.0
        sim_score = float(sims[pos])

        is_relevant = (
            1
            if (
                city_match == 1.0
                and price_fit == 1.0
                and (type_match == 1.0 or beds_fit == 1.0)
            )
            or sim_score >= 0.25
            else 0
        )

        rows.append(
            {
                "query_id": sc["query_id"],
                "tfidf_sim": sim_score,
                "city_match": city_match,
                "type_match": type_match,
                "price_fit": price_fit,
                "beds_fit": beds_fit,
                "baths_fit": baths_fit,
                "area_size": min(area_val, 100.0),
                "target": is_relevant,
            }
        )

feat_df = pd.DataFrame(rows)
feature_cols = [
    "tfidf_sim",
    "city_match",
    "type_match",
    "price_fit",
    "beds_fit",
    "baths_fit",
    "area_size",
]

X = feat_df[feature_cols]
y = feat_df["target"]
groups = feat_df["query_id"]

splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
train_idx, val_idx = next(splitter.split(X, y, groups))

filter_model = HistGradientBoostingClassifier(
    max_depth=5,
    learning_rate=0.08,
    max_iter=150,
    random_state=42,
)
filter_model.fit(X.iloc[train_idx], y.iloc[train_idx])

val_probs = filter_model.predict_proba(X.iloc[val_idx])[:, 1]
print("Validation sample relevance scores:", np.round(val_probs[:5], 3))

output_path = BASE_DIR / "filter_ranker.pkl"
joblib.dump(
    {
        "model": filter_model,
        "vectorizer": vectorizer,
        "features": feature_cols,
    },
    output_path,
)
print(f"Saved trained filter ranking model to: {output_path}")
