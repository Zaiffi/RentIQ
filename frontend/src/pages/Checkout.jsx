import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Users,
  FileText,
  CreditCard,
  ArrowLeft,
  Phone,
  Building,
  ChevronDown,
  Check,
  Loader2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE_URL = "http://localhost:8000/api/v1";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navState = location.state || {};
  const queryParams = new URLSearchParams(location.search);

  const checkIn =
    queryParams.get("checkIn") ||
    (navState.checkInDate
      ? new Date(navState.checkInDate).toLocaleDateString()
      : "Not selected");
  const checkOut =
    queryParams.get("checkOut") ||
    (navState.checkOutDate
      ? new Date(navState.checkOutDate).toLocaleDateString()
      : "Not selected");

  const parsedGuests = Number(
    queryParams.get("guests") || navState.guestsCount || 1,
  );
  const guestsCountParam =
    Number.isFinite(parsedGuests) && parsedGuests >= 1 ? parsedGuests : 1;

  const propertyInfo = navState.property || {};
  const resolvedPropertyId = Number(
    propertyInfo.id ||
      propertyInfo.property_id ||
      queryParams.get("propertyId") ||
      0,
  );
  const propertyTitle =
    propertyInfo.title || "Luxury Modern Villa with Skyline View";
  const propertyLocation =
    propertyInfo.address ||
    propertyInfo.city ||
    "DHA Phase 6, Lahore, Pakistan";
  const pricePerNight = Number(
    propertyInfo.pricePerNight || propertyInfo.price_per_night || 0,
  );

  const calculateFallbackNights = () => {
    if (navState.nightsCount && Number(navState.nightsCount) > 0) {
      return Number(navState.nightsCount);
    }
    const start = navState.checkInDate
      ? new Date(navState.checkInDate)
      : new Date(checkIn);
    const end = navState.checkOutDate
      ? new Date(navState.checkOutDate)
      : new Date(checkOut);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diff > 0) return diff;
    }
    return 1;
  };

  const nightsCount = calculateFallbackNights();
  const computedTotalAmount =
    navState.staySubtotal && Number(navState.staySubtotal) > 0
      ? Number(navState.staySubtotal)
      : pricePerNight > 0
        ? pricePerNight * nightsCount
        : 415;

  // Form States
  const [fullName, setFullName] = useState(
    localStorage.getItem("userName") || localStorage.getItem("user_name") || "",
  );
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Group / Stay Type (Family, Married Couple, Corporate/Business, Friends)
  const [groupType, setGroupType] = useState("Family");

  const getDefaultRelationForGroup = (type, memberIdx = 0) => {
    if (type === "Married Couple") {
      return memberIdx === 0 ? "Wife" : "Husband";
    }
    if (type === "Friends") return "Friend";
    if (type === "Corporate/Business") return "Colleague";
    return memberIdx === 0 ? "Spouse" : "Child";
  };

  // Dynamic Accompanying Members State (accompanying guests = total guests - 1)
  const requiredAccompanyingCount = Math.max(0, guestsCountParam - 1);
  const [familyMembers, setFamilyMembers] = useState(() =>
    Array.from({ length: requiredAccompanyingCount }, (_, idx) => ({
      name: "",
      relation: getDefaultRelationForGroup("Family", idx),
      cnicOrPassport: "",
    })),
  );

  // Sync accompanying guest rows when guestsCountParam changes
  useEffect(() => {
    const targetCount = Math.max(0, guestsCountParam - 1);
    setFamilyMembers((prev) => {
      if (prev.length === targetCount) return prev;
      if (prev.length > targetCount) {
        return prev.slice(0, targetCount);
      }
      const extraRows = Array.from(
        { length: targetCount - prev.length },
        (_, idx) => ({
          name: "",
          relation: getDefaultRelationForGroup(groupType, prev.length + idx),
          cnicOrPassport: "",
        }),
      );
      return [...prev, ...extraRows];
    });
  }, [guestsCountParam, groupType]);

  // Track which dropdown is open (index-based)
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const dropdownRefs = useRef({});

  // Close custom dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdownIndex !== null &&
        dropdownRefs.current[openDropdownIndex] &&
        !dropdownRefs.current[openDropdownIndex].contains(event.target)
      ) {
        setOpenDropdownIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownIndex]);

  // Couple specific: Marriage Certificate (Nikah Nama)
  const [marriageCert, setMarriageCert] = useState(null);

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Additional Local Wallet / Processing States
  const [walletProvider, setWalletProvider] = useState("jazzcash");
  const [walletMobile, setWalletMobile] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStageText, setProcessingStageText] = useState("");

  // Alert / Feedback Modal State
  const [alertModal, setAlertModal] = useState({
    open: false,
    type: "warning", // "warning" | "error" | "success"
    title: "",
    message: "",
  });

  const openAlert = (type, title, message) => {
    setAlertModal({ open: true, type, title, message });
  };

  const handleGroupTypeChange = (type) => {
    setGroupType(type);
    setOpenDropdownIndex(null);
    setFamilyMembers((prev) =>
      prev.map((member, idx) => ({
        ...member,
        relation: getDefaultRelationForGroup(type, idx),
      })),
    );
  };

  const handleAddMember = () => {
    if (familyMembers.length >= requiredAccompanyingCount) {
      openAlert(
        "warning",
        "Guest Limit Reached",
        `You selected ${guestsCountParam} total guest${guestsCountParam > 1 ? "s" : ""}, so up to ${requiredAccompanyingCount} accompanying guest${requiredAccompanyingCount === 1 ? "" : "s"} can be added.`,
      );
      return;
    }

    setFamilyMembers([
      ...familyMembers,
      {
        name: "",
        relation: getDefaultRelationForGroup(groupType, familyMembers.length),
        cnicOrPassport: "",
      },
    ]);
  };

  const handleRemoveMember = (index) => {
    const updated = familyMembers.filter((_, i) => i !== index);
    setFamilyMembers(updated);
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      openAlert(
        "warning",
        "Missing Primary Guest Details",
        "Please fill out all primary guest details before continuing.",
      );
      return;
    }

    if (
      !emergencyName.trim() ||
      !emergencyRelation.trim() ||
      !emergencyPhone.trim()
    ) {
      openAlert(
        "warning",
        "Emergency Contact Required",
        "Please fill out all emergency contact details before continuing.",
      );
      return;
    }

    if (
      guestsCountParam > 1 &&
      groupType === "Married Couple" &&
      !marriageCert
    ) {
      openAlert(
        "warning",
        "Certificate Required",
        "Please attach the Marriage Certificate / Nikah Nama for a Married Couple stay.",
      );
      return;
    }

    if (paymentMethod === "wallet" && !walletMobile.trim()) {
      openAlert(
        "warning",
        "Wallet Number Required",
        "Please enter your mobile wallet number (JazzCash / Easypaisa).",
      );
      return;
    }

    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (!cleanCard || !cardExpiry.trim() || !cardCvc.trim()) {
        openAlert(
          "warning",
          "Card Details Required",
          "Please fill in your card number, expiry date, and CVC.",
        );
        return;
      }
    }

    setIsProcessingPayment(true);
    setProcessingStageText("Initiating secure payment & saving booking...");

    const selectedMethodLabel =
      paymentMethod === "wallet"
        ? `${walletProvider === "jazzcash" ? "JazzCash" : "Easypaisa"} (${walletMobile.trim()})`
        : "Credit / Debit Card";

    const normalizedGroupType = guestsCountParam > 1 ? groupType : "Solo Stay";
    const normalizedAccompanying =
      guestsCountParam > 1
        ? familyMembers.map((m) => ({
            name: m.name.trim(),
            relation: m.relation,
            cnic_or_passport: m.cnicOrPassport.trim(),
          }))
        : [];

    const bookingApiPayload = {
      property_id: resolvedPropertyId > 0 ? resolvedPropertyId : null,
      property_title: propertyTitle,
      location: propertyLocation,
      check_in: checkIn,
      check_out: checkOut,
      nights_count: nightsCount,
      guests_count: guestsCountParam,
      group_type: normalizedGroupType,
      total_amount: computedTotalAmount,
      payment_method: selectedMethodLabel,
      payment_status: "Paid",
      status: "Pending Host Confirmation",
      primary_guest: {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      },
      accompanying_guests: normalizedAccompanying,
      marriage_certificate_name: marriageCert ? marriageCert.name : null,
      emergency_contact: {
        name: emergencyName.trim(),
        relation: emergencyRelation.trim(),
        phone: emergencyPhone.trim(),
      },
    };

    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    let savedBookingRecord = {
      id: Date.now(),
      propertyId: resolvedPropertyId > 0 ? resolvedPropertyId : null,
      propertyTitle,
      location: propertyLocation,
      checkIn,
      checkOut,
      nightsCount,
      groupType: normalizedGroupType,
      guestsCount: guestsCountParam,
      accompanyingGuests: guestsCountParam > 1 ? familyMembers : [],
      totalAmount: computedTotalAmount,
      paymentMethod: selectedMethodLabel,
      status: "Pending Host Confirmation",
      current_step: 3,
      date: new Date().toLocaleDateString(),
      syncedToDb: false,
    };

    try {
      setProcessingStageText(
        paymentMethod === "wallet"
          ? `Verifying ${walletProvider === "jazzcash" ? "JazzCash" : "Easypaisa"} payment & saving to database...`
          : "Verifying payment & saving booking to database...",
      );

      const response = await fetch(`${API_BASE_URL}/bookings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingApiPayload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const created = data.booking || data;
        savedBookingRecord = {
          ...savedBookingRecord,
          id: created.id || created.booking_id || savedBookingRecord.id,
          status: created.status || savedBookingRecord.status,
          current_step: created.current_step ?? savedBookingRecord.current_step,
          syncedToDb: true,
        };
      } else if (response.status === 401) {
        setIsProcessingPayment(false);
        setProcessingStageText("");
        openAlert(
          "error",
          "Session Expired",
          "Please login again to save your booking in the database.",
        );
        return;
      } else {
        const errData = await response.json().catch(() => ({}));
        if (response.status !== 404 && response.status !== 405) {
          throw new Error(
            errData.detail || "Failed to save booking in database",
          );
        }
      }
    } catch (error) {
      console.error("Booking API error:", error);
      const isNetworkFailure =
        error instanceof TypeError ||
        /fetch|network/i.test(error?.message || "");
      if (!isNetworkFailure) {
        setIsProcessingPayment(false);
        setProcessingStageText("");
        openAlert(
          "error",
          "Booking Failed",
          error.message || "Could not complete booking in database.",
        );
        return;
      }
    }

    const existingBookings = JSON.parse(
      localStorage.getItem("rentiq_bookings") || "[]",
    );
    localStorage.setItem(
      "rentiq_bookings",
      JSON.stringify([savedBookingRecord, ...existingBookings]),
    );

    setIsProcessingPayment(false);
    setProcessingStageText("");
    navigate("/history-tracking", {
      state: { latestBooking: savedBookingRecord },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-coral-500 bg-white border border-gray-200 px-4 py-2 rounded-xl transition cursor-pointer shadow-xs mb-6"
          >
            <ArrowLeft size={16} /> Back to Property Details
          </button>

          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Complete Your{" "}
                <span className="text-coral-500">
                  Secure Verification & Checkout
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1">
                RentIQ requires guest identification & compliance documents to
                ensure safe community living across Pakistan.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-xs text-right shrink-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {propertyTitle}
              </p>
              <p className="text-sm font-black text-coral-600 mt-0.5">
                {pricePerNight > 0
                  ? `Rs. ${computedTotalAmount.toLocaleString()}`
                  : `$${computedTotalAmount.toLocaleString()}`}{" "}
                <span className="text-[11px] font-bold text-gray-500">
                  ({nightsCount} {nightsCount === 1 ? "night" : "nights"})
                </span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-8">
            {/* SECTION 1: Primary Guest Information */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <div className="p-2 bg-coral-500/10 text-coral-600 rounded-xl">
                  <User size={18} />
                </div>
                <h2 className="text-sm font-black text-gray-900">
                  1. Primary Guest Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Full Name (as per CNIC/Passport)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammad Ali Khan"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ali.khan@gmail.com"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Phone Number (WhatsApp preferred)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Permanent Residential Address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House #, Street, City"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Stay Type & Group Compliance Verification (Shown ONLY if guests > 1) */}
            {guestsCountParam > 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-coral-500/10 text-coral-600 rounded-xl">
                      <Users size={18} />
                    </div>
                    <h2 className="text-sm font-black text-gray-900">
                      2. Stay Category & Accompanying Guests
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-gray-500">
                    {requiredAccompanyingCount} Accompanying{" "}
                    {requiredAccompanyingCount === 1 ? "Guest" : "Guests"}
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-700 block">
                    Select Group / Stay Nature
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      "Family",
                      "Married Couple",
                      "Corporate/Business",
                      "Friends",
                    ].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => handleGroupTypeChange(type)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition cursor-pointer text-center ${
                          groupType === type
                            ? "bg-coral-500 text-white border-coral-500 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {groupType === "Married Couple" && (
                  <div className="bg-coral-500/5 border border-coral-500/20 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-coral-700 text-xs font-bold">
                      <FileText size={16} />
                      <span>Marriage Certificate / Nikah Nama Required</span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium">
                      As per local community and property bylaws, couples must
                      provide proof of marriage for joint stays.
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => setMarriageCert(e.target.files[0])}
                      className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-coral-500 file:text-white hover:file:bg-coral-600 cursor-pointer"
                    />
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700">
                      {groupType === "Married Couple"
                        ? "Spouse Details"
                        : "Accompanying Guests Information"}
                    </label>
                    {groupType !== "Married Couple" &&
                      familyMembers.length < requiredAccompanyingCount && (
                        <button
                          type="button"
                          onClick={handleAddMember}
                          className="text-xs font-bold text-coral-600 hover:underline cursor-pointer"
                        >
                          + Add Guest
                        </button>
                      )}
                  </div>

                  {familyMembers.map((member, idx) => {
                    let options = [];
                    if (groupType === "Family") {
                      options = ["Spouse", "Child", "Parent"];
                    } else if (groupType === "Married Couple") {
                      options = ["Wife", "Husband"];
                    } else if (groupType === "Corporate/Business") {
                      options = [
                        "Colleague",
                        "Team Lead",
                        "Manager",
                        "Director",
                      ];
                    }

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-2xl border border-gray-200"
                      >
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="Guest Full Name"
                            value={member.name}
                            onChange={(e) =>
                              handleMemberChange(idx, "name", e.target.value)
                            }
                            className="w-full bg-white border border-gray-200 text-xs rounded-xl p-3 focus:outline-none focus:border-coral-500 shadow-2xs"
                          />
                        </div>

                        <div
                          className="sm:col-span-3 relative"
                          ref={(el) => (dropdownRefs.current[idx] = el)}
                        >
                          {groupType === "Friends" ? (
                            <input
                              type="text"
                              readOnly
                              value="Friend"
                              className="w-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-500 rounded-xl p-3 cursor-not-allowed select-none text-center shadow-2xs"
                            />
                          ) : (
                            <div>
                              <div
                                onClick={() =>
                                  setOpenDropdownIndex(
                                    openDropdownIndex === idx ? null : idx,
                                  )
                                }
                                className="w-full bg-white border border-gray-200 text-xs font-bold text-gray-800 rounded-xl py-3 px-3.5 flex items-center justify-between cursor-pointer shadow-2xs select-none"
                              >
                                <span>{member.relation}</span>
                                <ChevronDown
                                  size={14}
                                  className={`text-gray-400 transition-transform duration-300 ${
                                    openDropdownIndex === idx
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>

                              {openDropdownIndex === idx && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 py-2 px-1">
                                  {options.map((opt) => (
                                    <div
                                      key={opt}
                                      onClick={() => {
                                        handleMemberChange(
                                          idx,
                                          "relation",
                                          opt,
                                        );
                                        setOpenDropdownIndex(null);
                                      }}
                                      className={`flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition ${
                                        member.relation === opt
                                          ? "bg-coral-50 text-coral-600"
                                          : "text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      <span>{opt}</span>
                                      {member.relation === opt && (
                                        <Check
                                          size={14}
                                          className="text-coral-500"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            placeholder="CNIC or Passport No."
                            value={member.cnicOrPassport}
                            onChange={(e) =>
                              handleMemberChange(
                                idx,
                                "cnicOrPassport",
                                e.target.value,
                              )
                            }
                            className="w-full bg-white border border-gray-200 text-xs rounded-xl p-3 focus:outline-none focus:border-coral-500 shadow-2xs"
                          />
                        </div>

                        <div className="sm:col-span-1 text-center">
                          {groupType !== "Married Couple" &&
                            familyMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(idx)}
                                className="text-rose-500 hover:text-rose-700 font-bold text-xs cursor-pointer"
                              >
                                ✕
                              </button>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: Emergency Contact Information */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <div className="p-2 bg-coral-500/10 text-coral-600 rounded-xl">
                  <Phone size={18} />
                </div>
                <h2 className="text-sm font-black text-gray-900">
                  {guestsCountParam > 1
                    ? "3. Emergency Contact Person"
                    : "2. Emergency Contact Person"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Relative/Friend Name"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Relation
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="e.g. Brother, Father"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+92 300 9876543"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Secure Payment Gateway */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <div className="p-2 bg-coral-500/10 text-coral-600 rounded-xl">
                  <CreditCard size={18} />
                </div>
                <h2 className="text-sm font-black text-gray-900">
                  {guestsCountParam > 1
                    ? "4. Secure Payment Method"
                    : "3. Secure Payment Method"}
                </h2>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 p-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                    paymentMethod === "card"
                      ? "bg-coral-500 text-white border-coral-500"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  <CreditCard size={16} /> Credit / Debit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`flex-1 p-3 rounded-2xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                    paymentMethod === "wallet"
                      ? "bg-coral-500 text-white border-coral-500"
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
                >
                  <Building size={16} /> Bank Transfer / Wallet
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-4">
                  <div className="space-y-2">
                    <p className="font-bold text-gray-900">
                      Select Local Mobile Wallet or Bank Transfer:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setWalletProvider("jazzcash")}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                          walletProvider === "jazzcash"
                            ? "bg-coral-500 text-white border-coral-500 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <Smartphone size={14} /> JazzCash Wallet
                      </button>

                      <button
                        type="button"
                        onClick={() => setWalletProvider("easypaisa")}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                          walletProvider === "easypaisa"
                            ? "bg-coral-500 text-white border-coral-500 shadow-xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <Smartphone size={14} /> Easypaisa Wallet
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">
                      {walletProvider === "jazzcash"
                        ? "JazzCash Mobile Number"
                        : "Easypaisa Mobile Number"}
                    </label>
                    <input
                      type="tel"
                      value={walletMobile}
                      onChange={(e) => setWalletMobile(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full bg-white border border-gray-200 text-xs font-medium rounded-xl p-3 focus:outline-none focus:border-coral-500"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-200/80 space-y-1">
                    <p className="font-bold text-gray-900">
                      Direct Bank Transfer Instructions:
                    </p>
                    <p>Bank Name: Meezan Bank / Alfalah</p>
                    <p>Account Title: RentIQ Pakistan (Pvt) Ltd</p>
                    <p>Account Number: PK08MEZN0001234567890123</p>
                    <p className="text-[11px] text-coral-600 font-semibold pt-1">
                      Please upload or share transfer receipt with our support
                      team after reservation.
                    </p>
                  </div>
                </div>
              )}

              {isProcessingPayment && (
                <div className="bg-coral-50/70 border border-coral-200 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-coral-700">
                  <Loader2 size={16} className="animate-spin shrink-0" />
                  <span>{processingStageText}</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                    Dates & Guests
                  </p>
                  <p className="text-xs font-extrabold text-gray-900">
                    {checkIn} to {checkOut} ({guestsCountParam} Guest
                    {guestsCountParam > 1 ? "s" : ""})
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="bg-coral-500 hover:bg-coral-600 disabled:opacity-60 text-white text-xs font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-coral-500/25 transition cursor-pointer uppercase tracking-wider inline-flex items-center gap-2"
                >
                  {isProcessingPayment && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {isProcessingPayment
                    ? "Processing..."
                    : "Confirm & Pay Securely"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {alertModal.open && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setAlertModal((prev) => ({ ...prev, open: false }))
                  }
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center -mt-4 ${
                  alertModal.type === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : alertModal.type === "error"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-amber-50 text-amber-500"
                }`}
              >
                {alertModal.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-gray-900">
                  {alertModal.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {alertModal.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setAlertModal((prev) => ({ ...prev, open: false }))
                }
                className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
