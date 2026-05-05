import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Search, GraduationCap, Filter, Mail, UserCheck } from "lucide-react";

export default function FacultyStudents({ user }) {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      const profileId = user.profile_id || user.id;
      const res = await axios.get(`/api/faculty/${profileId}/subjects`);
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }, [user]);

  const fetchStudents = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const profileId = user.profile_id || user.id;
      const url = selectedSubjectId 
        ? `/api/faculty/${profileId}/students?subject_id=${selectedSubjectId}` 
        : `/api/faculty/${profileId}/students`;
      const res = await axios.get(url);
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedSubjectId]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    fetchStudents();
    const handler = () => { fetchSubjects(); fetchStudents(); };
    window.addEventListener("dataUpdated", handler);
    return () => window.removeEventListener("dataUpdated", handler);
  }, [fetchStudents, fetchSubjects]);

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    return name.includes(q) || (s.student_id || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
  });

  return (
    <div className="faculty-dash">
      <div className="dash-header">
        <div>
          <h2>My Students</h2>
          <p className="subtitle">All unique students enrolled across all subjects you handle</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "#eef2ff", padding: "12px 24px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: "1px solid #e0e7ff" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#4f46e5" }}>{students.length}</div>
            <div style={{ fontSize: "0.75rem", color: "#6366f1", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>Unique Students</div>
          </div>
        </div>
      </div>

      <div className="table-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search by name, ID, or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
            <select 
              value={selectedSubjectId} 
              onChange={e => setSelectedSubjectId(e.target.value)}
              style={{ padding: '10px 16px 10px 36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '0.9rem', outline: 'none', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="">All Assigned Subjects</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.code}: {sub.section || 'N/A'}</option>
              ))}
            </select>
          </div>
        </div>
        <span className="result-count" style={{ fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>Showing {filtered.length} records</span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem", color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '16px', fontWeight: 600 }}>Syncing student database...</p>
        </div>
      ) : (
        <div className="students-table-wrapper" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <table className="students-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>School ID</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student Name</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Course</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Year</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Section</th>
                <th style={{ textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email Contact</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
                    <div style={{ background: '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <UserCheck size={32} style={{ opacity: 0.4 }} />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#475569' }}>No student records found</p>
                    <p style={{ fontSize: '0.9rem' }}>{selectedSubjectId ? "Try selecting a different subject or clearing the filter." : "Once the admin enrolls students to your subjects, they will appear here."}</p>
                  </td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 20px' }}><span className="id-badge" style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontWeight: 800, color: '#1e293b', fontSize: '0.8rem' }}>{s.student_id}</span></td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{s.first_name} {s.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Student</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#475569' }}>{s.course || "—"}</td>
                  <td style={{ padding: '16px 20px', color: '#64748b' }}>{s.year_level || "—"}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {s.section
                      ? <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>{s.section}</span>
                      : <span style={{ color: '#cbd5e1' }}>—</span>
                    }
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                      <Mail size={14} /> {s.email}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
