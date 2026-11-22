import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  KeyRound,
  Home,
  Search,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL = "http://localhost:8000";

const TRACKING_STAGES = [
  {
    key: "placed",
    title: "Request Submitted",
    description: "Booking & stay dates logged in RentIQ",
    icon: FileText,
  },
  {
    key: "verification",
    title: "Guest & ID Verification",
    description: "CNIC / group compliance & safety check",
    icon: ShieldCheck,
  },
  {
    key: "payment",
    title: "SafePay Payment",
    description: "Advance / rental payment confirmation",
    icon: CreditCard,
  },
  {
    key: "handover",
    title: "Host Approval & Keys",
    description: "Owner approval & check-in handover prep",
    icon: KeyRound,
  },
  {
    key: "active",
    title: "Move-In / Stay Active",
    description: "Property access & ongoing stay tracking",
    icon: Home,
  },
];

function parseDateOnly(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();

  // YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(trimmed);
  if (isoMatch) {
    return new Date(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
    );
  }

  // MM/DD/YYYY or DD/MM/YYYY
  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slashMatch) {
    const first = Number(slashMatch[1]);
    const second = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    // Assume MM/DD/YYYY unless first > 12
    const month = first > 12 ? second - 1 : first - 1;
    const day = first > 12 ? first : second;
    return new Date(year, month, day);
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return null;
}

function getTodayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function normalizeBookingRecord(item, index) {
  const checkInRaw = item.checkIn || item.check_in || "Upcoming";
  const checkOutRaw = item.checkOut || item.check_out || "Flexible";

  const hostConfirmed = Boolean(
    item.host_confirmed ??
    item.hostConfirmed ??
    [
      "confirmed",
      "host confirmed",
      "approved",
      "move-in active",
      "active",
      "completed",
    ].includes(
      String(item.status || "")
        .toLowerCase()
        .trim(),
    ),
  );

  const today = getTodayDateOnly();
  const startDate = parseDateOnly(checkInRaw);
  const endDate = parseDateOnly(checkOutRaw);

  const moveInDateStarted = Boolean(
    hostConfirmed && startDate && today.getTime() >= startDate.getTime(),
  );
  const stayEnded = Boolean(
    hostConfirmed && endDate && today.getTime() > endDate.getTime(),
  );

  let currentStep = 3;
  let badgeLabel = "Awaiting Host Confirm";
  let badgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
  let rawCategory = "awaiting_host";

  if (!hostConfirmed) {
    currentStep = 3;
    badgeLabel = "Pending Host Confirmation";
    badgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
    rawCategory = "awaiting_host";
  } else if (stayEnded) {
    currentStep = 5;
    badgeLabel = "Completed";
    badgeClasses = "bg-gray-100 text-gray-700 border-gray-200";
    rawCategory = "completed";
  } else if (moveInDateStarted) {
    currentStep = 5;
    badgeLabel = "Move-In Active";
    badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
    rawCategory = "active";
  } else {
    currentStep = 4;
    badgeLabel = "Host Confirmed";
    badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
    rawCategory = "confirmed";
  }

  const rawPhoto =
    typeof item.property_image === "string" && item.property_image.trim()
      ? item.property_image.trim()
      : typeof item.image === "string" && item.image.trim()
        ? item.image.trim()
        : typeof item.property?.photos === "string" &&
            item.property.photos.trim()
          ? item.property.photos.split(",")[0].trim()
          : "";

  const cleanPhotoPath = rawPhoto.replace(/^\/+/, "");
  const resolvedImage = rawPhoto
    ? rawPhoto.startsWith("http")
      ? rawPhoto
      : `${API_BASE_URL}/${cleanPhotoPath}`
    : "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600";

  const amountVal = Number(
    item.total_amount ??
      item.totalAmount ??
      item.total_price ??
      item.amount ??
      item.price ??
      0,
  );

  const guestsVal = Number(
    item.guests_count ??
      item.guestsCount ??
      item.guests ??
      item.max_guests ??
      1,
  );

  const nightsVal = Number(item.nights_count ?? item.nightsCount ?? 1);

  const paymentDisplay =
    item.paymentMethod ||
    item.payment_method ||
    item.payment_status ||
    "SafePay Protected";

  return {
    id: item.id ?? item.booking_id ?? `BK-${1001 + index}`,
    propertyId:
      item.property_id ?? item.propertyId ?? item.property?.id ?? null,
    propertyTitle:
      item.propertyTitle ||
      item.property_title ||
      item.property?.title ||
      item.title ||
      "Verified Rental Property",
    city:
      item.city ||
      item.location ||
      item.property?.city ||
      item.property?.address ||
      "Pakistan",
    image: resolvedImage,
    checkIn: checkInRaw,
    checkOut: checkOutRaw,
    nightsCount: Number.isNaN(nightsVal) || nightsVal < 1 ? 1 : nightsVal,
    guests: Number.isNaN(guestsVal) || guestsVal < 1 ? 1 : guestsVal,
    amount: Number.isNaN(amountVal) ? 0 : amountVal,
    paymentMethod: paymentDisplay,
    groupType:
      item.groupType || item.group_type || item.stay_type || "Standard Stay",
    updatedAt:
      item.updated_at || item.created_at || item.date || "Recently updated",
    hostConfirmed,
    moveInDateStarted,
    stayEnded,
    rawCategory,
    badge: {
      label: badgeLabel,
      classes: badgeClasses,
    },
    currentStep,
  };
}

