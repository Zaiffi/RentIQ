import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  Lock,
  CheckCircle2,
  Bed,
  Users,
  Wifi,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import lahoreImg from "../assets/images/destination/lahore.jpg";
import islamabadImg from "../assets/images/destination/islamabad.jpg";
import karachiImg from "../assets/images/destination/karachi.jpg";
import murreeImg from "../assets/images/destination/murree.jpg";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBeds, setSelectedBeds] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);

  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isBedsOpen, setIsBedsOpen] = useState(false);

  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const cityRef = useRef(null);
  const bedsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (checkInRef.current && !checkInRef.current.contains(event.target)) {
        setShowCheckInCalendar(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(event.target)) {
        setShowCheckOutCalendar(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setIsCityOpen(false);
      }
      if (bedsRef.current && !bedsRef.current.contains(event.target)) {
        setIsBedsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) {
            videoRef.current.play().catch((error) => {
              console.log("Auto-play prevented:", error);
            });
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  const featuredProperties = [
    {
      id: 1,
      title: "Modern Luxury Apartment with City View",
      location: "Gulberg III, Lahore",
      price: "Rs. 45,000 / month",
      rating: 4.9,
      beds: "2 Beds",
      guests: "4 Guests",
      wifi: "Free High-Speed Wi-Fi",
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600",
      aiBadge: "12% Cheaper (Verified)",
    },
    {
      id: 2,
      title: "Cozy Studio Apartment near Metro",
      location: "Blue Area, Islamabad",
      price: "Rs. 35,000 / month",
      rating: 4.8,
      beds: "1 Bed",
      guests: "2 Guests",
      wifi: "High-Speed Wi-Fi",
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600",
      aiBadge: "High Demand Area",
    },
    {
      id: 3,
      title: "Executive Furnished Villa",
      location: "DHA Phase 5, Karachi",
      price: "Rs. 120,000 / month",
      rating: 5.0,
      beds: "4 Beds",
      guests: "8 Guests",
      wifi: "Fiber Wi-Fi Available",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
      aiBadge: "Smart Price Match",
    },
    {
      id: 4,
      title: "Spacious Family Penthouse",
      location: "F-7 Markaz, Islamabad",
      price: "Rs. 95,000 / month",
      rating: 4.7,
      beds: "3 Beds",
      guests: "6 Guests",
      wifi: "Free Wi-Fi",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
      aiBadge: "Zero Commission",
    },
    {
      id: 5,
      title: "Modern 2-Bed Portion",
      location: "DHA Phase 6, Lahore",
      price: "Rs. 55,000 / month",
      rating: 4.9,
      beds: "2 Beds",
      guests: "4 Guests",
      wifi: "High-Speed Wi-Fi",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600",
      aiBadge: "Verified",
    },
  ];

  const destinations = [
    { city: "Lahore", properties: "1,240+ Properties", image: lahoreImg },
    { city: "Islamabad", properties: "850+ Properties", image: islamabadImg },
    { city: "Karachi", properties: "1,500+ Properties", image: karachiImg },
    { city: "Murree", properties: "420+ Properties", image: murreeImg },
  ];

  const getExploreSearchUrl = () => {
    const params = new URLSearchParams();
    if (selectedCity) params.append("city", selectedCity);
    if (selectedBeds) params.append("beds", selectedBeds);
    if (checkInDate) params.append("checkIn", checkInDate.toISOString());
    if (checkOutDate) params.append("checkOut", checkOutDate.toISOString());
    return `/explore?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Custom Image Banner Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
          <div
            className="relative rounded-3xl overflow-visible bg-cover bg-center min-h-[450px] flex flex-col justify-between p-6 sm:p-12 text-white shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.55)), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1600')`,
            }}
          >
            <div className="text-center pt-[75px]">
              <h6 className="text-1xl sm:text-3xl md:text-4xl font-extrabold tracking-wide drop-shadow-md">
                Pakistan's first{" "}
                <span className="text-coral-500">Zero-Commission</span>
                <br /> Property Platform
              </h6>
            </div>

            {/* Search Widget Section */}
            <div className="max-w-4xl mx-auto w-full mt-auto mb-6 flex flex-col items-center relative z-40">
              <div className="bg-white rounded-2xl md:rounded-full p-1.5 shadow-2xl flex flex-col md:flex-row items-center w-full border border-gray-100 text-gray-800 gap-1 relative">
                {/* City Custom Styled Dropdown */}
                <div
                  className="px-5 py-2 border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-auto relative cursor-pointer select-none"
                  ref={cityRef}
                  onClick={() => {
                    setIsCityOpen(!isCityOpen);
                    setIsBedsOpen(false);
                    setShowCheckInCalendar(false);
                    setShowCheckOutCalendar(false);
                  }}
                >
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block leading-tight">
                    City
                  </label>
                  <div className="flex items-center justify-between gap-3 mt-0.5">
                    <span
                      className={`text-[12px] ${
                        selectedCity
                          ? "font-black text-gray-950"
                          : "font-medium text-gray-400"
                      }`}
                    >
                      {selectedCity || "Select city"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition transform ${
                        isCityOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isCityOpen && (
                    <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 py-2">
                      {["Lahore", "Islamabad", "Karachi", "Rawalpindi"].map(
                        (city) => (
                          <div
                            key={city}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCity(city);
                              setIsCityOpen(false);
                            }}
                            className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition ${
                              selectedCity === city
                                ? "bg-coral-500/10 text-coral-600"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {city}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                {/* Beds Custom Styled Dropdown */}
                <div
                  className="px-5 py-2 border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-auto relative cursor-pointer select-none"
                  ref={bedsRef}
                  onClick={() => {
                    setIsBedsOpen(!isBedsOpen);
                    setIsCityOpen(false);
                    setShowCheckInCalendar(false);
                    setShowCheckOutCalendar(false);
                  }}
                >
                  <label className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block leading-tight">
                    Beds
                  </label>
                  <div className="flex items-center justify-between gap-3 mt-0.5">
                    <span
                      className={`text-[12px] ${
                        selectedBeds
                          ? "font-black text-gray-950"
                          : "font-medium text-gray-400"
                      }`}
                    >
                      {selectedBeds || "Select beds"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition transform ${
                        isBedsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isBedsOpen && (
                    <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 py-2">
                      {["1 Bed", "2 Beds", "3 Beds", "4+ Beds"].map((bed) => (
                        <div
                          key={bed}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBeds(bed);
                            setIsBedsOpen(false);
                          }}
                          className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition ${
                            selectedBeds === bed
                              ? "bg-coral-500/10 text-coral-600"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {bed}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Check-In Custom Calendar Picker */}
                <div
                  className="px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 flex-1 w-full flex flex-col justify-center relative cursor-pointer hover:bg-gray-50 rounded-xl transition"
                  ref={checkInRef}
                >
                  <div
                    onClick={() => {
                      setShowCheckInCalendar(!showCheckInCalendar);
                      setShowCheckOutCalendar(false);
                      setIsCityOpen(false);
                      setIsBedsOpen(false);
                    }}
                  >
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-wider leading-tight">
                      Check-In
                    </label>
                    <span
                      className={`text-[12px] py-0.5 block ${
                        checkInDate
                          ? "font-black text-gray-950"
                          : "font-medium text-gray-400"
                      }`}
                    >
                      {checkInDate
                        ? checkInDate.toLocaleDateString()
                        : "Select date"}
                    </span>
                  </div>

                  {showCheckInCalendar && (
                    <div className="absolute top-full left-0 mt-3 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2.5 text-gray-800">
                      <Calendar
                        onChange={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) {
                            alert(
                              "You cannot select a past date! Please choose an upcoming date.",
                            );
                            return;
                          }
                          setCheckInDate(date);
                          setShowCheckInCalendar(false);
                        }}
                        value={checkInDate || new Date()}
                        className="custom-react-calendar"
                      />
                    </div>
                  )}
                </div>

                {/* Check-Out Custom Calendar Picker */}
                <div
                  className="px-4 py-2 flex-1 w-full flex flex-col justify-center relative cursor-pointer hover:bg-gray-50 rounded-xl transition"
                  ref={checkOutRef}
                >
                  <div
                    onClick={() => {
                      setShowCheckOutCalendar(!showCheckOutCalendar);
                      setShowCheckInCalendar(false);
                      setIsCityOpen(false);
                      setIsBedsOpen(false);
                    }}
                  >
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-wider leading-tight">
                      Check-Out
                    </label>
                    <span
                      className={`text-[12px] py-0.5 block ${
                        checkOutDate
                          ? "font-black text-gray-950"
                          : "font-medium text-gray-400"
                      }`}
                    >
                      {checkOutDate
                        ? checkOutDate.toLocaleDateString()
                        : "Select date"}
                    </span>
                  </div>

                  {showCheckOutCalendar && (
                    <div className="absolute top-full right-0 mt-3 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl p-2.5 text-gray-800">
                      <Calendar
                        onChange={(date) => {
                          const minCheckout = checkInDate || new Date();
                          if (date < minCheckout) {
                            alert(
                              "Check-out date cannot be earlier than check-in or past dates!",
                            );
                            return;
                          }
                          setCheckOutDate(date);
                          setShowCheckOutCalendar(false);
                        }}
                        value={checkOutDate || checkInDate || new Date()}
                        className="custom-react-calendar"
                      />
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="px-1 w-full md:w-auto flex justify-end">
                  <Link
                    to={getExploreSearchUrl()}
                    className="bg-coral-500 hover:bg-coral-600 text-white p-3 rounded-xl md:rounded-full transition shadow-md flex items-center justify-center w-full md:w-auto"
                  >
                    <Search size={16} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-gray-200 border-t border-white/20 pt-4 mt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-coral-400" /> Verified
                Owners
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-yellow-400" /> Pricing
                Insights
              </div>
              <div className="flex items-center gap-1.5">
                <Lock size={16} className="text-coral-400" /> SafePay Protection
              </div>
            </div>
          </div>
        </div>

        {/* Popular Destinations Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Popular Destinations
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Explore rentals in Pakistan's top cities
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((dest, index) => (
              <Link
                key={index}
                to={`/explore?city=${dest.city}`}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition aspect-[4/3] flex flex-col justify-end p-4 text-white"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="object-cover w-full h-full group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                </div>

                <div className="relative z-10">
                  <h3 className="font-bold text-base sm:text-lg group-hover:text-coral-400 transition">
                    {dest.city}
                  </h3>
                  <p className="text-[11px] text-gray-200 font-medium">
                    {dest.properties}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Properties Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Properties
            </h2>
            <Link
              to="/explore"
              className="group inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-[12px] font-semibold px-4 py-2 rounded-xl shadow-md transition ml-1"
            >
              <span>View All</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition border border-gray-100 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-coral-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow">
                      {property.aiBadge}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 truncate">
                        <MapPin size={12} /> {property.location}
                      </span>
                      <span className="text-[11px] font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star size={10} fill="currentColor" /> {property.rating}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm truncate mb-1.5">
                      {property.title}
                    </h3>

                    <ul className="list-disc list-inside text-[11px] text-gray-500 font-medium space-y-1 mb-2">
                      <li className="flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
                        <Bed size={12} className="text-gray-400 shrink-0" />
                        <span>{property.beds}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
                        <Users size={12} className="text-gray-400 shrink-0" />
                        <span>{property.guests}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
                        <Wifi size={12} className="text-gray-400 shrink-0" />
                        <span>{property.wifi}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="p-3.5 pt-0 flex justify-between items-center">
                  <span className="text-coral-600 font-extrabold text-xs">
                    {property.price}
                  </span>
                  <Link
                    to={`/property/${property.id}`}
                    className="bg-gray-900 hover:bg-coral-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotional Video Banner Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-coral-900 shadow-xl p-6 sm:p-8 lg:p-10 text-white">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-coral-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
              <div className="lg:col-span-7 flex flex-col items-start space-y-3">
                <span className="inline-flex items-center gap-1.5 bg-coral-500/20 text-coral-400 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-coral-500/30">
                  <Sparkles size={12} /> Next-Gen Rental Experience
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Rent Smarter, Live Better with{" "}
                  <span className="text-coral-500">RentIQ</span>
                </h2>

                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                  Say goodbye to heavy middlemen commissions. Explore verified
                  properties, get AI-powered pricing insights, and secure your
                  dream rental in Pakistan with absolute peace of mind.
                </p>

                <div className="pt-1">
                  <Link
                    to="/explore"
                    className="group inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition"
                  >
                    <span>Explore Properties</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1.5"
                    />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center items-center">
                <div className="relative w-[220px] sm:w-[240px] h-[440px] bg-gray-950 rounded-[36px] p-2.5 shadow-2xl border-4 border-gray-700/60 ring-6 ring-black/40">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-black rounded-full z-20"></div>

                  <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src="/videos/rentiq-demo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-600 rounded-full z-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            height: 32px;
            margin-bottom: 4px;
          }
          .custom-react-calendar .react-calendar__navigation button {
            color: #111827;
            font-weight: 800;
            font-size: 11px;
            background: none;
            border-radius: 6px;
            min-width: 24px;
          }
          .custom-react-calendar .react-calendar__navigation button:hover:not(:disabled) {
            background-color: #F3F4F6;
            color: #FF5A5F;
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
          .custom-react-calendar .react-calendar__tile:hover:not(:disabled) {
            background-color: #F3F4F6 !important;
            color: #FF5A5F !important;
          }
          .custom-react-calendar .react-calendar__tile--active {
            background: #FF5A5F !important;
            color: white !important;
          }
        `}</style>

        <Footer />
      </div>
    </div>
  );
}
