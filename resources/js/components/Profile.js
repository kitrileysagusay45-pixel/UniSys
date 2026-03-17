import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Shield, Activity, Camera } from 'lucide-react';
import '../../sass/profile.scss';

export default function Profile({ user, onLogout }) {
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Admin User',
    username: user?.username || '',
    role: user?.role || 'Admin',
    personal_info: user?.phone || '',
    tin: user?.tin || '',
    address: user?.address || '',
    email: user?.email || '',
    account_created: user?.created_at || 'Recently',
    last_login: 'System Information',
    user_id: user?.username || 'Admin',
    account_status: 'Active',
    profile_picture: user?.profile_picture || null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [activities, setActivities] = useState([
    { action: 'Logged in', timestamp: '2024-10-20 01:30 AM', ip: '127.0.0.1' },
    { action: 'Updated profile', timestamp: '2024-10-19 03:45 PM', ip: '127.0.0.1' },
    { action: 'Changed settings', timestamp: '2024-10-19 10:20 AM', ip: '127.0.0.1' },
  ]);

  // 🧠 Helper function to normalize image paths
  const resolveImagePath = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage/')) return path;
    if (path.startsWith('storage/')) return `/${path}`;
    return `/storage/${path}`;
  };

  // ✅ Update profile data and picture preview when user changes
  useEffect(() => {
    if (user) {
      const newProfile = {
        ...profileData,
        name: user.name || 'Admin User',
        username: user.username || '',
        role: user.role || 'Admin',
        personal_info: user.phone || '',
        tin: user.tin || '',
        address: user.address || '',
        email: user.email || '',
        account_created: user.created_at || 'Recently',
        user_id: user.username || 'Admin',
        profile_picture: user.profile_picture || profileData.profile_picture,
      };
      setProfileData(newProfile);
      setFormData(newProfile);
      setProfilePicturePreview(resolveImagePath(user.profile_picture));
    }
  }, [user]);

  // ✅ Handle photo change (live preview)
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

  // ✅ Save profile changes
  const handleSave = async () => {
    if (!user || !user.id) {
      alert('❌ Error: User not found. Please log in again.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', user.id);
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('phone', formData.personal_info || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('tin', formData.tin || '');

      // 🟢 Only attach new photo if uploaded
      if (profilePicture instanceof File) {
        formDataToSend.append('profile_picture', profilePicture);
      }

      const response = await axios.post('/api/user/profile/update', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const updatedUser = response.data.user;

        // ✅ Preserve photo if none uploaded
        const newPhoto = updatedUser.profile_picture || profileData.profile_picture;
        const newProfileData = { ...formData, profile_picture: newPhoto };

        setProfileData(newProfileData);
        setFormData(newProfileData);
        setIsEditing(false);
        setProfilePicture(null);

        // ✅ Update preview
        setProfilePicturePreview(resolveImagePath(newPhoto));

        // ✅ Save to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // ✅ Notify layout of updated user
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { user: updatedUser } }));

        alert('✅ Profile updated successfully!');
      } else {
        alert('❌ Failed to update profile.');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('❌ Failed to update profile.');
    }
  };

  // ✅ Cancel edit
  const handleCancel = () => {
    setFormData({ ...profileData });
    setProfilePicture(null);
    setProfilePicturePreview(resolveImagePath(profileData.profile_picture));
    setIsEditing(false);
  };

  // ✅ Password change
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('❌ New passwords do not match!');
      return;
    }
    try {
      const res = await axios.post('/api/user/profile/change-password', {
        user_id: user.id,
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.confirm_password,
      });
      if (res.data.success) {
        alert('✅ Password changed successfully!');
        setShowChangePassword(false);
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      }
    } catch {
      alert('❌ Failed to change password.');
    }
  };


  return (
    <div className="profile-container">
      <div className="profile-header">
        <div>
          <h2>My Profile</h2>
          <p className="subtitle">Manage your account settings</p>
        </div>
        <button className="btn-edit-profile" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profile"
                  onError={(e) => {
                    console.error('Image failed:', profilePicturePreview);
                    e.target.style.display = 'none';
                    setProfilePicturePreview(null);
                  }}
                />
              ) : (
                <User size={48} strokeWidth={1.5} />
              )}
              {isEditing && (
                <label htmlFor="profile-picture-input" className="avatar-edit-btn">
                  <Camera size={16} />
                </label>
              )}
            </div>
            <input
              id="profile-picture-input"
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
            <div className="profile-info">
              <h3>{profileData.name}</h3>
              <p className="role-badge">{profileData.role}</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="info-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="info-grid-two-column">
            {/* Row 1: Full Name | Email Address */}
            <div className="info-field">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p>{profileData.name || 'Not set'}</p>
              )}
            </div>
            <div className="info-field">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <p>{profileData.email || 'Not set'}</p>
              )}
            </div>

            {/* Row 2: Contact Number | TIN */}
            <div className="info-field">
              <label>Contact Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.personal_info || ''}
                  onChange={(e) => setFormData({ ...formData, personal_info: e.target.value })}
                />
              ) : (
                <p>{profileData.personal_info || 'Not set'}</p>
              )}
            </div>
            <div className="info-field">
              <label>TIN</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.tin || ''}
                  onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                />
              ) : (
                <p>{profileData.tin || 'Not set'}</p>
              )}
            </div>

            {/* Row 3: Address (full width) */}
            <div className="info-field info-field-full">
              <label>Address</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              ) : (
                <p>{profileData.address || 'Not set'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>

        {/* Security Section - Change Password */}
        <div className="info-section">
          <div className="section-header">
            <h3 className="section-title">
              <Shield size={20} style={{verticalAlign: 'middle', marginRight: '8px'}} />
              Security Settings
            </h3>
          </div>
          
          {!showChangePassword ? (
            <button 
              className="btn-primary" 
              onClick={() => setShowChangePassword(true)}
              style={{marginTop: '1rem'}}
            >
              <Shield size={18} />
              Change Password
            </button>
          ) : (
            <div className="password-form-section">
              <div className="form-grid">
                <div className="form-field">
                  <label>Current Password *</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>New Password *</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="edit-actions" style={{marginTop: '1.5rem'}}>
                <button className="btn-cancel" onClick={() => {
                  setShowChangePassword(false);
                  setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
                }}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleChangePassword}>
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activity Button */}
        <div className="action-buttons-section">
          <button className="action-btn" onClick={() => setShowActivity(true)}>
            <Activity size={20} />
            View Activity Log
          </button>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivity && (
        <div className="modal-overlay" onClick={() => setShowActivity(false)}>
          <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Account Activity</h3>
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a, i) => (
                  <tr key={i}>
                    <td>{a.action}</td>
                    <td>{a.timestamp}</td>
                    <td>{a.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-actions">
              <button className="btn-submit" onClick={() => setShowActivity(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
