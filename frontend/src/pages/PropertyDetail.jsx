import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Waves,
  Tv,
  ShieldCheck,
  ArrowLeft,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  Send,
  Bed,
  Bath,
  Home,
  ChevronDown,
  Check,
  Users,
  Calendar as CalendarIcon,
  Trash2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking & Calendar States
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  const [showDateAlertModal, setShowDateAlertModal] = useState(false);
  const [showLoginAlertModal, setShowLoginAlertModal] = useState(false);

  const [guestsCount, setGuestsCount] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);

  // Reviews States
  const [reviewsList, setReviewsList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(2);

  // Lightbox Modal States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch Property Detail and Reviews
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/v1/properties/${id}`,
        );
        if (!response.ok) throw new Error("Property not found");
        const data = await response.json();

        const formattedProperty = {
          ...data,
          rating: data.average_rating !== undefined ? data.average_rating : 0.0,
          pricePerNight: data.price_per_night || 50000,
          maxGuests: data.max_guests || 4,
          bedrooms: data.bedrooms || 2,
          beds: data.beds || 2,
          bathrooms: data.bathrooms || 2,
          images: data.photos
            ? data.photos
                .split(",")
                .map((img) =>
                  img.startsWith("http") ? img : `http://localhost:8000/${img}`,
                )
            : [
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
              ],
          host: {
            name: data.host_name || "Verified Host",
            role: "SuperHost",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          },
          amenitiesList: data.amenities
            ? data.amenities.split(",").map((am) => am.trim())
            : ["Wi-Fi", "Kitchen", "Air Conditioning"],
        };

        setProperty(formattedProperty);

        const revResponse = await fetch(
          `http://localhost:8000/api/v1/properties/${id}/reviews`,
        );
        if (revResponse.ok) {
          const revData = await revResponse.json();
          setReviewsList(revData);
        }
      } catch (err) {
        console.error("Error fetching property detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyData();
    }
  }, [id]);

  // Read query params if passed from Explore/Home page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkInParam = params.get("checkIn");
    const checkOutParam = params.get("checkOut");
    if (checkInParam) setCheckInDate(new Date(checkInParam));
    if (checkOutParam) setCheckOutDate(new Date(checkOutParam));
  }, [location.search]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (checkInRef.current && !checkInRef.current.contains(event.target)) {
        setShowCheckInCalendar(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(event.target)) {
        setShowCheckOutCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBooking = (e) => {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userRole = localStorage.getItem("userRole");

    if (!isLoggedIn || userRole === "host") {
      setShowLoginAlertModal(true);
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setShowDateAlertModal(true);
      return;
    }

    const checkInStr = checkInDate.toLocaleDateString();
    const checkOutStr = checkOutDate.toLocaleDateString();
    navigate(
      `/checkout?checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsCount}`,
    );
  };

  // Handle Review Submission
  const handleAddReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first to submit a review!");
      setShowLoginAlertModal(true);
      return;
    }
    if (rating === 0) {
      alert("Please select a star rating before submitting!");
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/properties/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: Number(rating),
            comment: newComment,
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to post review");
      }

      const data = await response.json();
      const newRevItem = data.review || data;
      const updatedReviews = [newRevItem, ...reviewsList];
      setReviewsList(updatedReviews);

      const newAvg =
        updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) /
        updatedReviews.length;
      setProperty((prev) => ({
        ...prev,
        rating: Number(newAvg.toFixed(1)),
      }));

      setNewComment("");
      setRating(0);
      alert("Review posted successfully!");
    } catch (error) {
      console.error("Error posting review:", error);
      alert(error.message || "Failed to submit review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to delete your review.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/properties/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to delete review");
      }

      const updatedReviews = reviewsList.filter((r) => r.id !== reviewId);
      setReviewsList(updatedReviews);

      if (updatedReviews.length > 0) {
        const newAvg =
          updatedReviews.reduce((acc, curr) => acc + curr.rating, 0) /
          updatedReviews.length;
        setProperty((prev) => ({ ...prev, rating: Number(newAvg.toFixed(1)) }));
      } else {
        setProperty((prev) => ({ ...prev, rating: 0.0 }));
      }

      alert("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.message || "Failed to delete review.");
    }
  };

  // Calculate Star Rating Breakdown Counts
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsList.forEach((rev) => {
    if (starCounts[rev.rating] !== undefined) {
      starCounts[rev.rating] += 1;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-sm font-bold text-gray-600 animate-pulse">
            Loading property details...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <p className="text-base font-bold text-gray-800">
            Property not found
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="px-5 py-2.5 bg-coral-500 text-white rounded-xl text-xs font-bold"
          >
            Back to Explore
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <div>
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button & Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-coral-500 bg-white border border-gray-200 px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2.5 rounded-xl border border-gray-200 bg-white transition cursor-pointer shadow-xs ${
                  isLiked
                    ? "text-rose-500"
                    : "text-gray-600 hover:text-coral-500"
                }`}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-coral-500 transition cursor-pointer shadow-xs">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          {/* Property Title & Location Info */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-semibold text-gray-600">
              <span className="flex items-center gap-1 text-gray-900 font-bold">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {property.rating > 0 ? property.rating : "New"} (
                {reviewsList.length} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-700">
                <MapPin size={14} className="text-coral-500" />
                {property.address || property.city}
              </span>
            </div>
          </div>

          {/* --- IMAGE GALLERY --- */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-black">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[380px] sm:h-[480px]">
              <div
                onClick={() => setLightboxOpen(true)}
                className="md:col-span-2 h-full overflow-hidden cursor-pointer group relative"
              >
                <img
                  src={property.images[0]}
                  alt="Main Property"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
                {property.images.slice(1, 5).map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setLightboxOpen(true)}
                    className="h-full overflow-hidden cursor-pointer group relative"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${index}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- PROPERTY SPECS BAR --- */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Users size={20} className="text-coral-500" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Max Guests
                </p>
                <p className="text-xs font-extrabold text-gray-900">
                  {property.maxGuests} Guests
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Home size={20} className="text-coral-500" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Bedrooms
                </p>
                <p className="text-xs font-extrabold text-gray-900">
                  {property.bedrooms} Bedrooms
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Bed size={20} className="text-coral-500" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Beds
                </p>
                <p className="text-xs font-extrabold text-gray-900">
                  {property.beds} Beds
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Bath size={20} className="text-coral-500" />
              <div className="text-left">
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  Bathrooms
                </p>
                <p className="text-xs font-extrabold text-gray-900">
                  {property.bathrooms} Baths
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-gray-900">
                  About this place
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-gray-900">
                  What this place offers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {property.amenitiesList.map((amName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <div className="text-coral-500 p-2 bg-white rounded-xl shadow-xs">
                        <Check size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-800">
                        {amName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- REVIEWS SECTION --- */}
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                {/* Rating Overview Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Rating Overview
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-gray-900">
                        {property.rating > 0
                          ? property.rating.toFixed(1)
                          : "0.0"}{" "}
                        out of 5
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        ({reviewsList.length} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.round(property.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right Side: Progress Bars Breakdown */}
                  <div className="w-full md:w-64 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = starCounts[stars];
                      const percentage =
                        reviewsList.length > 0
                          ? (count / reviewsList.length) * 100
                          : 0;
                      return (
                        <div
                          key={stars}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="font-bold text-gray-700 w-6 flex items-center gap-0.5">
                            {stars}★
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-500 font-semibold w-6 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review Submission Form */}
                <form
                  onSubmit={handleAddReview}
                  className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4"
                >
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Leave a Review
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">
                      Your Rating:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            size={22}
                            className={`${
                              rating >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300 fill-transparent"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-gray-700">
                        ({rating} out of 5)
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows="3"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your experience..."
                    className="w-full bg-white border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500 resize-none"
                  ></textarea>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Send size={14} /> Post Review
                  </button>
                </form>

                {/* Reviews List */}
                <div className="grid grid-cols-1 gap-4 pt-2">
                  {reviewsList.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4 text-center">
                      No reviews yet. Be the first to review!
                    </p>
                  ) : (
                    reviewsList.slice(0, visibleReviewsCount).map((rev) => (
                      <div
                        key={rev.id}
                        className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-2 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-900">
                            {rev.user_name || "Guest User"}
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className="fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="text-gray-400 hover:text-rose-500 transition p-1 cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* See More / See Less Button */}
                {reviewsList.length > 2 && (
                  <div className="text-center pt-2">
                    {visibleReviewsCount < reviewsList.length ? (
                      <button
                        onClick={() =>
                          setVisibleReviewsCount((prev) => prev + 4)
                        }
                        className="inline-flex items-center gap-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        See More Reviews <ChevronDown size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setVisibleReviewsCount(2)}
                        className="inline-flex items-center gap-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Floating Booking Card with Clean Custom Calendar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sticky top-20 space-y-6">
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-2xl font-black text-gray-900">
                      Rs. {Number(property.pricePerNight).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {" "}
                      / night
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{property.rating > 0 ? property.rating : "New"}</span>
                  </div>
                </div>

                <form onSubmit={handleBooking} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Check-in Field */}
                    <div className="relative" ref={checkInRef}>
                      <div
                        onClick={() =>
                          setShowCheckInCalendar(!showCheckInCalendar)
                        }
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:border-coral-500 transition"
                      >
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Check-in
                        </label>
                        <p className="text-[11px] font-bold text-gray-900 mt-0.5 truncate">
                          {checkInDate
                            ? checkInDate.toLocaleDateString()
                            : "Select date"}
                        </p>
                      </div>
                      {showCheckInCalendar && (
                        <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 w-[300px]">
                          <Calendar
                            onChange={(date) => {
                              setCheckInDate(date);
                              setShowCheckInCalendar(false);
                            }}
                            value={checkInDate || new Date()}
                          />
                        </div>
                      )}
                    </div>

                    {/* Check-out Field */}
                    <div className="relative" ref={checkOutRef}>
                      <div
                        onClick={() =>
                          setShowCheckOutCalendar(!showCheckOutCalendar)
                        }
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:border-coral-500 transition"
                      >
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Check-out
                        </label>
                        <p className="text-[11px] font-bold text-gray-900 mt-0.5 truncate">
                          {checkOutDate
                            ? checkOutDate.toLocaleDateString()
                            : "Select date"}
                        </p>
                      </div>
                      {showCheckOutCalendar && (
                        <div className="absolute top-full right-0 mt-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 w-[300px]">
                          <Calendar
                            onChange={(date) => {
                              setCheckOutDate(date);
                              setShowCheckOutCalendar(false);
                            }}
                            value={checkOutDate || checkInDate || new Date()}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-3 rounded-xl shadow-lg transition cursor-pointer uppercase tracking-wider"
                  >
                    Reserve Stay
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
