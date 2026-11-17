import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  MessageSquare,
  Building2,
  User,
  ChevronDown,
  MapPin,
} from "lucide-react";

export default function HostReviewsPanel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchHostReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:8000/api/v1/properties/host/reviews",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Error fetching host reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHostReviews();
  }, []);

  // Dropdown ke bahar click karne par band karne ke liye
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unique properties with title & city
  const uniqueProperties = Array.from(
    new Map(
      reviews.map((rev) => [
        rev.property_id,
        {
          id: rev.property_id,
          title: rev.property_title,
          city: rev.property_city,
        },
      ]),
    ).values(),
  );

  // Filter reviews based on selected property
  const filteredReviews =
    selectedProperty === "all"
      ? reviews
      : reviews.filter(
          (rev) => rev.property_id.toString() === selectedProperty.toString(),
        );

  // Selected label display ke liye
  const getSelectedLabel = () => {
    if (selectedProperty === "all") {
      return `All Properties (${reviews.length} Reviews)`;
    }
    const found = uniqueProperties.find(
      (p) => p.id.toString() === selectedProperty.toString(),
    );
    if (!found) return "Select property";
    return found.city ? `${found.title} — ${found.city}` : found.title;
  };

  if (loading) {
    return (
      <div className="p-6 text-xs font-bold text-gray-500 animate-pulse">
        Loading guest reviews...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
      {/* Header & Custom Styled Dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-coral-500" />
          <h2 className="text-lg font-black text-gray-900">
            Guest Reviews ({filteredReviews.length})
          </h2>
        </div>

        {/* Custom Rounded Floating Dropdown (Same as Add Property Dropdown) */}
        <div className="relative w-full sm:w-80" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`w-full flex items-center justify-between bg-white border ${
              isDropdownOpen
                ? "border-coral-500 ring-2 ring-coral-500/10"
                : "border-gray-200 hover:border-gray-300"
            } text-gray-900 text-xs font-bold rounded-2xl px-4 py-3 transition cursor-pointer shadow-2xs`}
          >
            <span className="truncate pr-2">{getSelectedLabel()}</span>
            <ChevronDown
              size={15}
              className={`text-gray-500 shrink-0 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Floating Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full bg-white border border-gray-100 rounded-3xl shadow-xl z-50 py-2 px-2 max-h-64 overflow-y-auto">
              {/* All Properties Option */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProperty("all");
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  selectedProperty === "all"
                    ? "bg-coral-50 text-coral-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                All Properties ({reviews.length} Reviews)
              </button>

              {/* Individual Properties with City */}
              {uniqueProperties.map((prop) => {
                const isSelected =
                  selectedProperty.toString() === prop.id.toString();
                return (
                  <button
                    key={prop.id}
                    type="button"
                    onClick={() => {
                      setSelectedProperty(prop.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-coral-50 text-coral-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{prop.title}</span>
                    {prop.city && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 shrink-0">
                        <MapPin size={11} className="text-coral-500" />
                        {prop.city}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <p className="text-xs text-gray-500 py-4 text-center">
          No reviews found for this property.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3 hover:shadow-sm transition"
            >
              {/* Property Title, City & Guest Name */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 size={16} className="text-coral-500" />
                  <span className="text-xs font-bold text-gray-900">
                    Property:{" "}
                    <span className="text-coral-600 underline">
                      {rev.property_title}
                    </span>
                  </span>
                  {rev.property_city && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                      <MapPin size={11} className="text-coral-500" />
                      {rev.property_city}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">
                    Reviewed by:{" "}
                    <strong className="text-gray-900">{rev.user_name}</strong>
                  </span>
                </div>
              </div>

              {/* Rating & Comment */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-700">
                    ({rev.rating}/5)
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium bg-white p-3 rounded-xl border border-gray-100 shadow-2xs">
                  "{rev.comment}"
                </p>
              </div>
              <div className="text-[10px] text-gray-400 text-right">
                {new Date(rev.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
