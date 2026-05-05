import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BookOpen, Clock, MapPin, User, CalendarDays, Hash } from "lucide-react";

export default function StudentSubjects({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    if (!user) return;
    const studentId = user.profile_id || user.id;
    try {
      const res = await axios.get(`/api/subjects/student/${studentId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubjects();
    // Listen for admin-triggered enrollment updates
    const handler = () => fetchSubjects();
    window.addEventListener("dataUpdated", handler);
    return () => window.removeEventListener("dataUpdated", handler);
  }, [fetchSubjects]);

  const fmtTime = (t) => {
    if (!t) return null;
    try {
      const [h, m] = t.split(":");
      const hr = parseInt(h, 10);
      const suffix = hr >= 12 ? "PM" : "AM";
      const hr12 = hr % 12 || 12;
      return `${hr12}:${m} ${suffix}`;
    } catch { return t; }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "#64748b", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "20px", height: "20px", border: "2px solid #e2e8f0", borderTop: "2px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        Loading subjects...
      </div>
    );
  }

  const totalUnits = subjects.reduce((sum, s) => sum + (parseInt(s.units) || 3), 0);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem", fontWeight: 800 }}>My Enrolled Subjects</h2>
          <p style={{ margin: "5px 0 0", color: "#64748b" }}>Your class schedule and assigned instructors</p>
        </div>
        {subjects.length > 0 && (
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ background: "#eef2ff", padding: "10px 16px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#6366f1" }}>{subjects.length}</div>
              <div style={{ fontSize: "0.72rem", color: "#4338ca", fontWeight: 700, textTransform: "uppercase" }}>Subjects</div>
            </div>
            <div style={{ background: "#f0fdf4", padding: "10px 16px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#16a34a" }}>{totalUnits}</div>
              <div style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 700, textTransform: "uppercase" }}>Total Units</div>
            </div>
          </div>
        )}
      </div>

      {subjects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: "1rem" }} />
          <h3 style={{ margin: "0 0 10px 0", color: "#334155", fontSize: "1.1rem" }}>No Enrolled Subjects</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>You have no enrolled subjects yet. Please contact your administrator for enrollment.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {subjects.map(sub => {
            const facultyName = sub.faculty ? `${sub.faculty.first_name} ${sub.faculty.last_name}` : "TBA";
            const timeDisplay = (sub.time_start && sub.time_end)
              ? `${fmtTime(sub.time_start)} – ${fmtTime(sub.time_end)}`
              : "TBA";
            const room = sub.room_id && sub.room ? sub.room.name || sub.room : sub.room || "TBA";

            return (
              <div key={sub.id} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s, transform 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#6366f1", background: "#eef2ff", padding: "4px 10px", borderRadius: "6px", display: "inline-block", marginBottom: "8px" }}>
                      {sub.code}
                    </span>
                    <h3 style={{ margin: 0, fontSize: "1rem", color: "#1e293b", fontWeight: 700 }}>{sub.name}</h3>
                    {sub.section && (
                      <span style={{ fontSize: "0.72rem", color: "#4338ca", background: "#e0e7ff", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, display: "inline-block", marginTop: "4px" }}>
                        {sub.section}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10b981" }}>{sub.units || 3}</span>
                    <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Units</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "0.875rem" }}>
                    <User size={15} color="#6366f1" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, minWidth: "70px" }}>Instructor:</span>
                    <span>{facultyName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "0.875rem" }}>
                    <CalendarDays size={15} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, minWidth: "70px" }}>Day:</span>
                    <span>{sub.schedule_day || "TBA"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "0.875rem" }}>
                    <Clock size={15} color="#14b8a6" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, minWidth: "70px" }}>Time:</span>
                    <span>{timeDisplay}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "0.875rem" }}>
                    <MapPin size={15} color="#ec4899" style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, minWidth: "70px" }}>Room:</span>
                    <span>{room}</span>
                  </div>
                  {sub.semester && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "0.875rem" }}>
                      <Hash size={15} color="#8b5cf6" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, minWidth: "70px" }}>Semester:</span>
                      <span>{sub.semester} {sub.academic_year ? `| ${sub.academic_year}` : ""}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
