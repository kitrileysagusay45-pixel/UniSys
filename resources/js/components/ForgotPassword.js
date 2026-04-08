import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, Mail } from "lucide-react";
// import "../../sass/login-page.scss";

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post("/api/forgot-password", { email });
      if (response.data.success) {
        setMessage(response.data.message);
      } else {
        setError(response.data.message || "Something went wrong.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-right" style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
          <button onClick={onBackToLogin} className="back-btn" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "none", background: "none", cursor: "pointer", color: "var(--primary-color)" }}>
            <ArrowLeft size={18} /> Back to Login
          </button>
          
          <h2 className="form-heading">Forgot Password</h2>
          <p className="form-subheading">Enter your email address and we'll send you a link to reset your password.</p>

          {message && <div style={{ padding: "1rem", backgroundColor: "#e2f8f0", color: "#1e7e5e", borderRadius: "8px", marginBottom: "1rem" }}>{message}</div>}
          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
