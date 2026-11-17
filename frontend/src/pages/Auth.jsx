import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Search,
  Building2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function Auth() {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Forgot Password View State
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Form input states for login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form input states for register
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Role selection state for register form (Guest & Host only)
  const [selectedRole, setSelectedRole] = useState("guest");

  // Error message state for form display
  const [registerError, setRegisterError] = useState("");
  const [loginError, setLoginError] = useState("");

  // URL ke mutabiq panel state set karna
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsRightPanelActive(true);
    } else {
      setIsRightPanelActive(false);
    }
    setRegisterError("");
    setLoginError("");
    setForgotError("");
    setForgotSuccess("");
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/login",
        {
          email: loginEmail,
          password: loginPassword,
        },
      );

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("isLoggedIn", "true");

      const userRole = response.data.user.role;
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (userRole === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === "host") {
        navigate("/host/dashboard", { replace: true });
      } else {
        const from = location.state?.from || "/explore";
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login Error:", err);
      const serverDetail = err.response?.data?.detail;

      if (!err.response) {
        setLoginError("Backend server is offline! Please start FastAPI.");
      } else if (serverDetail && typeof serverDetail === "string") {
        setLoginError(serverDetail);
      } else {
        setLoginError("Invalid Email or Password!");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");

    if (registerPassword !== confirmPassword) {
      setRegisterError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/register",
        {
          full_name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: selectedRole,
        },
      );

      console.log("Register Success Response:", response.data);

      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");

      setIsRightPanelActive(false);
      navigate("/login", { state: location.state });
    } catch (err) {
      console.error("Register Error Details:", err);

      if (!err.response) {
        setRegisterError("Backend server is offline! Please start FastAPI.");
        return;
      }

      const serverDetail = err.response?.data?.detail;

      if (typeof serverDetail === "string") {
        setRegisterError(serverDetail);
      } else if (Array.isArray(serverDetail)) {
        const errorMsgs = serverDetail.map((e) => e.msg).join(", ");
        setRegisterError(errorMsgs);
      } else {
        setRegisterError("Registration failed! Please check inputs.");
      }
    }
  };

  // Forgot Password Action Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/reset-password",
        {
          email: forgotEmail,
          new_password: newPassword,
        },
      );

      setForgotSuccess(
        response.data.message || "Password updated successfully!",
      );
      setTimeout(() => {
        setIsForgotPasswordView(false);
        setForgotEmail("");
        setNewPassword("");
        setForgotSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Forgot Password Error:", err.response || err);
      const serverDetail = err.response?.data?.detail;
      if (!err.response) {
        setForgotError("Backend server is offline!");
      } else if (typeof serverDetail === "string") {
        setForgotError(serverDetail);
      } else if (Array.isArray(serverDetail)) {
        setForgotError(serverDetail.map((e) => e.msg).join(", "));
      } else {
        setForgotError("Failed to reset password. Email might not exist.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl min-h-[550px] border border-gray-200 transition-all duration-700 flex items-center justify-center">
        {/* --- FORGOT PASSWORD VIEW --- */}
        {isForgotPasswordView ? (
          <div className="w-full max-w-md p-8 z-50 bg-white">
            <form
              onSubmit={handleForgotPassword}
              className="w-full space-y-4 text-center"
            >
              <h2 className="text-2xl font-black text-gray-900">
                Reset Password
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Enter your email and create a new password.
              </p>

              {forgotError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 text-left">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              <div className="space-y-3 pt-2 text-left">
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-coral-500"
                  />
                </div>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    name="new_password_field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-coral-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-3 rounded-xl shadow-md transition cursor-pointer mt-2"
              >
                Update Password
              </button>

              {/* Back to Login Button */}
              <p className="text-xs text-gray-500 font-medium pt-2">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(false);
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  className="text-coral-600 font-bold hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* --- SIGN UP FORM --- */}
            <div
              className={`absolute top-0 h-full w-1/2 left-0 flex items-center justify-center p-6 overflow-y-auto transition-all duration-700 ease-in-out z-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
                isRightPanelActive
                  ? "translate-x-full opacity-100 z-50 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <form
                onSubmit={handleRegister}
                className="w-full space-y-3 text-center my-auto py-4"
              >
                <h2 className="text-2xl font-black text-gray-900">
                  Create Account
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Register as a Guest or Host to get started
                </p>

                {registerError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 text-left">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-gray-700 block">
                    What do you want to do?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      onClick={() => setSelectedRole("guest")}
                      className={`cursor-pointer p-2.5 rounded-2xl border-2 transition flex flex-col gap-1 ${
                        selectedRole === "guest"
                          ? "border-coral-500 bg-coral-50/40 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                        <Search size={14} />
                      </div>
                      <h4 className="text-[11px] font-bold text-gray-900">
                        Find a Property
                      </h4>
                      <p className="text-[9px] text-gray-500 leading-tight">
                        Browse, save and book stays.
                      </p>
                    </div>

                    <div
                      onClick={() => setSelectedRole("host")}
                      className={`cursor-pointer p-2.5 rounded-2xl border-2 transition flex flex-col gap-1 ${
                        selectedRole === "host"
                          ? "border-coral-500 bg-coral-50/40 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                        <Building2 size={14} />
                      </div>
                      <h4 className="text-[11px] font-bold text-gray-900">
                        List My Property
                      </h4>
                      <p className="text-[9px] text-gray-500 leading-tight">
                        Manage listings with AI insights.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-coral-500"
                    />
                  </div>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-coral-500"
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-coral-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showRegisterPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-coral-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-3 rounded-xl shadow-md transition cursor-pointer mt-2"
                >
                  SIGN UP
                </button>

                <p className="text-xs text-gray-500 font-medium pt-1">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRightPanelActive(false);
                      navigate("/login", { state: location.state });
                    }}
                    className="text-coral-600 font-bold hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </form>
            </div>

            {/* --- SIGN IN FORM --- */}
            <div
              className={`absolute top-0 h-full w-1/2 left-0 flex items-center justify-center p-8 transition-all duration-700 ease-in-out z-20 ${
                isRightPanelActive
                  ? "translate-x-full opacity-0 pointer-events-none"
                  : "opacity-100 z-50 pointer-events-auto"
              }`}
            >
              <form
                onSubmit={handleLogin}
                className="w-full space-y-4 text-center"
              >
                <h2 className="text-2xl font-black text-gray-900">Sign In</h2>
                <p className="text-xs text-gray-500 font-medium">
                  Use your credentials to login
                </p>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 text-left">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-coral-500"
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-3.5 text-gray-400"
                    />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-gray-50 border border-gray-200 text-xs font-medium rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-coral-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showLoginPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordView(true)}
                    className="text-[11px] text-gray-500 hover:text-coral-600 font-medium cursor-pointer bg-transparent border-none p-0"
                  >
                    Forgot Your Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold py-3 rounded-xl shadow-md transition cursor-pointer mt-2"
                >
                  Login
                </button>
                <p className="text-xs text-gray-500 font-medium pt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRightPanelActive(true);
                      navigate("/register", { state: location.state });
                    }}
                    className="text-coral-600 font-bold hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            </div>

            {/* --- OVERLAY SLIDING PANEL --- */}
            <div
              className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-40 ${
                isRightPanelActive ? "-translate-x-full" : ""
              }`}
            >
              <div
                className={`bg-gradient-to-br from-gray-600 via-gray-600 to-gray-600 text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out flex items-center justify-between ${
                  isRightPanelActive ? "translate-x-1/2" : "translate-x-0"
                }`}
                style={{
                  borderRadius: isRightPanelActive
                    ? "0 150px 150px 0"
                    : "150px 0 0 150px",
                }}
              >
                <div className="w-1/2 h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
                  <span className="inline-flex items-center gap-1.5 bg-coral-500/20 text-coral-400 text-xs font-extrabold px-3 py-1 rounded-full border border-coral-500/30 uppercase tracking-wider">
                    <Sparkles size={14} /> New Here?
                  </span>
                  <h2 className="text-2xl font-black">Hello, Friend!</h2>
                  <p className="text-xs text-gray-300 font-medium max-w-xs leading-relaxed">
                    Enter your personal details and start journey with RentIQ
                    verified properties.
                  </p>
                </div>

                <div className="w-1/2 h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
                  <span className="inline-flex items-center gap-1.5 bg-coral-500/20 text-coral-400 text-xs font-extrabold px-3 py-1 rounded-full border border-coral-500/30 uppercase tracking-wider">
                    <Sparkles size={14} /> Welcome Back
                  </span>
                  <h2 className="text-2xl font-black">Welcome Back!</h2>
                  <p className="text-xs text-gray-300 font-medium max-w-xs leading-relaxed">
                    To keep connected with us please login with your personal
                    info.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
