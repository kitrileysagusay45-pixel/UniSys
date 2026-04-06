import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Clock, MapPin, User, Calendar, FileText } from "lucide-react";
import "../../sass/student-dashboard.scss";

export default function StudentDashboard({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [activeSemester, setActiveSemester] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/api/student/${user.id}/subjects`)
      .then(res => setSubjects(res.data))
      .catch(console.error);
      
    axios.get(`/api/system/settings`).then(res => {
      if (res.data.active_semester) setActiveSemester(res.data.active_semester);
      if (res.data.upcoming_events) setUpcomingEvents(res.data.upcoming_events);
    }).catch(console.error);
  }, [user]);

  return (
    <div className="student-dash">
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Welcome, {user?.name || user?.first_name || "Student"}!</h2>
          <p className="subtitle" style={{margin: 0}}>{user?.course || "Course"} — {user?.department || "Department"} | {user?.student_id}</p>
          {activeSemester && <p style={{margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b'}}>Semester: {activeSemester}</p>}
        </div>
        <div className="quick-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => window.history.pushState({}, '', '/student-profile')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#1a5fb4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><FileText size={16} /> View Grades</button>
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

        <div className="activity-section" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} /> Upcoming Events</h3>
          {upcomingEvents.length > 0 ? upcomingEvents.map((ev, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px', background: 'var(--hover-bg, #f8fafc)', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{ev.title}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-color, #3b82f6)', fontWeight: 600 }}>{ev.date}</span>
            </div>
          )) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #64748b)' }}>No upcoming events.</p>
          )}
        </div>
      </div>
    </div>
  );
}
