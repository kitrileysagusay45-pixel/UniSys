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
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentsList, setDepartmentsList] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, title: "", message: "" });
  const [viewMode, setViewMode] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    faculty_id: "", employee_id: "", first_name: "", middle_name: "", last_name: "",
    date_of_birth: "", age: "", sex: "", email: "", phone: "", address: "", tin_number: "",
    department: "", position: "", employment_type: "Full-Time", date_hired: "", office_phone: "", status: "Pending",
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

  const openForm = (faculty, mode = "edit") => {
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
    });
    fetchDepartments();
    setShowForm(true);
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
      } else {
        await axios.patch(`/api/faculties/${id}/archive`);
        addToast('Faculty archived.', 'info');
      }
      await fetchFaculties();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "faculties" } }));
    } catch (err) { addToast('Action failed.', 'error'); }
    setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" });
    closeForm();
  };

  const filtered = faculties.filter(f => {
    const q = searchQuery.toLowerCase();
    const name = `${f.first_name || ""} ${f.middle_name || ""} ${f.last_name || ""}`.toLowerCase();
    const matchesSearch = name.includes(q) || (f.faculty_id || "").toLowerCase().includes(q) || (f.email || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || f.status === statusFilter;
    return matchesSearch && matchesStatus && f.status !== "Archived";
  });

  const isPending = form.status === "Pending";

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
              <select className="department-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="modal-overlay" onClick={closeForm}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">
                  {isPending ? "Review & Activate Faculty" : "Edit Faculty"}
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

                  {/* Employment Details - EDITABLE */}
                  <h4 className="section-heading">💼 Employment Details {isPending && <span className="editable-tag">Admin fills this</span>}</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department *</label>
                      <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                        <option value="">Select Department</option>
                        {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
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
                    <label>Employment Type *</label>
                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem" }}>
                      {employmentTypes.map(t => (
                        <label key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                          <input type="radio" name="employment_type" value={t}
                            checked={form.employment_type === t}
                            onChange={e => setForm({ ...form, employment_type: e.target.value })} />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Date Hired</label>
                    <input type="date" value={form.date_hired}
                      onChange={e => setForm({ ...form, date_hired: e.target.value })} />
                  </div>

                  <div className="modal-actions" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {isPending && (
                        <button type="button" className="btn-activate" onClick={() => {
                          // Save employment details first then activate
                          const payload = { ...form, age: form.age ? parseInt(form.age) : null, date_of_birth: form.date_of_birth || null, date_hired: form.date_hired || null };
                          axios.put(`/api/faculties/${editingId}`, payload).then(() => {
                            handleActivate({ id: editingId, first_name: form.first_name, last_name: form.last_name });
                          }).catch(err => {
                            addToast('Please fill in all employment details first.', 'error');
                          });
                        }}>
                          <CheckCircle size={16} /> Activate
                        </button>
                      )}
                      {!isPending && (
                        <button type="button" className="btn-archive-action" onClick={() => handleArchive({ id: editingId, first_name: form.first_name, last_name: form.last_name })}>
                          📦 Archive
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button type="button" onClick={closeForm} className="btn-cancel">Cancel</button>
                      {!isPending && <button type="submit" className="btn-submit">Update Faculty</button>}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th>Faculty ID</th><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(f => {
                  const fullName = [f.first_name, f.middle_name, f.last_name].filter(Boolean).join(" ") || f.name || "N/A";
                  return (
                    <tr key={f.id}>
                      <td>{f.faculty_id}</td>
                      <td>{fullName}</td>
                      <td>{f.email}</td>
                      <td>{f.department || "—"}</td>
                      <td>{f.position || "—"}</td>
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
