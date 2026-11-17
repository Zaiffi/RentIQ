import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.png";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  return (
    <footer className="relative bg-gray-100 text-gray-700 pt-32 pb-12 mt-24 border-t border-gray-200">
      {/* Overlapping Newsletter Section */}
      <div className="absolute -top-20 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-coral-500 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-white border border-gray-700/50">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="bg-white/10 text-coral-300 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
              Stay Updated
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Get Real Estate Market Trends in Pakistan
            </h3>
            <p className="text-gray-300 text-[12.5px] font-medium">
              Subscribe to our newsletter for zero-commission deals, price
              trends, and verified property alerts.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-80">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-white text-gray-900 text-xs font-medium px-4 py-3 rounded-xl focus:outline-none shadow-inner border border-gray-200"
              />
            </div>
            <button
              onClick={() => alert("Subscribed successfully!")}
              className="w-full sm:w-auto bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Subscribe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Expanded Professional Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-300">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 flex flex-col items-start space-y-2.5">
            <Link to="#" className="inline-block -mt-5">
              <img
                src={logo}
                alt="RentIQ Logo"
                className="h-10 sm:h-20 w-auto object-contain -ml-3.5"
              />
            </Link>

            <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-sm">
              Pakistan's pioneering zero-commission rental platform. Empowering
              tenants and property owners with direct connections, verified
              listings, and AI-driven pricing insights.
            </p>

            <div className="pt-1.5">
              <span className="inline-block bg-white text-gray-700 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm border border-gray-200">
                🇵🇰 Proudly Serving Lahore, Islamabad, Karachi & Murree
              </span>
            </div>
          
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-gray-900 text-xs font-extrabold uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <Link to="/" className="hover:text-coral-600 transition">
                  About RentIQ
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-coral-600 transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-coral-600 transition">
                  Press & Media
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-coral-600 transition">
                  Investor Relations
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Explore Properties */}
          <div className="space-y-3">
            <h4 className="text-gray-900 text-xs font-extrabold uppercase tracking-wider">
              Explore Rentals
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <Link
                  to="/search?type=apartment"
                  className="hover:text-coral-600 transition"
                >
                  Luxury Apartments
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=villa"
                  className="hover:text-coral-600 transition"
                >
                  Furnished Villas
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=portion"
                  className="hover:text-coral-600 transition"
                >
                  Family Portions
                </Link>
              </li>
              <li>
                <Link
                  to="/search?type=penthouse"
                  className="hover:text-coral-600 transition"
                >
                  Penthouses
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-gray-900 text-xs font-extrabold uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-gray-600">
              <li>📍 Blue Area, Islamabad, Pakistan</li>
              <li>📞 +92 (51) 111-RENT-IQ</li>
              <li>📧 support@rentiq.pk</li>
              <li className="pt-1">
                <Link
                  to="/faq"
                  className="hover:text-coral-600 transition font-bold"
                >
                  Help Center & FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 pt-6 gap-4">
          <p>
            &copy; {new Date().getFullYear()} RentIQ (Pvt) Ltd. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-6 font-medium">
            <a href="#" className="hover:text-gray-900 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
