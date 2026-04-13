import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Search, Edit2, Archive, CheckCircle } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import { useToast } from "./useToast";
// import "../../sass/students.scss";

export default function Students() {
  const { refreshCounts } = useCounts();
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // Default to Pending
  const [departmentsList, setDepartmentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, title: "", message: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    student_id: "", first_name: "", middle_name: "", last_name: "",
    date_of_birth: "", age: "", sex: "", email: "", phone: "", address: "",
    department: "", course: "", year_level: "", section: "", status: "Pending",
  });

  const fetchStudents = async () => {
    try { const res = await axios.get("/api/students"); setStudents(res.data); } catch (err) { console.error(err); }
  };
  const fetchDepartments = async () => {
    try { const res = await axios.get("/api/departments"); setDepartmentsList(res.data.filter(d => d.status !== "Archived")); } catch (err) { console.error(err); }
  };
  const fetchCourses = async () => {
    try { const res = await axios.get("/api/courses"); setCoursesList(res.data.filter(c => c.status !== "Archived")); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchStudents(); fetchDepartments(); fetchCourses(); }, []);

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : null, date_of_birth: form.date_of_birth || null };
      if (editingId) {
        await axios.put(`/api/students/${editingId}`, payload);
        addToast('Student updated successfully!', 'success');
      }
      await fetchStudents();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
      closeForm();
    } catch (err) {
      const errs = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : '';
      addToast('Failed to save. ' + errs, 'error');
    }
  };

  const openForm = async (student) => {
    setEditingId(student.id);
    setForm({
      student_id: student.student_id || "", first_name: student.first_name || "",
      middle_name: student.middle_name || "", last_name: student.last_name || "",
      date_of_birth: student.date_of_birth || "", age: student.age != null ? String(student.age) : "",
      sex: student.sex || "", email: student.email || "", phone: student.phone || "",
      address: student.address || "", department: student.department || "",
      course: student.course || "", year_level: student.year_level || "",
      section: student.section || "", status: student.status || "Pending",
    });
    setActivityLogs([]);
    setShowRejectInput(false);
    setRejectionReason("");
    fetchDepartments();
    fetchCourses();
    setShowForm(true);

    try {
      const res = await axios.get(`/api/students/${student.id}`);
      if (res.data.activity_logs) {
        setActivityLogs(res.data.activity_logs);
      }
    } catch (err) { console.error("Failed to fetch logs", err); }
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleActivate = (student) => {
    setConfirmModal({
      isOpen: true, type: "success", id: student.id,
      title: "Activate Student",
      message: `Are you sure you want to activate ${student.first_name} ${student.last_name}? They will be able to login to the system.`,
    });
  };

  const handleArchive = (student) => {
    setConfirmModal({
      isOpen: true, type: "warning", id: student.id,
      title: "Archive Student",
      message: `Are you sure you want to archive ${student.first_name} ${student.last_name}?`,
    });
  };

  const confirmAction = async () => {
    const { type, id } = confirmModal;
    try {
      if (type === "success") {
        await axios.patch(`/api/students/${id}/activate`);
        addToast('Student activated!', 'success');
      } else if (type === "reject") {
        await axios.patch(`/api/students/${id}/reject`, { reason: rejectionReason });
        addToast('Student rejected.', 'info');
      } else {
        await axios.patch(`/api/students/${id}/archive`);
        addToast('Student archived.', 'info');
      }
      await fetchStudents();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
    } catch (err) { addToast('Action failed.', 'error'); }
    setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" });
    setShowRejectInput(false);
    closeForm();
  };

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await axios.patch("/api/students/bulk-activate", { ids: selectedIds });
      addToast(`${selectedIds.length} students activated!`, 'success');
      setSelectedIds([]);
      await fetchStudents();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
    } catch (err) {
      addToast('Bulk activation failed.', 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const pendings = filtered.filter(s => s.status === "Pending").map(s => s.id);
    if (selectedIds.length === pendings.length && pendings.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendings);
    }
  };

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
    pending: filteredBySearch.filter(s => s.status === "Pending").length,
    active: filteredBySearch.filter(s => s.status === "Active").length,
    rejected: filteredBySearch.filter(s => s.status === "Rejected").length,
    all: filteredBySearch.filter(s => s.status !== "Archived").length
  };

  const isPending = form.status === "Pending";
  const isRejected = form.status === "Rejected";

  // ── Tab Configuration ──────────────────────────────────────────────────────
  const STATUS_TABS_CONFIG = [
    { id: "Pending",  label: "Pending",  color: "#E9A800", count: counts.pending },
    { id: "Active",   label: "Active",   color: "#0F6E56", count: counts.active },
    { id: "Rejected", label: "Rejected", color: "#993C1D", count: counts.rejected },
    { id: "All",      label: "All",      color: "#3C3489", count: counts.all },
  ];

  function StatusTab({ id, label, color, count, isActive, onClick }) {
    return (
      <button
        type="button"
        onClick={() => onClick(id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "999px",
          border: isActive ? "none" : "0.5px solid #e2e8f0",
          background: isActive ? color : "#fff",
          color: isActive ? "#fff" : "#64748b",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          transition: "all 0.15s ease",
          boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <span style={{ 
          width: "6px", 
          height: "6px", 
          borderRadius: "50%", 
          background: isActive ? "#fff" : color 
        }} />
        <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{
          marginLeft: "2px",
          padding: "1px 7px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: "700",
          background: isActive ? "rgba(255,255,255,0.2)" : "#f1f5f9",
          color: isActive ? "#fff" : "#64748b",
        }}>
          {count}
        </span>
      </button>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div><h2>Student Management</h2><p className="subtitle">Manage students and their academic information</p></div>
      </div>
      <div className="settings-content">
        <div className="settings-body">
          <div className="table-header">
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
              <h3>Students</h3>
              <div className="search-box" style={{ maxWidth: "250px" }}>
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search Students" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="status-tabs-container" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {STATUS_TABS_CONFIG.map(tab => (
                  <StatusTab
                    key={tab.id}
                    {...tab}
                    isActive={statusFilter === tab.id}
                    onClick={setStatusFilter}
                  />
                ))}
              </div>
              
              {selectedIds.length > 0 && (
                <button className="btn-activate" onClick={handleBulkActivate} style={{ marginLeft: '1rem' }}>
                   <CheckCircle size={16} /> Approve {selectedIds.length} Selected
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={closeForm}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">
                  {isPending ? "Review & Activate Student" : "Edit Student"}
                  <span className="modal-header-id"> | {form.student_id}</span>
                </h3>
                <form onSubmit={handleSubmit} className="modal-form">
                  <h4 className="section-heading">📋 Personal Information {isPending && <span className="readonly-tag">Read-Only (from registration)</span>}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Student ID</label>
                      <input type="text" value={form.student_id} readOnly className="readonly" />
                    </div>
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" value={form.first_name} readOnly={isPending} className={isPending ? "readonly" : ""}
                        onChange={e => !isPending && setForm({ ...form, first_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" value={form.last_name} readOnly={isPending} className={isPending ? "readonly" : ""}
                        onChange={e => !isPending && setForm({ ...form, last_name: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input type="date" value={form.date_of_birth} readOnly={isPending} className={isPending ? "readonly" : ""}
                        onChange={e => !isPending && setForm({ ...form, date_of_birth: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Age</label>
                      <input type="number" value={form.age} readOnly className="readonly" />
                    </div>
                    <div className="form-group">
                      <label>Sex</label>
                      <input type="text" value={form.sex} readOnly={isPending} className={isPending ? "readonly" : ""}
                        onChange={e => !isPending && setForm({ ...form, sex: e.target.value })} />
                    </div>
                  </div>

                  <h4 className="section-heading">📞 Contact Information {isPending && <span className="readonly-tag">Read-Only</span>}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={form.email} readOnly={isPending} className={isPending ? "readonly" : ""}
                        onChange={e => !isPending && setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="tel" value={form.phone} readOnly={isPending} className={isPending ? "readonly" : ""}
                        onChange={e => !isPending && setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input type="text" value={form.address} readOnly={isPending} className={isPending ? "readonly" : ""}
                      onChange={e => !isPending && setForm({ ...form, address: e.target.value })} />
                  </div>

                  <h4 className="section-heading">🎓 Academic Information {isPending && <span className="editable-tag">Admin fills this</span>}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department *</label>
                      <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                        <option value="">Select Department</option>
                        {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Course *</label>
                      <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} required>
                        <option value="">Select Course</option>
                        {coursesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Year Level *</label>
                      <select value={form.year_level} onChange={e => setForm({ ...form, year_level: e.target.value })} required>
                        <option value="">Select Year Level</option>
                        {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Section</label>
                      <input type="text" placeholder="e.g. Section A" value={form.section}
                        onChange={e => setForm({ ...form, section: e.target.value })} />
                    </div>
                  </div>
                  <div className="modal-actions" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
                    {showRejectInput && isPending && (
                      <div className="rejection-input-area" style={{ marginBottom: "1rem", width: "100%", padding: '1rem', background: '#fff1f2', borderRadius: '8px' }}>
                        <label style={{ color: '#991b1b', fontWeight: 'bold' }}>Reason for rejection (optional)</label>
                        <textarea 
                          placeholder="Provide a reason for rejection..." 
                          value={rejectionReason} 
                          onChange={e => setRejectionReason(e.target.value)}
                          className="rejection-textarea"
                          style={{ width: '100%', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #fca5a5', padding: '0.5rem' }}
                        />
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                          <button type="button" className="btn-archive-action" style={{ background: '#ef4444' }} onClick={() => {
                            setConfirmModal({
                              isOpen: true, type: "reject", id: editingId,
                              title: "Confirm Rejection",
                              message: `Are you sure you want to reject ${form.first_name}'s registration?`
                            });
                          }}>Confirm Reject</button>
                          <button type="button" className="btn-cancel" onClick={() => setShowRejectInput(false)}>Cancel</button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {isPending && !showRejectInput && (
                          <button type="button" className="btn-archive-action" onClick={() => setShowRejectInput(true)} style={{ backgroundColor: '#ef4444', color: 'white' }}>
                            Reject Registration
                          </button>
                        )}
                        {!isPending && (
                           <button type="button" className="btn-archive-action" onClick={() => handleArchive({ id: editingId, first_name: form.first_name, last_name: form.last_name })}>
                             📦 Archive Student
                           </button>
                        )}
                        <button type="button" className="btn-cancel" onClick={closeForm}>Cancel</button>
                      </div>

                      {isPending ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <button type="button" className="btn-activate" 
                            disabled={!form.department || !form.course || !form.year_level}
                            onClick={() => {
                              const payload = { ...form, age: form.age ? parseInt(form.age) : null, date_of_birth: form.date_of_birth || null };
                              axios.put(`/api/students/${editingId}`, payload).then(() => {
                                handleActivate({ id: editingId, first_name: form.first_name, last_name: form.last_name });
                              }).catch(err => {
                                addToast('Failed to prepare for activation.', 'error');
                              });
                            }}>
                            <CheckCircle size={16} /> Activate Student
                          </button>
                          {(!form.department || !form.course || !form.year_level) && (
                            <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Fill in all required fields to activate</span>
                          )}
                        </div>
                      ) : (
                        <button type="submit" className="btn-submit">Update Student</button>
                      )}
                    </div>
                  </div>

                  {activityLogs.length > 0 && (
                    <div className="activity-logs-section" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '2px dashed #eee' }}>
                      <h4 className="section-heading">📜 Activity Log</h4>
                      <div className="logs-list" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                        {activityLogs.map(log => (
                          <div key={log.id} className="log-item" style={{ fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #fafafa' }}>
                            <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>{log.action}</span> by Admin on {new Date(log.created_at).toLocaleString()}
                            {log.reason && <p style={{ margin: '4px 0 0 0', color: '#666', fontStyle: 'italic' }}>— Reason: {log.reason}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.filter(s => s.status === "Pending").length} 
                  />
                </th>
                <th>Student ID</th><th>Name</th><th>Email</th><th>Course</th><th>Year Level</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => {
                  const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ") || s.name || "N/A";
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr key={s.id} className={isSelected ? "row-selected" : ""}>
                      <td>
                        {s.status === "Pending" && (
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => toggleSelect(s.id)} 
                          />
                        )}
                      </td>
                      <td>{s.student_id}</td>
                      <td>{fullName}</td>
                      <td>{s.email}</td>
                      <td>{s.status === "Pending" && !s.course ? <span className="reg-date">Registered {new Date(s.created_at).toLocaleDateString()}</span> : (s.course || "—")}</td>
                      <td>{s.status === "Pending" && !s.year_level ? "—" : (s.year_level || "—")}</td>
                      <td><span className={`status-badge ${(s.status || "").toLowerCase()}`}>{s.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          {s.status === "Pending" ? (
                            <button onClick={() => openForm(s)} className="btn-icon btn-activate-sm" title="Review & Activate">
                              <CheckCircle size={16} />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => openForm(s)} className="btn-icon btn-edit" title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => handleArchive(s)} className="btn-icon btn-archive" title="Archive"><Archive size={16} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" })}
        confirmText={confirmModal.type === "success" ? "Activate" : "Archive"}
      />
    </div>
  );
}
