import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Heart,
  Bed,
  Bath,
  Users,
  ArrowLeft,
  Trash2,
  Search,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Favorites() {
  const navigate = useNavigate();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);

  const safeGetStorage = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeSetStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error("Storage write error:", err);
    }
  };

  const getAccountKey = () => {
    const currentUserId = safeGetStorage("userId") || safeGetStorage("user_id");
    const rawKey =
      currentUserId ||
      safeGetStorage("email") ||
      safeGetStorage("userName") ||
      safeGetStorage("user_name") ||
      "guest";
    return String(rawKey).trim().toLowerCase() || "guest";
  };

  const getStorageKey = () => `rentiq_favorites_${getAccountKey()}`;

  const readLocalFavorites = () => {
    try {
      const raw = safeGetStorage(getStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (err) {
      console.error("Error parsing favorites:", err);
      return [];
    }
  };

  const writeLocalFavorites = (items) => {
    safeSetStorage(
      getStorageKey(),
      JSON.stringify(Array.isArray(items) ? items : []),
    );
  };

  const showTimedToast = (message) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const resolveImage = (prop) => {
    if (!prop) {
      return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80";
    }
    if (typeof prop.image === "string" && prop.image.trim()) {
      return prop.image.startsWith("http")
        ? prop.image
        : `http://localhost:8000/${prop.image}`;
    }
    if (typeof prop.photos === "string" && prop.photos.trim()) {
      const firstPhoto = prop.photos
        .replace(/["[\]]/g, "")
        .split(",")[0]
        ?.trim();
      if (firstPhoto) {
        return firstPhoto.startsWith("http")
          ? firstPhoto
          : `http://localhost:8000/${firstPhoto}`;
      }
    }
    return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80";
  };

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      setLoading(true);
      const localItems = readLocalFavorites();
      if (isMounted) {
        setFavoriteProperties(localItems);
      }

      const token = safeGetStorage("token");
      if (token) {
        try {
          const response = await fetch(
            "http://localhost:8000/api/v1/favorites",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.ok && isMounted) {
            const data = await response.json();
            const backendList = Array.isArray(data)
              ? data
              : Array.isArray(data?.favorites)
                ? data.favorites
                : Array.isArray(data?.items)
                  ? data.items
                  : null;

            if (backendList) {
              writeLocalFavorites(backendList);
              setFavoriteProperties(backendList);
            }
          }
        } catch {
          // Keep local user-specific favorites if backend route is unavailable
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadFavorites();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveFavorite = async (e, propertyId) => {
    e.stopPropagation();
    const updated = favoriteProperties.filter(
      (item) => String(item?.id) !== String(propertyId),
    );
    writeLocalFavorites(updated);
    setFavoriteProperties(updated);
    showTimedToast("Property removed from favorites");

    const token = safeGetStorage("token");
    if (token) {
      try {
        await fetch(`http://localhost:8000/api/v1/favorites/${propertyId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Local state already updated
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <div>
        <Navbar />

        {/* Auto-dismiss 3-second Theme-Matched Toast Popup (no OK/Cancel buttons) */}
        {toastMessage && (
          <div className="fixed top-24 right-5 z-50 bg-white text-gray-900 px-4 py-3 rounded-2xl shadow-xl border border-coral-500/20 flex items-center gap-3 text-xs font-bold">
            <div className="w-7 h-7 rounded-xl bg-coral-500/10 text-coral-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-coral-500 bg-white border border-gray-200 px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                My Favorites
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Properties saved to your personal wishlist (
                {favoriteProperties.length})
              </p>
            </div>

            {favoriteProperties.length > 0 && (
              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
              >
                <Search size={14} className="text-coral-500" />
                Explore More
              </button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-20 text-center">
              <p className="text-sm font-bold text-gray-600 animate-pulse">
                Loading your saved properties...
              </p>
            </div>
          ) : favoriteProperties.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center max-w-lg mx-auto my-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-coral-500/10 text-coral-500 flex items-center justify-center mx-auto">
                <Heart size={26} />
              </div>
              <h2 className="text-lg font-black text-gray-900">
                No Saved Properties Yet
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                Tap the heart icon on any property detail page to save it here
                for later.
              </p>
              <button
                type="button"
                onClick={() => navigate("/explore")}
                className="inline-flex items-center justify-center px-6 py-3 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map((prop, index) => {
                const priceVal = Number(
                  prop.price_per_night ?? prop.pricePerNight ?? 50000,
                );
                const propRating = Number(
                  prop.rating ?? prop.average_rating ?? 0,
                );

                return (
                  <div
                    key={prop.id ?? index}
                    onClick={() => prop.id && navigate(`/property/${prop.id}`)}
                    className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition overflow-hidden cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-52 overflow-hidden bg-gray-100">
                        <img
                          src={resolveImage(prop)}
                          alt={prop.title || "Saved Property"}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFavorite(e, prop.id)}
                          title="Remove from Favorites"
                          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/95 text-rose-500 shadow-md hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-base font-extrabold text-gray-900 line-clamp-1">
                            {prop.title || "Property"}
                          </h2>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 shrink-0">
                            <Star
                              size={13}
                              className="fill-amber-400 text-amber-400"
                            />
                            {propRating > 0 ? propRating.toFixed(1) : "New"}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 line-clamp-1">
                          <MapPin
                            size={13}
                            className="text-coral-500 shrink-0"
                          />
                          {prop.address || prop.city || "Location available"}
                        </p>

                        <div className="flex items-center gap-4 pt-1 text-[11px] font-bold text-gray-600">
                          {prop.bedrooms !== undefined && (
                            <span className="inline-flex items-center gap-1">
                              <Bed size={13} className="text-gray-400" />
                              {prop.bedrooms} Beds
                            </span>
                          )}
                          {prop.bathrooms !== undefined && (
                            <span className="inline-flex items-center gap-1">
                              <Bath size={13} className="text-gray-400" />
                              {prop.bathrooms} Baths
                            </span>
                          )}
                          {(prop.max_guests || prop.maxGuests) && (
                            <span className="inline-flex items-center gap-1">
                              <Users size={13} className="text-gray-400" />
                              {prop.max_guests || prop.maxGuests} Guests
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <div>
                        <span className="text-base font-black text-gray-900">
                          Rs.{" "}
                          {Number.isNaN(priceVal)
                            ? "50,000"
                            : priceVal.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {" "}
                          / night
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveFavorite(e, prop.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
