import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Search, Edit2, Archive, CheckCircle } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import { useToast } from "./useToast";
// import "../../sass/faculty.scss";

export default function Faculty() {
  const { refreshCounts } = useCounts();
  const [faculties, setFaculties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending"); // Default to Pending
  const [departmentsList, setDepartmentsList] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, title: "", message: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    faculty_id: "", employee_id: "", first_name: "", middle_name: "", last_name: "",
    date_of_birth: "", age: "", sex: "", email: "", phone: "", address: "", tin_number: "",
    department: "", position: "", employment_type: "Full-Time", date_hired: "", office_phone: "", status: "Pending",
    specialization: "", subject_assignment: "",
  });

  const fetchFaculties = async () => {
    try { const res = await axios.get("/api/faculties"); setFaculties(res.data); } catch (err) { console.error(err); }
  };
  const fetchDepartments = async () => {
    try { const res = await axios.get("/api/departments"); setDepartmentsList(res.data.filter(d => d.status !== "Archived")); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchFaculties(); fetchDepartments(); }, []);

  const positions = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Instructor", "Senior Lecturer", "Dean", "Department Head", "Coordinator"];
  const employmentTypes = ["Full-Time", "Part-Time", "Adjunct"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : null, date_of_birth: form.date_of_birth || null, date_hired: form.date_hired || null };
      if (editingId) {
        await axios.put(`/api/faculties/${editingId}`, payload);
        addToast('Faculty updated successfully!', 'success');
      }
      await fetchFaculties();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "faculties" } }));
      closeForm();
    } catch (err) {
      const errs = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : '';
      addToast('Failed to save. ' + errs, 'error');
    }
  };

  const openForm = async (faculty, mode = "edit") => {
    setEditingId(faculty.id);
    setViewMode(mode);
    setForm({
      faculty_id: faculty.faculty_id || "", employee_id: faculty.employee_id || "",
      first_name: faculty.first_name || "", middle_name: faculty.middle_name || "",
      last_name: faculty.last_name || "", date_of_birth: faculty.date_of_birth || "",
      age: faculty.age != null ? String(faculty.age) : "", sex: faculty.sex || "",
      email: faculty.email || "", phone: faculty.phone || "", address: faculty.address || "",
      tin_number: faculty.tin_number || "",
      department: faculty.department || "", position: faculty.position || "",
      employment_type: faculty.employment_type || "Full-Time",
      date_hired: faculty.date_hired || "", office_phone: faculty.office_phone || "",
      status: faculty.status || "Pending",
      specialization: faculty.specialization || "",
      subject_assignment: faculty.subject_assignment || "",
    });
    setActivityLogs([]);
    setShowRejectInput(false);
    setRejectionReason("");
    fetchDepartments();
    setShowForm(true);

    try {
      const res = await axios.get(`/api/faculties/${faculty.id}`);
      if (res.data.activity_logs) {
        setActivityLogs(res.data.activity_logs);
      }
    } catch (err) { console.error("Failed to fetch logs", err); }
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setViewMode(null); };

  const handleActivate = (faculty) => {
    setConfirmModal({
      isOpen: true, type: "success", id: faculty.id,
      title: "Activate Faculty",
      message: `Are you sure you want to activate ${faculty.first_name} ${faculty.last_name}? They will be able to login to the system.`,
    });
  };

  const handleArchive = (faculty) => {
    setConfirmModal({
      isOpen: true, type: "warning", id: faculty.id,
      title: "Archive Faculty",
      message: `Are you sure you want to archive ${faculty.first_name} ${faculty.last_name}? They will be removed from the active list.`,
    });
  };

  const confirmAction = async () => {
    const { type, id } = confirmModal;
    try {
      if (type === "success") {
        await axios.patch(`/api/faculties/${id}/activate`);
        addToast('Faculty activated!', 'success');
      } else if (type === "reject") {
        await axios.patch(`/api/faculties/${id}/reject`, { reason: rejectionReason });
        addToast('Faculty rejected.', 'info');
      } else {
        await axios.patch(`/api/faculties/${id}/archive`);
        addToast('Faculty archived.', 'info');
      }
      await fetchFaculties();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "faculties" } }));
    } catch (err) { addToast('Action failed.', 'error'); }
    setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" });
    setShowRejectInput(false);
    closeForm();
  };

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      await axios.patch("/api/faculties/bulk-activate", { ids: selectedIds });
      addToast(`${selectedIds.length} faculty members activated!`, 'success');
      setSelectedIds([]);
      await fetchFaculties();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "faculties" } }));
    } catch (err) {
      addToast('Bulk activation failed.', 'error');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const pendings = filtered.filter(f => f.status === "Pending").map(f => f.id);
    if (selectedIds.length === pendings.length && pendings.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendings);
    }
  };

  const filteredBySearch = faculties.filter(f => {
    const q = searchQuery.toLowerCase();
    const name = `${f.first_name || ""} ${f.middle_name || ""} ${f.last_name || ""}`.toLowerCase();
    return name.includes(q) || (f.faculty_id || "").toLowerCase().includes(q) || (f.email || "").toLowerCase().includes(q);
  });

  const filtered = filteredBySearch.filter(f => {
    const matchesStatus = statusFilter === "All" || f.status === statusFilter;
    return matchesStatus && f.status !== "Archived";
  });

  const counts = {
    pending: filteredBySearch.filter(f => f.status === "Pending").length,
    active: filteredBySearch.filter(f => f.status === "Active").length,
    rejected: filteredBySearch.filter(f => f.status === "Rejected").length,
    all: filteredBySearch.filter(f => f.status !== "Archived").length
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
        <div><h2>Faculty Management</h2><p className="subtitle">Manage faculty members and their information</p></div>
      </div>
      <div className="settings-content">
        <div className="settings-body">
          <div className="table-header">
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
              <h3>Faculty Members</h3>
              <div className="search-box" style={{ maxWidth: "250px" }}>
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search Faculty" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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

          {/* Modal Form */}
          {showForm && (
            <div className="modal-overlay" onClick={closeForm}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">
                  {isPending ? "Review & Activate Faculty" : "Edit Faculty"}
                  <span className="modal-header-id"> | {form.employee_id || form.faculty_id}</span>
                </h3>
                <form onSubmit={handleSubmit} className="modal-form">
                  {/* Personal Info - READ ONLY for pending */}
                  <h4 className="section-heading">📋 Personal Information {isPending && <span className="readonly-tag">Read-Only (from registration)</span>}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Faculty ID</label>
                      <input type="text" value={form.faculty_id} readOnly className="readonly" />
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

                  {/* Contact Info - READ ONLY for pending */}
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
                  {form.tin_number && (
                    <div className="form-group">
                      <label>TIN Number</label>
                      <input type="text" value={form.tin_number} readOnly className="readonly" />
                    </div>
                  )}

                   {/* Professional Info - Admin fills this */}
                  <h4 className="section-heading">🏢 Professional Information {isPending && <span className="editable-tag">Admin fills this</span>}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department *</label>
                      <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                        <option value="">Select Department</option>
                        {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Specialization *</label>
                      <input type="text" placeholder="e.g. Web Development" value={form.specialization}
                        onChange={e => setForm({ ...form, specialization: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Employment Type *</label>
                      <select value={form.employment_type} onChange={e => setForm({ ...form, employment_type: e.target.value })} required>
                        <option value="">Select Type</option>
                        {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subject Assignment</label>
                      <input type="text" placeholder="e.g. CS101, CS202" value={form.subject_assignment}
                        onChange={e => setForm({ ...form, subject_assignment: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                      <option value="">Select Position</option>
                      {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Hired</label>
                    <input type="date" value={form.date_hired}
                      onChange={e => setForm({ ...form, date_hired: e.target.value })} />
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
                             📦 Archive Faculty
                           </button>
                        )}
                        <button type="button" className="btn-cancel" onClick={closeForm}>Cancel</button>
                      </div>

                      {isPending ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <button type="button" className="btn-activate" 
                            disabled={!form.department || !form.specialization || !form.employment_type}
                            onClick={() => {
                              const payload = { ...form, age: form.age ? parseInt(form.age) : null, date_of_birth: form.date_of_birth || null, date_hired: form.date_hired || null };
                              axios.put(`/api/faculties/${editingId}`, payload).then(() => {
                                handleActivate({ id: editingId, first_name: form.first_name, last_name: form.last_name });
                              }).catch(err => {
                                addToast('Failed to prepare for activation.', 'error');
                              });
                            }}>
                            <CheckCircle size={16} /> Activate Faculty
                          </button>
                          {(!form.department || !form.specialization || !form.employment_type) && (
                            <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>Fill in all required fields to activate</span>
                          )}
                        </div>
                      ) : (
                        <button type="submit" className="btn-submit">Update Faculty</button>
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

          {/* Table */}
          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={toggleSelectAll} 
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.filter(f => f.status === "Pending").length} 
                  />
                </th>
                <th>EMPLOYEE ID</th><th>Name</th><th>Email</th><th>DEPARTMENT</th><th>EMPLOYMENT TYPE</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(f => {
                  const fullName = [f.first_name, f.middle_name, f.last_name].filter(Boolean).join(" ") || f.name || "N/A";
                  const isSelected = selectedIds.includes(f.id);
                  return (
                    <tr key={f.id} className={isSelected ? "row-selected" : ""}>
                      <td>
                        {f.status === "Pending" && (
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => toggleSelect(f.id)} 
                          />
                        )}
                      </td>
                      <td>{f.employee_id || f.faculty_id}</td>
                      <td>{fullName}</td>
                      <td>{f.email}</td>
                      <td>{f.status === "Pending" && !f.department ? <span className="reg-date" style={{ color: '#6366f1', fontSize: '12px' }}>Registered {new Date(f.created_at).toLocaleDateString()}</span> : (f.department || "—")}</td>
                      <td>{f.status === "Pending" && !f.employment_type ? "—" : (f.employment_type || "—")}</td>
                      <td><span className={`status-badge ${(f.status || "").toLowerCase()}`}>{f.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          {f.status === "Pending" ? (
                            <button onClick={() => openForm(f, "view")} className="btn-icon btn-activate-sm" title="Review & Activate">
                              <CheckCircle size={16} />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => openForm(f, "edit")} className="btn-icon btn-edit" title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => handleArchive(f)} className="btn-icon btn-archive" title="Archive"><Archive size={16} /></button>
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
