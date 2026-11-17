import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Calendar,
  User,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Home as HomeIcon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const blogPosts = [
    {
      id: 1,
      title:
        "Islamabad & Lahore Rental Market Trends 2026: What Tenants & Hosts Need to Know",
      category: "market",
      categoryName: "Market Trends",
      author: "RentIQ Market Intelligence",
      date: "October 24, 2026",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      excerpt:
        "Explore how AI-driven pricing and zero-commission platforms are transforming property rentals across major urban hubs in Pakistan.",
    },
    {
      id: 2,
      title:
        "Why Zero-Commission Renting is Saving Pakistani Families Thousands",
      category: "tenants",
      categoryName: "Tenant Guides",
      author: "Ayesha Malik",
      date: "October 20, 2026",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      excerpt:
        "Say goodbye to hefty broker cuts. Learn how direct tenant-to-host connections ensure transparency and absolute peace of mind.",
    },
    {
      id: 3,
      title:
        "Essential Verification Guide for Couples & Families Booking Rentals",
      category: "safety",
      categoryName: "Legal & Safety",
      author: "Legal Compliance Team",
      date: "October 18, 2026",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
      excerpt:
        "Everything you need to know about CNIC verifications, family policies, and marriage certificate requirements for secure stays.",
    },
    {
      id: 4,
      title:
        "How Property Hosts Can Maximize Earnings Using Booking Demand Forecasting",
      category: "hosts",
      categoryName: "Host Tips",
      author: "Zainab Tariq",
      date: "October 15, 2026",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      excerpt:
        "Leverage 7-day and 30-day predictive analytics to anticipate peak holiday travel windows in Murree and Islamabad.",
    },
    {
      id: 5,
      title:
        "Top 5 Secure Neighborhoods in Karachi for Expatriates and Families",
      category: "market",
      categoryName: "Market Trends",
      author: "Daniyal Khan",
      date: "October 10, 2026",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
      excerpt:
        "A comprehensive breakdown of gated communities, security infrastructure, and average rental yields in Clifton and DHA.",
    },
    {
      id: 6,
      title:
        "Preparing Your Vacation Home in Murree for the Peak Winter Season",
      category: "hosts",
      categoryName: "Host Tips",
      author: "Hassan Raza",
      date: "October 05, 2026",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      excerpt:
        "Actionable checklist for property owners to upgrade heating amenities, listing descriptions, and instant guest communication.",
    },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "all" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Blog Hero Section */}
        <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-coral-500/20 text-coral-400 text-xs font-extrabold px-3.5 py-1 rounded-full border border-coral-500/30 uppercase tracking-wider">
              <BookOpen size={14} /> RentIQ Insights & News
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Real Estate & Rental <span className="text-coral-500">Blog</span>
            </h1>

            <p className="text-gray-300 text-xs sm:text-sm font-medium max-w-xl mx-auto">
              Expert advice, market analysis, tenant guides, and hosting tips
              tailored for the Pakistani property landscape.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto pt-2">
              <div className="absolute inset-y-0 left-4 top-2 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search articles (e.g. market trends, zero-commission, Islamabad)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-gray-900 text-xs sm:text-sm font-medium pl-12 pr-4 py-4 rounded-2xl shadow-xl focus:outline-none border border-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeCategory === "all"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => setActiveCategory("market")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "market"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <TrendingUp size={14} /> Market Trends
            </button>
            <button
              onClick={() => setActiveCategory("tenants")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "tenants"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users size={14} /> Tenant Guides
            </button>
            <button
              onClick={() => setActiveCategory("hosts")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "hosts"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <HomeIcon size={14} /> Host Tips
            </button>
            <button
              onClick={() => setActiveCategory("safety")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "safety"
                  ? "bg-coral-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ShieldCheck size={14} /> Legal & Safety
            </button>
          </div>
        </div>

        {/* Blog Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-xl mx-auto">
              <p className="text-sm font-bold text-gray-700 mb-1">
                No articles found
              </p>
              <p className="text-xs text-gray-500">
                Try searching with a different keyword or category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md">
                        {post.categoryName}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-coral-500" />{" "}
                          {post.date}
                        </span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 group-hover:text-coral-600 transition leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-gray-600 font-medium leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Author & Read More Footer */}
                  <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-4 pt-4">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                      <User size={13} className="text-gray-400" /> {post.author}
                    </span>
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-xs font-bold text-coral-500 hover:text-coral-600 transition flex items-center gap-1"
                    >
                      Read Article <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
