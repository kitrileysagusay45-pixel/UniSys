import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, BookOpen, Building2 } from "lucide-react";
import "../../sass/faculty-dashboard.scss";

export default function FacultyDashboard({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    // Fetch faculty's subjects
    axios.get(`/api/faculty/${user.id}/subjects`).then(res => setSubjects(res.data)).catch(console.error);
    // Fetch students under department
    axios.get(`/api/faculty/${user.id}/students`).then(res => setStudentCount(res.data.length)).catch(console.error);
  }, [user]);

  return (
    <div className="faculty-dash">
      <div className="dash-header">
        <h2>Welcome, {user?.first_name || user?.name || "Faculty"}!</h2>
        <p className="subtitle">Faculty Dashboard — {user?.department || "Department"}</p>
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

      <div className="subjects-section">
        <h3>📚 Subject Overview</h3>
        {subjects.length === 0 ? (
          <p className="empty-state">No subjects assigned yet.</p>
        ) : (
          <div className="subject-cards">
            {subjects.map(s => (
              <div key={s.id} className="subject-card">
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
    </div>
  );
}
