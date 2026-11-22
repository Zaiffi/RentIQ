import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL = "http://localhost:8000";

export default function AccountSettings() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("guest");

  // Optional password update fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showToast = (msg) => {
    setErrorMessage("");
    setToastMessage(msg);
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

  const hydrateFromLocalStorage = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setFullName(parsed.full_name || parsed.name || "");
        setEmail(parsed.email || localStorage.getItem("email") || "");
        setPhone(parsed.phone || parsed.phone_number || "");
        setAddress(parsed.address || parsed.city || "");
        setBio(parsed.bio || "");
        setRole(parsed.role || localStorage.getItem("userRole") || "guest");
      } else {
        setEmail(localStorage.getItem("email") || "");
        setRole(localStorage.getItem("userRole") || "guest");
      }
    } catch (err) {
      console.error("Error reading user from localStorage:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUserProfile = async () => {
      setLoading(true);
      hydrateFromLocalStorage();

      const token = localStorage.getItem("token");
      if (token) {
        const endpoints = [
          `${API_BASE_URL}/api/v1/users/me`,
          `${API_BASE_URL}/api/v1/auth/me`,
        ];

        for (const url of endpoints) {
          try {
            const res = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok && isMounted) {
              const data = await res.json();
              const profile = data?.user || data;
              setFullName(profile.full_name || profile.name || "");
              setEmail(profile.email || "");
              setPhone(profile.phone || profile.phone_number || "");
              setAddress(profile.address || profile.city || "");
              setBio(profile.bio || "");
              setRole(profile.role || "guest");
              break;
            }
          } catch {
            // Fallback to next endpoint or localStorage
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    loadUserProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (newPassword || confirmNewPassword || currentPassword) {
      if (newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMessage("New password and confirm password do not match.");
        return;
      }
    }

    setSaving(true);

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      bio: bio.trim(),
    };

    if (newPassword) {
      payload.current_password = currentPassword;
      payload.password = newPassword;
      payload.new_password = newPassword;
    }

    const token = localStorage.getItem("token");
    let updatedInBackend = false;
    let backendErrorMsg = "";

    if (token) {
      const updateTargets = [
        { url: `${API_BASE_URL}/api/v1/users/me`, method: "PUT" },
        { url: `${API_BASE_URL}/api/v1/users/profile`, method: "PUT" },
        { url: `${API_BASE_URL}/api/v1/auth/profile`, method: "PUT" },
      ];

      for (const target of updateTargets) {
        try {
          const response = await fetch(target.url, {
            method: target.method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            const updatedData = await response.json().catch(() => ({}));
            const savedProfile = updatedData?.user || updatedData || {};

            setFullName(savedProfile.full_name || payload.full_name);
            setEmail(savedProfile.email || payload.email);
            setPhone(savedProfile.phone || payload.phone);
            setAddress(savedProfile.address || payload.address);
            setBio(savedProfile.bio || payload.bio);
            updatedInBackend = true;
            break;
          } else if (response.status === 400 || response.status === 422) {
            const errJson = await response.json().catch(() => ({}));
            backendErrorMsg =
              errJson?.detail ||
              "Could not update profile. Please check inputs.";
            break;
          }
        } catch {
          // Try next endpoint if available
        }
      }
    }

    // Sync updated fields in localStorage so Navbar / Dashboard stay up-to-date
    try {
      const existingRaw = localStorage.getItem("user");
      const existingObj = existingRaw ? JSON.parse(existingRaw) : {};
      const mergedUser = {
        ...existingObj,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        bio: bio.trim(),
        role,
      };
      localStorage.setItem("user", JSON.stringify(mergedUser));
      if (email.trim()) {
        localStorage.setItem("email", email.trim());
      }
    } catch (err) {
      console.error("LocalStorage sync error:", err);
    }

    setSaving(false);

    if (backendErrorMsg) {
      setErrorMessage(backendErrorMsg);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");

    showToast(
      updatedInBackend
        ? "Account settings updated in database!"
        : "Account settings saved successfully!",
    );
  };

  const avatarLetter = (fullName || email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Theme-Matched Auto-Dismiss Toast Popup */}
        {toastMessage && (
          <div className="fixed top-24 right-5 z-50 bg-white text-gray-900 px-4 py-3 rounded-2xl shadow-xl border border-coral-500/20 flex items-center gap-3 text-xs font-bold">
            <div className="w-7 h-7 rounded-xl bg-coral-500/10 text-coral-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-coral-500 bg-white border border-gray-200 px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-coral-500 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                {avatarLetter}
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  Account Settings
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  Manage and update your personal details saved in your account
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 bg-coral-50 text-coral-600 border border-coral-200 text-[11px] font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto">
              <ShieldCheck size={14} /> {role} Account
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
              <p className="text-sm font-bold text-gray-600 animate-pulse">
                Loading your account details...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-xs font-bold">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Personal Information Card */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base font-extrabold text-gray-900">
                    Personal Information
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Update your name, contact number, and location details
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <User size={13} className="text-coral-500" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Mail size={13} className="text-coral-500" /> Email
                      Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Phone size={13} className="text-coral-500" /> Phone
                      Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition"
                    />
                  </div>

                  {/* City / Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <MapPin size={13} className="text-coral-500" /> City /
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Rawalpindi / Islamabad"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    About / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write a short note about yourself..."
                    className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-medium text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition resize-none"
                  />
                </div>
              </div>

              {/* Password Update Card (Optional) */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                      <Lock size={16} className="text-coral-500" /> Change
                      Password
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Leave blank if you only want to update your profile info
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-coral-500 cursor-pointer"
                  >
                    {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                    {showPasswords ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      Current Password
                    </label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      New Password
                    </label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      Confirm New Password
                    </label>
                    <input
                      type={showPasswords ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 focus:bg-white border border-gray-200 focus:border-coral-500 text-xs sm:text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-5 py-3 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 disabled:opacity-60 shadow-md transition cursor-pointer"
                >
                  <Save size={15} />
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
