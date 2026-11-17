import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Explore from "./pages/Explore";
import PropertyDetail from "./pages/PropertyDetail";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import HostDashboard from "./pages/host/HostDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* --- Guest Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* --- Host Dashboard Route (SPA Setup) --- */}
        <Route path="/host/dashboard" element={<HostDashboard />} />

        {/* --- Admin Dashboard Route (SPA Setup) --- */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
