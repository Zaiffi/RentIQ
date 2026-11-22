import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Building2,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  CalendarCheck,
} from "lucide-react";
import logoImg from "../../assets/images/logo.png";

const API_BASE = "http://localhost:8000/api/v1";

// --- Sub-Panel 1: Dashboard Overview ---
function AdminHomePanel({ overview, pendingHosts, setActiveTab, onRefresh }) {
  const statCards = [
    {
      label: "Pending Host Approvals",
      value: overview.pending_hosts ?? 0,
      icon: <Clock size={20} className="text-amber-600" />,
      bg: "bg-amber-50 border-amber-200",
      targetTab: "Pending Hosts",
    },
    {
      label: "Total Users & Hosts",
      value: overview.total_users ?? 0,
      icon: <Users size={20} className="text-coral-600" />,
      bg: "bg-rose-50 border-rose-200",
      targetTab: "Manage Users",
    },
    {
      label: "Total Properties",
      value: overview.total_properties ?? 0,
      icon: <Building2 size={20} className="text-blue-600" />,
      bg: "bg-blue-50 border-blue-200",
      targetTab: "Manage Properties",
    },
    {
      label: "Total Bookings",
      value: overview.total_bookings ?? 0,
      icon: <CalendarCheck size={20} className="text-emerald-600" />,
      bg: "bg-emerald-50 border-emerald-200",
      targetTab: "Dashboard",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-coral-600 bg-coral-50 px-3 py-1 rounded-full">
            <ShieldCheck size={13} /> Admin Overview
          </span>
          <h2 className="text-xl font-black text-gray-900 mt-2">
            Welcome to RentIQ Admin Panel
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Host approvals, user accounts, aur live property listings ko yahan
            se control karein.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gray-900 hover:bg-gray-800 text-white transition cursor-pointer"
        >
          <RefreshCw size={14} /> Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(card.targetTab)}
            className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-500">{card.label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.bg}`}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">
              Recent Pending Host Requests
            </h3>
            <p className="text-xs text-gray-500">
              Approve hone tak pending hosts login nahi kar sakenge.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("Pending Hosts")}
            className="text-xs font-bold text-coral-600 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {pendingHosts.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold text-gray-500">
            Koi pending host approval request nahi hai.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingHosts.slice(0, 5).map((h) => (
              <div
                key={h.id}
                className="px-5 py-3.5 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-gray-900">{h.full_name}</p>
                  <p className="text-gray-500">{h.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-800">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-Panel 2: Pending Hosts Approval ---
function PendingHostsPanel({
  pendingHosts,
  actionLoadingId,
  onApprove,
  onReject,
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-base font-extrabold text-gray-900">
          Pending Host Approvals ({pendingHosts.length})
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Naye registered hosts ko approve ya reject karein.
        </p>
      </div>

      {pendingHosts.length === 0 ? (
        <div className="p-10 text-center text-xs sm:text-sm font-semibold text-gray-500">
          Is waqt koi pending host approval request nahi hai.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500 border-b border-gray-100">
                <th className="py-3.5 px-5">Host Name</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
              {pendingHosts.map((host) => (
                <tr key={host.id} className="hover:bg-gray-50/70">
                  <td className="py-4 px-5 font-bold text-gray-900">
                    {host.full_name}
                  </td>
                  <td className="py-4 px-5 text-gray-600">{host.email}</td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      <Clock size={12} /> Pending Approval
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-2">
                    <button
                      type="button"
                      disabled={actionLoadingId === `approve-${host.id}`}
                      onClick={() => onApprove(host.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionLoadingId === `reject-${host.id}`}
                      onClick={() => onReject(host.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Sub-Panel 3: Manage Users ---
function ManageUsersPanel({ users }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-base font-extrabold text-gray-900">
          All Users & Hosts ({users.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500 border-b border-gray-100">
              <th className="py-3.5 px-5">ID</th>
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-5">Email</th>
              <th className="py-3.5 px-5">Role</th>
              <th className="py-3.5 px-5">Approval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/70">
                <td className="py-3.5 px-5 font-bold text-gray-500">#{u.id}</td>
                <td className="py-3.5 px-5 font-bold text-gray-900">
                  {u.full_name}
                </td>
                <td className="py-3.5 px-5 text-gray-600">{u.email}</td>
                <td className="py-3.5 px-5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800 uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  {u.is_approved ? (
                    <span className="text-emerald-700 font-bold text-xs">
                      Approved
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold text-xs">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Sub-Panel 4: Manage Properties ---
function ManagePropertiesPanel({
  properties,
  actionLoadingId,
  onToggleStatus,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-base font-extrabold text-gray-900">
          All Platform Properties ({properties.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[11px] font-extrabold uppercase text-gray-500 border-b border-gray-100">
              <th className="py-3.5 px-5">Title</th>
              <th className="py-3.5 px-5">City</th>
              <th className="py-3.5 px-5">Type</th>
              <th className="py-3.5 px-5">Rent</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
            {properties.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/70">
                <td className="py-3.5 px-5 font-bold text-gray-900">
                  {p.title}
                </td>
                <td className="py-3.5 px-5 text-gray-600">{p.city}</td>
                <td className="py-3.5 px-5 text-gray-600">{p.property_type}</td>
                <td className="py-3.5 px-5 font-bold text-gray-900">
                  Rs. {Number(p.price_per_night || 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      p.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right space-x-2">
                  <button
                    type="button"
                    disabled={actionLoadingId === `prop-${p.id}`}
                    onClick={() => onToggleStatus(p)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition cursor-pointer disabled:opacity-50"
                  >
                    {p.is_active ? (
                      <>
                        <EyeOff size={13} /> Deactivate
                      </>
                    ) : (
                      <>
                        <Eye size={13} /> Activate
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoadingId === `del-${p.id}`}
                    onClick={() => onDelete(p.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [overview, setOverview] = useState({
    total_users: 0,
    total_hosts: 0,
    pending_hosts: 0,
    total_properties: 0,
    active_properties: 0,
    total_bookings: 0,
  });
  const [pendingHosts, setPendingHosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [banner, setBanner] = useState(null);

  const showBanner = (type, text) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [overviewRes, pendingRes, usersRes, propsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/overview`, { headers }),
        axios.get(`${API_BASE}/admin/pending-hosts`, { headers }),
        axios.get(`${API_BASE}/admin/users`, { headers }),
        axios.get(`${API_BASE}/admin/properties`, { headers }),
      ]);

      setOverview(overviewRes.data || {});
      setPendingHosts(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setProperties(Array.isArray(propsRes.data) ? propsRes.data : []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      const msg =
        err?.response?.data?.detail ||
        "Admin data load karne mein masla aaya. Check karein ke aap admin se logged in hain.";
      showBanner("error", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApproveHost = async (userId) => {
    setActionLoadingId(`approve-${userId}`);
    try {
      await axios.put(
        `${API_BASE}/admin/approve-host/${userId}`,
        {},
        { headers: getAuthHeaders() },
      );
      showBanner("success", "Host account approve ho gaya hai!");
      await fetchAdminData();
    } catch (err) {
      showBanner(
        "error",
        err?.response?.data?.detail || "Host approve karne mein error aaya.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectHost = async (userId) => {
    setActionLoadingId(`reject-${userId}`);
    try {
      await axios.delete(`${API_BASE}/admin/reject-host/${userId}`, {
        headers: getAuthHeaders(),
      });
      showBanner("success", "Pending host request reject kar di gayi.");
      await fetchAdminData();
    } catch (err) {
      showBanner(
        "error",
        err?.response?.data?.detail || "Host reject karne mein error aaya.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePropertyStatus = async (prop) => {
    const nextStatus = !prop.is_active;
    setActionLoadingId(`prop-${prop.id}`);
    try {
      await axios.put(`${API_BASE}/admin/properties/${prop.id}/status`, null, {
        params: { is_active: nextStatus },
        headers: getAuthHeaders(),
      });
      showBanner(
        "success",
        `Property "${prop.title}" ab ${nextStatus ? "Active" : "Inactive"} hai.`,
      );
      await fetchAdminData();
    } catch (err) {
      showBanner(
        "error",
        err?.response?.data?.detail || "Property status update nahi ho saka.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteProperty = async (propId) => {
    setActionLoadingId(`del-${propId}`);
    try {
      await axios.delete(`${API_BASE}/admin/properties/${propId}`, {
        headers: getAuthHeaders(),
      });
      showBanner("success", "Property delete ho gayi.");
      await fetchAdminData();
    } catch (err) {
      showBanner(
        "error",
        err?.response?.data?.detail || "Property delete karne mein error aaya.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userRole");
    navigate("/auth");
  };

  const sidebarItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    {
      name: "Pending Hosts",
      icon: <UserCheck size={18} />,
      badge: pendingHosts.length,
    },
    { name: "Manage Users", icon: <Users size={18} /> },
    { name: "Manage Properties", icon: <Building2 size={18} /> },
  ];

  const renderActivePanel = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <AdminHomePanel
            overview={overview}
            pendingHosts={pendingHosts}
            setActiveTab={setActiveTab}
            onRefresh={fetchAdminData}
          />
        );
      case "Pending Hosts":
        return (
          <PendingHostsPanel
            pendingHosts={pendingHosts}
            actionLoadingId={actionLoadingId}
            onApprove={handleApproveHost}
            onReject={handleRejectHost}
          />
        );
      case "Manage Users":
        return <ManageUsersPanel users={users} />;
      case "Manage Properties":
        return (
          <ManagePropertiesPanel
            properties={properties}
            actionLoadingId={actionLoadingId}
            onToggleStatus={handleTogglePropertyStatus}
            onDelete={handleDeleteProperty}
          />
        );
      default:
        return (
          <AdminHomePanel
            overview={overview}
            pendingHosts={pendingHosts}
            setActiveTab={setActiveTab}
            onRefresh={fetchAdminData}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- TOP NAVBAR (Height: 70px) --- */}
      <header className="bg-white border-b border-gray-200 px-6 h-[70px] flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => setActiveTab("Dashboard")}
          >
            <img
              src={logoImg}
              alt="RentIQ Logo"
              className="h-14 sm:h-16 w-auto object-contain py-1"
            />
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider bg-coral-50 text-coral-600 px-3 py-1 rounded-full border border-coral-200">
            Admin Panel
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("Pending Hosts")}
            className="relative p-2 text-gray-600 hover:text-coral-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            title="Pending Host Approvals"
          >
            <Bell size={16} />
            {pendingHosts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-coral-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {pendingHosts.length}
              </span>
            )}
          </button>

          <div className="relative" ref={profileDropdownRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-2 pr-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 py-1.5 rounded-2xl border border-gray-200 transition"
            >
              <div className="w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-xs">
                A
              </div>
              <ChevronDown
                size={12}
                className={`text-gray-500 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-2">
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-xs font-extrabold text-gray-900">
                    Administrator
                  </p>
                  <p className="text-[11px] text-gray-500">System Admin</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN SPA LAYOUT WITH SIDEBAR & DYNAMIC CONTENT --- */}
      <div className="flex flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <aside className="w-72 bg-white border border-gray-200/80 p-3 rounded-3xl shadow-sm space-y-1.5 hidden lg:block sticky top-24 h-fit ml-0">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? "bg-coral-500 text-white shadow-md shadow-coral-500/20"
                    : "text-gray-600 hover:bg-coral-50 hover:text-coral-600"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={isActive ? "text-white" : "text-gray-500"}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </span>
                {item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? "bg-white text-coral-600"
                        : "bg-coral-100 text-coral-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <main className="flex-1 py-2 overflow-hidden space-y-4">
          {banner && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between ${
                banner.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              <span>{banner.text}</span>
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="text-xs underline ml-4 cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-3xl p-10 border border-gray-200/80 text-center text-sm font-bold text-gray-500">
              Loading admin dashboard...
            </div>
          ) : (
            renderActivePanel()
          )}
        </main>
      </div>
    </div>
  );
}
