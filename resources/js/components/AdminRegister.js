import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Phone, MapPin, IdCard, Camera } from 'lucide-react';
import '../../sass/admin-register.scss';

// ...existing code...
export default function AdminRegister({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    tin: '',
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Ensure new accounts created here are admin (server must accept this)
      formDataToSend.append('role', 'admin');

      if (profilePicture) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      const response = await axios.post('/api/admin/register', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      if (response.data?.success) {
        alert('✅ Admin registration successful! Please login.');
        onBackToLogin();
      } else {
        // handle non-200 with message
        const msg = response.data?.message || 'Registration failed';
        setErrors({ form: msg });
      }
    } catch (err) {
      console.error('Registration error:', err);
      // parse validation errors commonly returned by Laravel / PHP APIs
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        setErrors(serverErrors);
      } else if (err?.response?.data?.message) {
        setErrors({ form: err.response.data.message });
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-register-page">
      <div className="admin-register-card">
        <div className="admin-register-content">
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
            <h2 className="form-title">Register</h2>

            {errors.form && <div className="admin-error-message">{errors.form}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
              {/* Profile Picture Upload */}
              <div className="profile-picture-upload">
                <div className="profile-picture-container">
                  <div className="profile-picture-preview">
                    {profilePicturePreview ? (
                      <img src={profilePicturePreview} alt="Profile Preview" />
                    ) : (
                      <User size={48} strokeWidth={1.5} />
                    )}
                  </div>
                  <label htmlFor="profile-picture-input" className="upload-button">
                    <Camera size={20} />
                    Upload Photo
                  </label>
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: 'none' }}
                  />
                </div>
                {errors.profile_picture && (
                  <span className="error-text">{Array.isArray(errors.profile_picture) ? errors.profile_picture[0] : errors.profile_picture}</span>
                )}
              </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              {errors.name && <span className="error-text">{errors.name[0]}</span>}
            </div>

            <div className="form-group">
              <label>
                <User size={18} />
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              {errors.username && <span className="error-text">{errors.username[0]}</span>}
            </div>

            <div className="form-group">
              <label>
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {errors.email && <span className="error-text">{errors.email[0]}</span>}
            </div>

            <div className="form-group">
              <label>
                <Phone size={18} />
                Contact Number
              </label>
              <input
                type="text"
                placeholder="Enter your contact number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              {errors.phone && <span className="error-text">{errors.phone[0]}</span>}
            </div>

            <div className="form-group">
              <label>
                <IdCard size={18} />
                TIN
              </label>
              <input
                type="text"
                placeholder="Enter your TIN"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
              />
              {errors.tin && <span className="error-text">{errors.tin[0]}</span>}
            </div>

            <div className="form-group form-full-width">
              <label>
                <MapPin size={18} />
                Address
              </label>
              <input
                type="text"
                placeholder="Enter your address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              {errors.address && <span className="error-text">{errors.address[0]}</span>}
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              {errors.password && <span className="error-text">{errors.password[0]}</span>}
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                required
              />
              {errors.password_confirmation && (
                <span className="error-text">{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</span>
              )}
            </div>
          </div>

              <button type="submit" className="admin-register-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </button>

              <div className="login-link">
                <p>
                  Already have an account?{' '}
                  <button type="button" onClick={onBackToLogin} className="link-button">
                    Login here
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