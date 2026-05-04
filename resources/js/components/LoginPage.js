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
  
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <span
        className="role-badge"
        style={{ 
          "--badge-color": color, 
          "--badge-bg": bg,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '700',
          backgroundColor: bg,
          color: color,
          textTransform: 'uppercase'
        }}
      >
        <Icon size={10} strokeWidth={2.5} />
        {label}
      </span>
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
  const [lookingUp, setLookingUp]   = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
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
        } else if (!cancelled) {
          setDetectedRole(null);
          setAccountStatus("Active");
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
    <div className="lp-root" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, #6366f1, #1e2a4a)', 
      position: 'relative',
      overflow: 'hidden'
    }}>

      <div className="lp-card" style={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: '1000px', 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        zIndex: 10
      }}>
        {/* ── Left Panel ── */}
        <aside className="lp-panel" style={{ 
          flex: 1, 
          backgroundColor: '#1e293b', 
          color: '#ffffff', 
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div className="lp-panel__inner" style={{ position: 'relative', zIndex: 2 }}>
            <div className="lp-logo" style={{ marginBottom: '2rem', color: '#6366f1' }}>
              <GraduationCap size={64} strokeWidth={1.5} />
            </div>
            <h1 className="lp-brand" style={{ fontSize: '3rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>UniSys</h1>
            <p className="lp-tagline" style={{ fontSize: '1.25rem', color: '#94a3b8', margin: '0.5rem 0 2rem', fontWeight: '500' }}>University Portal</p>
            <p className="lp-desc" style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '3rem' }}>
              A unified gateway for academic administration, faculty empowerment, and student success.
            </p>

            <ul className="lp-roles" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f1f5f9' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316' }}></span> Admin Dashboard
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f1f5f9' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span> Faculty Portal
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#f1f5f9' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span> Student Portal
              </li>
            </ul>
          </div>
          
          {/* Decorative rings (subtle) */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '200px', height: '200px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        </aside>

        {/* ── Right Panel (Form) ── */}
        <main className="lp-form-panel" style={{ flex: 1.2, padding: '4rem 3.5rem', backgroundColor: '#ffffff' }}>
          {showRoleSelection ? (
            <div className="lp-form-inner" style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="lp-form-header" style={{ marginBottom: '2.5rem' }}>
                <h2 className="lp-form-title" style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.5rem' }}>Join UniSys</h2>
                <p className="lp-form-sub" style={{ color: '#64748b', fontSize: '1.1rem' }}>Select your role to start your registration</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <button 
                  type="button" 
                  className="lp-role-btn" 
                  onClick={onStudentRegister} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#22c55e';
                    e.currentTarget.style.backgroundColor = '#f0fdf4';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}>
                      <User size={24} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Student</span>
                      <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Enroll in courses and view grades</span>
                    </div>
                  </div>
                </button>

                <button 
                  type="button" 
                  className="lp-role-btn" 
                  onClick={onFacultyRegister} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #f1f5f9',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#f1f5f9';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#dbeafe', color: '#2563eb', borderRadius: '12px' }}>
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>Faculty</span>
                      <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Manage subjects and evaluate students</span>
                    </div>
                  </div>
                </button>
              </div>

              <div>
                <button type="button" className="lp-link-back" onClick={() => setShowRoleSelection(false)} style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#1e293b'}
                onMouseOut={(e) => e.target.style.color = '#64748b'}
                >
                   &larr; Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <div className="lp-form-inner" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="lp-form-header" style={{ marginBottom: '2.5rem' }}>
                <h2 className="lp-form-title" style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.5rem' }}>Welcome Back</h2>
                <p className="lp-form-sub" style={{ color: '#64748b', fontSize: '1.1rem' }}>Please enter your details to sign in</p>
              </div>

              {error && (
                <div className="lp-error" style={{ 
                  padding: '1rem', 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fee2e2', 
                  color: '#dc2626', 
                  borderRadius: '12px', 
                  marginBottom: '1.5rem', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form className="lp-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="lp-field">
                  <label className="lp-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                    <span>Username or Email</span>
                    {lookingUp && <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                    {!lookingUp && <RoleBadge role={detectedRole} status={accountStatus} />}
                  </label>
                  <input
                    ref={usernameRef}
                    type="text"
                    className={`lp-input ${fieldErrors.username ? "lp-input--invalid" : ""}`}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.25rem',
                      borderRadius: '12px',
                      border: fieldErrors.username ? '2px solid #ef4444' : '2px solid #f1f5f9',
                      backgroundColor: '#f8fafc',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.backgroundColor = '#f8fafc';
                      e.target.style.borderColor = '#f1f5f9';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="e.g. juan.delacruz"
                    value={credentials.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    autoComplete="username"
                    autoFocus
                    required
                  />
                  {fieldErrors.username && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.username}</p>}
                </div>

                <div className="lp-field">
                  <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                    Password
                  </label>
                  <div className="lp-input-wrap" style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`lp-input ${fieldErrors.password ? "lp-input--invalid" : ""}`}
                      style={{
                        width: '100%',
                        padding: '0.875rem 3rem 0.875rem 1.25rem',
                        borderRadius: '12px',
                        border: fieldErrors.password ? '2px solid #ef4444' : '2px solid #f1f5f9',
                        backgroundColor: '#f8fafc',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.backgroundColor = '#ffffff';
                        e.target.style.borderColor = '#6366f1';
                        e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.borderColor = '#f1f5f9';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="••••••••"
                      value={credentials.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onKeyDown={handleCapsLock}
                      onKeyUp={handleCapsLock}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{fieldErrors.password}</p>}
                  {capsLockOn && <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} /> Caps Lock is ON</p>}
                </div>

                <div className="lp-extras" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: '#6366f1' }}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    backgroundColor: '#4f46e5', 
                    color: '#ffffff', 
                    border: 'none', 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    if(!loading) {
                      e.target.style.backgroundColor = '#4338ca';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if(!loading) {
                      e.target.style.backgroundColor = '#4f46e5';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>

                <div className="lp-footer" style={{ marginTop: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '1rem' }}>
                  Don't have an account? {' '}
                  <button 
                    type="button" 
                    onClick={() => setShowRoleSelection(true)} 
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
