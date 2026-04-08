import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  User, Mail, Phone, MapPin, Shield, LogOut, Camera, 
  GraduationCap, Briefcase, LayoutDashboard, Users, 
  Building2, PieChart, Calendar, BookOpen, Clock, 
  ChevronRight, Key, Info, Activity, ListChecks
} from "lucide-react";
// import "../../sass/profile.scss";

export default function Profile({ user, onLogout }) {
  const [currentUser, setCurrentUser] = useState(user);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({ students: 0, faculties: 0, departments: 0 });
  const [activity, setActivity] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  const role = currentUser?.role || "admin";
  const fullName = `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim() || currentUser?.name || "User";
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  
  // Format IDs based on role requirements
  const formattedId = () => {
    if (role === "admin") return currentUser?.username || "ADM-2024-0001";
    if (role === "faculty") return currentUser?.faculty_id || "FAC-IT-001";
    if (role === "student") return currentUser?.student_id || "STU-2026-0001";
    return "—";
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    fetchRoleSpecificData();
  }, []);

  const fetchRoleSpecificData = async () => {
    setLoadingExtras(true);
    try {
      if (role === "admin") {
        const [countsRes, logsRes] = await Promise.all([
          axios.get("/api/dashboard-counts"),
          axios.get("/api/system/audit-logs")
        ]);
        setStats({
          students: countsRes.data.students || 0,
          faculties: countsRes.data.faculties || 0,
          departments: countsRes.data.departments || 0
        });
        setActivity((logsRes.data || []).slice(0, 4));
      } else if (role === "faculty") {
        const subRes = await axios.get(`/api/faculty/${currentUser.id}/subjects`);
        setSubjects(subRes.data || []);
      } else if (role === "student") {
        const subRes = await axios.get(`/api/student/${currentUser.id}/subjects`);
        setSubjects(subRes.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch profile extras:", err);
    } finally {
      setLoadingExtras(false);
    }
  };

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

  // ── Sub-Components ───────────────────────────────────────

  const LeftColumn = () => (
    <div className="profile-left-col">
      {/* Profile Card */}
      <div className="profile-card main-profile-card">
        <div className="profile-banner"></div>
        <div className="profile-info-summary">
          <div className="avatar-container">
            {currentUser?.profile_picture ? (
              <img src={currentUser.profile_picture} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar">{initials}</div>
            )}
            <label className="avatar-edit-overlay" htmlFor="photo-upload">
              <Camera size={14} />
              <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoUpload} hidden />
            </label>
          </div>
          <h2 className="profile-name">{fullName}</h2>
          <span className="role-badge">
            {role === "admin" ? "Administrator" : role === "faculty" ? "Faculty" : "Student"}
          </span>
          
          <div className="meta-rows">
            {role === "student" ? (
              <>
                <div className="meta-row">
                  <Shield size={16} /> 
                  <span>ID: {formattedId()}</span>
                </div>
                <div className="meta-row">
                  <BookOpen size={16} /> 
                  <span>{currentUser?.course || "BSCS"} - {currentUser?.department || "IT"}</span>
                </div>
                <div className="meta-row">
                  <GraduationCap size={16} /> 
                  <span>{currentUser?.year_level || "1st"} Year</span>
                </div>
              </>
            ) : (
              <>
                <div className="meta-row">
                  <Calendar size={16} /> 
                  <span>Member since {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : "2024"}</span>
                </div>
                <div className="meta-row">
                  <Phone size={16} /> 
                  <span>{currentUser?.phone || "No phone linked"}</span>
                </div>
                <div className="meta-row">
                  <MapPin size={16} /> 
                  <span>{currentUser?.address || "No address provided"}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="stat-strip">
          {role === "admin" ? (
            <>
              <div className="stat-item">
                <span className="stat-value">{stats.students}</span>
                <span className="stat-label">Total Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.faculties}</span>
                <span className="stat-label">Total Faculty</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.departments}</span>
                <span className="stat-label">Total Depts</span>
              </div>
            </>
          ) : role === "faculty" ? (
            <>
              <div className="stat-item">
                <span className="stat-value">{subjects.length}</span>
                <span className="stat-label">Subjects</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{subjects.reduce((acc, s) => acc + (s.students?.length || 0), 0)}</span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ fontSize: '0.75rem' }}>{currentUser?.department || "N/A"}</span>
                <span className="stat-label">Dept</span>
              </div>
            </>
          ) : (
            <>
               <div className="stat-item">
                <span className="stat-value">{subjects.length}</span>
                <span className="stat-label">Enrolled</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{currentUser?.year_level || "1st"}</span>
                <span className="stat-label">Year Level</span>
              </div>
              <div className="stat-item">
                <span className={`stat-value ${currentUser?.status?.toLowerCase() || 'enrolled'}`}>
                  {currentUser?.status || "Enrolled"}
                </span>
                <span className="stat-label">Status</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Links / Academic Info Panel */}
      <div className="profile-card quick-links-card">
        <div className="card-header">
          <h3>
            {role === "student" ? <Info size={18} /> : <LayoutDashboard size={18} />}
            {role === "student" ? "Academic Info" : "Quick Links"}
          </h3>
        </div>
        <div className="card-body">
          {role === "admin" && (
            <>
              <div className="link-item" onClick={() => window.location.href="/dashboard"}>
                <div className="link-left"><LayoutDashboard size={18} /> Dashboard</div>
                <ChevronRight size={16} className="chevron" />
              </div>
              <div className="link-item" onClick={() => window.location.href="/faculty"}>
                <div className="link-left"><Users size={18} /> Manage Faculty</div>
                <ChevronRight size={16} className="chevron" />
              </div>
              <div className="link-item" onClick={() => window.location.href="/students"}>
                <div className="link-left"><GraduationCap size={18} /> Manage Students</div>
                <ChevronRight size={16} className="chevron" />
              </div>
              <div className="link-item">
                <div className="link-left"><PieChart size={18} /> Reports</div>
                <ChevronRight size={16} className="chevron" />
              </div>
            </>
          )}
          {role === "faculty" && (
            <>
              <div className="link-item" onClick={() => window.location.href="/faculty-dashboard"}>
                <div className="link-left"><LayoutDashboard size={18} /> Dashboard</div>
                <ChevronRight size={16} className="chevron" />
              </div>
              <div className="link-item">
                <div className="link-left"><BookOpen size={18} /> My Subjects</div>
                <ChevronRight size={16} className="chevron" />
              </div>
              <div className="link-item">
                <div className="link-left"><Users size={18} /> My Students</div>
                <ChevronRight size={16} className="chevron" />
              </div>
            </>
          )}
          {role === "student" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
               <div className="link-item">
                  <div className="link-left"><Info size={18} /> Course: {currentUser?.course || "BSCS"}</div>
               </div>
               <div className="link-item">
                  <div className="link-left"><Building2 size={18} /> Dept: {currentUser?.department || "IT"}</div>
               </div>
               <div className="link-item">
                  <div className="link-left"><Calendar size={18} /> A.Y. 2025-2026</div>
               </div>
               <div className="link-item">
                  <div className="link-left"><Clock size={18} /> 1st Semester</div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* Left Column */}
        <LeftColumn />

        {/* Right Column */}
        <div className="profile-right-col">
          
          {/* Personal Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              <button className="edit-btn">Edit Profile</button>
            </div>
            <div className="card-body">
              <div className="info-field-grid">
                <div className="info-field">
                  <span className="field-label">Full Name</span>
                  <span className="field-value">{fullName}</span>
                </div>
                <div className="info-field">
                  <span className="field-label">
                    {role === "admin" ? "Username" : role === "faculty" ? "Employee ID" : "Student ID"}
                  </span>
                  <span className="field-value">{formattedId()}</span>
                </div>
                
                {role === "faculty" && (
                  <div className="info-field">
                    <span className="field-label">Department</span>
                    <span className="field-value">{currentUser?.department || "N/A"}</span>
                  </div>
                )}
                
                {role === "student" && (
                  <>
                    <div className="info-field">
                      <span className="field-label">Course</span>
                      <span className="field-value">{currentUser?.course || "BSCS"}</span>
                    </div>
                    <div className="info-field">
                      <span className="field-label">Department</span>
                      <span className="field-value">{currentUser?.department || "IT"}</span>
                    </div>
                    <div className="info-field">
                      <span className="field-label">Year Level</span>
                      <span className="field-value">{currentUser?.year_level || "1st"}</span>
                    </div>
                  </>
                )}

                <div className="info-field">
                  <span className="field-label">Role</span>
                  <span className="field-value">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </div>
                <div className="info-field">
                  <span className="field-label">Status</span>
                  <span className={`field-value ${currentUser?.status?.toLowerCase() || 'active'}`}>
                    {currentUser?.status || "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="profile-card">
            <div className="card-header">
              <h3>Contact Information</h3>
              <button className="edit-btn">Edit</button>
            </div>
            <div className="card-body">
              <div className="info-field-grid">
                <div className="info-field">
                  <span className="field-label">Email Address</span>
                  <span className="field-value link">{currentUser?.email || "—"}</span>
                </div>
                <div className="info-field">
                  <span className="field-label">Phone Number</span>
                  <span className="field-value">{currentUser?.phone || "—"}</span>
                </div>
                <div className="info-field" style={{ gridColumn: 'span 2' }}>
                  <span className="field-label">Home Address</span>
                  <span className="field-value">{currentUser?.address || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Specific Role-Specific Section */}
          {role === "admin" && (
            <div className="profile-card">
              <div className="card-header">
                <h3><Activity size={18} /> Recent Activity</h3>
              </div>
              <div className="card-body">
                <div className="activity-list">
                  {activity.length > 0 ? activity.map((log, i) => (
                    <div className="activity-item" key={i}>
                      <div className={`status-dot ${
                        log.action?.includes('login') ? 'login' : 
                        log.action?.includes('created') || log.action?.includes('new') ? 'record' : 
                        'config'
                      }`}></div>
                      <div className="activity-content">
                        <div className="activity-text">{log.action || "System processing"}</div>
                        <div className="activity-time">
                           <Clock size={12} /> {new Date(log.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <>
                      <div className="activity-item">
                        <div className="status-dot login"></div>
                        <div className="activity-content">
                          <div className="activity-text">Successful login to admin portal</div>
                          <div className="activity-time"><Clock size={12} /> Just now</div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="status-dot record"></div>
                        <div className="activity-content">
                          <div className="activity-text">Updated Department configurations</div>
                          <div className="activity-time"><Clock size={12} /> 2 hours ago</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {role === "faculty" && (
            <div className="profile-card">
              <div className="card-header">
                <h3><ListChecks size={18} /> Teaching Summary</h3>
              </div>
              <div className="card-body">
                <div className="summary-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject Name</th>
                        <th>Year Level</th>
                        <th style={{ textAlign: 'right' }}>Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.length > 0 ? subjects.map((s, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, color: '#0d2b5e' }}>{s.name}</td>
                          <td>{s.year_level || "1st Year"}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.students?.length || 0}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="empty-state">No subjects currently handled.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {role === "student" && (
            <div className="profile-card">
              <div className="card-header">
                <h3><BookOpen size={18} /> Enrolled Subjects</h3>
              </div>
              <div className="card-body">
                <div className="summary-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Subject</th>
                        <th>Faculty</th>
                        <th style={{ textAlign: 'right' }}>Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.length > 0 ? subjects.map((s, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>{s.code}</td>
                          <td>{s.name}</td>
                          <td>{s.faculty ? `${s.faculty.first_name} ${s.faculty.last_name}` : "TBA"}</td>
                          <td style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                            {s.schedule_day || "TBA"} {s.time_start || ""}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="4" className="empty-state">
                            No subjects enrolled yet. Contact your admin to enroll.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="profile-card action-buttons-card">
            <div className="card-body">
              <button className="btn-logout-full" onClick={onLogout}>
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

