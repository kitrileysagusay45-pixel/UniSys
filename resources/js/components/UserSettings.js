import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Save, ShieldCheck, User as UserIcon } from 'lucide-react';
import Toast from './Toast';
import { useToast } from './useToast';

export default function UserSettings({ user }) {
  const { toasts, addToast, removeToast } = useToast();
  
  // Email Update State
  const [email, setEmail] = useState(user?.email || '');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password Change State
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Visibility States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    setUpdatingEmail(true);

    try {
      const res = await axios.post(
        '/api/user/profile/update',
        { user_id: user.id, email },
        { headers: { 'X-User-Id': user.id } }
      );
      
      if (res.data?.success) {
        setEmailSuccess('Email updated successfully!');
        addToast('Email updated successfully', 'success');
        
        const updatedUser = { ...user, email };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update email';
      setEmailError(msg);
      addToast(msg, 'error');
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setUpdatingPassword(true);

    try {
      const res = await axios.post(
        '/api/user/profile/change-password',
        { 
          user_id: user.id, 
          current_password: passwords.current_password,
          new_password: passwords.new_password,
          new_password_confirmation: passwords.new_password_confirmation
        },
        { headers: { 'X-User-Id': user.id } }
      );
      
      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully!');
        addToast('Password changed successfully', 'success');
        setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setPasswordError(msg);
      addToast(msg, 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2.5rem',
    border: '1px solid #f1f5f9',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    border: '2px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.6rem',
    color: '#475569',
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const btnStyle = (disabled, primary = true) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.85rem 2rem',
    borderRadius: '12px',
    backgroundColor: disabled ? '#cbd5e1' : (primary ? '#6366f1' : '#1e293b'),
    color: '#fff',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700,
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    boxShadow: disabled ? 'none' : `0 4px 6px -1px ${primary ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.2)'}`
  });

  return (
    <div className="user-settings-wrapper" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', padding: '1.25rem', borderRadius: '18px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
          <UserIcon size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>Account Settings</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '4px 0 0' }}>Manage your credentials and security preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        
        {/* Email Card */}
        <div style={cardStyle} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.25rem' }}>
            <div style={{ color: '#6366f1' }}><Mail size={24} /></div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', fontWeight: 800 }}>Primary Email Address</h3>
          </div>

          <form onSubmit={handleUpdateEmail}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Current Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                  onBlur={e => e.currentTarget.style.borderColor = '#f1f5f9'}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.75rem' }}>This email is used for login and official university communications.</p>
            </div>

            <button 
              type="submit" 
              disabled={updatingEmail || email === user?.email}
              style={btnStyle(updatingEmail || email === user?.email)}
            >
              <Save size={18} /> {updatingEmail ? 'Updating...' : 'Save Email Changes'}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div style={cardStyle} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.25rem' }}>
            <div style={{ color: '#6366f1' }}><ShieldCheck size={24} /></div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', fontWeight: 800 }}>Update Password</h3>
          </div>

          <form onSubmit={handleChangePassword}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    value={passwords.current_password}
                    onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                    required
                    style={{ ...inputStyle, paddingRight: '3rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showNew ? "text" : "password"} 
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                    required
                    style={{ ...inputStyle, paddingRight: '3rem' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNew(!showNew)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwords.new_password_confirmation}
                  onChange={(e) => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed #e2e8f0' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={14} color="#6366f1" /> Password must be at least 8 characters with letters and numbers.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={updatingPassword || !passwords.current_password || !passwords.new_password}
              style={btnStyle(updatingPassword || !passwords.current_password || !passwords.new_password, false)}
            >
              <Lock size={18} /> {updatingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
