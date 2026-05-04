import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Search, Edit2, Archive, CheckCircle, Plus } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState("Active"); // Default to Active
  const [departmentsList, setDepartmentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, title: "", message: "" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showCredentials, setShowCredentials] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    date_of_birth: "", sex: "", email: "", phone: "", address: "",
    department: "", course: "", year_level: "", section: "",
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
      const payload = { ...form };
      if (editingId) {
        await axios.put(`/api/students/${editingId}`, payload);
        addToast('Student updated successfully!', 'success');
      } else {
        const res = await axios.post('/api/students', payload);
        addToast('Student enrolled successfully!', 'success');
        if (res.data.credentials) {
          setShowCredentials(res.data.credentials);
        }
      }
      await fetchStudents();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
      if (!editingId) {
          // Keep form open if showing credentials, otherwise close
      } else {
          closeForm();
      }
    } catch (err) {
      const errs = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : '';
      addToast('Failed to save. ' + errs, 'error');
    }
  };

  const openForm = (student = null) => {
    if (student) {
      setEditingId(student.id);
      setForm({
        first_name: student.first_name || "",
        middle_name: student.middle_name || "", last_name: student.last_name || "",
        date_of_birth: student.date_of_birth || "", 
        sex: student.sex || "", email: student.email || "", phone: student.phone || "",
        address: student.address || "", department: student.department || "",
        course: student.course || "", year_level: student.year_level || "",
        section: student.section || "",
      });
    } else {
      setEditingId(null);
      setForm({
        first_name: "", middle_name: "", last_name: "",
        date_of_birth: "", sex: "", email: "", phone: "", address: "",
        department: "", course: "", year_level: "", section: "",
      });
    }
    setActivityLogs([]);
    setShowCredentials(null);
    fetchDepartments();
    fetchCourses();
    setShowForm(true);
  };

  const closeForm = () => { 
    setShowForm(false); 
    setEditingId(null); 
    setForm({
      first_name: "", middle_name: "", last_name: "",
      date_of_birth: "", sex: "", email: "", phone: "", address: "",
      department: "", course: "", year_level: "", section: "",
    });
  };

  const handleArchive = (student) => {
    setConfirmModal({
      isOpen: true,
      type: "archive",
      id: student.id,
      title: "Archive Student",
      message: `Are you sure you want to archive ${student.first_name} ${student.last_name}?`
    });
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
    active: filteredBySearch.filter(s => s.status === "Active").length,
    all: filteredBySearch.filter(s => s.status !== "Archived").length
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
        <div><h2>Student Management</h2><p className="subtitle">Manage students and their academic information</p></div>
      </div>
      <div className="settings-content">
        <div className="settings-body">
          <div className="table-header">
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
              </div>
              <button className="primary-btn" onClick={() => openForm()} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                <Plus size={16} /> New Student
              </button>
          </div>
        </div>

          {showForm && (
            <div className="modal-overlay" onClick={closeForm}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">
                  {editingId ? "Edit Student" : "New Student Enrollment"}
                  {editingId && <span className="modal-header-id"> | {form.student_id}</span>}
                </h3>
                
                {showCredentials ? (
                  <div className="credentials-box" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
                    <h4 style={{ color: '#166534', marginTop: 0 }}>✅ Enrollment Successful!</h4>
                    <p style={{ color: '#15803d', marginBottom: '1rem' }}>Issue these credentials to the student immediately.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px dashed #22c55e' }}>
                      <div>
                        <small style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontSize: '10px', fontWeight: 700 }}>Student ID (Username)</small>
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

                    <h4 className="section-heading">🎓 Academic Information</h4>
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
                        <input type="text" placeholder="e.g. CS-1A" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} />
                      </div>
                    </div>
                    
                    <div className="modal-actions" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ddd" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", gap: "1rem" }}>
                        <button type="button" className="btn-cancel" onClick={closeForm}>Cancel</button>
                        <button type="submit" className="btn-submit">{editingId ? "Update Student" : "Complete Enrollment"}</button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Student ID</th><th>Name</th><th>Email</th><th>Course</th><th>Section</th><th>Year Level</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((s, index) => {
                  const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ") || s.name || "N/A";
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr key={s.id} className={isSelected ? "row-selected" : ""}>
                      <td>{index + 1}</td>
                      <td>{s.student_id}</td>
                      <td>{fullName}</td>
                      <td>{s.email}</td>
                      <td>{s.status === "Pending" && !s.course ? <span className="reg-date">Registered {new Date(s.created_at).toLocaleDateString()}</span> : (s.course || "—")}</td>
                      <td>{s.section || "—"}</td>
                      <td>{s.status === "Pending" && !s.year_level ? "—" : (s.year_level || "—")}</td>
                      <td><span className={`status-badge ${(s.status || "").toLowerCase()}`}>{s.status}</span></td>
                      <td>
                        <div className="action-buttons">
                            <>
                              <button onClick={() => openForm(s)} className="btn-icon btn-edit" title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => handleArchive(s)} className="btn-icon btn-archive" title="Archive"><Archive size={16} /></button>
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
            await axios.patch(`/api/students/${confirmModal.id}/archive`);
            addToast('Student archived.', 'info');
            await fetchStudents();
            await refreshCounts();
            window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
          } catch (err) { addToast('Action failed.', 'error'); }
          setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" });
        }}
        onCancel={() => setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" })}
        confirmText="Archive"
      />
    </div>
  );
}
