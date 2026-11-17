import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function BlogDetail() {
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock database of blogs
  const blogPosts = {
    1: {
      title:
        "Islamabad & Lahore Rental Market Trends 2026: What Tenants & Hosts Need to Know",
      categoryName: "Market Trends",
      author: "RentIQ Market Intelligence",
      date: "October 24, 2026",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      content: [
        {
          type: "paragraph",
          text: "The Pakistani real estate and rental market has experienced a massive shift over the past year. With urbanization accelerating in major hubs like Islamabad, Lahore, Karachi, and Murree, traditional brokerage systems are rapidly being replaced by transparent, technology-driven ecosystems.",
        },
        {
          type: "heading",
          text: "1. The Rise of Zero-Commission Platforms",
        },
        {
          type: "paragraph",
          text: "Historically, tenants and property owners in Pakistan lost between 5% to 10% of their annual rental value to middlemen and traditional brokers. Platforms like RentIQ have pioneered zero-commission direct connections, allowing parties to communicate securely without hidden deductions.",
        },
        {
          type: "heading",
          text: "2. AI-Driven Pricing and Demand Forecasting",
        },
        {
          type: "paragraph",
          text: "Pricing a property no longer relies on guesswork or outdated local agent advice. Property hosts now utilize machine learning algorithms that analyze historical transaction data, seasonal spikes (such as summer tourism in Murree or academic intakes in Lahore), and regional demand forecasts to optimize rental yields in real-time.",
        },
        {
          type: "heading",
          text: "3. What to Expect in Late 2026 and Beyond",
        },
        {
          type: "paragraph",
          text: "As digital verification standards improve—including CNIC cross-checks and automated marriage certificate validation for family portions—trust in online rental agreements is at an all-time high. Both tenants and hosts can look forward to a faster, safer, and completely streamlined renting experience.",
        },
      ],
    },
    2: {
      title:
        "Why Zero-Commission Renting is Saving Pakistani Families Thousands",
      categoryName: "Tenant Guides",
      author: "Ayesha Malik",
      date: "October 20, 2026",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      content: [
        {
          type: "paragraph",
          text: "Finding a home for your family is stressful enough without worrying about exorbitant agent fees. In Pakistan, finding an apartment or house traditionally meant paying half to a full month's rent just as commission to a local broker.",
        },
        {
          type: "heading",
          text: "How Direct Connections Change the Game",
        },
        {
          type: "paragraph",
          text: "By cutting out the middleman, RentIQ empowers tenants to speak directly with verified property owners. This transparency ensures that deposits are clear, lease agreements are straightforward, and savings go directly toward settling into your new neighborhood.",
        },
      ],
    },
    3: {
      title:
        "Essential Verification Guide for Couples & Families Booking Rentals",
      categoryName: "Legal & Safety",
      author: "Legal Compliance Team",
      date: "October 18, 2026",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
      content: [
        {
          type: "paragraph",
          text: "Safety and security remain paramount when booking short-term stays or long-term rentals in Pakistan. Understanding local housing society regulations and police reporting requirements ensures your stay is hassle-free.",
        },
        {
          type: "heading",
          text: "CNIC and Marital Status Policies",
        },
        {
          type: "paragraph",
          text: "To comply with community security guidelines in Islamabad, Lahore, and Murree, verified hosts require adult guests to present valid CNICs. For married couples, hosts may request matching CNIC addresses or a valid Marriage Certificate (Nikah Nama) during check-in.",
        },
      ],
    },
  };

  // Fallback if ID doesn't match
  const currentId = parseInt(id) || 1;
  const post = blogPosts[currentId] || blogPosts[1];

  // Get related articles (exclude current post)
  const relatedPosts = Object.keys(blogPosts)
    .filter((key) => parseInt(key) !== currentId)
    .map((key) => ({ id: key, ...blogPosts[key] }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Back Button & Header Bar */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-coral-500 transition mb-6"
          >
            <ArrowLeft size={16} /> Back to Blog & Articles
          </Link>

          {/* Article Title (Untouched) */}
          <h1 className="text-1xl sm:text-2xl font-black text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author Meta Info */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-200 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-gray-900">
                <User size={15} className="text-coral-500" /> {post.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" /> {post.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-gray-400" /> {post.readTime}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isBookmarked
                    ? "bg-coral-500 text-white border-coral-500"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
                title="Bookmark Article"
              >
                <Bookmark size={16} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Article link copied to clipboard!");
                }}
                className="p-2 rounded-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                title="Share Article"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="rounded-3xl overflow-hidden shadow-xl h-72 sm:h-[400px]">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Article Body Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-5 font-medium">
          {post.content.map((block, index) => {
            if (block.type === "heading") {
              return (
                <h2
                  key={index}
                  className="text-[18px] font-bold text-gray-900 pt-4 leading-snug"
                >
                  {block.text}
                </h2>
              );
            }
            return (
              <p
                key={index}
                className="text-[13px] text-gray-600 leading-relaxed"
              >
                {block.text}
              </p>
            );
          })}
        </div>

        {/* Call to Action Banner */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-coral-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-2 text-center md:text-left max-w-lg">
              <h3 className="text-xl sm:text-2xl font-black">
                Ready to explore verified properties?
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm font-medium">
                Browse through our zero-commission listings in Lahore,
                Islamabad, and Karachi today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <Link
                to="/search"
                className="w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-lg transition text-center flex items-center justify-center gap-2"
              >
                Explore Listings <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Articles Section (E-commerce Style) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-coral-500 font-extrabold text-[11px] uppercase tracking-wider block mb-1">
                Keep Reading
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                Related Articles
              </h3>
            </div>
            <Link
              to="/blog"
              className="text-xs font-bold text-coral-500 hover:text-coral-600 transition flex items-center gap-1"
            >
              View All Articles <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((item) => (
              <Link
                key={item.id}
                to={`/blog/${item.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md">
                      {item.categoryName}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-coral-500 transition leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-0 flex items-center justify-between text-xs font-bold text-coral-500">
                  <span>Read Article</span>
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
