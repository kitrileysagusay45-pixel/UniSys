import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Clock, MapPin, User, Calendar, FileText, Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import GradesView from "./GradesView";
// import "../../sass/student-dashboard.scss";

export default function StudentDashboard({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [activeSemester, setActiveSemester] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [viewingGrades, setViewingGrades] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const [subRes, annRes, setRes] = await Promise.all([
          axios.get(`/api/student/${user.id}/subjects`),
          axios.get('/api/announcements/dashboard'),
          axios.get('/api/system/settings')
        ]);
        
        setSubjects(subRes.data);
        setAnnouncements(annRes.data);
        if (setRes.data.active_semester) setActiveSemester(setRes.data.active_semester);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (viewingGrades) {
    return <GradesView studentId={user.id} onBack={() => setViewingGrades(false)} />;
  }

  return (
    <div className="student-dash">
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Welcome, {user?.name || user?.first_name || "Student"}!</h2>
          <p className="subtitle" style={{margin: 0}}>{user?.course || "Course"} — {user?.department || "Department"} | {user?.student_id}</p>
          {activeSemester && <p style={{margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b'}}>Semester: {activeSemester}</p>}
        </div>
        <div className="quick-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => setViewingGrades(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 16px', background: '#1a5fb4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(26, 95, 180, 0.2)' }}>
            <FileText size={18} /> View My Grades
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="enrolled-section">
          <h3><BookOpen size={22} /> Enrolled Subjects</h3>
          {subjects.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} className="empty-icon" />
              <p>No subjects enrolled yet.</p>
              <p className="empty-sub">Contact your admin to enroll in subjects.</p>
            </div>
          ) : (
            <div className="subject-grid">
              {subjects.map(s => (
                <div key={s.id} className="subject-card">
                  <div className="card-header">
                    <span className="subject-code">{s.code}</span>
                    <span className={`status-dot ${s.status?.toLowerCase()}`}></span>
                  </div>
                  <h4 className="subject-name">{s.name}</h4>

                  <div className="card-details">
                    <div className="detail-row">
                      <MapPin size={16} />
                      <span>Room: {s.room ? s.room.name : "TBA"}</span>
                    </div>
                    <div className="detail-row">
                      <Clock size={16} />
                      <span>
                        {s.schedule_day || "TBA"} 
                        {(s.time_start || s.time_end) ? ` | ${s.time_start} - ${s.time_end}` : ""}
                      </span>
                    </div>
                    <div className="detail-row">
                      <User size={16} />
                      <span>
                        {s.faculty
                          ? `${s.faculty.first_name} ${s.faculty.last_name}`
                          : "TBA"}
                      </span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className="semester">{s.semester || "—"}</span>
                    <span className="academic-year">{s.academic_year || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Announcements Widget */}
          <div className="activity-section shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '14px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}><Bell size={18} className="text-primary" /> Announcements</h3>
            {announcements.length > 0 ? (
              <div className="announcement-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map(ann => (
                  <div key={ann.id} className={`ann-item ${ann.type}`} style={{ padding: '10px', borderRadius: '8px', background: ann.type === 'urgent' ? '#fff1f2' : '#f8fafc', borderLeft: `4px solid ${ann.type === 'urgent' ? '#e11d48' : '#3b82f6'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      {ann.type === 'urgent' ? <AlertTriangle size={14} color="#e11d48" /> : <Info size={14} color="#3b82f6" />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: ann.type === 'urgent' ? '#9f1239' : '#1e40af' }}>{ann.title}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{ann.content}</p>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No new announcements.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
