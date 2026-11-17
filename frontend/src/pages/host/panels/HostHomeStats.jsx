import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Building2,
  CheckCircle2,
  Calendar,
  Star,
  Wallet,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function HostHomeStats({ setActiveTab }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Host ki properties backend se fetch karna
  useEffect(() => {
    const fetchHostDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          "http://127.0.0.1:8000/api/v1/properties/my-properties",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setProperties(response.data);
      } catch (err) {
        console.error("Error fetching host properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHostDashboardData();
  }, []);

  // --- DYNAMIC CALCULATIONS ---
  const totalPropertiesCount = properties.length;

  const activeListingsCount = properties.filter(
    (p) => p.is_active !== false,
  ).length;

  const stats = [
    {
      title: "Total properties",
      count: totalPropertiesCount.toString(),
      icon: <Building2 size={18} />,
      targetTab: "My Properties",
      desc: "View all listed properties",
    },
    {
      title: "Active listings",
      count: activeListingsCount.toString(),
      icon: <CheckCircle2 size={18} />,
      targetTab: "My Properties",
      desc: "Currently running & active",
    },
    {
      title: "Active bookings",
      count: "4",
      icon: <Calendar size={18} />,
      targetTab: "Bookings",
      desc: "Currently active guest stays",
    },
    {
      title: "Average rating",
      count: "4.7",
      icon: <Star size={18} />,
      targetTab: "Host Profile",
      desc: "Guest reviews & comments",
    },
    {
      title: "Estimated revenue",
      count: "Rs. 186,500",
      subtitle: "Confirmed & completed stays",
      icon: <Wallet size={18} />,
      targetTab: "Analytics",
      desc: "Detailed earnings & graphs",
    },
  ];

  const recentBookings = [
    {
      id: 1,
      guest: "Ali Khan",
      property: "Luxury Penthouse DHA",
      dates: "12 Oct - 15 Oct",
      status: "Confirmed",
      amount: "Rs. 45,000",
    },
    {
      id: 2,
      guest: "Sara Ahmed",
      property: "Modern Apartment Gulberg",
      dates: "18 Oct - 20 Oct",
      status: "Pending",
      amount: "Rs. 28,000",
    },
    {
      id: 3,
      guest: "Usman Malik",
      property: "Cozy Studio Bahria",
      dates: "25 Oct - 28 Oct",
      status: "Completed",
      amount: "Rs. 32,000",
    },
  ];

  const topProperties = properties.slice(0, 3).map((prop) => ({
    name: prop.title,
    bookings: "5 Bookings",
    revenue: `Rs. ${(prop.price_per_night * 5).toLocaleString()}`,
    rating: "4.8",
  }));

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          Welcome back, Hassan
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Here is how your listings are doing. Click any card below to view
          details.
        </p>
      </div>

      {/* --- CLICKABLE ACTION CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab && setActiveTab(item.targetTab)}
            className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-3 hover:shadow-md hover:border-coral-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-coral-50 text-coral-500 flex items-center justify-center group-hover:bg-coral-500 group-hover:text-white transition">
                {item.icon}
              </div>
              <ChevronRight
                size={14}
                className="text-gray-300 group-hover:text-coral-500 transition-transform group-hover:translate-x-0.5"
              />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-coral-600 tracking-tight transition">
                {item.count}
              </div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">
                {item.title}
              </div>
              <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- REVENUE & BOOKING TREND GRAPH --- */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-gray-900 tracking-tight">
              Annual Revenue & Booking Trend
            </h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              Tracking performance growth across months (Y-Axis: Revenue in Rs.)
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl text-[11px] font-extrabold shadow-2xs">
            <TrendingUp size={14} /> +24.5% vs last year
          </div>
        </div>

        <div className="flex pt-4">
          <div className="flex flex-col justify-between text-[9px] font-bold text-gray-400 pr-3 pb-6 h-44 select-none">
            <span>Rs. 250k</span>
            <span>Rs. 180k</span>
            <span>Rs. 100k</span>
            <span>Rs. 50k</span>
            <span>Rs. 0</span>
          </div>

          <div className="flex-1 relative">
            <div className="w-full h-44 relative">
              <svg
                viewBox="0 0 600 140"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ff5a5f" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#ff5a5f" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line
                  x1="0"
                  y1="35"
                  x2="600"
                  y2="35"
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="70"
                  x2="600"
                  y2="70"
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1="105"
                  x2="600"
                  y2="105"
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
                <path
                  d="M 0,110 Q 75,90 150,80 T 300,50 T 450,60 T 600,20 L 600,140 L 0,140 Z"
                  fill="url(#revenueGradient)"
                />
                <path
                  d="M 0,110 Q 75,90 150,80 T 300,50 T 450,60 T 600,20"
                  fill="none"
                  stroke="#ff5a5f"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="110" r="4" fill="#ff5a5f" />
                <circle cx="150" cy="80" r="4" fill="#ff5a5f" />
                <circle cx="300" cy="50" r="4" fill="#ff5a5f" />
                <circle cx="450" cy="60" r="4" fill="#ff5a5f" />
                <circle
                  cx="600"
                  cy="20"
                  r="5"
                  fill="#ff5a5f"
                  className="animate-pulse"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-2 px-1 select-none">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RECENT BOOKINGS & TOP PROPERTIES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-900 tracking-tight">
              Recent Bookings & Requests
            </h3>
            <span
              onClick={() => setActiveTab && setActiveTab("Bookings")}
              className="text-[11px] font-bold text-coral-500 cursor-pointer hover:underline"
            >
              View all
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-bold">
                  <th className="pb-3">Guest</th>
                  <th className="pb-3">Property</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-black text-[10px]">
                        {b.guest.charAt(0)}
                      </div>
                      {b.guest}
                    </td>
                    <td className="py-3 text-gray-600 font-medium">
                      {b.property}
                    </td>
                    <td className="py-3 text-gray-500 text-[11px]">
                      {b.dates}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                          b.status === "Confirmed"
                            ? "bg-emerald-50 text-emerald-600"
                            : b.status === "Pending"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-gray-900">
                      {b.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Properties */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-900 tracking-tight">
              Top Properties
            </h3>
            <Building2 size={16} className="text-coral-500" />
          </div>

          <div className="space-y-3">
            {topProperties.length > 0 ? (
              topProperties.map((prop, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveTab && setActiveTab("My Properties")}
                  className="p-3 bg-gray-50/60 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-coral-300 transition cursor-pointer"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {prop.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {prop.bookings} • ⭐ {prop.rating}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-gray-900">
                      {prop.revenue}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                No properties found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
