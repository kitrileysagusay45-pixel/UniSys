import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Users, X, Check, Save, Star, AlertCircle, FileText, Bell, Calendar, Info, AlertTriangle, Send, Megaphone } from "lucide-react";

export default function FacultySubjects({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("enrollment");
  const [gradingPeriod, setGradingPeriod] = useState("prelim");
  const [gradesMap, setGradesMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [existingGrades, setExistingGrades] = useState({});
  const [saving, setSaving] = useState(false);
  // Announcement state
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annForm, setAnnForm] = useState({ title: '', content: '', type: 'info', category: 'general_advisory' });
  const [annSaving, setAnnSaving] = useState(false);

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
    setViewMode("enrollment");
    axios.get(`/api/subjects/${subject.id}`)
      .then(res => setEnrolledStudents(res.data.students || []))
      .catch(console.error);
  };

  const handleGradeView = (subject) => {
    setSelectedSubject(subject);
    setViewMode("grading");
    setGradingPeriod("prelim");
    axios.get(`/api/subjects/${subject.id}`)
      .then(res => setEnrolledStudents(res.data.students || []))
      .catch(console.error);
    // Fetch existing grades
    axios.get(`/api/faculty/section-grades/${subject.id}`)
      .then(res => {
        const map = {};
        (res.data.grades || []).forEach(g => { map[g.student_id] = g; });
        setExistingGrades(map);
      })
      .catch(console.error);
  };

  const enrollStudent = async (studentId) => {
    try {
      await axios.post(`/api/subjects/${selectedSubject.id}/enroll`, { student_id: studentId });
      const student = allStudents.find(s => s.id === studentId);
      setEnrolledStudents([...enrolledStudents, student]);
    } catch { alert("Failed to enroll student."); }
  };

  const unenrollStudent = async (studentId) => {
    if (!confirm("Are you sure you want to unenroll this student?")) return;
    try {
      await axios.post(`/api/subjects/${selectedSubject.id}/unenroll`, { student_id: studentId });
      setEnrolledStudents(enrolledStudents.filter(s => s.id !== studentId));
    } catch { alert("Failed to unenroll student."); }
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
            grading_period: gradingPeriod,
            grade: gradesMap[student.id],
            remarks: remarksMap[student.id] || null,
            semester: selectedSubject.semester || "1st Semester",
            academic_year: selectedSubject.academic_year || "2025-2026"
          });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      alert(`${gradingPeriod.charAt(0).toUpperCase() + gradingPeriod.slice(1)} grades saved!`);
      setGradesMap({});
      // Refresh existing grades
      const res = await axios.get(`/api/faculty/section-grades/${selectedSubject.id}`);
      const map = {};
      (res.data.grades || []).forEach(g => { map[g.student_id] = g; });
      setExistingGrades(map);
    } catch (err) {
      console.error(err);
      alert("Error saving grades. Please check values.");
    } finally { setSaving(false); }
  };

  const handlePostAnnouncement = async () => {
    if (!annForm.title || !annForm.content) return alert("Title and content required.");
    setAnnSaving(true);
    try {
      await axios.post('/api/faculty/announcements', {
        ...annForm,
        faculty_id: user.id,
        target_role: 'student',
        section: selectedSubject?.section || null,
        department: user.department || null,
      });
      alert("Announcement posted!");
      setShowAnnForm(false);
      setAnnForm({ title: '', content: '', type: 'info', category: 'general_advisory' });
    } catch (err) {
      console.error(err);
      alert("Failed to post announcement.");
    } finally { setAnnSaving(false); }
  };

  const filteredStudents = allStudents.filter(s => {
    const isEnrolled = enrolledStudents.some(es => es.id === s.id);
    const matches = `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    return !isEnrolled && matches;
  });

  const getExistingGrade = (studentId, period) => {
    const g = existingGrades[studentId];
    return g ? g[period] : null;
  };

  const periodLabels = { prelim: 'Prelim', midterm: 'Midterm', finals: 'Finals' };

  return (
    <div className="faculty-dash">
      <div className="dash-header">
        <h2>My Subjects</h2>
        <p className="subtitle">Manage enrollment, grading, and announcements</p>
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
                    {s.section && <span style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{s.section}</span>}
                  </div>
                  <h4 className="subject-name">{s.name}</h4>
                  <div className="subject-meta">
                    <span>📅 {s.schedule_day || "TBA"}</span>
                    <span>🕐 {s.time_start || "—"} - {s.time_end || "—"}</span>
                    {s.units && <span>📊 {s.units} units</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn-manage" onClick={() => handleManageStudents(s)} style={{ flex: 1 }}>
                      <Users size={16} /> Students
                    </button>
                    <button onClick={() => handleGradeView(s)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                      <Star size={16} /> Grades
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="manage-enrollment">
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button className="btn-back" onClick={() => { setSelectedSubject(null); setExistingGrades({}); setGradesMap({}); }}>← Back</button>
            <button onClick={() => { setShowAnnForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              <Megaphone size={16} /> Post Announcement
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div>
              <h3>{selectedSubject.code}: {selectedSubject.name}</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{enrolledStudents.length} Students | {selectedSubject.section || 'No section'} | {selectedSubject.units || 3} units</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              {['enrollment', 'grading'].map(m => (
                <button key={m} className={`toggle-btn ${viewMode === m ? 'active' : ''}`} onClick={() => setViewMode(m)}
                  style={{ padding: '8px 16px', background: viewMode === m ? '#1a5fb4' : '#f1f5f9', color: viewMode === m ? '#fff' : '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  {m === 'enrollment' ? <><Users size={16} /> Enrollment</> : <><Star size={16} /> Grading</>}
                </button>
              ))}
            </div>
          </div>

          {/* Announcement Form Modal */}
          {showAnnForm && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAnnForm(false)}>
              <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', width: '500px', maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginTop: 0 }}>Post Announcement to {selectedSubject.section || selectedSubject.code}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input placeholder="Title" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <textarea placeholder="Content" rows={4} value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select value={annForm.type} onChange={e => setAnnForm({...annForm, type: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <option value="info">Info</option><option value="urgent">Urgent</option><option value="success">Success</option><option value="warning">Warning</option>
                    </select>
                    <select value={annForm.category} onChange={e => setAnnForm({...annForm, category: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <option value="general_advisory">General Advisory</option><option value="exam_schedule">Exam Schedule</option><option value="activity_notice">Activity Notice</option><option value="requirement_reminder">Requirement Reminder</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowAnnForm(false)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handlePostAnnouncement} disabled={annSaving} style={{ padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      <Send size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />{annSaving ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'enrollment' ? (
            <div className="enrollment-grid">
              <div className="enrolled-section">
                <h4>Currently Enrolled</h4>
                <div className="student-list">
                  {enrolledStudents.length === 0 ? <p className="empty-small">No students enrolled.</p> : (
                    enrolledStudents.map(s => (
                      <div key={s.id} className="student-item enrolled">
                        <div className="item-info">
                          <span className="item-name">{s.first_name} {s.last_name}</span>
                          <span className="item-id">{s.student_id}</span>
                        </div>
                        <button className="btn-remove" onClick={() => unenrollStudent(s.id)} title="Unenroll"><X size={16} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="available-section">
                <h4>Available Students ({user?.department})</h4>
                <div className="search-mini"><Search size={14} /><input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                <div className="student-list">
                  {filteredStudents.length === 0 ? <p className="empty-small">No students found.</p> : (
                    filteredStudents.map(s => (
                      <div key={s.id} className="student-item available">
                        <div className="item-info">
                          <span className="item-name">{s.first_name} {s.last_name}</span>
                          <span className="item-id">{s.student_id}</span>
                        </div>
                        <button className="btn-add-mini" onClick={() => enrollStudent(s.id)}><Check size={16} /> Enroll</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['prelim','midterm','finals'].map(p => (
                    <button key={p} onClick={() => { setGradingPeriod(p); setGradesMap({}); }}
                      style={{ padding: '8px 16px', background: gradingPeriod === p ? '#1a5fb4' : '#f1f5f9', color: gradingPeriod === p ? '#fff' : '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
                      {periodLabels[p]}
                    </button>
                  ))}
                </div>
                <button onClick={handleSaveGrades} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <Save size={18} /> {saving ? "Saving..." : `Submit ${periodLabels[gradingPeriod]} Grades`}
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Student</th>
                    <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Prelim</th>
                    <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Midterm</th>
                    <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Finals</th>
                    <th style={{ padding: '12px', textAlign: 'center', width: '90px' }}>Final</th>
                    <th style={{ padding: '12px', textAlign: 'center', width: '120px' }}>New Grade</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map(s => {
                    const eg = existingGrades[s.id];
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.student_id}</div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: eg?.prelim ? (eg.prelim <= 3 ? '#059669' : '#dc2626') : '#94a3b8' }}>
                          {eg?.prelim ? parseFloat(eg.prelim).toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: eg?.midterm ? (eg.midterm <= 3 ? '#059669' : '#dc2626') : '#94a3b8' }}>
                          {eg?.midterm ? parseFloat(eg.midterm).toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: eg?.finals ? (eg.finals <= 3 ? '#059669' : '#dc2626') : '#94a3b8' }}>
                          {eg?.finals ? parseFloat(eg.finals).toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: eg?.final_grade ? (eg.final_grade <= 3 ? '#059669' : '#dc2626') : '#94a3b8' }}>
                          {eg?.final_grade ? parseFloat(eg.final_grade).toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <input type="number" step="0.25" min="1.0" max="5.0" placeholder="0.00"
                            value={gradesMap[s.id] || ""}
                            onChange={e => setGradesMap({...gradesMap, [s.id]: e.target.value})}
                            style={{ width: '75px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center' }} />
                        </td>
                        <td style={{ padding: '12px' }}>
                          <select value={remarksMap[s.id] || (eg?.remarks || "")}
                            onChange={e => setRemarksMap({...remarksMap, [s.id]: e.target.value})}
                            style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                            <option value="">Auto</option>
                            <option value="Passed">Passed</option>
                            <option value="Failed">Failed</option>
                            <option value="Incomplete">Incomplete</option>
                            <option value="Dropped">Dropped</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
