import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Clock, MapPin, User } from "lucide-react";
import "../../sass/student-dashboard.scss";

export default function StudentDashboard({ user }) {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/api/student/${user.id}/subjects`)
      .then(res => setSubjects(res.data))
      .catch(console.error);
  }, [user]);

  return (
    <div className="student-dash">
      <div className="dash-header">
        <h2>Welcome, {user?.first_name || user?.name || "Student"}!</h2>
        <p className="subtitle">{user?.course || "Course"} — {user?.department || "Department"} | {user?.student_id}</p>
      </div>

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
    </div>
  );
}
