import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Phone, MapPin, Shield, LogOut, Camera, GraduationCap, Briefcase } from "lucide-react";
import "../../sass/profile.scss";

export default function Profile({ user, onLogout }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const role = currentUser?.role || "admin";
  const displayName = currentUser?.name || `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || "User";
  const displayId = currentUser?.student_id || currentUser?.faculty_id || currentUser?.username || "—";

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("user_id", currentUser.id);

      await axios.post("/api/user/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (ev) => {
        const updated = { ...currentUser, profile_picture: ev.target.result };
        setCurrentUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("profileUpdated"));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const getRoleBadge = () => {
    const badges = { admin: "Administrator", faculty: "Faculty Member", student: "Student" };
    return badges[role] || "User";
  };

  const getRoleColor = () => {
    const colors = { admin: "#003366", faculty: "#0d7c66", student: "#1a5fb4" };
    return colors[role] || "#003366";
  };

  return (
    <div className="profile-container">
      <div className="profile-header-section">
        <div className="profile-cover" style={{ background: `linear-gradient(135deg, ${getRoleColor()}, ${getRoleColor()}88)` }}>
          <div className="cover-pattern"></div>
        </div>
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            {currentUser?.profile_picture ? (
              <img src={currentUser.profile_picture} alt="Profile" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <User size={48} />
              </div>
            )}
            <label className="avatar-upload" htmlFor="photo-upload">
              <Camera size={16} />
              <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoUpload} hidden />
            </label>
          </div>
          <div className="profile-name-section">
            <h2 className="profile-name">{displayName}</h2>
            <span className="role-badge" style={{ background: getRoleColor() }}>{getRoleBadge()}</span>
          </div>
        </div>
      </div>

      <div className="profile-body">
        <div className="info-card">
          <h3><User size={20} /> Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{displayName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{role === "student" ? "School ID" : role === "faculty" ? "Faculty ID" : "Username"}</span>
              <span className="info-value">{displayId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className="info-value">{getRoleBadge()}</span>
            </div>
            {currentUser?.sex && (
              <div className="info-item">
                <span className="info-label">Sex</span>
                <span className="info-value">{currentUser.sex}</span>
              </div>
            )}
            {currentUser?.date_of_birth && (
              <div className="info-item">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">{currentUser.date_of_birth}</span>
              </div>
            )}
          </div>
        </div>

        <div className="info-card">
          <h3><Mail size={20} /> Contact Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{currentUser?.email || "—"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{currentUser?.phone || "—"}</span>
            </div>
            <div className="info-item full-width">
              <span className="info-label">Address</span>
              <span className="info-value">{currentUser?.address || "—"}</span>
            </div>
          </div>
        </div>

        {role === "student" && (
          <div className="info-card">
            <h3><GraduationCap size={20} /> Academic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Course</span>
                <span className="info-value">{currentUser?.course || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{currentUser?.department || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Section</span>
                <span className="info-value">{currentUser?.section || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {role === "faculty" && (
          <div className="info-card">
            <h3><Briefcase size={20} /> Employment Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Department</span>
                <span className="info-value">{currentUser?.department || "—"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Position</span>
                <span className="info-value">{currentUser?.position || "—"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="signout-section">
          <button className="btn-signout" onClick={onLogout}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
