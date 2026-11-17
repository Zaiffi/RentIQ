import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Users,
  Home as HomeIcon,
  ShieldCheck,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      category: "guests",
      categoryName: "For Guests & Tenants",
      q: "How does RentIQ's zero-commission model work?",
      a: "Unlike traditional real estate agents who charge hefty upfront or recurring broker commissions, RentIQ connects guests and tenants directly with verified property owners. There are zero middleman fees, ensuring transparent pricing for your stays.",
    },
    {
      category: "guests",
      categoryName: "For Guests & Tenants",
      q: "How do I search for verified properties?",
      a: "You can use our advanced search filters on the Explore page to sort properties by city (Lahore, Islamabad, Karachi, Murree), budget, property type (Apartments, Villas, Portions), and specific amenities like Wi-Fi or parking.",
    },
    {
      category: "guests",
      categoryName: "For Guests & Tenants",
      q: "What is personalized property matching?",
      a: "RentIQ's AI feature compares your saved preferences and search behavior with property characteristics, ranking available stays by match percentage and providing clear explanations for why a property fits you.",
    },
    {
      category: "guests",
      categoryName: "For Guests & Tenants",
      q: "How do I contact a property host before booking?",
      a: "Once you find a listing that matches your requirement, you can securely message the verified host directly through our platform to clarify details or schedule viewings.",
    },
    {
      category: "safety",
      categoryName: "Couples, Families & Verification",
      q: "Are RentIQ properties family and couple friendly?",
      a: "Yes! RentIQ features a wide range of verified apartments, family portions, and vacation homes in major cities like Islamabad, Lahore, and Murree that warmly welcome families and married couples.",
    },
    {
      category: "safety",
      categoryName: "Couples, Families & Verification",
      q: "What documents are required for couples checking in?",
      a: "For security and legal compliance across Pakistani real estate guidelines, married couples may be required to present valid Computerized National Identity Cards (CNICs) reflecting matching marital status or a valid Marriage Certificate / Nikah Nama upon check-in, depending on the specific host's property policy.",
    },
    {
      category: "safety",
      categoryName: "Couples, Families & Verification",
      q: "Why are verification documents checked?",
      a: "RentIQ prioritizes the safety, privacy, and security of both guests and hosts. Standard ID and verification checks protect all parties against fraud and ensure a secure, peaceful environment during your stay.",
    },
    {
      category: "hosts",
      categoryName: "For Property Hosts",
      q: "Is there any fee to list my property on RentIQ?",
      a: "No! Listing your property on RentIQ is 100% free with zero upfront charges. You only manage your bookings and enjoy direct payouts.",
    },
    {
      category: "hosts",
      categoryName: "For Property Hosts",
      q: "How does the AI Rental Price Recommendation work?",
      a: "Our AI analyzes regional price data, seasonality, historical trends, and market demand to suggest an optimal nightly or monthly rate. However, the host always has 100% control — AI only suggests, and you decide.",
    },
    {
      category: "hosts",
      categoryName: "For Property Hosts",
      q: "What is booking-demand forecasting?",
      a: "A 7 or 30 day forward-looking forecast predicts when travel demand in your area is expected to spike or drop, allowing you to adjust availability and capture higher rental yields.",
    },
    {
      category: "safety",
      categoryName: "Safety & Verification",
      q: "How are property owners and listings verified?",
      a: "Hosts must complete identity verification and submit valid property ownership documents before their listing receives the official 'Verified Owner' badge.",
    },
    {
      category: "payments",
      categoryName: "Payments & Payouts",
      q: "What payment methods are supported?",
      a: "We support secure direct bank transfers, credit/debit cards, and approved digital wallet transactions depending on the rental agreement type.",
    },
  ];

  const filteredFaqs = faqData.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero & Search Header */}
        <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-coral-500/20 text-coral-400 text-xs font-extrabold px-3.5 py-1 rounded-full border border-coral-500/30 uppercase tracking-wider">
              <HelpCircle size={14} /> Comprehensive Support
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Frequently Asked <span className="text-coral-500">Questions</span>
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm font-medium max-w-xl mx-auto">
              Everything you need to know about renting, hosting, couple
              policies, AI tools, and zero-commission deals on RentIQ.
            </p>

          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeCategory === "all"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setActiveCategory("guests")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "guests"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users size={14} /> For Guests
            </button>
            <button
              onClick={() => setActiveCategory("hosts")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "hosts"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <HomeIcon size={14} /> For Hosts
            </button>
            <button
              onClick={() => setActiveCategory("safety")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "safety"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ShieldCheck size={14} /> Couples & Safety
            </button>
            <button
              onClick={() => setActiveCategory("payments")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "payments"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <CreditCard size={14} /> Payments
            </button>
          </div>
        </div>

        {/* Accordion FAQ List Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <p className="text-sm font-bold text-gray-700 mb-1">
                No matching questions found
              </p>
              <p className="text-xs text-gray-500">
                Try searching with a different keyword or browse all topics.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 focus:outline-none cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-extrabold text-coral-600 bg-coral-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                          {faq.categoryName}
                        </span>
                        <h4 className="text-[14px] font-bold text-gray-900 leading-snug">
                          {faq.q}
                        </h4>
                      </div>
                      <span className="text-coral-500 shrink-0">
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 sm:px-6 pb-6 pt-0">
                        <p className="text-[12px] text-gray-600 font-medium leading-relaxed border-t border-gray-100 pt-4">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Support Banner */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-coral-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-2 text-center md:text-left max-w-lg">
              <h3 className="text-xl sm:text-2xl font-black">
                Still have questions or need assistance?
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm font-medium">
                Our support team and AI assistants are available 24/7 across
                Lahore, Islamabad, and Karachi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-lg transition text-center flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} /> Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
