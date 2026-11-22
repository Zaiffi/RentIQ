import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarCheck,
  BarChart3,
  Sparkles,
  TrendingUp,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  Star,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
  Loader2,
  CheckCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/images/logo.png";

// --- SPA PANELS ---
import HostHomeStats from "./panels/HostHomeStats"; // Stats & Overview
import MyPropertiesPanel from "./panels/MyPropertiesPanel"; // Properties List
import AddPropertyPanel from "./panels/AddPropertyPanel"; // Add Property Form
import BookingsPanel from "./panels/BookingsPanel"; // Incoming Bookings & Verification
import AnalyticsPanel from "./panels/AnalyticsPanel"; // Earnings & Stats
import AIPricePanel from "./panels/AIPricePanel"; // AI Price Recommendations
import DemandForecastPanel from "./panels/DemandForecastPanel"; // Demand Forecast
import HostProfilePanel from "./panels/HostProfilePanel"; // Profile & Settings
import HostReviewsPanel from "./panels/HostReviewsPanel"; // Host Reviews Panel (New)

const API_BASE_URL = "http://localhost:8000";

function HostNotificationsPanel({ onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [readingId, setReadingId] = useState(null);
  const [filterTab, setFilterTab] = useState("all"); // "all" | "unread" | "confirmations"
  const [searchTerm, setSearchTerm] = useState("");
  const [bannerNotice, setBannerNotice] = useState(null);

  const getToken = () =>
    localStorage.getItem("token") || localStorage.getItem("access_token");

  const showNotice = (type, text) => {
    setBannerNotice({ type, text });
    setTimeout(() => {
      setBannerNotice((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const fetchNotifications = useCallback(
    async ({ manual = false, silent = false } = {}) => {
      if (!silent) {
        if (manual) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      }

      const token = getToken();
      if (!token) {
        setNotifications([]);
        if (onUnreadChange) onUnreadChange(0);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/notifications/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.notifications)
              ? data.notifications
              : [];
          setNotifications(list);
          if (onUnreadChange) {
            onUnreadChange(list.filter((n) => !n.is_read).length);
          }
        }
      } catch {
        if (!silent) {
          showNotice(
            "error",
            "Could not load notifications from server. Please check backend.",
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [onUnreadChange],
  );

  useEffect(() => {
    fetchNotifications({ manual: false, silent: false });

    const timer = setInterval(() => {
      fetchNotifications({ manual: false, silent: true });
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const handleConfirmBooking = async (notif) => {
    if (!notif?.booking_id) return;
    const token = getToken();
    setConfirmingId(notif.id);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/bookings/${notif.booking_id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Failed to confirm booking");
      }

      setNotifications((prev) => {
        const updated = prev.map((item) =>
          item.booking_id === notif.booking_id
            ? { ...item, action_status: "confirmed", is_read: true }
            : item,
        );
        if (onUnreadChange) {
          onUnreadChange(updated.filter((n) => !n.is_read).length);
        }
        return updated;
      });

      showNotice(
        "success",
        `Booking #${notif.booking_id} confirmed! Guest tracking has been updated live.`,
      );
    } catch (err) {
      showNotice("error", err.message || "Error confirming booking.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    const token = getToken();
    setReadingId(notifId);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/notifications/${notifId}/read`,
        {
          method: "PATCH",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (res.ok) {
        setNotifications((prev) => {
          const updated = prev.map((item) =>
            item.id === notifId ? { ...item, is_read: true } : item,
          );
          if (onUnreadChange) {
            onUnreadChange(updated.filter((n) => !n.is_read).length);
          }
          return updated;
        });
      }
    } catch {
      showNotice("error", "Unable to mark notification as read.");
    } finally {
      setReadingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadItems = notifications.filter((n) => !n.is_read);
    if (unreadItems.length === 0) return;

    await Promise.all(unreadItems.map((n) => handleMarkAsRead(n.id)));
    showNotice("success", "All notifications marked as read.");
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      String(n.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(n.message || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(n.booking_id || "").includes(searchTerm.trim());

    if (!matchesSearch) return false;

    if (filterTab === "unread") {
      return !n.is_read;
    }
    if (filterTab === "confirmations") {
      return (
        n.notif_type === "booking_confirmation" && n.action_status === "pending"
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const pendingConfirmCount = notifications.filter(
    (n) =>
      n.notif_type === "booking_confirmation" && n.action_status === "pending",
  ).length;
  const confirmedCount = notifications.filter(
    (n) => n.action_status === "confirmed",
  ).length;

  const formatTimestamp = (isoStr) => {
    if (!isoStr) return "Just now";
    const dt = new Date(isoStr);
    if (isNaN(dt.getTime())) return isoStr;
    return dt.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 bg-coral-50 text-coral-600 border border-coral-200 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          <Sparkles size={13} /> Host Live Alerts
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[11px] font-bold px-3.5 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
            >
              <CheckCheck size={13} className="text-emerald-600" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchNotifications({ manual: true, silent: false })}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-[11px] font-bold px-3.5 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
          >
            <RefreshCw
              size={12}
              className={refreshing ? "animate-spin text-coral-500" : ""}
            />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {bannerNotice && (
        <div
          className={`rounded-2xl px-4 py-3 text-xs font-bold border flex items-center justify-between gap-3 ${
            bannerNotice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{bannerNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setBannerNotice(null)}
            className="text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-coral-500/10 text-coral-600 flex items-center justify-center shrink-0">
            <Bell size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Host <span className="text-coral-500">Notifications</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Review guest payments and confirm bookings to unlock keys &
              move-in tracking in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase block">
              Unread Alerts
            </span>
            <span className="text-xl font-black text-gray-900 mt-1 block">
              {unreadCount}
            </span>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase block">
              Awaiting Confirmation
            </span>
            <span className="text-xl font-black text-amber-700 mt-1 block">
              {pendingConfirmCount}
            </span>
          </div>

          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/70">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase block">
              Confirmed Bookings
            </span>
            <span className="text-xl font-black text-emerald-700 mt-1 block">
              {confirmedCount}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
            {[
              { id: "all", label: "All" },
              { id: "unread", label: `Unread (${unreadCount})` },
              {
                id: "confirmations",
                label: `Confirmations (${pendingConfirmCount})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  filterTab === tab.id
                    ? "bg-white text-coral-600 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search booking ID or alert..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-coral-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <p className="text-xs sm:text-sm font-bold text-gray-500 animate-pulse">
              Loading host notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Bell size={20} />
            </div>
            <h2 className="text-sm font-extrabold text-gray-900">
              No Notifications Found
            </h2>
            <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">
              When a guest completes payment on checkout, a confirmation alert
              will appear here immediately.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const needsConfirmation =
                notif.notif_type === "booking_confirmation" &&
                notif.action_status === "pending" &&
                !!notif.booking_id;
              const isConfirmed = notif.action_status === "confirmed";

              return (
                <div
                  key={notif.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    needsConfirmation
                      ? "bg-amber-50/40 border-amber-200"
                      : !notif.is_read
                        ? "bg-coral-50/25 border-coral-200/80"
                        : "bg-gray-50/60 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isConfirmed
                          ? "bg-emerald-100 text-emerald-700"
                          : needsConfirmation
                            ? "bg-amber-100 text-amber-700"
                            : "bg-white text-coral-500 border border-gray-200"
                      }`}
                    >
                      {isConfirmed ? (
                        <CheckCircle2 size={18} />
                      ) : needsConfirmation ? (
                        <ShieldCheck size={18} />
                      ) : (
                        <Bell size={18} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-extrabold text-gray-900">
                          {notif.title}
                        </h3>

                        {notif.booking_id && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            Booking #{notif.booking_id}
                          </span>
                        )}

                        {isConfirmed ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Confirmed
                          </span>
                        ) : needsConfirmation ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Action Needed
                          </span>
                        ) : !notif.is_read ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-coral-500 text-white">
                            New
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-gray-600 font-medium leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 pt-0.5">
                        <Clock size={11} />
                        <span>{formatTimestamp(notif.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                    {needsConfirmation && (
                      <button
                        type="button"
                        onClick={() => handleConfirmBooking(notif)}
                        disabled={confirmingId === notif.id}
                        className="inline-flex items-center gap-1.5 bg-coral-500 hover:bg-coral-600 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                      >
                        {confirmingId === notif.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Confirming...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Confirm Booking</span>
                          </>
                        )}
                      </button>
                    )}

                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notif.id)}
                        disabled={readingId === notif.id}
                        className="inline-flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                      >
                        {readingId === notif.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : null}
                        <span>Mark Read</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Get logged-in user details from localStorage
  const [userData, setUserData] = useState({
    full_name: "Hassan",
    email: "hassan@rentiq.com",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          full_name: parsedUser.full_name || parsedUser.name || "Hassan",
          email: parsedUser.email || "hassan@rentiq.com",
        });
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  // Poll unread notifications count for top bell badge
  useEffect(() => {
    const syncUnreadBadge = async () => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        setUnreadNotificationsCount(0);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.notifications)
              ? data.notifications
              : [];
          setUnreadNotificationsCount(list.filter((n) => !n.is_read).length);
        }
      } catch {
        // Keep badge quiet if backend endpoint is unavailable
      }
    };

    syncUnreadBadge();
    const badgeTimer = setInterval(syncUnreadBadge, 6000);
    return () => clearInterval(badgeTimer);
  }, []);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const sidebarItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "My Properties", icon: <Building2 size={18} /> },
    { name: "Add Property", icon: <PlusCircle size={18} /> },
    { name: "Bookings", icon: <CalendarCheck size={18} /> },
    { name: "Reviews", icon: <Star size={18} /> },
    { name: "Analytics", icon: <BarChart3 size={18} /> },
    { name: "AI Price Recommendation", icon: <Sparkles size={18} /> },
    { name: "Demand Forecast", icon: <TrendingUp size={18} /> },
  ];

  // --- Dynamic Component Renderer for SPA ---
  const renderActivePanel = () => {
    switch (activeTab) {
      case "Dashboard":
        return <HostHomeStats setActiveTab={setActiveTab} />;
      case "My Properties":
        return <MyPropertiesPanel />;
      case "Add Property":
        return <AddPropertyPanel />;
      case "Bookings":
        return <BookingsPanel />;
      case "Notifications":
        return (
          <HostNotificationsPanel
            onUnreadChange={setUnreadNotificationsCount}
          />
        );
      case "Reviews":
        return <HostReviewsPanel />;
      case "Analytics":
        return <AnalyticsPanel />;
      case "AI Price Recommendation":
        return <AIPricePanel />;
      case "Demand Forecast":
        return <DemandForecastPanel />;
      case "Host Profile":
        return <HostProfilePanel />;
      default:
        return <HostHomeStats setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- TOP NAVBAR (Height: 70px) --- */}
      <header className="bg-white border-b border-gray-200 px-6 h-[70px] flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-8">
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => setActiveTab("Dashboard")}
          >
            <img
              src={logoImg}
              alt="RentIQ Logo"
              className="h-14 sm:h-20 w-auto object-contain py-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("Notifications")}
            title="Host Notifications"
            className={`relative p-2 rounded-xl transition cursor-pointer focus:outline-none focus:ring-0 ${
              activeTab === "Notifications"
                ? "text-coral-600 bg-coral-50 border border-coral-200"
                : "text-gray-600 hover:text-coral-600 bg-gray-50 hover:bg-gray-100 border border-transparent"
            }`}
          >
            <Bell size={16} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-coral-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {unreadNotificationsCount > 99
                  ? "99+"
                  : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 py-1.5 rounded-2xl border border-gray-200 transition"
            >
              <div className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-xs">
                {userData.full_name
                  ? userData.full_name.charAt(0).toUpperCase()
                  : "H"}
              </div>

              <ChevronDown
                size={12}
                className={`text-gray-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </div>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2">
                {/* User Info Header inside dropdown */}
                <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-xs font-extrabold text-gray-900 truncate">
                    {userData.full_name}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate font-medium">
                    {userData.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab("Host Profile");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-coral-50 hover:text-coral-600 rounded-xl transition cursor-pointer"
                >
                  <Settings size={14} className="text-gray-500" /> Settings
                </button>
                <div className="h-px bg-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN SPA LAYOUT WITH SIDEBAR & DYNAMIC CONTENT --- */}
      <div className="flex flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* SIDEBAR */}
        <aside className="w-72 bg-white border border-gray-200/80 p-3 rounded-3xl shadow-sm space-y-1.5 hidden lg:block sticky top-24 h-fit ml-0">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-coral-500 text-white shadow-md shadow-coral-500/20"
                    : "text-gray-600 hover:bg-coral-50 hover:text-coral-600"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-500 hover:text-coral-600"
                    }
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </span>

                {item.name === "Notifications" &&
                  unreadNotificationsCount > 0 && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white text-coral-600"
                          : "bg-coral-500 text-white"
                      }`}
                    >
                      {unreadNotificationsCount > 99
                        ? "99+"
                        : unreadNotificationsCount}
                    </span>
                  )}
              </button>
            );
          })}
        </aside>

        {/* DYNAMIC CONTENT AREA (SPA Renderer) */}
        <main className="flex-1 py-2 overflow-hidden">
          {renderActivePanel()}
        </main>
      </div>
    </div>
  );
}
