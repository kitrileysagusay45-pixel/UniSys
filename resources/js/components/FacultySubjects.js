import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Users, X, Check, Save, Star, AlertCircle, FileText, Bell, Calendar, Info, AlertTriangle } from "lucide-react";
// import "../../sass/faculty-dashboard.scss";

export default function FacultySubjects({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("enrollment"); // "enrollment" or "grading"
  const [gradesMap, setGradesMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [saving, setSaving] = useState(false);

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

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const promises = enrolledStudents.map(student => {
        if (gradesMap[student.id]) {
          return axios.post('/api/faculty/post-grade', {
            student_id: student.id,
            subject_id: selectedSubject.id,
            faculty_id: user.id,
            grade: gradesMap[student.id],
            remarks: remarksMap[student.id] || "Passed",
            semester: selectedSubject.semester || "First Semester",
            academic_year: selectedSubject.academic_year || "2025-2026"
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      alert("Grades saved successfully!");
      setSelectedSubject(null);
    } catch (err) {
      console.error(err);
      alert("Error saving grades. Please check values.");
    } finally {
      setSaving(false);
    }
  };

  const filteredAllStudents = allStudents.filter(s => {
    const isEnrolled = enrolledStudents.some(es => es.id === s.id);
    const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
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
          
          <div className="management-header" style={{ marginBottom: '20px' }}>
            <div className="subject-info-title">
              <h3>{selectedSubject.code}: {selectedSubject.name}</h3>
              <span className="enrolled-count">{enrolledStudents.length} Students Enrolled</span>
            </div>
            <div className="view-toggle" style={{ display: 'flex', gap: '10px' }}>
              <button className={`toggle-btn ${viewMode === 'enrollment' ? 'active' : ''}`} onClick={() => setViewMode('enrollment')}>
                <Users size={16} /> Enrollment Management
              </button>
              <button className={`toggle-btn ${viewMode === 'grading' ? 'active' : ''}`} onClick={() => setViewMode('grading')}>
                <Star size={16} /> Final Grading (1.0-5.0)
              </button>
            </div>
          </div>

          {viewMode === 'enrollment' ? (
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
          ) : (
            <div className="grading-section shadow-premium" style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4>Final Grade Entry</h4>
                <button 
                  className="btn-save-grades" 
                  onClick={handleSaveGrades} 
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Save size={18} /> {saving ? "Saving..." : "Submit Final Grades"}
                </button>
              </div>
              <div className="grades-table-mini" style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Student Name</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '120px' }}>Grade (1.0-5.0)</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.student_id}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <input 
                            type="number" 
                            step="0.01" 
                            min="1.0" 
                            max="5.0" 
                            placeholder="0.00"
                            value={gradesMap[s.id] || ""}
                            onChange={e => setGradesMap({...gradesMap, [s.id]: e.target.value})}
                            style={{ width: '80px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select 
                            value={remarksMap[s.id] || "Passed"}
                            onChange={e => setRemarksMap({...remarksMap, [s.id]: e.target.value})}
                            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                          >
                            <option value="Passed">Passed</option>
                            <option value="Failed">Failed</option>
                            <option value="Incomplete">Incomplete</option>
                            <option value="Dropped">Dropped</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
