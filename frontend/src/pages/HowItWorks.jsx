import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Home as HomeIcon,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("guests");
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-coral-500/20 text-coral-400 text-xs font-extrabold px-3.5 py-1 rounded-full border border-coral-500/30 uppercase tracking-wider">
              <Sparkles size={14} /> AI-powered decision support
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              How <span className="text-coral-500">RentIQ</span> Works
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
              RentIQ is a rental platform where guests browse and book, and
              hosts list and manage properties. Three AI features support
              decisions on both sides with suggestions and predictions.
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => setActiveTab("guests")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "guests"
                    ? "bg-coral-500 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Users size={16} /> For Guests & Renters
              </button>
              <button
                onClick={() => setActiveTab("hosts")}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === "hosts"
                    ? "bg-coral-500 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <HomeIcon size={16} /> For Property Hosts
              </button>
            </div>
          </div>
        </div>

        {/* Core Steps Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeTab === "guests"
                  ? "3 Simple Steps for Guests"
                  : "3 Easy Steps for Hosts"}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeTab === "guests" ? (
                <>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <span className="text-3xl font-black text-coral-500/30 block mb-2">
                      01
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Search & Filter Preferences
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Select your destination city, check-in dates, budget, and
                      required amenities.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <span className="text-3xl font-black text-coral-500/30 block mb-2">
                      02
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      AI Match & Verified Listings
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Review smart match scores, verified owner badges, and
                      zero-commission rates.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <span className="text-3xl font-black text-coral-500/30 block mb-2">
                      03
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Connect & Book Securely
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Directly chat with verified hosts and finalize your stay
                      safely.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <span className="text-3xl font-black text-coral-500/30 block mb-2">
                      01
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      List Your Property
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Add property details, photos, and location in under 5
                      minutes.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <span className="text-3xl font-black text-coral-500/30 block mb-2">
                      02
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Apply Smart AI Pricing
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Leverage real-time market suggestions to optimize your
                      monthly earnings.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <span className="text-3xl font-black text-coral-500/30 block mb-2">
                      03
                    </span>
                    <h3 className="text-base font-bold text-gray-900 mb-2">
                      Welcome Verified Guests
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Receive booking requests and enjoy hassle-free direct
                      payouts.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Pillars Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="bg-coral-50 text-coral-600 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-coral-200">
              Intelligent Assistance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mt-2">
              Three AI Pillars Powering RentIQ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl font-black text-coral-500/30">
                    01
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                    Guest Intelligence
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Personalized Property Matching
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Guests save preferences for city, budget, and property type.
                  RentIQ compares them and ranks stays by match percentage.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-coral-500" />{" "}
                  Historical search patterns
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-coral-500" /> Location
                  accessibility scores
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl font-black text-coral-500/30">
                    02
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                    Host Optimization
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Rental Price Recommendation
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  Hosts see suggested pricing based on real-time market data.
                  The host chooses whether to accept it.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-coral-500" /> Regional
                  price data analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-coral-500" /> Peak
                  holiday seasonality
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-3xl p-7 border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-3xl font-black text-coral-500/30">
                    03
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-3 py-1 rounded-full">
                    Predictive Insights
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Booking-Demand Forecasting
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-6">
                  A 7 or 30 day forecast shows when booking demand is expected
                  to rise or fall so hosts can plan ahead.
                </p>
              </div>
              <ul className="space-y-2 pt-4 border-t border-gray-100 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-coral-500" /> 30-day
                  occupancy projections
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-coral-500" />{" "}
                  High-demand weekend alerts
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full p-5 text-left flex justify-between items-center cursor-pointer"
              >
                <span className="text-[14px] font-bold text-gray-900">
                  Is RentIQ really zero-commission?
                </span>
                {openFaq === 0 ? (
                  <ChevronUp size={20} className="text-coral-500" />
                ) : (
                  <ChevronDown size={20} className="text-coral-500" />
                )}
              </button>
              {openFaq === 0 && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-[12px] text-gray-600 font-medium border-t border-gray-100 pt-3">
                    Yes! RentIQ eliminates traditional real estate agent fees.
                    Guests and hosts interact directly without paying hidden
                    broker cuts.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full p-5 text-left flex justify-between items-center cursor-pointer"
              >
                <span className="text-[14px] font-bold text-gray-900">
                  Does the AI automatically change my property rates?
                </span>
                {openFaq === 1 ? (
                  <ChevronUp size={20} className="text-coral-500" />
                ) : (
                  <ChevronDown size={20} className="text-coral-500" />
                )}
              </button>
              {openFaq === 1 && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-[12px] text-gray-600 font-medium border-t border-gray-100 pt-3">
                    No. RentIQ's AI provides data-backed suggestions and
                    forecasts to aid decision-making. All pricing actions remain
                    100% under host control.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full p-5 text-left flex justify-between items-center cursor-pointer"
              >
                <span className="text-[14px] font-bold text-gray-900">
                  How are property owners verified?
                </span>
                {openFaq === 2 ? (
                  <ChevronUp size={20} className="text-coral-500" />
                ) : (
                  <ChevronDown size={20} className="text-coral-500" />
                )}
              </button>
              {openFaq === 2 && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-[12px] text-gray-600 font-medium border-t border-gray-100 pt-3">
                    Owners undergo identity and property document verification
                    before receiving the 'Verified Owner' badge on their
                    listings.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-coral-500 text-white text-xs font-bold px-7 py-3.5 rounded-xl shadow-md transition"
            >
              <span>View All FAQs</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
