import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { GraduationCap, Eye, EyeOff, Shield, BookOpen, User, AlertCircle, Loader } from "lucide-react";

// ── Role badge config ────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  admin:   { label: "ADMIN",   color: "#f97316", bg: "rgba(249,115,22,0.12)",   icon: Shield },
  faculty: { label: "FACULTY", color: "#3b82f6", bg: "rgba(59,130,246,0.12)",   icon: BookOpen },
  student: { label: "STUDENT", color: "#22c55e", bg: "rgba(34,197,94,0.12)",    icon: User },
};

function RoleBadge({ role, status }) {
  if (!role || !ROLE_CONFIG[role]) return null;
  const { label, color, bg, icon: Icon } = ROLE_CONFIG[role];
  const isPending = status === "Pending";
  const isRejected = status === "Rejected";
  
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <span
        className="role-badge"
        style={{ "--badge-color": color, "--badge-bg": bg }}
      >
        <Icon size={10} strokeWidth={2.5} />
        {label}
      </span>
      {isPending && (
        <span
          className="role-badge"
          style={{ 
            "--badge-color": "#f59e0b", 
            "--badge-bg": "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.3)"
          }}
        >
          PENDING
        </span>
      )}
      {isRejected && (
        <span
          className="role-badge"
          style={{ 
            "--badge-color": "#ef4444", 
            "--badge-bg": "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)"
          }}
        >
          REJECTED
        </span>
      )}
    </div>
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
  const [accountStatus, setAccountStatus] = useState("Active"); // 'Active'|'Pending'|'Rejected'
  const [rejectionReason, setRejectionReason] = useState("");
  const [lookingUp, setLookingUp]   = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
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
        if (!cancelled && res.data?.found) {
          setDetectedRole(res.data.role);
          setAccountStatus(res.data.status || "Active");
          setRejectionReason(res.data.rejection_reason || "");
        } else if (!cancelled) {
          setDetectedRole(null);
          setAccountStatus("Active");
          setRejectionReason("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetectedRole(null);
          setAccountStatus("Active");
        }
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

    let hasError = false;
    const newFieldErrors = { username: "", password: "" };

    if (!username) {
      newFieldErrors.username = "Username is required.";
      hasError = true;
    }
    if (!password) {
      newFieldErrors.password = "Password is required.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
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
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: "" }));
  }, [error, fieldErrors]);

  const handleCapsLock = (e) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

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
                  {!lookingUp && <RoleBadge role={detectedRole} status={accountStatus} />}
                </label>
                <div className="lp-input-wrap">
                  <input
                    id="lp-username"
                    ref={usernameRef}
                    type="text"
                    className={`lp-input ${detectedRole ? `lp-input--${detectedRole} lp-input--valid` : ""} ${fieldErrors.username ? "lp-input--invalid" : ""}`}
                    placeholder="Email address or username"
                    value={credentials.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    autoComplete="username"
                    autoFocus
                    required
                  />
                </div>
                {fieldErrors.username ? (
                  <p className="lp-field-error">{fieldErrors.username}</p>
                ) : accountStatus === "Pending" ? (
                  <p className="lp-hint" style={{ color: "#d97706", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={14} /> Your account is awaiting admin activation. Please check back later.
                  </p>
                ) : accountStatus === "Rejected" ? (
                  <div className="lp-hint" style={{ color: "#dc2626", fontWeight: "600", padding: '8px', background: 'rgba(220,38,38,0.05)', borderRadius: '6px', marginTop: '4px' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                       <AlertCircle size={14} /> <span>Account Rejected</span>
                    </div>
                    {rejectionReason && <p style={{ fontWeight: '400', fontSize: '12px', marginTop: '2px', fontStyle: 'italic' }}>Reason: {rejectionReason}</p>}
                  </div>
                ) : (
                  <p className="lp-hint">Any email or username registered in the system</p>
                )}
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
                    className={`lp-input ${fieldErrors.password ? "lp-input--invalid" : ""}`}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onKeyDown={handleCapsLock}
                    onKeyUp={handleCapsLock}
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
                {fieldErrors.password && <p className="lp-field-error">{fieldErrors.password}</p>}
                {capsLockOn && !fieldErrors.password && (
                  <p className="lp-caps-warning">
                    <AlertCircle size={12} /> Caps Lock is ON
                  </p>
                )}
              </div>

              {/* Extras: Remember Me & Forgot link */}
              <div className="lp-extras">
                <label className="lp-remember">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)} 
                  />
                  <span>Remember me</span>
                </label>
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
                className={`lp-btn ${detectedRole ? `lp-btn--${detectedRole}` : ""} ${["Pending", "Rejected"].includes(accountStatus) ? "lp-btn--pending" : ""}`}
                disabled={loading || ["Pending", "Rejected"].includes(accountStatus)}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="lp-spinner" />
                    Signing in…
                  </>
                ) : accountStatus === "Pending" ? (
                  "Awaiting Activation"
                ) : accountStatus === "Rejected" ? (
                  "Account Rejected"
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