export default function BookingHistoryTracking() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedHistoryIds, setExpandedHistoryIds] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadBookingsAndHistory = useCallback(
    async ({ isManualRefresh = false, silent = false } = {}) => {
      if (!silent) {
        if (isManualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      }

      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        setBookings([]);
        setRequiresAuth(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setRequiresAuth(false);

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/bookings/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          setBookings([]);
          setRequiresAuth(true);
        } else if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.bookings)
              ? data.bookings
              : Array.isArray(data?.items)
                ? data.items
                : [];

          const normalized = list.map((item, idx) =>
            normalizeBookingRecord(item, idx),
          );
          setBookings(normalized);

          if (normalized.length > 0) {
            setSelectedBookingId((prev) =>
              prev && normalized.some((b) => String(b.id) === String(prev))
                ? prev
                : normalized[0].id,
            );
          } else {
            setSelectedBookingId(null);
          }
        }
      } catch {
        if (!silent) {
          setBookings([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadBookingsAndHistory({ isManualRefresh: false, silent: false });

    // Real-time silent sync every 4 seconds so host confirmation updates immediately without page reload
    const intervalId = setInterval(() => {
      loadBookingsAndHistory({ isManualRefresh: false, silent: true });
    }, 4000);

    return () => clearInterval(intervalId);
  }, [loadBookingsAndHistory]);

  const toggleHistoryExpand = (id) => {
    setExpandedHistoryIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Only show in Completed/Past history if confirmed by host AND completed/past
  const historyVisibleBookings = bookings.filter(
    (b) => b.hostConfirmed && b.stayEnded,
  );

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.id).toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "active") {
      return !b.stayEnded;
    }
    if (statusFilter === "completed") {
      return b.hostConfirmed && b.stayEnded;
    }
    return true;
  });

  const activeTrackedBooking =
    filteredBookings.find((b) => String(b.id) === String(selectedBookingId)) ||
    filteredBookings[0] ||
    null;

  const totalSpend = bookings.reduce((sum, item) => sum + item.amount, 0);
  const activeCount = bookings.filter((item) => !item.stayEnded).length;
  const completedCount = historyVisibleBookings.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-coral-500 bg-white border border-gray-200 px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  loadBookingsAndHistory({
                    isManualRefresh: true,
                    silent: false,
                  })
                }
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[11px] font-bold px-3.5 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                <RefreshCw
                  size={12}
                  className={refreshing ? "animate-spin text-coral-500" : ""}
                />
                <span>{refreshing ? "Syncing..." : "Refresh"}</span>
              </button>

              <span className="inline-flex items-center gap-1.5 bg-coral-50 text-coral-600 border border-coral-200 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                <Sparkles size={13} /> Live Rental Tracker & History
              </span>
            </div>
          </div>

          {/* Page Header & Summary Cards */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Booking{" "}
                <span className="text-coral-500">History & Tracking</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Track every step of your property rental process—from
                verification and SafePay payment to host confirmation and
                move-in—with automatic live updates.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase block">
                  Total Bookings
                </span>
                <span className="text-xl font-black text-gray-900 mt-1 block">
                  {bookings.length}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase block">
                  Active Tracking
                </span>
                <span className="text-xl font-black text-coral-500 mt-1 block">
                  {activeCount}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase block">
                  Completed Stays
                </span>
                <span className="text-xl font-black text-gray-900 mt-1 block">
                  {completedCount}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase block">
                  Total Booking Value
                </span>
                <span className="text-lg sm:text-xl font-black text-gray-900 mt-1 block truncate">
                  Rs. {totalSpend.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
              <p className="text-sm font-bold text-gray-600 animate-pulse">
                Loading your database bookings and live tracking status...
              </p>
            </div>
          ) : requiresAuth ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-500 flex items-center justify-center mx-auto">
                <Calendar size={22} />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Sign In to View Your Saved Bookings
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-medium">
                Please log in to your RentIQ account to view bookings saved in
                your database profile.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-coral-50 text-coral-500 flex items-center justify-center mx-auto">
                <Calendar size={22} />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">
                No Database Bookings Found for Your Account
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto font-medium">
                Once you reserve a property while logged in, your saved DB
                bookings and live rental tracker will appear here.
              </p>
              <div className="pt-2">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition"
                >
                  Explore Properties
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* SECTION 1: Live Property Rental Process Tracker */}
              {activeTrackedBooking && (
                <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={activeTrackedBooking.image}
                        alt={activeTrackedBooking.propertyTitle}
                        className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shrink-0"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-extrabold text-coral-500 uppercase tracking-wider">
                            Live Rental Tracking • #{activeTrackedBooking.id}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeTrackedBooking.badge.classes}`}
                          >
                            {activeTrackedBooking.badge.label}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-gray-900 mt-0.5">
                          {activeTrackedBooking.propertyTitle}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium flex items-center gap-3 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} className="text-coral-500" />
                            {activeTrackedBooking.city}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            {activeTrackedBooking.checkIn} →{" "}
                            {activeTrackedBooking.checkOut}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Users size={12} className="text-gray-400" />
                            {activeTrackedBooking.guests}{" "}
                            {activeTrackedBooking.guests === 1
                              ? "Guest"
                              : "Guests"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Custom Styled Booking Selector Dropdown */}
                    {filteredBookings.length > 1 && (
                      <div
                        className="w-full md:w-72 relative"
                        ref={dropdownRef}
                      >
                        <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1.5">
                          Select Booking to Track
                        </span>

                        <button
                          type="button"
                          onClick={() => setDropdownOpen((prev) => !prev)}
                          className={`w-full flex items-center justify-between gap-2 bg-gray-50 hover:bg-white border rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-gray-800 transition cursor-pointer ${
                            dropdownOpen
                              ? "border-coral-500 ring-2 ring-coral-500/15 bg-white"
                              : "border-gray-200 hover:border-coral-300"
                          }`}
                        >
                          <span className="truncate">
                            #{activeTrackedBooking.id} —{" "}
                            {activeTrackedBooking.propertyTitle}
                          </span>
                          <ChevronDown
                            size={15}
                            className={`text-gray-500 shrink-0 transition-transform duration-200 ${
                              dropdownOpen ? "rotate-180 text-coral-500" : ""
                            }`}
                          />
                        </button>

                        {dropdownOpen && (
                          <div className="absolute right-0 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto">
                            {filteredBookings.map((b) => {
                              const isSelected =
                                String(b.id) ===
                                String(activeTrackedBooking.id);
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBookingId(b.id);
                                    setDropdownOpen(false);
                                  }}
                                  className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                                    isSelected
                                      ? "bg-coral-50 text-coral-600 font-extrabold"
                                      : "text-gray-700 hover:bg-gray-50 font-semibold"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="truncate">
                                      #{b.id} — {b.propertyTitle}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium truncate mt-0.5">
                                      {b.city} • {b.badge.label}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check
                                      size={14}
                                      className="text-coral-500 shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 5-Stage Rental Process Stepper */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-1">
                    {TRACKING_STAGES.map((stage, idx) => {
                      const stepNumber = idx + 1;
                      const isStep5MoveIn = stepNumber === 5;
                      const isStep5ActiveGreen =
                        isStep5MoveIn &&
                        activeTrackedBooking.hostConfirmed &&
                        activeTrackedBooking.moveInDateStarted;

                      const isCompleted =
                        stepNumber < activeTrackedBooking.currentStep ||
                        isStep5ActiveGreen;
                      const isCurrent =
                        !isStep5ActiveGreen &&
                        stepNumber === activeTrackedBooking.currentStep;

                      const StageIcon = stage.icon;

                      const cardClasses = isStep5ActiveGreen
                        ? "bg-emerald-50/70 border-emerald-500 shadow-xs"
                        : isCurrent
                          ? "bg-coral-50/70 border-coral-500 shadow-xs"
                          : isCompleted
                            ? "bg-gray-50/90 border-emerald-200"
                            : "bg-white border-gray-100 opacity-70";

                      const iconBoxClasses = isStep5ActiveGreen
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-coral-500 text-white"
                          : isCompleted
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 text-gray-400";

                      const pillClasses = isStep5ActiveGreen
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-coral-500 text-white"
                          : isCompleted
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500";

                      const pillText = isStep5ActiveGreen
                        ? "Move-In Active"
                        : isCurrent
                          ? "Current Step"
                          : isCompleted
                            ? "Completed"
                            : `Step ${stepNumber}`;

                      const footerStatusText = isStep5ActiveGreen
                        ? "Move-In Started"
                        : isCompleted
                          ? "Verified & Done"
                          : isCurrent
                            ? stepNumber === 3 &&
                              !activeTrackedBooking.hostConfirmed
                              ? "Paid • Waiting Host Confirm"
                              : "In Progress Now"
                            : "Upcoming";

                      return (
                        <div
                          key={stage.key}
                          className={`rounded-2xl p-4 border transition flex flex-col justify-between ${cardClasses}`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBoxClasses}`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 size={17} />
                                ) : (
                                  <StageIcon size={17} />
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${pillClasses}`}
                              >
                                {pillText}
                              </span>
                            </div>

                            <h3 className="text-xs font-extrabold text-gray-900">
                              {stage.title}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">
                              {stage.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-gray-100/80 flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Clock size={11} className="text-coral-500" />
                            <span>{footerStatusText}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: Full Booking History & Past Activity */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-gray-900">
                      Complete Booking & Rental History
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Completed stays appear in history once confirmed by the
                      host and finished
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative">
                      <Search
                        size={14}
                        className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search property or ID..."
                        className="bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-coral-500"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                      {[
                        { id: "all", label: "All" },
                        { id: "active", label: "Active" },
                        { id: "completed", label: "Completed" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setStatusFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            statusFilter === tab.id
                              ? "bg-white text-coral-600 shadow-2xs"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="py-8 text-center text-xs font-bold text-gray-500">
                    {statusFilter === "completed"
                      ? "No host-confirmed completed stays in history yet."
                      : "No bookings match your current filter."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((booking) => {
                      const isExpanded = !!expandedHistoryIds[booking.id];
                      const currentStageInfo =
                        TRACKING_STAGES[booking.currentStep - 1] ||
                        TRACKING_STAGES[0];

                      return (
                        <div
                          key={booking.id}
                          className="rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white transition p-4 space-y-3"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={booking.image}
                                alt={booking.propertyTitle}
                                className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                              />
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-extrabold text-gray-400">
                                    #{booking.id}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${booking.badge.classes}`}
                                  >
                                    {booking.badge.label}
                                  </span>
                                </div>
                                <h3 className="text-sm font-extrabold text-gray-900 mt-0.5">
                                  {booking.propertyTitle}
                                </h3>
                                <p className="text-[11px] text-gray-500 font-medium flex flex-wrap items-center gap-2 mt-0.5">
                                  <span>{booking.city}</span>
                                  <span>•</span>
                                  <span>
                                    {booking.checkIn} → {booking.checkOut}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {booking.guests}{" "}
                                    {booking.guests === 1 ? "Guest" : "Guests"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                              <div className="text-left lg:text-right mr-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                  Total Amount
                                </span>
                                <span className="text-sm font-black text-gray-900">
                                  Rs. {booking.amount.toLocaleString()}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedBookingId(booking.id)}
                                className="px-3 py-2 rounded-xl text-[11px] font-bold bg-coral-500 hover:bg-coral-600 text-white transition cursor-pointer"
                              >
                                Track Step
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleHistoryExpand(booking.id)}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition cursor-pointer"
                              >
                                Details
                                {isExpanded ? (
                                  <ChevronUp size={13} />
                                ) : (
                                  <ChevronDown size={13} />
                                )}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="pt-3 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                  Current Process Stage
                                </span>
                                <span className="font-bold text-gray-900 mt-0.5 block">
                                  Step {booking.currentStep} of 5:{" "}
                                  {currentStageInfo.title}
                                </span>
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                  Payment & Stay Category
                                </span>
                                <span className="font-bold text-gray-900 mt-0.5 block">
                                  {booking.paymentMethod} • {booking.groupType}
                                </span>
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase block">
                                    Stay Duration & Date
                                  </span>
                                  <span className="font-semibold text-gray-600 mt-0.5 block">
                                    {booking.nightsCount}{" "}
                                    {booking.nightsCount === 1
                                      ? "Night"
                                      : "Nights"}{" "}
                                    • {booking.updatedAt}
                                  </span>
                                </div>
                                {booking.propertyId && (
                                  <Link
                                    to={`/property/${booking.propertyId}`}
                                    className="text-coral-600 hover:underline font-bold text-[11px]"
                                  >
                                    View Property →
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
