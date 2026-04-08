import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, BookOpen, Building2, Plus, Calendar, Bell, Info, AlertTriangle, FileText } from "lucide-react";
// import "../../sass/faculty-dashboard.scss";

export default function FacultyDashboard({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [activeSemester, setActiveSemester] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const [subRes, stuRes, annRes, evRes, setRes] = await Promise.all([
          axios.get(`/api/faculty/${user.id}/subjects`),
          axios.get(`/api/faculty/${user.id}/students`),
          axios.get('/api/announcements/dashboard'),
          axios.get('/api/system/settings')
        ]);
        
        setSubjects(subRes.data);
        setStudentCount(stuRes.data.length);
        setAnnouncements(annRes.data);
        if (setRes.data.active_semester) setActiveSemester(setRes.data.active_semester);
      } catch (err) {
        console.error("Faculty Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="faculty-dash">
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Welcome, {user?.name || user?.first_name || "Faculty"}!</h2>
          <p className="subtitle" style={{margin: 0}}>Faculty Dashboard — {user?.department || "Department"}</p>
          {activeSemester && <p style={{margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b'}}>Semester: {activeSemester}</p>}
        </div>
        <div className="quick-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => window.history.pushState({}, '', '/faculty-subjects')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#0d7c66', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /> Add Grades</button>
          <button className="secondary-btn" onClick={() => window.history.pushState({}, '', '/faculty-subjects')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><Calendar size={16} /> View Schedule</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-info">
            <span className="stat-number">{studentCount}</span>
            <span className="stat-label">Students in Department</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><BookOpen size={28} /></div>
          <div className="stat-info">
            <span className="stat-number">{subjects.length}</span>
            <span className="stat-label">Subjects Assigned</span>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon"><Building2 size={28} /></div>
          <div className="stat-info">
            <span className="stat-number">{user?.department || "—"}</span>
            <span className="stat-label">Department</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="subjects-section">
          <h3>📚 Recent Subject Schedule</h3>
          {subjects.length === 0 ? (
            <p className="empty-state">No subjects assigned yet.</p>
          ) : (
            <div className="subject-cards">
              {subjects.map(s => (
                <div key={s.id} className="subject-card" onClick={() => window.history.pushState({}, '', '/faculty-subjects')} style={{cursor: 'pointer'}}>
                  <div className="subject-code">{s.code}</div>
                  <h4 className="subject-name">{s.name}</h4>
                  <div className="subject-meta">
                    {s.schedule_day && <span>📅 {s.schedule_day}</span>}
                    {(s.time_start || s.time_end) && (
                      <span>🕐 {s.time_start} - {s.time_end}</span>
                    )}
                    {s.room && <span>📍 {s.room.name}</span>}
                  </div>
                  <div className="subject-footer">
                    <span className="semester-badge">{s.semester || "—"}</span>
                    <span className="year-badge">{s.academic_year || "—"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sidebar-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Announcements Widget */}
          <div className="activity-section shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '14px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}><Bell size={18} color="#0d7c66" /> Announcements</h3>
            {announcements.length > 0 ? (
              <div className="announcement-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {announcements.map(ann => (
                  <div key={ann.id} style={{ padding: '10px', borderRadius: '8px', background: ann.type === 'urgent' ? '#fff1f2' : '#f0fdfa', borderLeft: `4px solid ${ann.type === 'urgent' ? '#e11d48' : '#0d7c66'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      {ann.type === 'urgent' ? <AlertTriangle size={14} color="#e11d48" /> : <Info size={14} color="#0d7c66" />}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: ann.type === 'urgent' ? '#9f1239' : '#065f46' }}>{ann.title}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>{ann.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No recent announcements.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
