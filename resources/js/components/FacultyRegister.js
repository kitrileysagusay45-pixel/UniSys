import React, { useState } from "react";
import axios from "axios";
import { GraduationCap, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
// import "../../sass/faculty-register.scss";

export default function FacultyRegister({ onBackToLogin }) {
  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    age: "", sex: "", date_of_birth: "",
    email: "", phone: "", address: "",
    tin_number: "",
    password: "", password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDobChange = (dob) => {
    if (!dob) {
      setForm(prev => ({ ...prev, date_of_birth: "", age: "" }));
      return;
    }
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    setForm(prev => ({ ...prev, date_of_birth: dob, age: String(age) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await axios.post("/api/faculty/register", form);
      if (res.data?.success) {
        setSuccess({
          message: res.data.message,
          facultyId: res.data.faculty_id,
        });
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

  if (success) {
    return (
      <div className="register-page faculty">
        <div className="register-card success-card">
          <CheckCircle size={64} className="success-icon" />
          <h2>Registration Successful!</h2>
          <p className="success-message">{success.message}</p>
          <div className="id-display">
            <span className="id-label">Your Faculty ID:</span>
            <span className="id-value">{success.facultyId}</span>
          </div>
          <p className="info-text">Please save your Faculty ID. You will be able to login once an admin activates your account.</p>
          <button className="btn-back" onClick={onBackToLogin}>
            <ArrowLeft size={18} /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page faculty">
      <div className="register-card">
        <div className="register-header">
          <button className="back-link" onClick={onBackToLogin}>
            <ArrowLeft size={18} /> Back to Login
          </button>
          <div className="header-brand">
            <GraduationCap size={36} strokeWidth={1.5} className="brand-icon" />
            <div>
              <h1>Faculty Registration</h1>
              <p>UniSys — University Management System</p>
            </div>
          </div>
        </div>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <h3 className="section-title">👤 Personal Information</h3>
          <div className="form-row three-col">
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" placeholder="First Name" value={form.first_name}
                onChange={e => setForm({...form, first_name: e.target.value})} required />
              {fieldErrors.first_name && <span className="field-error">{fieldErrors.first_name[0]}</span>}
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input type="text" placeholder="Middle Name" value={form.middle_name}
                onChange={e => setForm({...form, middle_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" placeholder="Last Name" value={form.last_name}
                onChange={e => setForm({...form, last_name: e.target.value})} required />
              {fieldErrors.last_name && <span className="field-error">{fieldErrors.last_name[0]}</span>}
            </div>
          </div>

          <div className="form-row three-col">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" value={form.date_of_birth}
                onChange={e => handleDobChange(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" placeholder="Age" value={form.age} readOnly className="readonly" />
            </div>
            <div className="form-group">
              <label>Sex *</label>
              <select value={form.sex} onChange={e => setForm({...form, sex: e.target.value})} required>
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <h3 className="section-title">📞 Contact Information</h3>
          <div className="form-row two-col">
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" placeholder="email@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}
            </div>
            <div className="form-group">
              <label>Contact Number *</label>
              <input type="tel" placeholder="e.g. 09123456789" value={form.phone}
                maxLength="11"
                onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '')})} required />
              <small className="field-hint">{form.phone.length}/11 digits</small>
            </div>
          </div>
          <div className="form-group">
            <label>Address *</label>
            <input type="text" placeholder="Full Address" value={form.address}
              onChange={e => setForm({...form, address: e.target.value})} required />
          </div>

          <h3 className="section-title">📋 Employment Information</h3>
          <div className="form-group">
            <label>TIN Number *</label>
            <input type="text" placeholder="TIN Number" value={form.tin_number}
              onChange={e => setForm({...form, tin_number: e.target.value})} required />
            {fieldErrors.tin_number && <span className="field-error">{fieldErrors.tin_number[0]}</span>}
          </div>

          <h3 className="section-title">🔒 Account Security</h3>
          <div className="form-row two-col">
            <div className="form-group">
              <label>Password *</label>
              <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password[0]}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="password-wrapper">
                <input type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                  value={form.password_confirmation}
                  onChange={e => setForm({...form, password_confirmation: e.target.value})} required />
                <button type="button" className="toggle-pw" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register as Faculty"}
          </button>
        </form>
      </div>
    </div>
  );
}
