import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Search, Edit2, Archive, CheckCircle, Plus } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState("Active"); // Default to Active
  const [departmentsList, setDepartmentsList] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, title: "", message: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showCredentials, setShowCredentials] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    date_of_birth: "", sex: "", email: "", phone: "", address: "",
    department: "", position: "", employment_type: "Full-Time", date_hired: "", office_phone: "",
    specialization: "",
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
      const payload = { ...form };
      if (editingId) {
        await axios.put(`/api/faculties/${editingId}`, payload);
        addToast('Faculty updated successfully!', 'success');
      } else {
        const res = await axios.post('/api/faculties', payload);
        addToast('Faculty member added successfully!', 'success');
        if (res.data.credentials) {
          setShowCredentials(res.data.credentials);
        }
      }
      await fetchFaculties();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "faculties" } }));
      if (!editingId) {
          // Keep form open if showing credentials
      } else {
          closeForm();
      }
    } catch (err) {
      const errs = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : '';
      addToast('Failed to save. ' + errs, 'error');
    }
  };

  const openForm = (faculty = null) => {
    if (faculty) {
      setEditingId(faculty.id);
      setForm({
        first_name: faculty.first_name || "", middle_name: faculty.middle_name || "",
        last_name: faculty.last_name || "", date_of_birth: faculty.date_of_birth || "",
        sex: faculty.sex || "",
        email: faculty.email || "", phone: faculty.phone || "", address: faculty.address || "",
        department: faculty.department || "", position: faculty.position || "",
        employment_type: faculty.employment_type || "Full-Time",
        date_hired: faculty.date_hired || "", office_phone: faculty.office_phone || "",
        specialization: faculty.specialization || "",
      });
    } else {
      setEditingId(null);
      setForm({
        first_name: "", middle_name: "", last_name: "",
        date_of_birth: "", sex: "", email: "", phone: "", address: "",
        department: "", position: "", employment_type: "Full-Time", date_hired: "", office_phone: "",
        specialization: "",
      });
    }
    setActivityLogs([]);
    setShowCredentials(null);
    fetchDepartments();
    setShowForm(true);
  };

  const closeForm = () => { 
    setShowForm(false); 
    setEditingId(null); 
    setViewMode(null); 
    setForm({
      first_name: "", middle_name: "", last_name: "",
      date_of_birth: "", sex: "", email: "", phone: "", address: "",
      department: "", position: "", employment_type: "Full-Time", date_hired: "", office_phone: "",
      specialization: "",
    });
  };

  const handleArchive = (faculty) => {
    setConfirmModal({
      isOpen: true,
      type: "archive",
      id: faculty.id,
      title: "Archive Faculty",
      message: `Are you sure you want to archive ${faculty.first_name} ${faculty.last_name}?`
    });
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
    active: filteredBySearch.filter(f => f.status === "Active").length,
    all: filteredBySearch.filter(f => f.status !== "Archived").length
  };

  const isPending = form.status === "Pending";
  const isRejected = form.status === "Rejected";

  // ── Tab Configuration ──────────────────────────────────────────────────────
  const STATUS_TABS_CONFIG = [
    { id: "Active",   label: "Active",   color: "#0F6E56", count: counts.active },
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
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              </div>
              <button className="primary-btn" onClick={() => openForm()} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                <Plus size={16} /> New Faculty
              </button>
            </div>
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="modal-overlay" onClick={closeForm}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">
                  {editingId ? "Edit Faculty" : "New Faculty Member"}
                  {editingId && <span className="modal-header-id"> | {form.employee_id || form.faculty_id}</span>}
                </h3>

                {showCredentials ? (
                  <div className="credentials-box" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <h4 style={{ color: '#166534', marginTop: 0 }}>✅ Faculty Account Created!</h4>
                    <p style={{ color: '#15803d', marginBottom: '1rem' }}>Issue these credentials to the faculty member.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px dashed #22c55e' }}>
                      <div>
                        <small style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>Faculty ID (Username)</small>
                        <strong style={{ fontSize: '1.2rem', color: '#1e293b' }}>{showCredentials.username}</strong>
                      </div>
                      <div>
                        <small style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>Default Password</small>
                        <strong style={{ fontSize: '1.2rem', color: '#1e293b' }}>{showCredentials.password}</strong>
                      </div>
                    </div>
                    <button type="button" onClick={closeForm} style={{ marginTop: '1.5rem', padding: '8px 24px', background: '#166534', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Done</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="modal-form">
                    <h4 className="section-heading">📋 Personal Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Middle Name</label>
                        <input type="text" value={form.middle_name} onChange={e => setForm({ ...form, middle_name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date of Birth</label>
                        <input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Sex</label>
                        <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}>
                          <option value="">Select Sex</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <h4 className="section-heading">📞 Contact Information</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email *</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                      </div>
                      <div className="form-group">
                        <label>Phone</label>
                        <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>

                    <h4 className="section-heading">🏢 Professional Information</h4>
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
                        <label>Position</label>
                        <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}>
                          <option value="">Select Position</option>
                          {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Date Hired</label>
                      <input type="date" value={form.date_hired} onChange={e => setForm({ ...form, date_hired: e.target.value })} />
                    </div>

                    <div className="modal-actions" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", gap: "1rem" }}>
                        <button type="button" className="btn-cancel" onClick={closeForm}>Cancel</button>
                        <button type="submit" className="btn-submit">{editingId ? "Update Faculty" : "Create Account"}</button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th style={{ width: '40px' }}>#</th>
                <th>EMPLOYEE ID</th><th>Name</th><th>Email</th><th>DEPARTMENT</th><th>EMPLOYMENT TYPE</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((f, index) => {
                  const fullName = [f.first_name, f.middle_name, f.last_name].filter(Boolean).join(" ") || f.name || "N/A";
                  const isSelected = selectedIds.includes(f.id);
                  return (
                    <tr key={f.id} className={isSelected ? "row-selected" : ""}>
                      <td>{index + 1}</td>
                      <td>{f.employee_id || f.faculty_id}</td>
                      <td>{fullName}</td>
                      <td>{f.email}</td>
                      <td>{f.status === "Pending" && !f.department ? <span className="reg-date" style={{ color: '#6366f1', fontSize: '12px' }}>Registered {new Date(f.created_at).toLocaleDateString()}</span> : (f.department || "—")}</td>
                      <td>{f.status === "Pending" && !f.employment_type ? "—" : (f.employment_type || "—")}</td>
                      <td><span className={`status-badge ${(f.status || "").toLowerCase()}`}>{f.status}</span></td>
                      <td>
                        <div className="action-buttons">
                            <>
                              <button onClick={() => openForm(f)} className="btn-icon btn-edit" title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => handleArchive(f)} className="btn-icon btn-archive" title="Archive"><Archive size={16} /></button>
                            </>
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
        onConfirm={async () => {
          try {
            await axios.patch(`/api/faculties/${confirmModal.id}/archive`);
            addToast('Faculty archived.', 'info');
            await fetchFaculties();
            await refreshCounts();
            window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "faculties" } }));
          } catch (err) { addToast('Action failed.', 'error'); }
          setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" });
        }}
        onCancel={() => setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" })}
        confirmText="Archive"
      />
    </div>
  );
}
