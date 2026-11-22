import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  ChevronDown,
  Settings,
  Clock,
  LogOut,
  Heart,
} from "lucide-react";
import logo from "../assets/images/logo.png";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status & user details from localStorage on mount & storage change
  useEffect(() => {
    const checkAuth = () => {
      const logged = localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("userRole");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      setIsLoggedIn(logged && role !== "host");

      if (logged) {
        setUserEmail(
          userData.email ||
            localStorage.getItem("userEmail") ||
            "user@gmail.com",
        );
        setUserName(userData.full_name || "User");
        setUserAvatar(userData.avatar || userData.profile_image || "");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear auth details from localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update local state immediately
    setIsLoggedIn(false);
    setDropdownOpen(false);

    // Daraz behavior: Page redirect nahi hoga, user usi page par rahega
    // Agar user kisi protected page par hai jo login ke baghair nahi chal sakta, toh usay explore par bhej sakte hain, warna usi page par rehne dein
    if (
      location.pathname === "/profile" ||
      location.pathname === "/favorites"
    ) {
      navigate("/explore");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="RentIQ Logo"
              className="h-14 sm:h-20 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/Explore"
              className="text-[12px] font-semibold text-gray-700 hover:text-coral-500 transition"
            >
              Explore
            </Link>
            <Link
              to="/How-It-Works"
              className="text-[12px] font-semibold text-gray-700 hover:text-coral-500 transition"
            >
              How It Works
            </Link>
            <Link
              to="/Blog"
              className="text-[12px] font-semibold text-gray-700 hover:text-coral-500 transition"
            >
              Blog
            </Link>
            <Link
              to="/faq"
              className="text-[12px] font-semibold text-gray-700 hover:text-coral-500 transition"
            >
              FAQ'S
            </Link>
          </nav>

          {/* Right Side: Login/Signup OR Profile Dropdown */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Trigger Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-1.5 px-3 rounded-xl transition cursor-pointer shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-coral-500 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : userName ? (
                      userName.charAt(0).toUpperCase()
                    ) : (
                      <User size={14} />
                    )}
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Professional Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 px-1.5 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-[11px] font-bold text-gray-900">
                        {userName || "Signed in as"}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate font-medium">
                        {userEmail}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        to="/favorites"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold text-gray-700 hover:bg-coral-50 hover:text-coral-600 rounded-xl transition"
                      >
                        <Heart size={14} className="text-gray-400" />
                        <span>Favorites</span>
                      </Link>

                      <Link
                        to="/history-tracking"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold text-gray-700 hover:bg-coral-50 hover:text-coral-600 rounded-xl transition"
                      >
                        <Clock size={14} className="text-gray-400" />
                        <span>History & Tracking</span>
                      </Link>

                      <Link
                        to="/account-settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold text-gray-700 hover:bg-coral-50 hover:text-coral-600 rounded-xl transition"
                      >
                        <Settings size={14} className="text-gray-400" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer text-left"
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <Link
                  to="/login"
                  className="text-[12px] font-bold text-gray-700 hover:text-coral-500 py-2 transition"
                >
                  Login
                </Link>
                <span className="text-gray-500 font-semibold px-1">|</span>
                <Link
                  to="/register"
                  className="bg-coral-500 hover:bg-coral-600 text-white text-[12px] font-semibold px-4 py-2 rounded-xl shadow-md transition ml-1"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
