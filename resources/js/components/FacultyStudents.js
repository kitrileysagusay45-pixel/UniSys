import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import "../../sass/faculty-dashboard.scss";

export default function FacultyStudents({ user }) {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/api/faculty/${user.id}/students`)
      .then(res => setStudents(res.data))
      .catch(console.error);
  }, [user]);

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const name = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    return name.includes(q) || (s.student_id || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
  });

  return (
    <div className="faculty-dash">
      <div className="dash-header">
        <h2>My Students</h2>
        <p className="subtitle">Students under {user?.department || "your department"}</p>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <span className="result-count">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="students-table-wrapper">
        <table className="students-table">
          <thead><tr>
            <th>School ID</th><th>Name</th><th>Course</th><th>Year Level</th><th>Section</th><th>Email</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="empty-cell">No students found</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="id-badge">{s.student_id}</span></td>
                  <td className="name-cell">{s.first_name} {s.last_name}</td>
                  <td>{s.course || "—"}</td>
                  <td>{s.year_level || "—"}</td>
                  <td>{s.section || "—"}</td>
                  <td>{s.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
