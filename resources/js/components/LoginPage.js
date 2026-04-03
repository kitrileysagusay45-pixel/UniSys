import React, { useState } from "react";
import axios from "axios";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import "../../sass/login-page.scss";

export default function LoginPage({ onLogin, onStudentRegister, onFacultyRegister, onForgotPassword }) {
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const identifier = (credentials.identifier || "").trim();
    const password   = credentials.password || "";

    if (!identifier || !password) {
      setError("Please enter your email/username and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/login", { identifier, password }, { withCredentials: true });

      if (response.data?.success) {
        if (onLogin) onLogin(response.data.user);
      } else {
        setError(response.data?.message || "Login failed.");
      }
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : null) ||
        err?.message;
      setError(serverMsg || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="brand-section">
            <div className="brand-icon">
              <GraduationCap size={64} strokeWidth={1.5} />
            </div>
            <h1 className="brand-title">UniSys</h1>
            <p className="brand-subtitle">University Management System</p>
          </div>
          <div className="brand-decoration">
            <div className="decoration-circle c1"></div>
            <div className="decoration-circle c2"></div>
            <div className="decoration-circle c3"></div>
          </div>
        </div>

        <div className="login-right">
          <h2 className="form-heading">Sign In</h2>
          <p className="form-subheading">Enter your credentials to continue</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email or Username</label>
              <input
                type="text"
                placeholder="Enter your email or username"
                value={credentials.identifier}
                onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
                <button type="button" className="link-btn" onClick={onForgotPassword} style={{ fontSize: "0.85rem" }}>
                  Forgot Password?
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="register-links">
            <p>
              <button type="button" className="link-btn" onClick={onStudentRegister}>
                Register here as a Student
              </button>
              {" | "}
              <button type="button" className="link-btn" onClick={onFacultyRegister}>
                Register here as a Faculty
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
