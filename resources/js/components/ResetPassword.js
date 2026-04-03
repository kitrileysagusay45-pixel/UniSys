import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, Lock } from "lucide-react";
import "../../sass/login-page.scss";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const email = urlParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      setError("Invalid or missing reset token/email.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post("/api/reset-password", {
        ...formData,
        token,
        email,
      });

      if (response.data.success) {
        setMessage(response.data.message + " Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message || 
                        (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : null);
      setError(serverMsg || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-right" style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
          <h2 className="form-heading">Reset Password</h2>
          <p className="form-subheading">Enter your new password below. It must be at least 8 characters long and contain an uppercase letter and a number.</p>

          {message && <div style={{ padding: "1rem", backgroundColor: "#e2f8f0", color: "#1e7e5e", borderRadius: "8px", marginBottom: "1rem" }}>{message}</div>}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>New Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
