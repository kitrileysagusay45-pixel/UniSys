import React, { useState } from "react";
import axios from "axios";
import { GraduationCap, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function StudentRegister({ onRegisterSuccess, onBackToLogin }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    course: "",
    department: "",
    year_level: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await axios.post("/api/student/register", form);
      if (res.data?.success) {
        sessionStorage.setItem("registrationSuccess", "Account created successfully! Please log in to continue.");
        window.location.href = "/login";
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setError(
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : "Registration failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'radial-gradient(circle at top right, #6366f1, #1e2a4a)', 
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <div className="register-card" style={{ 
        backgroundColor: '#ffffff', 
        padding: '2.5rem', 
        borderRadius: '16px', 
        width: '100%', 
        maxWidth: '640px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        position: 'relative', 
        zIndex: 10,
        border: '1px solid #e2e8f0'
      }}>
        <div className="register-header" style={{ marginBottom: '2rem' }}>
          <button className="lp-back-link" onClick={onBackToLogin} style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            marginBottom: '1.5rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#475569',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '0.6rem 1.25rem',
            borderRadius: '12px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#6366f1';
            e.currentTarget.style.background = '#fff';
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.transform = 'translateX(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#475569';
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <ArrowLeft size={16} strokeWidth={2.5} /> 
            <span>Back to Login</span>
          </button>
          <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              backgroundColor: '#eef2ff', 
              padding: '0.75rem', 
              borderRadius: '12px',
              color: '#4f46e5'
            }}>
              <GraduationCap size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>Student Registration</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '1rem' }}>Create your student account to get started</p>
            </div>
          </div>
        </div>

        {error && <div className="lp-error" role="alert" style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '0.9rem'
        }}>{error}</div>}

        <form onSubmit={handleSubmit} className="register-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>First Name *</label>
              <div className="lp-input-wrap">
                <input 
                  type="text" 
                  className={`lp-input ${fieldErrors.first_name ? "lp-input--invalid" : ""}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: fieldErrors.first_name ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    if(!fieldErrors.first_name) {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if(!fieldErrors.first_name) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="e.g. Juan" 
                  value={form.first_name}
                  onChange={e => setForm({...form, first_name: e.target.value})} 
                  required 
                />
              </div>
              {fieldErrors.first_name && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.first_name[0]}</span>}
            </div>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Last Name *</label>
              <div className="lp-input-wrap">
                <input 
                  type="text" 
                  className={`lp-input ${fieldErrors.last_name ? "lp-input--invalid" : ""}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: fieldErrors.last_name ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    if(!fieldErrors.last_name) {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if(!fieldErrors.last_name) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="e.g. Dela Cruz" 
                  value={form.last_name}
                  onChange={e => setForm({...form, last_name: e.target.value})} 
                  required 
                />
              </div>
              {fieldErrors.last_name && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.last_name[0]}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Email Address *</label>
              <div className="lp-input-wrap">
                <input 
                  type="email" 
                  className={`lp-input ${fieldErrors.email ? "lp-input--invalid" : ""}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: fieldErrors.email ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    if(!fieldErrors.email) {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if(!fieldErrors.email) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="personal@email.com" 
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})} 
                  required 
                />
              </div>
              {fieldErrors.email && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.email[0]}</span>}
            </div>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Phone Number *</label>
              <div className="lp-input-wrap">
                <input 
                  type="text" 
                  className={`lp-input ${fieldErrors.phone ? "lp-input--invalid" : ""}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: fieldErrors.phone ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    if(!fieldErrors.phone) {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if(!fieldErrors.phone) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="e.g. 09123456789" 
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  required 
                />
              </div>
              {fieldErrors.phone && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.phone[0]}</span>}
            </div>
          </div>

          <div className="lp-field">
            <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Home Address *</label>
            <div className="lp-input-wrap">
              <input 
                type="text" 
                className={`lp-input ${fieldErrors.address ? "lp-input--invalid" : ""}`}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: fieldErrors.address ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  if(!fieldErrors.address) {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if(!fieldErrors.address) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                placeholder="Full address" 
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})} 
                required 
              />
            </div>
            {fieldErrors.address && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.address[0]}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Course *</label>
              <div className="lp-input-wrap">
                <input 
                  type="text" 
                  className={`lp-input ${fieldErrors.course ? "lp-input--invalid" : ""}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: fieldErrors.course ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    if(!fieldErrors.course) {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if(!fieldErrors.course) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="e.g. BS in IT" 
                  value={form.course}
                  onChange={e => setForm({...form, course: e.target.value})} 
                  required 
                />
              </div>
              {fieldErrors.course && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.course[0]}</span>}
            </div>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Department *</label>
              <div className="lp-input-wrap">
                <input 
                  type="text" 
                  className={`lp-input ${fieldErrors.department ? "lp-input--invalid" : ""}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: fieldErrors.department ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    if(!fieldErrors.department) {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if(!fieldErrors.department) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="e.g. Computing" 
                  value={form.department}
                  onChange={e => setForm({...form, department: e.target.value})} 
                  required 
                />
              </div>
              {fieldErrors.department && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.department[0]}</span>}
            </div>
          </div>

          <div className="lp-field">
            <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Year Level *</label>
            <div className="lp-input-wrap">
              <select 
                className={`lp-input ${fieldErrors.year_level ? "lp-input--invalid" : ""}`}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: fieldErrors.year_level ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                  fontSize: '1rem',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  appearance: 'auto',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  if(!fieldErrors.year_level) {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if(!fieldErrors.year_level) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
                value={form.year_level} 
                onChange={e => setForm({...form, year_level: e.target.value})} 
                required
              >
                <option value="">Select Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Irregular">Irregular</option>
              </select>
            </div>
            {fieldErrors.year_level && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.year_level[0]}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Password *</label>
              <div className="lp-input-wrap" style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`lp-input ${fieldErrors.password ? "lp-input--invalid" : ""}`}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.75rem 0.75rem 1rem',
                    borderRadius: '10px',
                    border: fieldErrors.password ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    if(!fieldErrors.password) {
                      e.target.style.borderColor = '#6366f1';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if(!fieldErrors.password) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                />
                <button 
                  type="button" 
                  className="lp-pw-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#4f46e5'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {fieldErrors.password && <span className="lp-field-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{fieldErrors.password[0]}</span>}
            </div>
            <div className="lp-field" style={{ flex: 1 }}>
              <label className="lp-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>Confirm Password *</label>
              <div className="lp-input-wrap">
                <input 
                  type="password" 
                  className="lp-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Re-enter password"
                  value={form.password_confirmation}
                  onChange={e => setForm({...form, password_confirmation: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </div>

          <button type="submit" className="lp-btn-primary" disabled={loading} style={{ 
            marginTop: '1.5rem',
            padding: '0.875rem',
            borderRadius: '10px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)'
          }}
          onMouseOver={(e) => {
            if(!loading) {
              e.target.style.backgroundColor = '#4338ca';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.2)';
            }
          }}
          onMouseOut={(e) => {
            if(!loading) {
              e.target.style.backgroundColor = '#4f46e5';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)';
            }
          }}
          >
            {loading ? "Registering..." : "Create Student Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
