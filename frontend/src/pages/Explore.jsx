import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  MapPin,
  Bed,
  Users,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  Wifi,
  Utensils,
  Car,
  Wind,
  Tv,
  Waves,
  Trees,
  Shirt,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Calendar,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ITEMS_PER_PAGE = 9;
const API_BASE_URL = "http://localhost:8000/api/v1/properties/";
const MAX_SLIDER_PRICE = 150000;

const CITY_OPTIONS = [
  { value: "All", label: "All Cities (Pakistan)" },
  { value: "Islamabad", label: "Islamabad" },
  { value: "Lahore", label: "Lahore" },
  { value: "Karachi", label: "Karachi" },
  { value: "Murree", label: "Murree" },
  { value: "Rawalpindi", label: "Rawalpindi" },
];

const TYPE_OPTIONS = [
  { value: "All", label: "All Types" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Villa", label: "Villa" },
  { value: "Portion", label: "Family Portion" },
  { value: "Penthouse", label: "Penthouse" },
];

const BEDROOM_OPTIONS = [
  { value: "All", label: "All", isPlus: false },
  { value: "1", label: "1", isPlus: false },
  { value: "2", label: "2", isPlus: false },
  { value: "3", label: "3", isPlus: false },
  { value: "4", label: "4+", isPlus: true },
];

const GUEST_OPTIONS = [
  { value: "All", label: "Any Capacity", isPlus: false },
  { value: "2", label: "2 Guests", isPlus: false },
  { value: "4", label: "4 Guests", isPlus: false },
  { value: "6", label: "6 Guests", isPlus: false },
  { value: "8", label: "8+ Guests", isPlus: true },
];

function CustomFilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption =
    options.find(
      (opt) => opt.value.toLowerCase() === String(value).toLowerCase(),
    ) || options[0];

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-700 block">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between bg-gray-50 hover:bg-white text-xs font-bold text-gray-800 rounded-2xl px-3.5 py-3 border transition cursor-pointer ${
          open
            ? "border-coral-500 ring-2 ring-coral-500/15 bg-white"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          size={15}
          className={`text-gray-500 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180 text-coral-500" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 py-1.5 px-1.5 space-y-0.5">
          {options.map((opt) => {
            const isSelected =
              opt.value.toLowerCase() === String(value).toLowerCase();
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                  isSelected
                    ? "bg-coral-50 text-coral-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <CheckCircle2 size={14} className="text-coral-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Explore() {
  const location = useLocation();
  const resultsTopRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [priceRange, setPriceRange] = useState(MAX_SLIDER_PRICE);
  const [priceFilterActive, setPriceFilterActive] = useState(false);
  const [bedrooms, setBedrooms] = useState("All");
  const [guests, setGuests] = useState("All");
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Pagination state (9 properties per page)
  const [currentPage, setCurrentPage] = useState(1);

  // Backend properties, loading, and error states
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Booking Dates passed from Home page
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Read URL Query Parameters on Load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    const bedsParam = params.get("beds");
    const checkInParam = params.get("checkIn");
    const checkOutParam = params.get("checkOut");

    if (cityParam) {
      setSearchCity(cityParam);
    }
    if (bedsParam) {
      const bedNum = bedsParam.replace(/[^0-9]/g, "");
      if (bedNum) {
        setBedrooms(bedNum);
      }
    }
    if (checkInParam) {
      setCheckInDate(checkInParam);
    }
    if (checkOutParam) {
      setCheckOutDate(checkOutParam);
    }
  }, [location.search]);

  // Reset to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    searchCity,
    selectedType,
    priceRange,
    priceFilterActive,
    bedrooms,
    guests,
    selectedAmenities,
  ]);

  // Live Backend Data Fetching with AbortController, Debounce & ML Relevance Order
  useEffect(() => {
    const controller = new AbortController();

    const fetchRankedProperties = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const trimmedSearch = searchQuery.trim();
        const params = new URLSearchParams();

        if (trimmedSearch) {
          params.append("search", trimmedSearch);
        }

        if (searchCity !== "All") {
          params.append("city", searchCity);
        }

        if (selectedType !== "All") {
          params.append("property_type", selectedType);
        }

        if (priceFilterActive) {
          params.append("max_price", String(priceRange));
        }

        let effectiveBedrooms = bedrooms !== "All" ? bedrooms : "";
        let isBedroomsPlus = bedrooms === "4";

        if (!effectiveBedrooms && trimmedSearch) {
          const bedMatch = trimmedSearch.match(
            /\b([1-9])\s*(\+)?\s*bed(s|room|rooms)?\b/i,
          );
          if (bedMatch) {
            effectiveBedrooms = bedMatch[1];
            isBedroomsPlus = Boolean(bedMatch[2]) || Number(bedMatch[1]) >= 4;
          }
        }

        if (effectiveBedrooms) {
          params.append("bedrooms", effectiveBedrooms);
          params.append("bedrooms_plus", isBedroomsPlus ? "true" : "false");
        }

        const queryString = params.toString();
        const url = queryString
          ? `${API_BASE_URL}?${queryString}`
          : API_BASE_URL;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `Request failed (${response.status})`);
        }

        const data = await response.json();
        const rawList = Array.isArray(data) ? data : data.properties || [];

        const formattedData = rawList.map((item) => ({
          ...item,
          type: item.property_type || "Apartment",
          price: item.price_per_night ?? item.price ?? 0,
          image: item.photos
            ? item.photos.split(",")[0].trim()
            : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
          rating: item.average_rating !== undefined ? item.average_rating : 0.0,
          reviews: item.review_count !== undefined ? item.review_count : 0,
          guests: item.max_guests || 4,
          amenities: item.amenities
            ? item.amenities
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : ["Wi-Fi", "Kitchen", "Air Conditioning"],
          isBooked: false,
        }));

        setProperties(formattedData);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching properties from backend:", error);
          setProperties([]);
          setErrorMessage(
            "Unable to fetch properties from backend. Please check if FastAPI server is running on port 8000.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const delayTimer = setTimeout(() => {
      fetchRankedProperties();
    }, 300);

    return () => {
      clearTimeout(delayTimer);
      controller.abort();
    };
  }, [
    searchQuery,
    searchCity,
    selectedType,
    priceRange,
    priceFilterActive,
    bedrooms,
  ]);

  const amenityList = [
    { name: "Wi-Fi", icon: <Wifi size={14} /> },
    { name: "Kitchen", icon: <Utensils size={14} /> },
    { name: "Parking", icon: <Car size={14} /> },
    { name: "Air Conditioning", icon: <Wind size={14} /> },
    { name: "Washing Machine", icon: <Shirt size={14} /> },
    { name: "TV", icon: <Tv size={14} /> },
    { name: "Garden", icon: <Trees size={14} /> },
    { name: "Swimming Pool", icon: <Waves size={14} /> },
  ];

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Exact bedrooms (1, 2, 3) & 4+ are handled by backend;
  // Guests capacity checks that the property can accommodate at least the selected guests (>= target)
  const filteredProperties = properties.filter((prop) => {
    if (guests !== "All") {
      const propGuests = Number(prop.guests);
      const targetGuests = Number(guests);
      if (propGuests < targetGuests) {
        return false;
      }
    }
    if (selectedAmenities.length === 0) return true;
    return selectedAmenities.every((am) => prop.amenities.includes(am));
  });

  // Pagination calculations (9 per page)
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    const clamped = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(clamped);
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([
      1,
      totalPages,
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
    ]);
    const sorted = Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
        result.push("...");
      }
      result.push(sorted[i]);
    }
    return result;
  };

  const handleResetAll = () => {
    setSearchQuery("");
    setSearchCity("All");
    setSelectedType("All");
    setPriceRange(MAX_SLIDER_PRICE);
    setPriceFilterActive(false);
    setBedrooms("All");
    setGuests("All");
    setSelectedAmenities([]);
    setCheckInDate("");
    setCheckOutDate("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Header Search Banner */}
        <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-coral-500/20 text-coral-400 text-xs font-extrabold px-3.5 py-1 rounded-full border border-coral-500/30 uppercase tracking-wider">
              <Sparkles size={14} /> Zero-Commission Rentals
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Explore Verified{" "}
              <span className="text-coral-500">Properties</span>
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm font-medium max-w-xl mx-auto">
              Find apartments, villas, and family portions across Pakistan with
              live availability and direct owner contact.
            </p>

            {/* Smart Search Bar */}
            <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-gray-200">
              <div className="pl-3 text-coral-500">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Property here..."
                className="w-full text-xs sm:text-sm text-gray-800 font-medium bg-transparent focus:outline-none placeholder-gray-400 py-2 px-2"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  title="Clear Search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left Sidebar: Sticky Filters */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 shadow-sm lg:sticky lg:top-24 py-3 pl-6 pr-2.5">
              <div className="pr-3.5 space-y-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto custom-filter-scrollbar">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 pt-1">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-coral-500" />{" "}
                    Filters
                  </h3>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-[11px] font-bold text-coral-500 hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>

                {/* City Custom Dropdown */}
                <CustomFilterDropdown
                  label="City"
                  value={searchCity}
                  options={CITY_OPTIONS}
                  onChange={setSearchCity}
                />

                {/* Property Type Custom Dropdown */}
                <CustomFilterDropdown
                  label="Property Type"
                  value={selectedType}
                  options={TYPE_OPTIONS}
                  onChange={setSelectedType}
                />

                {/* Price Range Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Max Price</span>
                    <span className="text-coral-600">
                      {priceFilterActive
                        ? `Rs. ${priceRange.toLocaleString()} /mo`
                        : "Any Budget"}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20000"
                    max={MAX_SLIDER_PRICE}
                    step="5000"
                    value={priceRange}
                    onChange={(e) => {
                      setPriceRange(Number(e.target.value));
                      setPriceFilterActive(true);
                    }}
                    className="w-full accent-coral-500 cursor-pointer h-2 rounded-lg appearance-none"
                    style={{
                      background: `linear-gradient(to right, #FF5A5F 0%, #FF5A5F ${
                        ((priceRange - 20000) / (MAX_SLIDER_PRICE - 20000)) *
                        100
                      }%, #E5E7EB ${
                        ((priceRange - 20000) / (MAX_SLIDER_PRICE - 20000)) *
                        100
                      }%, #E5E7EB 100%)`,
                    }}
                  />
                </div>

                {/* Bedrooms */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Bedrooms
                  </label>
                  <div className="flex gap-1.5">
                    {BEDROOM_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setBedrooms(opt.value)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          bedrooms === opt.value
                            ? "bg-coral-500 text-white border-coral-500 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests Capacity Custom Dropdown */}
                <CustomFilterDropdown
                  label="Guests Capacity"
                  value={guests}
                  options={GUEST_OPTIONS}
                  onChange={setGuests}
                />

                {/* Amenities Checkboxes */}
                <div className="space-y-3 pt-2 pb-2 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-700 block">
                    Amenities
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {amenityList.map((item, idx) => {
                      const isChecked = selectedAmenities.includes(item.name);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleAmenity(item.name)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                            isChecked
                              ? "bg-coral-50 text-coral-700 border-coral-300 font-bold"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {item.icon} {item.name}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isChecked
                                ? "bg-coral-500 border-coral-500 text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isChecked && <CheckCircle2 size={12} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content: Property Cards Grid */}
            <div
              ref={resultsTopRef}
              className="lg:col-span-3 space-y-6 scroll-mt-24"
            >
              <div className="flex flex-wrap justify-between items-center gap-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-700">
                  {filteredProperties.length === 0 ? (
                    <>
                      Showing <span className="text-coral-600">0</span> verified
                      properties
                    </>
                  ) : (
                    <>
                      Showing{" "}
                      <span className="text-coral-600">
                        {startIndex + 1}–
                        {Math.min(endIndex, filteredProperties.length)}
                      </span>{" "}
                      of{" "}
                      <span className="text-coral-600">
                        {filteredProperties.length}
                      </span>{" "}
                      verified properties
                    </>
                  )}
                </p>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Page {safeCurrentPage} of {totalPages} • Zero Broker
                  Commission
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm flex flex-col justify-between animate-pulse"
                    >
                      <div>
                        <div className="h-48 bg-gray-200" />
                        <div className="p-5 space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                            <div className="h-3 bg-gray-200 rounded w-1/6" />
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-4/5" />
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                          <div className="flex gap-2 pt-1">
                            <div className="h-4 bg-gray-100 rounded-lg w-14" />
                            <div className="h-4 bg-gray-100 rounded-lg w-16" />
                          </div>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="space-y-1.5 w-1/3">
                          <div className="h-2.5 bg-gray-100 rounded w-2/3" />
                          <div className="h-4 bg-gray-200 rounded w-full" />
                        </div>
                        <div className="h-8 bg-gray-200 rounded-xl w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : errorMessage ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-rose-200 shadow-sm space-y-2">
                  <p className="text-base font-bold text-rose-600">
                    Failed to Load Properties
                  </p>
                  <p className="text-xs text-gray-600">{errorMessage}</p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
                  <p className="text-base font-bold text-gray-800">
                    No properties found
                  </p>
                  <p className="text-xs text-gray-500">
                    No properties match your search criteria. Try a different
                    query or reset filters.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProperties.map((prop) => {
                      const detailLink =
                        checkInDate && checkOutDate
                          ? `/property/${prop.id}?checkIn=${checkInDate}&checkOut=${checkOutDate}`
                          : `/property/${prop.id}`;

                      return (
                        <div
                          key={prop.id}
                          className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={
                                  prop.image.startsWith("http")
                                    ? prop.image
                                    : `http://localhost:8000/${prop.image.replace(/^\/+/, "")}`
                                }
                                alt={prop.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
                                }}
                              />

                              {prop.isBooked ? (
                                <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                                  <Calendar size={11} /> Booked till{" "}
                                  {prop.bookedTo}
                                </span>
                              ) : null}

                              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                                {prop.type}
                              </span>
                            </div>

                            <div className="p-5 space-y-2.5">
                              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                                <span className="flex items-center gap-1 font-bold text-gray-700">
                                  <MapPin
                                    size={12}
                                    className="text-coral-500"
                                  />{" "}
                                  {prop.city}
                                </span>
                                <span className="flex items-center gap-1 font-bold text-gray-900">
                                  <Star
                                    size={12}
                                    className="text-amber-500 fill-amber-500"
                                  />{" "}
                                  {prop.rating > 0 ? prop.rating : "New"}{" "}
                                  {prop.reviews > 0 ? `(${prop.reviews})` : ""}
                                </span>
                              </div>

                              <h3 className="text-[14px] font-bold text-gray-900 group-hover:text-coral-600 transition leading-snug line-clamp-1">
                                {prop.title}
                              </h3>

                              <div className="flex items-center gap-3 text-[11px] text-gray-600 font-medium pt-0.5">
                                <span className="flex items-center gap-1">
                                  <Bed size={13} className="text-gray-400" />{" "}
                                  {prop.bedrooms} Beds
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Users size={13} className="text-gray-400" />{" "}
                                  {prop.guests} Guests
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1 pt-1">
                                {prop.amenities.slice(0, 2).map((am, i) => (
                                  <span
                                    key={i}
                                    className="bg-gray-100 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-lg"
                                  >
                                    {am}
                                  </span>
                                ))}
                                {prop.amenities.length > 2 && (
                                  <span className="bg-gray-50 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded-lg">
                                    +{prop.amenities.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                                Monthly Rent
                              </span>
                              <span className="text-sm font-black text-gray-900">
                                Rs. {Number(prop.price).toLocaleString()}
                              </span>
                            </div>
                            <Link
                              to={detailLink}
                              className="bg-coral-500 hover:bg-coral-600 text-white text-[11px] font-bold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1"
                            >
                              View Details <ArrowRight size={13} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 text-[12px]">
                      <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronLeft size={13} /> Prev
                      </button>

                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`dots-${index}`}
                            className="px-1.5 py-1 text-[12px] font-bold text-gray-400 select-none"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            type="button"
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 rounded-lg text-[12px] font-bold border transition cursor-pointer ${
                              safeCurrentPage === page
                                ? "bg-coral-500 text-white border-coral-500"
                                : "bg-transparent text-gray-700 border-gray-200 hover:border-coral-500 hover:text-coral-500"
                            }`}
                          >
                            {page}
                          </button>
                        ),
                      )}

                      <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[12px] font-bold bg-coral-500 hover:bg-coral-600 text-white disabled:opacity-45 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Next <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-filter-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-filter-scrollbar::-webkit-scrollbar-track {
          background: #FFF5F5;
          border-radius: 9999px;
          margin: 6px 0;
        }
        .custom-filter-scrollbar::-webkit-scrollbar-thumb {
          background: #FF5A5F;
          border-radius: 9999px;
        }
        .custom-filter-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #E0484D;
        }
        .custom-filter-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #FF5A5F #FFF5F5;
        }
      `}</style>

      <Footer />
    </div>
  );
}
