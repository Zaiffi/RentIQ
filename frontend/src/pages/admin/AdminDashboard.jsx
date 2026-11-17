import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, Users, ShieldCheck, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [pendingHosts, setPendingHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPendingHosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/v1/admin/pending-hosts",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setPendingHosts(response.data);
    } catch (err) {
      console.error("Error fetching pending hosts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingHosts();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:8000/api/v1/admin/approve-host/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Host approved successfully!");
      fetchPendingHosts(); // List refresh karne ke liye
    } catch (err) {
      console.error("Approval error:", err);
      alert("Failed to approve host.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-coral-500 text-white rounded-2xl flex items-center justify-center font-black">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Manage pending host approvals
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition cursor-pointer"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Pending Hosts List */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Users size={16} className="text-coral-500" /> Pending Host
            Registrations ({pendingHosts.length})
          </h2>

          {loading ? (
            <p className="text-xs text-gray-500 text-center py-8">
              Loading pending hosts...
            </p>
          ) : pendingHosts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-medium space-y-2">
              <p className="text-3xl">🎉</p>
              <p>No pending host approvals right now!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingHosts.map((host) => (
                <div
                  key={host.id}
                  className="py-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">
                      {host.full_name}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {host.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApprove(host.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <CheckCircle size={14} /> Approve Host
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
