import React, { useState } from "react";
import axios from "axios";
import "../../sass/admin-login.scss";

// ...existing code...
export default function AdminLogin({ onLogin, onRegister }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const username = (credentials.username || "").trim();
    const password = credentials.password || "";

    if (!username || !password) {
      setError("Please enter both username and password.");
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('/api/admin/login', {
        username,
        password
      }, {
        withCredentials: true // include cookies/sessions from PHP
      });
      
      // Accept different possible success shapes from backend
      if (response.data?.success) {
        const user = response.data.user ?? response.data.data ?? null;
        const token = response.data.token ?? null;

        // If onLogin is provided, pass user object (or token) so parent can handle redirect/storage
        if (onLogin) {
          onLogin(user ?? { token });
        }
      } else {
        // fallback error message
        setError(response.data?.message || "Login failed. Please check credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      // inspect common server error shapes
      const serverMsg = err?.response?.data?.message
        || (err?.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : null)
        || err?.message;
      setError(serverMsg || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-content">
          <div className="admin-left-section">
            <div className="admin-logo-icon">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Graduation Cap */}
                <path d="M100 60L160 80L100 100L40 80L100 60Z" fill="#37bcff"/>
                <path d="M100 100V120" stroke="#37bcff" strokeWidth="4"/>
                <path d="M70 90V110C70 115 82 125 100 125C118 125 130 115 130 110V90" stroke="#37bcff" strokeWidth="4" fill="none"/>
                {/* Left Hand */}
                <path d="M40 100C40 100 35 105 32 110C30 113 28 118 30 122C32 126 36 128 40 128C42 128 44 127 46 125L55 115" fill="#b2f2ff" stroke="#37bcff" strokeWidth="2"/>
                {/* Right Hand */}
                <path d="M160 100C160 100 165 105 168 110C170 113 172 118 170 122C168 126 164 128 160 128C158 128 156 127 154 125L145 115" fill="#b2f2ff" stroke="#37bcff" strokeWidth="2"/>
                {/* Hands supporting from below */}
                <ellipse cx="40" cy="130" rx="15" ry="8" fill="#b2f2ff"/>
                <ellipse cx="160" cy="130" rx="15" ry="8" fill="#b2f2ff"/>
              </svg>
            </div>
            <h1 className="admin-title">UniSys</h1>
            <p className="admin-subtitle">Management System</p>
          </div>

          <div className="admin-right-section">
            <h2 className="form-title">Login</h2>

            {error && <div className="admin-error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <input
                  type="text"
                  placeholder="Username"
                  className="admin-input"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <input
                  type="password"
                  placeholder="Password"
                  className="admin-input"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="admin-login-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="register-link">
                <p>
                  Don't have an account?{' '}
                  <button type="button" onClick={onRegister} className="link-button">
                    Register here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}