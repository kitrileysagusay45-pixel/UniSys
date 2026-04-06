import React, { useState } from "react";
import axios from "axios";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import "../../sass/login-page.scss";

export default function LoginPage({ onLogin, onStudentRegister, onFacultyRegister, onForgotPassword }) {
  const [credentials, setCredentials] = useState({ username: "", password: "", remember: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const username = (credentials.username || "").trim();
    const password = credentials.password || "";

    if (!username || !password) {
      setError("Please enter your username and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/login", { 
        username, 
        password,
        remember: credentials.remember
      }, { withCredentials: true });

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

  const getRoleBadge = (username) => {
    const prefix = username.substring(0, 3).toUpperCase();
    if (prefix === 'ADM') return <span style={{background: '#f97316', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', marginLeft: '10px', verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Admin</span>;
    if (prefix === 'FAC') return <span style={{background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', marginLeft: '10px', verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Faculty</span>;
    if (prefix === 'STU') return <span style={{background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', marginLeft: '10px', verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Student</span>;
    return null;
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
              <label style={{ display: 'flex', alignItems: 'center' }}>
                Username
                {getRoleBadge(credentials.username)}
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: '500', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={credentials.remember} 
                    onChange={(e) => setCredentials({...credentials, remember: e.target.checked})} 
                    style={{width: '16px', height: '16px', margin: 0, cursor: 'pointer'}}
                  />
                  Remember Me
                </label>
                <button type="button" className="link-btn" onClick={onForgotPassword} style={{ fontSize: "0.85rem", padding: 0 }}>
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

