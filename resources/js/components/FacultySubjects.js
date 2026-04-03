import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Users, X, Check, Save } from "lucide-react";
import "../../sass/faculty-dashboard.scss";

export default function FacultySubjects({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    fetchSubjects();
    fetchAllStudents();
  }, [user]);

  const fetchSubjects = () => {
    axios.get(`/api/faculty/${user.id}/subjects`)
      .then(res => setSubjects(res.data))
      .catch(console.error);
  };

  const fetchAllStudents = () => {
    axios.get(`/api/faculty/${user.id}/students`)
      .then(res => setAllStudents(res.data))
      .catch(console.error);
  };

  const handleManageStudents = (subject) => {
    setSelectedSubject(subject);
    setEnrolledStudents(subject.students || []);
    // Fetch fresh enrolled students to be sure
    axios.get(`/api/subjects/${subject.id}`)
      .then(res => setEnrolledStudents(res.data.students || []))
      .catch(console.error);
  };

  const enrollStudent = async (studentId) => {
    try {
      await axios.post(`/api/subjects/${selectedSubject.id}/enroll`, { student_id: studentId });
      // Update local state
      const student = allStudents.find(s => s.id === studentId);
      setEnrolledStudents([...enrolledStudents, student]);
    } catch (err) {
      alert("Failed to enroll student.");
    }
  };

  const unenrollStudent = async (studentId) => {
    if(!confirm("Are you sure you want to unenroll this student?")) return;
    try {
      await axios.post(`/api/subjects/${selectedSubject.id}/unenroll`, { student_id: studentId });
      setEnrolledStudents(enrolledStudents.filter(s => s.id !== studentId));
    } catch (err) {
      alert("Failed to unenroll student.");
    }
  };

  const filteredAllStudents = allStudents.filter(s => {
    const isEnrolled = enrolledStudents.some(es => es.id === s.id);
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.student_id.toLowerCase().includes(searchQuery.toLowerCase());
    return !isEnrolled && matchesSearch;
  });

  return (
    <div className="faculty-dash">
      <div className="dash-header">
        <h2>My Subjects</h2>
        <p className="subtitle">Manage enrollment for your assigned subjects</p>
      </div>

      {!selectedSubject ? (
        <div className="subject-grid-container">
          {subjects.length === 0 ? (
            <div className="empty-state">No subjects assigned to you.</div>
          ) : (
            <div className="subject-cards">
              {subjects.map(s => (
                <div key={s.id} className="subject-card">
                  <div className="subject-header">
                    <span className="subject-code">{s.code}</span>
                  </div>
                  <h4 className="subject-name">{s.name}</h4>
                  <div className="subject-meta">
                    <span>📅 {s.schedule_day || "TBA"}</span>
                    <span>🕐 {s.time_start || "—"} - {s.time_end || "—"}</span>
                  </div>
                  <button className="btn-manage" onClick={() => handleManageStudents(s)}>
                    <Users size={16} /> Manage Students
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="manage-enrollment">
          <button className="btn-back" onClick={() => setSelectedSubject(null)}>← Back to Subjects</button>
          
          <div className="management-header">
            <div className="subject-info-title">
              <h3>{selectedSubject.code}: {selectedSubject.name}</h3>
              <span className="enrolled-count">{enrolledStudents.length} Students Enrolled</span>
            </div>
          </div>

          <div className="enrollment-grid">
            <div className="enrolled-section">
              <h4>Currently Enrolled</h4>
              <div className="student-list">
                {enrolledStudents.length === 0 ? (
                  <p className="empty-small">No students enrolled.</p>
                ) : (
                  enrolledStudents.map(s => (
                    <div key={s.id} className="student-item enrolled">
                      <div className="item-info">
                        <span className="item-name">{s.first_name} {s.last_name}</span>
                        <span className="item-id">{s.student_id}</span>
                      </div>
                      <button className="btn-remove" onClick={() => unenrollStudent(s.id)} title="Unenroll">
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="available-section">
              <h4>Available Students ({user?.department})</h4>
              <div className="search-mini">
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search students to add..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="student-list">
                {filteredAllStudents.length === 0 ? (
                  <p className="empty-small">No other students found in your department.</p>
                ) : (
                  filteredAllStudents.map(s => (
                    <div key={s.id} className="student-item available">
                      <div className="item-info">
                        <span className="item-name">{s.first_name} {s.last_name}</span>
                        <span className="item-id">{s.student_id}</span>
                      </div>
                      <button className="btn-add-mini" onClick={() => enrollStudent(s.id)} title="Enroll">
                        <Check size={16} /> Enroll
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
