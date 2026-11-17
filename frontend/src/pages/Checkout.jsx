import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Users,
  FileText,
  CreditCard,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Phone,
  MapPin,
  Building,
  ChevronDown,
  Check,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Property & Booking details passed from PropertyDetail page
  const queryParams = new URLSearchParams(location.search);
  const checkIn = queryParams.get("checkIn") || "Not selected";
  const checkOut = queryParams.get("checkOut") || "Not selected";
  const guestsCountParam = parseInt(queryParams.get("guests") || "1", 10);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Group / Stay Type (Family, Married Couple, Corporate/Business, Friends)
  const [groupType, setGroupType] = useState("Family");

  // Dynamic Members State
  const [familyMembers, setFamilyMembers] = useState([
    { name: "", relation: "Spouse", cnicOrPassport: "" },
  ]);

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

  const handleGroupTypeChange = (type) => {
    setGroupType(type);
    if (type === "Married Couple") {
      setFamilyMembers([{ name: "", relation: "Wife", cnicOrPassport: "" }]);
    } else if (type === "Friends") {
      setFamilyMembers([{ name: "", relation: "Friend", cnicOrPassport: "" }]);
    } else if (type === "Corporate/Business") {
      setFamilyMembers([
        { name: "", relation: "Colleague", cnicOrPassport: "" },
      ]);
    } else {
      setFamilyMembers([{ name: "", relation: "Spouse", cnicOrPassport: "" }]);
    }
  };

  const handleAddMember = () => {
    let defaultRel = "Child";
    if (groupType === "Married Couple") defaultRel = "Wife";
    if (groupType === "Friends") defaultRel = "Friend";
    if (groupType === "Corporate/Business") defaultRel = "Colleague";

    setFamilyMembers([
      ...familyMembers,
      { name: "", relation: defaultRel, cnicOrPassport: "" },
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

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert("Please fill out all primary guest details!");
      return;
    }

    const newBooking = {
      id: Date.now(),
      propertyTitle: "Luxury Modern Villa with Skyline View",
      location: "DHA Phase 6, Lahore, Pakistan",
      checkIn,
      checkOut,
      groupType: guestsCountParam > 1 ? groupType : "Solo Stay",
      guestsCount: guestsCountParam,
      totalAmount: 415,
      paymentMethod,
      status: "Confirmed & Paid",
      date: new Date().toLocaleDateString(),
    };

    const existingBookings = JSON.parse(
      localStorage.getItem("rentiq_bookings") || "[]",
    );
    localStorage.setItem(
      "rentiq_bookings",
      JSON.stringify([newBooking, ...existingBookings]),
    );

    alert("Payment successful! Your booking has been secured and verified.");
    navigate("/explore");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-coral-500 bg-white border border-gray-200 px-4 py-2 rounded-xl transition cursor-pointer shadow-xs mb-6"
          >
            <ArrowLeft size={16} /> Back to Property Details
          </button>

          <div className="mb-8">
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
                <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-coral-500/10 text-coral-600 rounded-xl">
                    <Users size={18} />
                  </div>
                  <h2 className="text-sm font-black text-gray-900">
                    2. Stay Category & Accompanying Guests
                  </h2>
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

                {/* Conditional Rendering: If Married Couple -> Marriage Certificate upload */}
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

                {/* Accompanying Members Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-700">
                      {groupType === "Married Couple"
                        ? "Spouse Details"
                        : "Accompanying Guests Information"}
                    </label>
                    {groupType !== "Married Couple" && (
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
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-2">
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
              )}

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
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
                  className="bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-coral-500/25 transition cursor-pointer uppercase tracking-wider"
                >
                  Confirm & Pay Securely
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
