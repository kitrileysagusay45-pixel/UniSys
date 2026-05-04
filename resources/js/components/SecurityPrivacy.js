import React, { useState } from 'react';
import { Shield, Smartphone, Globe, Eye, Trash2, CheckCircle, AlertTriangle, Clock, MapPin } from 'lucide-react';
import Toast from './Toast';
import { useToast } from './useToast';

export default function SecurityPrivacy({ user }) {
  const { toasts, addToast, removeToast } = useToast();
  const [tfaEnabled, setTfaEnabled] = useState(false);
  
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Windows 11 • Chrome', location: 'Manila, PH', lastActive: 'Active now', current: true },
    { id: 2, device: 'iPhone 13 • Safari', location: 'Quezon City, PH', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'macOS Monterey • Firefox', location: 'Cebu, PH', lastActive: '3 days ago', current: false }
  ]);

  const handleRevokeSession = (id) => {
    setSessions(sessions.filter(s => s.id !== id));
    addToast('Session revoked successfully', 'success');
  };

  const handleToggleTFA = () => {
    setTfaEnabled(!tfaEnabled);
    addToast(`Two-factor authentication ${!tfaEnabled ? 'enabled' : 'disabled'}`, 'info');
  };

  const sectionStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '1rem'
  };

  const toggleStyle = (active) => ({
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: active ? '#6366f1' : '#e2e8f0',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s',
    border: 'none',
    padding: 0
  });

  const toggleCircleStyle = (active) => ({
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    position: 'absolute',
    top: '3px',
    left: active ? '23px' : '3px',
    transition: 'all 0.3s'
  });

  return (
    <div className="security-privacy-container" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Security & Privacy</h2>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Protect your account and manage your digital footprint.</p>
      </div>

      {/* Two-Factor Authentication */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <div style={{ background: '#eef2ff', color: '#6366f1', padding: '10px', borderRadius: '12px' }}>
            <Smartphone size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Two-Factor Authentication (2FA)</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Add an extra layer of security to your account.</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ marginTop: '2px' }}>
              {tfaEnabled ? <CheckCircle size={20} color="#10b981" /> : <AlertTriangle size={20} color="#f59e0b" />}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#334155' }}>Authentication App</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Use an app like Google Authenticator or Authy to get codes.</p>
            </div>
          </div>
          <button style={toggleStyle(tfaEnabled)} onClick={handleToggleTFA}>
            <div style={toggleCircleStyle(tfaEnabled)} />
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <div style={{ background: '#f0fdf4', color: '#10b981', padding: '10px', borderRadius: '12px' }}>
            <Globe size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Active Sessions</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Manage the devices where you're currently logged in.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sessions.map(session => (
            <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#94a3b8', marginTop: '4px' }}><Smartphone size={20} /></div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>
                    {session.device} {session.current && <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '8px', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>Current</span>}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {session.location}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {session.lastActive}
                    </span>
                  </div>
                </div>
              </div>
              {!session.current && (
                <button 
                  onClick={() => handleRevokeSession(session.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Preferences */}
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <div style={{ background: '#fff7ed', color: '#f59e0b', padding: '10px', borderRadius: '12px' }}>
            <Eye size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Privacy Settings</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Control who can see your profile and activity.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            { label: 'Public Profile', desc: 'Allow other students/faculty to find your profile.' },
            { label: 'Show Email Address', desc: 'Display your university email on your public profile.' },
            { label: 'Activity Status', desc: 'Show when you are active on the portal.' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.desc}</p>
              </div>
              <button style={toggleStyle(true)}>
                <div style={toggleCircleStyle(true)} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
