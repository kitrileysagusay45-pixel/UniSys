import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { GraduationCap, Eye, EyeOff, Shield, BookOpen, User, AlertCircle, Loader } from "lucide-react";

// ── Role badge config ────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin:   { label: "ADMIN",   color: "#f97316", bg: "rgba(249,115,22,0.12)",   icon: Shield },
  faculty: { label: "FACULTY", color: "#3b82f6", bg: "rgba(59,130,246,0.12)",   icon: BookOpen },
  student: { label: "STUDENT", color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: User },
};

function RoleBadge({ role }) {
  if (!role || !ROLE_CONFIG[role]) return null;
  const { label, color, bg, icon: Icon } = ROLE_CONFIG[role];
  return (
    <span
      className="role-badge"
      style={{ "--badge-color": color, "--badge-bg": bg }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {label}
    </span>
  );
}

// ── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function LoginPage({ onLogin, onStudentRegister, onFacultyRegister, onForgotPassword }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [detectedRole, setDetectedRole] = useState(null);   // 'admin'|'faculty'|'student'|null
  const [lookingUp, setLookingUp]   = useState(false);
  const usernameRef = useRef(null);

  const debouncedUsername = useDebounce(credentials.username.trim(), 520);

  // ── Dynamic role detection ─────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setDetectedRole(null);
      return;
    }

    let cancelled = false;
    setLookingUp(true);

    axios
      .post("api/lookup-user", { username: debouncedUsername })
      .then((res) => {
        if (!cancelled && res.data?.role) {
          setDetectedRole(res.data.role);
        } else if (!cancelled) {
          setDetectedRole(null);
        }
      })
      .catch(() => {
        if (!cancelled) setDetectedRole(null);
      })
      .finally(() => {
        if (!cancelled) setLookingUp(false);
      });

    return () => { cancelled = true; };
  }, [debouncedUsername]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const username = credentials.username.trim();
    const password = credentials.password;

    if (!username || !password) {
      setError("Please enter your username and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "api/login",
        { username, password },
        { withCredentials: true }
      );

      if (res.data?.success) {
        if (onLogin) onLogin(res.data.user);
      } else {
        setError(res.data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : null) ||
        err?.message;
      setError(serverMsg || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  }, [error]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="lp-root">
      {/* Animated background blobs */}
      <div className="lp-blob lp-blob--1" />
      <div className="lp-blob lp-blob--2" />
      <div className="lp-blob lp-blob--3" />

      <div className="lp-card">
        {/* ── Left Panel ── */}
        <aside className="lp-panel">
          <div className="lp-panel__inner">
            <div className="lp-logo">
              <GraduationCap size={52} strokeWidth={1.4} />
            </div>
            <h1 className="lp-brand">UniSys</h1>
            <p className="lp-tagline">Portal</p>
            <p className="lp-desc">
              University Management System — your unified gateway for academic
              administration, faculty, and student services.
            </p>

            <ul className="lp-roles">
              <li style={{ "--dot": "#f97316" }}>Admin Dashboard</li>
              <li style={{ "--dot": "#3b82f6" }}>Faculty Portal</li>
              <li style={{ "--dot": "#22c55e" }}>Student Portal</li>
            </ul>
          </div>

          {/* decorative rings */}
          <span className="lp-ring lp-ring--a" />
          <span className="lp-ring lp-ring--b" />
        </aside>

        {/* ── Right Panel (Form) ── */}
        <main className="lp-form-panel">
          <div className="lp-form-inner">
            <div className="lp-form-header">
              <h2 className="lp-form-title">Sign In</h2>
              <p className="lp-form-sub">Enter your credentials to continue</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="lp-error" role="alert">
                <AlertCircle size={16} strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <form className="lp-form" onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-username">
                  <span>Username</span>
                  {lookingUp && <Loader size={12} className="lp-spinner" />}
                  {!lookingUp && <RoleBadge role={detectedRole} />}
                </label>
                <div className="lp-input-wrap">
                  <input
                    id="lp-username"
                    ref={usernameRef}
                    type="text"
                    className={`lp-input ${detectedRole ? `lp-input--${detectedRole}` : ""}`}
                    placeholder="Email address or username"
                    value={credentials.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    autoComplete="username"
                    autoFocus
                    required
                  />
                </div>
                <p className="lp-hint">Any email or username registered in the system</p>
              </div>

              {/* Password */}
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-password">
                  Password
                </label>
                <div className="lp-input-wrap lp-input-wrap--pw">
                  <input
                    id="lp-password"
                    type={showPassword ? "text" : "password"}
                    className="lp-input"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Forgot link */}
              <div className="lp-extras">
                <button
                  type="button"
                  className="lp-link"
                  onClick={onForgotPassword}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                id="lp-submit"
                type="submit"
                className="lp-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="lp-spinner" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="lp-register">
              <span>New here?</span>
              <button type="button" className="lp-link" onClick={onStudentRegister}>
                Register as Student
              </button>
              <span className="lp-sep">|</span>
              <button type="button" className="lp-link" onClick={onFacultyRegister}>
                Register as Faculty
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
