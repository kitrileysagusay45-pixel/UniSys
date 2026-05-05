import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Users, X, Check, Save, Star, AlertCircle, FileText, Bell, Calendar, Info, AlertTriangle, Send, Megaphone, GraduationCap, Mail } from "lucide-react";

export default function FacultySubjects({ user }) {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
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
    const handler = () => { fetchSubjects(); if (selectedSubject) refreshSubjectData(selectedSubject.id); };
    window.addEventListener('dataUpdated', handler);
    return () => window.removeEventListener('dataUpdated', handler);
  }, [user, selectedSubject?.id]);

  const fetchSubjects = () => {
    const profileId = user.profile_id || user.id;
    axios.get(`/api/faculty/${profileId}/subjects`)
      .then(res => setSubjects(res.data))
      .catch(console.error);
  };

  const refreshSubjectData = (subjectId) => {
    const profileId = user.profile_id || user.id;
    axios.get(`/api/subjects/${subjectId}?faculty_id=${profileId}`)
      .then(res => {
        setEnrolledStudents(res.data.students || []);
      })
      .catch(console.error);
  };

  const formatTime = (time) => {
    if (!time) return "TBA";
    try {
      const [hours, minutes] = time.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  const handleManageStudents = (subject) => {
    setSelectedSubject(subject);
    setViewMode("enrollment");
    refreshSubjectData(subject.id);
  };

  const handleGradeView = (subject) => {
    setSelectedSubject(subject);
    setViewMode("grading");
    setGradingPeriod("prelim");
    refreshSubjectData(subject.id);
    // Fetch existing grades
    axios.get(`/api/faculty/section-grades/${subject.id}`)
      .then(res => {
        const map = {};
        (res.data.grades || []).forEach(g => { map[g.student_id] = g; });
        setExistingGrades(map);
      })
      .catch(console.error);
  };

  const handleSaveGrades = async () => {
    setSaving(true);
    try {
      const promises = enrolledStudents.map(student => {
        if (gradesMap[student.id]) {
          return axios.post('/api/faculty/post-grade', {
            student_id: student.id,
            subject_id: selectedSubject.id,
            faculty_id: user.profile_id || user.id,
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
      window.dispatchEvent(new CustomEvent('dataUpdated'));
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
        faculty_id: user.profile_id || user.id,
        subject_id: selectedSubject.id,
        target_role: 'student',
        section: selectedSubject?.section || null,
        department: user.department || null,
      });
      alert("Announcement posted! Students in this subject will be notified.");
      setShowAnnForm(false);
      setAnnForm({ title: '', content: '', type: 'info', category: 'general_advisory' });
    } catch (err) {
      console.error(err);
      alert("Failed to post announcement.");
    } finally { setAnnSaving(false); }
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
                    <span title="Schedule Day">📅 {s.schedule_day || "TBA"}</span>
                    <span title="Class Time">🕐 {s.time_display || "TBA"}</span>
                    <span title="Assigned Room">📍 {s.room || "TBA"}</span>
                    {s.units && <span title="Credit Units">📊 {s.units} units</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button className="btn-manage" onClick={() => handleManageStudents(s)} style={{ flex: 1, position: 'relative' }}>
                      <Users size={16} /> Students
                      {s.enrolled_count > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#4f46e5', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>{s.enrolled_count}</span>}
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
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> {enrolledStudents.length} Students Enrolled</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {selectedSubject.section || 'N/A'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={14} /> {selectedSubject.units || 3} units</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {['enrollment', 'grading'].map(m => (
                <button key={m} className={`toggle-btn ${viewMode === m ? 'active' : ''}`} onClick={() => setViewMode(m)}
                  style={{ padding: '10px 20px', background: viewMode === m ? '#1e3a8a' : '#f1f5f9', color: viewMode === m ? '#fff' : '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  {m === 'enrollment' ? <><Users size={18} /> Enrollment</> : <><Star size={18} /> Grading Sheet</>}
                </button>
              ))}
            </div>
          </div>

          {/* Announcement Form Modal */}
          {showAnnForm && (
            <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAnnForm(false)}>
              <div className="modal-content" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', width: '550px', maxWidth: '95vw', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Post Announcement</h3>
                  <button onClick={() => setShowAnnForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>This announcement will be sent to all students enrolled in <strong>{selectedSubject.code}</strong>.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Announcement Title</label>
                    <input placeholder="e.g., Upcoming Quiz Reminder" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Content Message</label>
                    <textarea placeholder="Write your announcement details here..." rows={5} value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', resize: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Priority Type</label>
                      <select value={annForm.type} onChange={e => setAnnForm({...annForm, type: e.target.value})} style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', appearance: 'none', background: 'white' }}>
                        <option value="info">Information</option><option value="urgent">Urgent</option><option value="success">Success</option><option value="warning">Warning</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: '#475569' }}>Category</label>
                      <select value={annForm.category} onChange={e => setAnnForm({...annForm, category: e.target.value})} style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', appearance: 'none', background: 'white' }}>
                        <option value="general_advisory">General Advisory</option><option value="exam_schedule">Exam Schedule</option><option value="activity_notice">Activity Notice</option><option value="requirement_reminder">Requirement Reminder</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button onClick={() => setShowAnnForm(false)} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button onClick={handlePostAnnouncement} disabled={annSaving} style={{ padding: '12px 30px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {annSaving ? 'Posting...' : <><Send size={18} /> Publish Announcement</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'enrollment' ? (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} color="#1e40af" /> Currently Enrolled Students</h4>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{enrolledStudents.length} Students Total</span>
              </div>
              <div className="student-list-container" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>School ID</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Full Name</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Course & Year</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Section</th>
                      <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>Email Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          <GraduationCap size={48} style={{ opacity: 0.2, margin: '0 auto 12px', display: 'block' }} />
                          No students enrolled in this subject yet.
                        </td>
                      </tr>
                    ) : (
                      enrolledStudents.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 20px' }}><span className="id-badge" style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>{s.student_id}</span></td>
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1e293b' }}>{s.first_name} {s.last_name}</td>
                          <td style={{ padding: '16px 20px', color: '#64748b' }}>{s.course} - {s.year_level}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem' }}>{s.section || '—'}</span>
                          </td>
                          <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} /> {s.email}</div></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
                  {['prelim','midterm','finals'].map(p => (
                    <button key={p} onClick={() => { setGradingPeriod(p); setGradesMap({}); }}
                      style={{ padding: '10px 20px', background: gradingPeriod === p ? '#fff' : 'transparent', color: gradingPeriod === p ? '#1e3a8a' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800, textTransform: 'capitalize', boxShadow: gradingPeriod === p ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}>
                      {periodLabels[p]}
                    </button>
                  ))}
                </div>
                <button onClick={handleSaveGrades} disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}>
                  <Save size={20} /> {saving ? "Saving..." : `Submit ${periodLabels[gradingPeriod]} Grades`}
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '14px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Enrolled Student</th>
                      <th style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '90px' }}>Prelim</th>
                      <th style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '90px' }}>Midterm</th>
                      <th style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '90px' }}>Finals</th>
                      <th style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', width: '100px' }}>Final Grade</th>
                      <th style={{ padding: '14px', textAlign: 'center', color: '#1e40af', fontSize: '0.85rem', textTransform: 'uppercase', width: '130px', background: '#eff6ff' }}>{gradingPeriod} input</th>
                      <th style={{ padding: '14px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status / Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map(s => {
                      const eg = existingGrades[s.id];
                      const isPassing = (g) => g && parseFloat(g) <= 3.0;
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{s.first_name} {s.last_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{s.student_id} • {s.section}</div>
                          </td>
                          <td style={{ padding: '16px 14px', textAlign: 'center', fontWeight: 700, color: eg?.prelim ? (isPassing(eg.prelim) ? '#059669' : '#dc2626') : '#cbd5e1' }}>
                            {eg?.prelim ? parseFloat(eg.prelim).toFixed(2) : '—'}
                          </td>
                          <td style={{ padding: '16px 14px', textAlign: 'center', fontWeight: 700, color: eg?.midterm ? (isPassing(eg.midterm) ? '#059669' : '#dc2626') : '#cbd5e1' }}>
                            {eg?.midterm ? parseFloat(eg.midterm).toFixed(2) : '—'}
                          </td>
                          <td style={{ padding: '16px 14px', textAlign: 'center', fontWeight: 700, color: eg?.finals ? (isPassing(eg.finals) ? '#059669' : '#dc2626') : '#cbd5e1' }}>
                            {eg?.finals ? parseFloat(eg.finals).toFixed(2) : '—'}
                          </td>
                          <td style={{ padding: '16px 14px', textAlign: 'center', fontWeight: 800, fontSize: '1.1rem', background: '#f8fafc', color: eg?.final_grade ? (isPassing(eg.final_grade) ? '#059669' : '#dc2626') : '#cbd5e1' }}>
                            {eg?.final_grade ? parseFloat(eg.final_grade).toFixed(2) : '—'}
                          </td>
                          <td style={{ padding: '16px 14px', textAlign: 'center', background: '#eff6ff' }}>
                            <input type="number" step="0.25" min="1.0" max="5.0" placeholder="0.00"
                              value={gradesMap[s.id] || ""}
                              onChange={e => setGradesMap({...gradesMap, [s.id]: e.target.value})}
                              style={{ width: '85px', padding: '10px', border: '2px solid #bfdbfe', borderRadius: '10px', textAlign: 'center', fontWeight: 700, color: '#1e40af', outline: 'none' }} />
                          </td>
                          <td style={{ padding: '16px 14px' }}>
                            <select value={remarksMap[s.id] || (eg?.remarks || "")}
                              onChange={e => setRemarksMap({...remarksMap, [s.id]: e.target.value})}
                              style={{ padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: '10px', width: '120px', fontWeight: 600, color: (remarksMap[s.id] || eg?.remarks) === 'Passed' ? '#059669' : ((remarksMap[s.id] || eg?.remarks) === 'Failed' ? '#dc2626' : '#475569') }}>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
