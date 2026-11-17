import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarCheck,
  BarChart3,
  Sparkles,
  TrendingUp,
  User,
  Bell,
  LogOut,
  Settings,
  ChevronDown,
  Star,
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

export default function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");

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
          {/* Notification Center */}
          <button className="relative p-2 text-gray-600 hover:text-coral-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer">
            <Bell size={16} />
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-coral-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
              2
            </span>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-coral-500 text-white shadow-md shadow-coral-500/20"
                    : "text-gray-600 hover:bg-coral-50 hover:text-coral-600"
                }`}
              >
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
