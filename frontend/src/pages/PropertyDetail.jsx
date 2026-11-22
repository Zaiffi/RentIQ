import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Star,
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
  CheckCircle2,
  MoreVertical,
  Pencil,
  Flag,
  Copy,
  Mail,
  MessageCircle,
  ArrowLeft,
  Heart,
  Share2,
  X,
  Grid,
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

  // Today's date (start of day) for past-date blocking
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Booking & Calendar States
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  const [showDateAlertModal, setShowDateAlertModal] = useState(false);
  const [showGuestAlertModal, setShowGuestAlertModal] = useState(false);
  const [showLoginAlertModal, setShowLoginAlertModal] = useState(false);
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    type: "info", // "success" | "error" | "warning"
    title: "",
    message: "",
    actionLabel: "",
    actionPath: "",
  });

  const [guestsCount, setGuestsCount] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const checkInPopupRef = useRef(null);
  const checkOutPopupRef = useRef(null);
  const guestsRef = useRef(null);
  const reviewMenuRef = useRef(null);

  // Reviews States
  const [reviewsList, setReviewsList] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [sortBy, setSortBy] = useState("Most relevant");
  const [openMenuReviewId, setOpenMenuReviewId] = useState(null);
  const [expandedReviewIds, setExpandedReviewIds] = useState({});

  // Edit & Report Review States
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [reportingReview, setReportingReview] = useState(null);
  const [reportReason, setReportReason] = useState("Spam or misleading");

  // Lightbox Modal States
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentUserName = (
    localStorage.getItem("userName") ||
    localStorage.getItem("user_name") ||
    localStorage.getItem("fullName") ||
    localStorage.getItem("email") ||
    ""
  )
    .trim()
    .toLowerCase();
  const currentUserId =
    localStorage.getItem("userId") || localStorage.getItem("user_id");

  const getFavoritesStorageKey = () => {
    const accountKey = (
      currentUserId ||
      localStorage.getItem("email") ||
      localStorage.getItem("userName") ||
      "guest"
    )
      .toString()
      .trim()
      .toLowerCase();
    return `rentiq_favorites_${accountKey}`;
  };

  const readFavoritesList = () => {
    try {
      const raw = localStorage.getItem(getFavoritesStorageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeFavoritesList = (list) => {
    try {
      localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(list));
    } catch (err) {
      console.error("Error saving favorites:", err);
    }
  };

  const openFeedback = (
    type,
    title,
    message,
    actionLabel = "",
    actionPath = "",
  ) => {
    setFeedbackModal({
      open: true,
      type,
      title,
      message,
      actionLabel,
      actionPath,
    });
  };

  const recalculateAverageRating = (list) => {
    if (!list || list.length === 0) return 0.0;
    const avg =
      list.reduce((acc, curr) => acc + Number(curr.rating || 0), 0) /
      list.length;
    return Number(avg.toFixed(1));
  };

  const formatReviewTime = (rev) => {
    const rawDate = rev.created_at || rev.createdAt || rev.date;
    if (!rawDate) return "Recently";
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) return "Recently";
    const diffMs = Date.now() - parsed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  };

  const isOwnReview = (rev) => {
    if (rev.is_owner === true || rev.isOwn === true) return true;
    if (
      currentUserId &&
      rev.user_id &&
      String(rev.user_id) === String(currentUserId)
    ) {
      return true;
    }
    const revAuthor = (rev.user_name || rev.author_name || "")
      .trim()
      .toLowerCase();
    if (currentUserName && revAuthor && revAuthor === currentUserName) {
      return true;
    }
    return false;
  };

  // Sync favourite heart state when property loads
  useEffect(() => {
    if (!property) return;
    const favs = readFavoritesList();
    const exists = favs.some((item) => String(item.id) === String(property.id));
    setIsLiked(exists);
  }, [property]);

  // Keep selected guests within property's maxGuests when selected
  useEffect(() => {
    if (
      guestsCount !== null &&
      property?.maxGuests &&
      guestsCount > property.maxGuests
    ) {
      setGuestsCount(property.maxGuests);
    }
  }, [property, guestsCount]);

  // Toggle Favourite (Wishlist)
  const handleToggleFavorite = async () => {
    if (!property) return;

    const favs = readFavoritesList();
    const alreadySaved = favs.some(
      (item) => String(item.id) === String(property.id),
    );
    const token = localStorage.getItem("token");

    if (alreadySaved) {
      const updatedFavs = favs.filter(
        (item) => String(item.id) !== String(property.id),
      );
      writeFavoritesList(updatedFavs);
      setIsLiked(false);

      if (token) {
        try {
          await fetch(`http://localhost:8000/api/v1/favorites/${property.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // Local wishlist state already updated
        }
      }

      openFeedback(
        "info",
        "Removed from Favorites",
        "This property has been removed from your favorites list.",
      );
      return;
    }

    const favoritePayload = {
      id: property.id,
      title: property.title,
      city: property.city,
      address: property.address || property.city,
      price_per_night: property.pricePerNight,
      pricePerNight: property.pricePerNight,
      rating: property.rating,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      max_guests: property.maxGuests,
      image: property.images?.[0] || "",
      photos: property.photos || "",
      savedAt: new Date().toISOString(),
    };

    const updatedFavs = [favoritePayload, ...favs];
    writeFavoritesList(updatedFavs);
    setIsLiked(true);

    if (token) {
      try {
        await fetch(`http://localhost:8000/api/v1/favorites/${property.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ property_id: property.id }),
        });
      } catch {
        // Local wishlist state already updated
      }
    }

    openFeedback(
      "success",
      "Added to Favorites",
      "Saved to your favorites list so you can easily find it anytime.",
      "View Favorites",
      "/favorites",
    );
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = property
    ? `${property.title} - ${property.city || property.address || "RentIQ"}`
    : "Check out this property on RentIQ";

  const handleCopyShareLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const sharePlatforms = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
      badgeBg: "bg-emerald-50 text-emerald-600",
      icon: <MessageCircle size={18} />,
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      badgeBg: "bg-blue-50 text-blue-600",
      icon: <Share2 size={18} />,
    },
    {
      name: "Twitter / X",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      badgeBg: "bg-gray-100 text-gray-800",
      icon: <Send size={18} />,
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      badgeBg: "bg-sky-50 text-sky-600",
      icon: <Grid size={18} />,
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      badgeBg: "bg-cyan-50 text-cyan-600",
      icon: <Send size={18} />,
    },
    {
      name: "Email",
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Check out this property: ${shareUrl}`)}`,
      badgeBg: "bg-amber-50 text-amber-600",
      icon: <Mail size={18} />,
    },
  ];

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
          setReviewsList(Array.isArray(revData) ? revData : []);
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
    const guestsParam = Number(params.get("guests"));
    if (checkInParam) {
      const parsedIn = new Date(checkInParam);
      if (!isNaN(parsedIn) && parsedIn >= today) setCheckInDate(parsedIn);
    }
    if (checkOutParam) {
      const parsedOut = new Date(checkOutParam);
      if (!isNaN(parsedOut) && parsedOut >= today) setCheckOutDate(parsedOut);
    }
    if (guestsParam && guestsParam >= 1) {
      setGuestsCount(guestsParam);
    }
  }, [location.search]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideCheckInInput =
        checkInRef.current && checkInRef.current.contains(event.target);
      const clickedInsideCheckInPopup =
        checkInPopupRef.current &&
        checkInPopupRef.current.contains(event.target);

      if (!clickedInsideCheckInInput && !clickedInsideCheckInPopup) {
        setShowCheckInCalendar(false);
      }

      const clickedInsideCheckOutInput =
        checkOutRef.current && checkOutRef.current.contains(event.target);
      const clickedInsideCheckOutPopup =
        checkOutPopupRef.current &&
        checkOutPopupRef.current.contains(event.target);

      if (!clickedInsideCheckOutInput && !clickedInsideCheckOutPopup) {
        setShowCheckOutCalendar(false);
      }

      if (guestsRef.current && !guestsRef.current.contains(event.target)) {
        setShowGuestsDropdown(false);
      }

      if (
        reviewMenuRef.current &&
        !reviewMenuRef.current.contains(event.target)
      ) {
        setOpenMenuReviewId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nightsCount = calculateNights();
  const staySubtotal = property
    ? Number(property.pricePerNight || 0) * (nightsCount || 1)
    : 0;

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

    if (!guestsCount || guestsCount < 1) {
      setShowGuestAlertModal(true);
      return;
    }

    const checkInStr = encodeURIComponent(checkInDate.toLocaleDateString());
    const checkOutStr = encodeURIComponent(checkOutDate.toLocaleDateString());
    navigate(
      `/checkout?propertyId=${property.id}&checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=${guestsCount}`,
      {
        state: {
          property,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          guestsCount,
          nightsCount,
          staySubtotal,
        },
      },
    );
  };

  // Handle Review Submission
  const handleAddReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginAlertModal(true);
      return;
    }
    if (rating === 0) {
      openFeedback(
        "warning",
        "Rating Required",
        "Please select a star rating before submitting!",
      );
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
            comment: newComment.trim(),
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to post review");
      }

      const data = await response.json();
      const rawItem = data.review || data;
      const newRevItem = {
        ...rawItem,
        id: rawItem.id || Date.now(),
        user_name:
          rawItem.user_name ||
          localStorage.getItem("userName") ||
          localStorage.getItem("user_name") ||
          "You",
        rating: Number(rawItem.rating || rating),
        comment: rawItem.comment || newComment.trim(),
        created_at: rawItem.created_at || new Date().toISOString(),
        is_owner: true,
      };

      const updatedReviews = [newRevItem, ...reviewsList];
      setReviewsList(updatedReviews);
      setProperty((prev) => ({
        ...prev,
        rating: recalculateAverageRating(updatedReviews),
      }));

      setNewComment("");
      setRating(0);
      openFeedback(
        "success",
        "Review Posted",
        "Your review has been published successfully!",
      );
    } catch (error) {
      console.error("Error posting review:", error);
      openFeedback(
        "error",
        "Submission Failed",
        error.message || "Failed to submit review.",
      );
    }
  };

  // Open Edit Review Modal
  const handleOpenEditReview = (rev) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginAlertModal(true);
      return;
    }
    setOpenMenuReviewId(null);
    setEditingReview(rev);
    setEditRating(Number(rev.rating) || 5);
    setEditComment(rev.comment || "");
  };

  // Save Edited Review
  const handleSaveEditedReview = async (e) => {
    e.preventDefault();
    if (!editingReview) return;
    if (editRating === 0) {
      openFeedback(
        "warning",
        "Rating Required",
        "Please select a star rating for your review.",
      );
      return;
    }
    if (!editComment.trim()) return;

    const token = localStorage.getItem("token");
    const targetId = editingReview.id;
    const updatedCommentText = editComment.trim();
    const updatedStarRating = Number(editRating);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/properties/reviews/${targetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: updatedStarRating,
            comment: updatedCommentText,
          }),
        },
      );

      if (!response.ok && response.status !== 404 && response.status !== 405) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update review");
      }

      const updatedReviews = reviewsList.map((r) =>
        r.id === targetId
          ? {
              ...r,
              rating: updatedStarRating,
              comment: updatedCommentText,
              edited: true,
            }
          : r,
      );

      setReviewsList(updatedReviews);
      setProperty((prev) => ({
        ...prev,
        rating: recalculateAverageRating(updatedReviews),
      }));

      setEditingReview(null);
      openFeedback(
        "success",
        "Review Updated",
        "Your review has been updated successfully!",
      );
    } catch (error) {
      console.error("Error updating review:", error);
      openFeedback(
        "error",
        "Update Failed",
        error.message || "Failed to update review.",
      );
    }
  };

  const handleDeleteReview = (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginAlertModal(true);
      return;
    }
    setOpenMenuReviewId(null);
    setConfirmDeleteReviewId(reviewId);
  };

  const confirmAndDeleteReview = async () => {
    const reviewId = confirmDeleteReviewId;
    if (!reviewId) return;

    const token = localStorage.getItem("token");
    setConfirmDeleteReviewId(null);

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
      setProperty((prev) => ({
        ...prev,
        rating: recalculateAverageRating(updatedReviews),
      }));

      openFeedback(
        "success",
        "Review Deleted",
        "Your review has been deleted successfully.",
      );
    } catch (error) {
      console.error("Error deleting review:", error);
      openFeedback(
        "error",
        "Delete Failed",
        error.message || "Failed to delete review.",
      );
    }
  };

  // Open Report Review Modal
  const handleOpenReportReview = (rev) => {
    setOpenMenuReviewId(null);
    setReportingReview(rev);
    setReportReason("Spam or misleading");
  };

  const handleSubmitReportReview = async (e) => {
    e.preventDefault();
    if (!reportingReview) return;

    const token = localStorage.getItem("token");
    const targetId = reportingReview.id;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/properties/reviews/${targetId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            reason: reportReason,
          }),
        },
      );

      if (!response.ok && response.status !== 404 && response.status !== 405) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to report review");
      }

      setReportingReview(null);
      openFeedback(
        "success",
        "Review Reported",
        "Thank you for flagging this review. Our team will check it shortly.",
      );
    } catch (error) {
      console.error("Error reporting review:", error);
      openFeedback(
        "error",
        "Report Failed",
        error.message || "Could not submit report.",
      );
    }
  };

  // Sort reviews based on selected sortBy option
  const sortedReviews = [...reviewsList].sort((a, b) => {
    const dateA =
      new Date(a.created_at || a.createdAt || a.date || 0).getTime() || 0;
    const dateB =
      new Date(b.created_at || b.createdAt || b.date || 0).getTime() || 0;
    const ratingA = Number(a.rating || 0);
    const ratingB = Number(b.rating || 0);
    const lenA = (a.comment || "").length;
    const lenB = (b.comment || "").length;

    if (sortBy === "Newest") {
      return dateB - dateA || Number(b.id || 0) - Number(a.id || 0);
    }
    if (sortBy === "Oldest") {
      return dateA - dateB || Number(a.id || 0) - Number(b.id || 0);
    }
    if (sortBy === "Highest rating") {
      return ratingB - ratingA || dateB - dateA;
    }
    if (sortBy === "Lowest rating") {
      return ratingA - ratingB || dateB - dateA;
    }
    const scoreA = ratingA * 10 + Math.min(lenA / 40, 5);
    const scoreB = ratingB * 10 + Math.min(lenB / 40, 5);
    return scoreB - scoreA || dateB - dateA;
  });

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

  const maxSelectableGuests = Math.max(1, Number(property.maxGuests || 4));
  const guestOptions = Array.from(
    { length: maxSelectableGuests },
    (_, idx) => ({
      value: idx + 1,
      label: `${idx + 1} ${idx + 1 === 1 ? "Guest" : "Guests"}`,
    }),
  );

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
                type="button"
                onClick={handleToggleFavorite}
                title={isLiked ? "Remove from Favorites" : "Save to Favorites"}
                className={`p-2.5 rounded-xl border transition cursor-pointer shadow-xs ${
                  isLiked
                    ? "text-rose-500 border-rose-200 bg-rose-50/70"
                    : "text-gray-600 border-gray-200 bg-white hover:text-coral-500"
                }`}
              >
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopiedLink(false);
                  setShareModalOpen(true);
                }}
                title="Share Property"
                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-coral-500 transition cursor-pointer shadow-xs"
              >
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

              {/* --- MODERN REVIEWS SECTION --- */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
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
                        ({reviewsList.length}{" "}
                        {reviewsList.length === 1 ? "review" : "reviews"})
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
                  className="bg-gray-50/90 p-5 sm:p-6 rounded-2xl border border-gray-200/80 space-y-4"
                >
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Leave a Review
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
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
                    placeholder="Share details of your own experience at this place..."
                    className="w-full bg-white border border-gray-200 text-xs font-medium text-gray-800 rounded-xl p-3.5 focus:outline-none focus:border-coral-500 resize-none"
                  ></textarea>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Send size={14} /> Post Review
                  </button>
                </form>

                {/* Sort By Filter Pills */}
                {reviewsList.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <p className="text-xs font-bold text-gray-700">Sort by</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        "Most relevant",
                        "Newest",
                        "Oldest",
                        "Highest rating",
                        "Lowest rating",
                      ].map((option) => {
                        const active = sortBy === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSortBy(option)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                              active
                                ? "bg-coral-500 text-white border-coral-500 shadow-xs"
                                : "bg-white text-gray-700 border-gray-200 hover:border-coral-500 hover:text-coral-500"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Modern Reviews Feed */}
                <div className="divide-y divide-gray-100" ref={reviewMenuRef}>
                  {sortedReviews.length === 0 ? (
                    <p className="text-xs text-gray-500 py-8 text-center font-medium">
                      No reviews yet. Be the first to share your experience!
                    </p>
                  ) : (
                    sortedReviews
                      .slice(0, visibleReviewsCount)
                      .map((rev, idx) => {
                        const revKey = rev.id ?? idx;
                        const authorName = rev.user_name || "Guest User";
                        const initials = authorName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();
                        const own = isOwnReview(rev);
                        const commentText = rev.comment || "";
                        const isLong = commentText.length > 180;
                        const isExpanded = !!expandedReviewIds[revKey];
                        const displayedComment =
                          isLong && !isExpanded
                            ? `${commentText.slice(0, 180)}...`
                            : commentText;

                        return (
                          <div
                            key={revKey}
                            className="py-5 first:pt-2 last:pb-2 space-y-3 relative"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-coral-500/10 text-coral-600 font-black text-xs flex items-center justify-center shrink-0 border border-coral-500/20">
                                  {initials || "G"}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">
                                      {authorName}
                                    </h4>
                                    {own && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-500/10 text-coral-600">
                                        Your review
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(5)].map((_, sIdx) => (
                                        <Star
                                          key={sIdx}
                                          size={12}
                                          className={`${
                                            sIdx < Number(rev.rating || 0)
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-semibold">
                                      {formatReviewTime(rev)}
                                    </span>
                                    {rev.edited && (
                                      <span className="text-[10px] text-gray-400 font-medium">
                                        • Edited
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenMenuReviewId((prev) =>
                                      prev === revKey ? null : revKey,
                                    )
                                  }
                                  className="p-1.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                                  aria-label="Review options"
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {openMenuReviewId === revKey && (
                                  <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 z-30">
                                    {own ? (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenEditReview(rev)
                                          }
                                          className="w-full px-3.5 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <Pencil
                                            size={13}
                                            className="text-gray-500"
                                          />
                                          Edit review
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleDeleteReview(rev.id)
                                          }
                                          className="w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                        >
                                          <Trash2
                                            size={13}
                                            className="text-rose-500"
                                          />
                                          Delete review
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenReportReview(rev)
                                        }
                                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                      >
                                        <Flag
                                          size={13}
                                          className="text-rose-500"
                                        />
                                        Report review
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="pl-12 space-y-1">
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                                {displayedComment}
                              </p>
                              {isLong && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedReviewIds((prev) => ({
                                      ...prev,
                                      [revKey]: !prev[revKey],
                                    }))
                                  }
                                  className="text-xs font-bold text-coral-500 hover:text-coral-600 cursor-pointer"
                                >
                                  {isExpanded ? "Show less" : "More"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

                {/* See More / See Less Button */}
                {reviewsList.length > 3 && (
                  <div className="text-center pt-2">
                    {visibleReviewsCount < reviewsList.length ? (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleReviewsCount((prev) => prev + 4)
                        }
                        className="inline-flex items-center gap-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        See More Reviews <ChevronDown size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVisibleReviewsCount(3)}
                        className="inline-flex items-center gap-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Floating Booking Card with Custom Calendar & Modern Guests Dropdown */}
            <div className="lg:col-span-1">
              <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sticky top-20 space-y-5">
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
                    <div ref={checkInRef}>
                      <div
                        onClick={() => {
                          setShowCheckInCalendar(!showCheckInCalendar);
                          setShowCheckOutCalendar(false);
                          setShowGuestsDropdown(false);
                        }}
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:border-coral-500 transition"
                      >
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer">
                          Check-in
                        </label>
                        <p className="text-[11px] font-bold text-gray-900 mt-0.5 truncate">
                          {checkInDate
                            ? checkInDate.toLocaleDateString()
                            : "Select date"}
                        </p>
                      </div>
                      {showCheckInCalendar && (
                        <div
                          ref={checkInPopupRef}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2.5 text-gray-800"
                        >
                          <Calendar
                            minDate={today}
                            onChange={(date) => {
                              setCheckInDate(date);
                              if (checkOutDate && date > checkOutDate) {
                                setCheckOutDate(null);
                              }
                              setShowCheckInCalendar(false);
                            }}
                            value={checkInDate || today}
                            className="custom-react-calendar"
                          />
                        </div>
                      )}
                    </div>

                    {/* Check-out Field */}
                    <div ref={checkOutRef}>
                      <div
                        onClick={() => {
                          setShowCheckOutCalendar(!showCheckOutCalendar);
                          setShowCheckInCalendar(false);
                          setShowGuestsDropdown(false);
                        }}
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl cursor-pointer hover:border-coral-500 transition"
                      >
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer">
                          Check-out
                        </label>
                        <p className="text-[11px] font-bold text-gray-900 mt-0.5 truncate">
                          {checkOutDate
                            ? checkOutDate.toLocaleDateString()
                            : "Select date"}
                        </p>
                      </div>
                      {showCheckOutCalendar && (
                        <div
                          ref={checkOutPopupRef}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2.5 text-gray-800"
                        >
                          <Calendar
                            minDate={checkInDate || today}
                            onChange={(date) => {
                              setCheckOutDate(date);
                              setShowCheckOutCalendar(false);
                            }}
                            value={checkOutDate || checkInDate || today}
                            className="custom-react-calendar"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modern Guests Dropdown */}
                  <div className="relative" ref={guestsRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGuestsDropdown((prev) => !prev);
                        setShowCheckInCalendar(false);
                        setShowCheckOutCalendar(false);
                      }}
                      aria-expanded={showGuestsDropdown}
                      className={`w-full text-left bg-gray-50 border px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 ${
                        showGuestsDropdown
                          ? "border-coral-500 ring-2 ring-coral-500/15 bg-white"
                          : "border-gray-200 hover:border-coral-500"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-coral-500/10 text-coral-500 flex items-center justify-center shrink-0">
                          <Users size={14} />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                            Guests · Max {maxSelectableGuests}
                          </span>
                          <span
                            className={`block text-xs truncate ${
                              guestsCount
                                ? "font-extrabold text-gray-900"
                                : "font-bold text-gray-500"
                            }`}
                          >
                            {guestsCount
                              ? `${guestsCount} ${guestsCount === 1 ? "Guest" : "Guests"}`
                              : "Select guest"}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-500 shrink-0 transition-transform duration-200 ${
                          showGuestsDropdown ? "rotate-180 text-coral-500" : ""
                        }`}
                      />
                    </button>

                    {showGuestsDropdown && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl p-1.5 z-40 max-h-64 overflow-y-auto space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setGuestsCount(null);
                            setShowGuestsDropdown(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                            !guestsCount
                              ? "bg-coral-500/10 text-coral-600"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                          }`}
                        >
                          <span className="text-xs font-bold">
                            Select guest
                          </span>
                          {!guestsCount && (
                            <span className="w-5 h-5 rounded-full bg-coral-500 text-white flex items-center justify-center shrink-0">
                              <Check size={12} />
                            </span>
                          )}
                        </button>

                        {guestOptions.map((option) => {
                          const isSelected = guestsCount === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setGuestsCount(option.value);
                                setShowGuestsDropdown(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected
                                  ? "bg-coral-500/10 text-coral-600"
                                  : "text-gray-800 hover:bg-gray-50"
                              }`}
                            >
                              <span className="text-xs font-extrabold">
                                {option.label}
                              </span>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-coral-500 text-white flex items-center justify-center shrink-0">
                                  <Check size={12} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Nights & Price Summary */}
                  {checkInDate && checkOutDate && (
                    <div className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-600 font-medium">
                        <span>
                          Rs. {Number(property.pricePerNight).toLocaleString()}{" "}
                          × {nightsCount}{" "}
                          {nightsCount === 1 ? "night" : "nights"}
                        </span>
                        <span className="font-bold text-gray-800">
                          Rs. {staySubtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600 font-medium">
                        <span>Selected Guests</span>
                        <span className="font-bold text-gray-800">
                          {guestsCount
                            ? `${guestsCount} ${guestsCount === 1 ? "Guest" : "Guests"}`
                            : "Select guest"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-gray-900 font-black">
                        <span>Estimated Stay Total</span>
                        <span className="text-coral-600">
                          Rs. {staySubtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

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

        {/* --- MODERN POPUPS / MODALS --- */}

        {/* Share Property Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-coral-500/10 text-coral-500 flex items-center justify-center">
                    <Share2 size={16} />
                  </div>
                  <h3 className="text-base font-black text-gray-900">
                    Share Property
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-500 font-medium line-clamp-1">
                {property.title}
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {sharePlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-gray-200 hover:border-coral-500 hover:bg-gray-50 transition text-center"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${platform.badgeBg}`}
                    >
                      {platform.icon}
                    </div>
                    <span className="text-[11px] font-bold text-gray-800">
                      {platform.name}
                    </span>
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-transparent text-xs text-gray-600 font-medium px-2 focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                  {copiedLink ? "Copied" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Review Modal */}
        {editingReview && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveEditedReview}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900">
                  Edit Review
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">
                  Rating:
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEditRating(star)}
                      className="focus:outline-none transition transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        size={20}
                        className={`${
                          editRating >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300 fill-transparent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows="3"
                required
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 rounded-xl p-3 focus:outline-none focus:border-coral-500 resize-none"
              />

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Report Review Modal */}
        {reportingReview && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleSubmitReportReview}
              className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <Flag size={16} />
                  </div>
                  <h3 className="text-base font-black text-gray-900">
                    Report Review
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReportingReview(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-gray-500 font-medium">
                Why are you reporting{" "}
                <span className="font-bold text-gray-800">
                  {reportingReview.user_name || "this user"}
                </span>
                's review?
              </p>

              <div className="space-y-2">
                {[
                  "Spam or misleading",
                  "Off-topic or irrelevant",
                  "Harassment or offensive content",
                  "Fake or conflict of interest",
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      reportReason === reason
                        ? "border-coral-500 bg-coral-500/5 text-gray-900"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="accent-[#FF5A5F]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setReportingReview(null)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 1. Feedback / Alert Modal (Rating Required, Success, Error, Favorites) */}
        {feedbackModal.open && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                  feedbackModal.type === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : feedbackModal.type === "error"
                      ? "bg-rose-50 text-rose-600"
                      : feedbackModal.type === "info"
                        ? "bg-coral-500/10 text-coral-500"
                        : "bg-amber-50 text-amber-500"
                }`}
              >
                {feedbackModal.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900">
                  {feedbackModal.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {feedbackModal.message}
                </p>
              </div>
              {feedbackModal.actionLabel && feedbackModal.actionPath ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFeedbackModal((prev) => ({ ...prev, open: false }))
                    }
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Stay Here
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = feedbackModal.actionPath;
                      setFeedbackModal((prev) => ({ ...prev, open: false }));
                      navigate(target);
                    }}
                    className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    {feedbackModal.actionLabel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setFeedbackModal((prev) => ({ ...prev, open: false }))
                  }
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. Delete Review Confirmation Modal */}
        {confirmDeleteReviewId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-rose-50 text-rose-500">
                <Trash2 size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900">
                  Delete Review?
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Are you sure you want to delete this review? This action
                  cannot be undone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteReviewId(null)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAndDeleteReview}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Login Alert Modal */}
        {showLoginAlertModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-coral-500/10 text-coral-500">
                <LogIn size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900">
                  Login Required
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Please login with a guest account to continue.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLoginAlertModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginAlertModal(false);
                    navigate("/login");
                  }}
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Missing Dates Alert Modal */}
        {showDateAlertModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-amber-50 text-amber-500">
                <CalendarIcon size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900">
                  Select Dates
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Please choose both Check-in and Check-out dates before
                  reserving your stay.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDateAlertModal(false)}
                className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* 5. Missing Guests Alert Modal */}
        {showGuestAlertModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-amber-50 text-amber-500">
                <Users size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900">
                  Select Guest
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  Please select the number of guests before reserving your stay.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowGuestAlertModal(false)}
                className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* Custom Styles for Calendar */}
        <style>{`
          .custom-react-calendar {
            width: 260px !important;
            max-width: 100% !important;
            border: none !important;
            font-family: inherit !important;
            background: transparent !important;
            font-size: 11px !important;
          }
          .custom-react-calendar .react-calendar__navigation {
            display: flex;
            height: 34px;
            margin-bottom: 6px;
            background-color: #FF5A5F;
            border-radius: 10px;
            padding: 0 4px;
            align-items: center;
          }
          .custom-react-calendar .react-calendar__navigation button {
            color: #FFFFFF;
            font-weight: 800;
            font-size: 11px;
            background: transparent !important;
            border-radius: 6px;
            min-width: 24px;
          }
          .custom-react-calendar .react-calendar__navigation button:hover,
          .custom-react-calendar .react-calendar__navigation button:focus,
          .custom-react-calendar .react-calendar__navigation button:active,
          .custom-react-calendar .react-calendar__navigation button:disabled {
            background: transparent !important;
            background-color: transparent !important;
            color: #FFFFFF !important;
            opacity: 0.55;
          }
          .custom-react-calendar .react-calendar__month-view__weekdays {
            font-size: 9px;
            font-weight: 700;
            color: #9CA3AF;
            text-transform: uppercase;
          }
          .custom-react-calendar .react-calendar__tile {
            font-size: 10px;
            font-weight: 700;
            padding: 6px 4px !important;
            border-radius: 8px;
            color: #374151;
          }
          .custom-react-calendar .react-calendar__tile:disabled {
            color: #9CA3AF !important;
            background: transparent !important;
            opacity: 0.85 !important;
            cursor: not-allowed !important;
          }
          .custom-react-calendar .react-calendar__tile:hover:not(:disabled) {
            background-color: #F3F4F6 !important;
            color: #FF5A5F !important;
          }
          .custom-react-calendar .react-calendar__tile--active {
            background: #FF5A5F !important;
            color: white !important;
          }
        `}</style>
      </div>

      <Footer />
    </div>
  );
}
