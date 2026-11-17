import React, { useState, useEffect } from "react";
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
  X,
  Calendar,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Explore() {
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [priceRange, setPriceRange] = useState(150000);
  const [bedrooms, setBedrooms] = useState("All");
  const [guests, setGuests] = useState("All");
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Backend properties and loading states
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Live Backend Data Fetching with Debounce & Filters
  useEffect(() => {
    const fetchFilteredProperties = async () => {
      try {
        setLoading(true);

        // Query parameters banana for FastAPI backend
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (searchCity !== "All") params.append("city", searchCity);
        if (selectedType !== "All")
          params.append("property_type", selectedType);
        if (priceRange) params.append("max_price", priceRange);
        if (bedrooms !== "All") params.append("bedrooms", bedrooms);

        const response = await fetch(
          `http://localhost:8000/api/v1/properties/?${params.toString()}`,
        );
        const data = await response.json();

        // Map backend keys to match frontend display including average rating & review count
        const formattedData = data.map((item) => ({
          ...item,
          type: item.property_type || "Apartment",
          price: item.price_per_night || item.price || 0,
          image: item.photos
            ? item.photos.split(",")[0]
            : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
          rating: item.average_rating !== undefined ? item.average_rating : 0.0,
          reviews: item.review_count !== undefined ? item.review_count : 0,
          guests: item.max_guests || 4,
          amenities: item.amenities
            ? item.amenities.split(",")
            : ["Wi-Fi", "Kitchen", "Air Conditioning"],
          isBooked: false,
        }));

        setProperties(formattedData);
      } catch (error) {
        console.error("Error fetching properties from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce delay taake har keystroke par foran request na jaye
    const delayTimer = setTimeout(() => {
      fetchFilteredProperties();
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [searchQuery, searchCity, selectedType, priceRange, bedrooms]);

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

  // Additional client-side filter for amenities if returned from backend
  const filteredProperties = properties.filter((prop) => {
    if (selectedAmenities.length === 0) return true;
    return selectedAmenities.every((am) => prop.amenities.includes(am));
  });

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
                placeholder="Search by title, city, beds, or guests..."
                className="w-full text-xs sm:text-sm text-gray-800 font-medium bg-transparent focus:outline-none placeholder-gray-400 py-2 px-2"
              />
              {searchQuery && (
                <button
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
            {/* Left Sidebar: Filters */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-coral-500" />{" "}
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchCity("All");
                    setSelectedType("All");
                    setPriceRange(150000);
                    setBedrooms("All");
                    setGuests("All");
                    setSelectedAmenities([]);
                    setCheckInDate("");
                    setCheckOutDate("");
                  }}
                  className="text-[11px] font-bold text-coral-500 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  City
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                >
                  <option value="All">All Cities (Pakistan)</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Murree">Murree</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                >
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Portion">Family Portion</option>
                  <option value="Penthouse">Penthouse</option>
                </select>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>Max Price</span>
                  <span className="text-coral-600">
                    Rs. {priceRange.toLocaleString()} /mo
                  </span>
                </div>

                <input
                  type="range"
                  min="50000"
                  max="150000"
                  step="5000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-coral-500 cursor-pointer h-2 rounded-lg appearance-none"
                  style={{
                    background: `linear-gradient(to right, #FF5A5F 0%, #FF5A5F ${
                      ((priceRange - 50000) / (150000 - 50000)) * 100
                    }%, #E5E7EB ${
                      ((priceRange - 50000) / (150000 - 50000)) * 100
                    }%, #E5E7EB 100%)`,
                  }}
                />
              </div>

              {/* Bedrooms */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Bedrooms
                </label>
                <div className="flex gap-2">
                  {["All", "2", "3", "4"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBedrooms(b)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        bedrooms === b
                          ? "bg-coral-500 text-white border-coral-500 shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {b === "All" ? "All" : `${b}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  Guests Capacity
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                >
                  <option value="All">Any Capacity</option>
                  <option value="4">4+ Guests</option>
                  <option value="6">6+ Guests</option>
                  <option value="8">8+ Guests</option>
                </select>
              </div>

              {/* Amenities Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 block">
                  Amenities
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {amenityList.map((item, idx) => {
                    const isChecked = selectedAmenities.includes(item.name);
                    return (
                      <button
                        key={idx}
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

            {/* Right Content: Property Cards Grid */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs font-bold text-gray-700">
                  Showing{" "}
                  <span className="text-coral-600">
                    {filteredProperties.length}
                  </span>{" "}
                  verified properties from database
                </p>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Zero Broker Commission
                </span>
              </div>

              {loading ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
                  <p className="text-sm font-bold text-gray-600">
                    Loading properties from database...
                  </p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
                  <p className="text-base font-bold text-gray-800">
                    No properties found
                  </p>
                  <p className="text-xs text-gray-500">
                    No properties match your search criteria. Try a different
                    query.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((prop) => {
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
                          {/* Property Image & Conditional Booking Status Badge */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={
                                prop.image.startsWith("http")
                                  ? prop.image
                                  : `http://localhost:8000/${prop.image}`
                              }
                              alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              onError={(e) => {
                                e.target.src =
                                  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
                              }}
                            />

                            {/* Booked Status Badge */}
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

                          {/* Property Details */}
                          <div className="p-5 space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                              <span className="flex items-center gap-1 font-bold text-gray-700">
                                <MapPin size={12} className="text-coral-500" />{" "}
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

                            {/* Amenity tags snippet */}
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

                        {/* Card Footer: Price & View Details */}
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
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
