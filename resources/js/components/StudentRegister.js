import React, { useState, useEffect } from "react";
import axios from "axios";
import { GraduationCap, ArrowLeft, Eye, EyeOff, CheckCircle, BookOpen } from "lucide-react";
// import "../../sass/student-register.scss";

export default function StudentRegister({ onBackToLogin }) {
  const [form, setForm] = useState({
    name: "",
    student_id: "",
    email: "",
    course: "",
    department: "",
    year_level: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await axios.post("/api/student/register", form);
      if (res.data?.success) {
        setSuccess({
          message: res.data.message,
          studentId: res.data.student_id,
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
      <div className="register-page">
        <div className="register-card success-card">
          <CheckCircle size={64} className="success-icon" />
          <h2>Registration Successful!</h2>
          <p className="success-message">Your account has been created for **{form.name}**.</p>
          <div className="id-display">
            <span className="id-label">Student ID:</span>
            <span className="id-value">{success.studentId}</span>
          </div>
          <p className="info-text">
            Your account is currently **Pending**. Please wait for an administrator to verify and activate your account before you can log in.
          </p>
          <button className="btn-back" onClick={onBackToLogin}>
            <ArrowLeft size={18} /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <button className="back-link" onClick={onBackToLogin}>
            <ArrowLeft size={18} /> Back to Login
          </button>
          <div className="header-brand">
            <GraduationCap size={36} strokeWidth={1.5} className="brand-icon" />
            <div>
              <h1>Student Registration</h1>
              <p>UniSys — University Management System</p>
            </div>
          </div>
        </div>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Juan D. Dela Cruz" 
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} 
              required 
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name[0]}</span>}
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>Student ID *</label>
              <input 
                type="text" 
                placeholder="e.g. 2024-0001" 
                value={form.student_id}
                onChange={e => setForm({...form, student_id: e.target.value})} 
                required 
              />
              {fieldErrors.student_id && <span className="field-error">{fieldErrors.student_id[0]}</span>}
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input 
                type="email" 
                placeholder="personal@email.com" 
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} 
                required 
              />
              {fieldErrors.email && <span className="field-error">{fieldErrors.email[0]}</span>}
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>Course *</label>
              <input 
                type="text" 
                placeholder="e.g. BS in Information Technology" 
                value={form.course}
                onChange={e => setForm({...form, course: e.target.value})} 
                required 
              />
              {fieldErrors.course && <span className="field-error">{fieldErrors.course[0]}</span>}
            </div>
            <div className="form-group">
              <label>Department *</label>
              <input 
                type="text" 
                placeholder="e.g. College of Computing" 
                value={form.department}
                onChange={e => setForm({...form, department: e.target.value})} 
                required 
              />
              {fieldErrors.department && <span className="field-error">{fieldErrors.department[0]}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Year Level *</label>
            <select 
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
            {fieldErrors.year_level && <span className="field-error">{fieldErrors.year_level[0]}</span>}
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>Password *</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                />
                <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error">{fieldErrors.password[0]}</span>}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input 
                type="password" 
                placeholder="Re-enter password"
                value={form.password_confirmation}
                onChange={e => setForm({...form, password_confirmation: e.target.value})} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registering..." : "Register as Student"}
          </button>
        </form>
      </div>
    </div>
  );
}
