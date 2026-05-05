import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Search, Archive, BookOpen, X, CheckCircle, AlertCircle, ChevronRight, UserCircle, BookMarked, Clock, MapPin, User, Calendar } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import { useToast } from "./useToast";

/* ─── Student Detail Panel ──────────────────────────────────────────────── */
function StudentDetailPanel({ student, allSubjects, facultyStudentCounts, onClose, onEnrolled, onArchive }) {
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState({});
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState(null);
  const { toasts, addToast } = useToast();

  const fetchEnrolled = useCallback(() => {
    setLoadingEnrolled(true);
    axios.get(`/api/subjects/student/${student.id}`)
      .then(res => setEnrolledSubjects(res.data))
      .catch(() => setEnrolledSubjects([]))
      .finally(() => setLoadingEnrolled(false));
  }, [student.id]);

  useEffect(() => { fetchEnrolled(); }, [fetchEnrolled]);

  const yearSubjects = allSubjects.filter(s => s.year_level === student.year_level);

  const toggleSubject = (subId, facultyId) => {
    setSelectedSubjectIds(prev => {
      const next = { ...prev };
      if (next[subId] !== undefined) { delete next[subId]; } 
      else { next[subId] = facultyId || null; }
      return next;
    });
  };

  const fmtTime = (t) => {
    if (!t) return "TBA";
    try {
      const [h, m] = t.split(":");
      const hr = parseInt(h, 10);
      const suffix = hr >= 12 ? "PM" : "AM";
      const hr12 = hr % 12 || 12;
      return `${hr12}:${m} ${suffix}`;
    } catch { return t; }
  };

  const handleSaveEnrollment = async () => {
    if (Object.keys(selectedSubjectIds).length === 0) {
      addToast("Please select at least one subject.", "error"); return;
    }
    setSaving(true);
    try {
      const res = await axios.post(`/api/students/${student.id}/bulk-enroll`, {
        subject_assignments: selectedSubjectIds,
      });
      setResults(res.data);
      fetchEnrolled();
      onEnrolled(res.data.student);
      setSelectedSubjectIds({});
      addToast("Enrollment successful!", "success");
      setShowEnrollModal(false); // Close modal on success
    } catch (err) {
      addToast(err.response?.data?.message || "Enrollment failed.", "error");
    } finally { setSaving(false); }
  };

  const alreadyEnrolledIds = enrolledSubjects.map(s => s.id);

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "520px", background: "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)", zIndex: 1000, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "1.5rem", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", padding: "10px" }}><UserCircle size={28} /></div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1.2rem" }}>{student.first_name} {student.last_name}</h3>
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>{student.student_id}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[student.course, student.year_level, student.section || "No Section"].map((v, i) => (
              <span key={i} style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>{v || "—"}</span>
            ))}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "8px", color: "#fff", cursor: "pointer", padding: "8px" }}><X size={20} /></button>
      </div>

      <div style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Enrolled Subjects */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "#1e293b" }}><BookMarked size={18} color="#6366f1" /> Enrolled Subjects</h4>
            <span style={{ background: "#eef2ff", color: "#6366f1", padding: "2px 10px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700 }}>{enrolledSubjects.length} subjects</span>
          </div>

          {loadingEnrolled ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>Loading...</div>
          ) : enrolledSubjects.length === 0 ? (
            <div style={{ background: "#fafafa", border: "2px dashed #e2e8f0", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
              <BookOpen size={36} color="#cbd5e1" style={{ marginBottom: "12px" }} />
              <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#334155" }}>No subjects enrolled</p>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Assign subjects to this student to get started.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {enrolledSubjects.map(s => (
                <div key={s.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "#eef2ff", color: "#6366f1", padding: "6px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0 }}>{s.code}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>{s.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                      {s.section && <span style={{ background: "#e0e7ff", color: "#4338ca", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>{s.section}</span>}
                      {s.faculty && <span>👨‍🏫 {s.faculty.first_name} {s.faculty.last_name}</span>}
                      {s.schedule_day && <span>📅 {s.schedule_day}</span>}
                      {s.time_start && <span>🕐 {fmtTime(s.time_start)}</span>}
                    </div>
                  </div>
                  <CheckCircle size={16} color="#10b981" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results after enrollment */}
        {results && (
          <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
            {results.enrolled?.length > 0 && (
              <div style={{ background: "#f0fdf4", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle size={18} color="#16a34a" />
                <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: 600 }}>{results.enrolled.length} subject(s) enrolled successfully!</span>
              </div>
            )}
            {results.skipped?.map((sk, i) => (
              <div key={i} style={{ background: "#fff7ed", padding: "10px 16px", display: "flex", alignItems: "flex-start", gap: "10px", borderTop: "1px solid #fed7aa" }}>
                <AlertCircle size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.8rem", color: "#9a3412" }}><strong>{sk.subject_code}</strong>: {sk.reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Assign Subjects Button */}
        <button
          onClick={() => { setShowEnrollModal(true); setResults(null); }}
          style={{ padding: "12px 20px", background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
        >
          <BookOpen size={18} /> {enrolledSubjects.length === 0 ? "Assign Subjects Now" : "Manage Subjects"}
          <ChevronRight size={16} />
        </button>

        {/* Archive */}
        <button
          onClick={() => onArchive(student)}
          style={{ padding: "10px 20px", background: "#fff", color: "#ef4444", border: "2px solid #fecaca", borderRadius: "10px", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <Archive size={16} /> Archive Student
        </button>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setShowEnrollModal(false)}>
          <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
              <div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.1rem" }}>Assign Subjects — {student.first_name} {student.last_name}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                  Showing {yearSubjects.length} subjects for <strong>{student.year_level}</strong>. {Object.keys(selectedSubjectIds).length} selected.
                </p>
              </div>
              <button onClick={() => setShowEnrollModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>

            {/* Subject Table */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {yearSubjects.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                  No subjects found for {student.year_level}.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                    <tr>
                      <th style={{ padding: "12px", width: "44px" }}></th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: "#475569" }}>Subject</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: "#475569" }}>Schedule</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: 700, color: "#475569" }}>Faculty / Load</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearSubjects.map(sub => {
                      const isEnrolled = alreadyEnrolledIds.includes(sub.id);
                      const isChecked = selectedSubjectIds[sub.id] !== undefined;
                      const load = sub.faculty ? (facultyStudentCounts[sub.faculty.id] || 0) : 0;
                      const atCap = load >= 50;
                      
                      return (
                        <tr key={sub.id} style={{ 
                          borderBottom: "1px solid #f1f5f9", 
                          background: isEnrolled ? "#f8fafc" : isChecked ? "#faf5ff" : "#fff", 
                          opacity: (atCap && !isEnrolled) || isEnrolled ? 0.7 : 1,
                          transition: "all 0.2s"
                        }}>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            {isEnrolled ? (
                              <div style={{ color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CheckCircle size={18} />
                              </div>
                            ) : (
                              <input type="checkbox" checked={isChecked} disabled={atCap || isEnrolled}
                                onChange={() => toggleSubject(sub.id, sub.faculty_id)}
                                style={{ cursor: (atCap || isEnrolled) ? "not-allowed" : "pointer", width: "17px", height: "17px", accentColor: "#6366f1" }}
                              />
                            )}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontWeight: 700, color: isEnrolled ? "#94a3b8" : "#1e293b" }}>{sub.code}</span>
                              {isEnrolled && (
                                <span style={{ background: "#ecfdf5", color: "#059669", padding: "1px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>Already Enrolled</span>
                              )}
                            </div>
                            <div style={{ color: isEnrolled ? "#cbd5e1" : "#64748b", fontSize: "0.78rem" }}>{sub.name}</div>
                            {sub.section && <span style={{ background: isEnrolled ? "#f1f5f9" : "#e0e7ff", color: isEnrolled ? "#94a3b8" : "#4338ca", padding: "1px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>{sub.section}</span>}
                          </td>
                          <td style={{ padding: "12px", color: isEnrolled ? "#cbd5e1" : "#64748b", fontSize: "0.8rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> {sub.schedule_day || "TBA"}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}><Clock size={14} /> {sub.time_start && sub.time_end ? `${fmtTime(sub.time_start)} – ${fmtTime(sub.time_end)}` : "—"}</div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            {sub.faculty ? (
                              <div>
                                <div style={{ fontWeight: 600, color: isEnrolled ? "#cbd5e1" : "#334155", fontSize: "0.82rem" }}>{sub.faculty.first_name} {sub.faculty.last_name}</div>
                                <div style={{ marginTop: "4px" }}>
                                  <span style={{ 
                                    background: isEnrolled ? "#f1f5f9" : atCap ? "#fee2e2" : "#f1f5f9", 
                                    color: isEnrolled ? "#cbd5e1" : atCap ? "#ef4444" : "#475569", 
                                    padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700 
                                  }}>
                                    {load}/50 {atCap ? "⚠ FULL" : "students"}
                                  </span>
                                </div>
                              </div>
                            ) : <span style={{ color: "#cbd5e1" }}>No faculty</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", background: "#fafafa" }}>
              <button onClick={() => setShowEnrollModal(false)} style={{ padding: "10px 20px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
              <button onClick={async () => { await handleSaveEnrollment(); }} disabled={saving || Object.keys(selectedSubjectIds).length === 0}
                style={{ 
                  padding: "10px 24px", 
                  background: Object.keys(selectedSubjectIds).length === 0 ? "#e2e8f0" : "linear-gradient(135deg,#22c55e,#16a34a)", 
                  color: Object.keys(selectedSubjectIds).length === 0 ? "#94a3b8" : "#fff", 
                  border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700,
                  boxShadow: Object.keys(selectedSubjectIds).length === 0 ? "none" : "0 4px 12px rgba(22,163,74,0.2)"
                }}>
                {saving ? "Saving..." : `Add Selected Subjects (${Object.keys(selectedSubjectIds).length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Students Component ───────────────────────────────────────────── */
export default function Students() {
  const { refreshCounts } = useCounts();
  const [students, setStudents] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [facultyStudentCounts, setFacultyStudentCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, title: "", message: "" });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchStudents = async () => {
    try { const res = await axios.get("/api/students"); setStudents(res.data); } catch (err) { console.error(err); }
  };
  const fetchSubjects = async () => {
    try { const res = await axios.get("/api/subjects"); setAllSubjects(res.data.filter(s => s.status === "Active")); } catch (err) { console.error(err); }
  };
  const fetchFacultyCounts = async () => {
    try { const res = await axios.get("/api/faculty/student-counts"); setFacultyStudentCounts(res.data); } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchStudents(); fetchSubjects(); fetchFacultyCounts();
  }, []);

  const filteredBySearch = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const name = `${s.first_name || ""} ${s.middle_name || ""} ${s.last_name || ""}`.toLowerCase();
    return name.includes(q) || (s.student_id || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
  });

  const filtered = filteredBySearch.filter(s => {
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesStatus && s.status !== "Archived";
  });

  const counts = {
    active: filteredBySearch.filter(s => s.status === "Active").length,
    all: filteredBySearch.filter(s => s.status !== "Archived").length
  };

  const STATUS_TABS = [
    { id: "Active", label: "Active", color: "#0F6E56", count: counts.active },
    { id: "All", label: "All", color: "#3C3489", count: counts.all },
  ];

  const handleArchive = (student) => {
    setConfirmModal({
      isOpen: true, type: "archive", id: student.id,
      title: "Archive Student",
      message: `Are you sure you want to archive ${student.first_name} ${student.last_name}?`
    });
  };

  const handleEnrolled = (updatedStudent) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s));
    if (selectedStudent?.id === updatedStudent.id) setSelectedStudent({ ...selectedStudent, ...updatedStudent });
    fetchFacultyCounts();
    refreshCounts();
    addToast("Subjects assigned successfully!", "success");
    window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div><h2>Student Management</h2><p className="subtitle">Click a student to view details and manage enrollment</p></div>
      </div>
      <div className="settings-content">
        <div className="settings-body">
          <div className="table-header">
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1, justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <h3>Students</h3>
                <div className="search-box" style={{ maxWidth: "250px" }}>
                  <Search size={18} className="search-icon" />
                  <input type="text" placeholder="Search Students" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {STATUS_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setStatusFilter(tab.id)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", border: statusFilter === tab.id ? "none" : "0.5px solid #e2e8f0", background: statusFilter === tab.id ? tab.color : "#fff", color: statusFilter === tab.id ? "#fff" : "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusFilter === tab.id ? "#fff" : tab.color }} />
                      {tab.label}
                      <span style={{ padding: "1px 7px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: statusFilter === tab.id ? "rgba(255,255,255,0.2)" : "#f1f5f9", color: statusFilter === tab.id ? "#fff" : "#64748b" }}>{tab.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Student ID</th><th>Name</th><th>Email</th><th>Course</th><th>Section</th><th>Year Level</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((s, index) => {
                  const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ") || s.name || "N/A";
                  const isActive = selectedStudent?.id === s.id;
                  return (
                    <tr key={s.id}
                      onClick={() => setSelectedStudent(isActive ? null : s)}
                      style={{ cursor: "pointer", background: isActive ? "#eef2ff" : undefined, borderLeft: isActive ? "3px solid #6366f1" : "3px solid transparent", transition: "all 0.15s" }}
                    >
                      <td>{index + 1}</td>
                      <td><span style={{ fontWeight: 700, color: "#6366f1" }}>{s.student_id}</span></td>
                      <td><span style={{ fontWeight: 600, color: "#1e293b" }}>{fullName}</span></td>
                      <td>{s.email}</td>
                      <td>{s.status === "Pending" && !s.course ? <span style={{ color: "#6366f1", fontSize: "12px" }}>Registered {new Date(s.created_at).toLocaleDateString()}</span> : (s.course || "—")}</td>
                      <td>
                        {s.section
                          ? <span style={{ background: "#e0e7ff", color: "#4338ca", padding: "2px 8px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700 }}>{s.section}</span>
                          : <span style={{ color: "#94a3b8" }}>—</span>
                        }
                      </td>
                      <td>{s.year_level || "—"}</td>
                      <td><span className={`status-badge ${(s.status || "").toLowerCase()}`}>{s.status}</span></td>
                      <td>
                        <div className="action-buttons" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setSelectedStudent(isActive ? null : s)}
                            title="View Details"
                            style={{ background: "#eef2ff", color: "#6366f1", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ChevronRight size={16} />
                          </button>
                          <button onClick={() => handleArchive(s)} title="Archive"
                            style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Archive size={16} color="white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Detail Side Panel */}
      {selectedStudent && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 999 }} onClick={() => setSelectedStudent(null)} />
          <StudentDetailPanel
            student={selectedStudent}
            allSubjects={allSubjects}
            facultyStudentCounts={facultyStudentCounts}
            onClose={() => setSelectedStudent(null)}
            onEnrolled={handleEnrolled}
            onArchive={(student) => { setSelectedStudent(null); handleArchive(student); }}
          />
        </>
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={async () => {
          try {
            await axios.patch(`/api/students/${confirmModal.id}/archive`);
            addToast("Student archived.", "info");
            await fetchStudents(); await refreshCounts();
            window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
          } catch { addToast("Action failed.", "error"); }
          setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" });
        }}
        onCancel={() => setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" })}
        confirmText="Archive"
      />
    </div>
  );
}
