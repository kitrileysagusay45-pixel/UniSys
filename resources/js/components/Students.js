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
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentsList, setDepartmentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: "", id: null, title: "", message: "" });
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

  const openForm = (student) => {
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
    fetchDepartments();
    fetchCourses();
    setShowForm(true);
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
      } else {
        await axios.patch(`/api/students/${id}/archive`);
        addToast('Student archived.', 'info');
      }
      await fetchStudents();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: "students" } }));
    } catch (err) { addToast('Action failed.', 'error'); }
    setConfirmModal({ isOpen: false, type: "", id: null, title: "", message: "" });
    closeForm();
  };

  const filtered = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const name = `${s.first_name || ""} ${s.middle_name || ""} ${s.last_name || ""}`.toLowerCase();
    const matchesSearch = name.includes(q) || (s.student_id || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesStatus && s.status !== "Archived";
  });

  const isPending = form.status === "Pending";

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
              <select className="department-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={closeForm}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{isPending ? "Review & Activate Student" : "Edit Student"}</h3>
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

                  <div className="modal-actions" style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {isPending && (
                        <button type="button" className="btn-activate" onClick={() => {
                          const payload = { ...form, age: form.age ? parseInt(form.age) : null, date_of_birth: form.date_of_birth || null };
                          axios.put(`/api/students/${editingId}`, payload).then(() => {
                            handleActivate({ id: editingId, first_name: form.first_name, last_name: form.last_name });
                          }).catch(err => {
                            addToast('Please fill in all academic information first.', 'error');
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
                      {!isPending && <button type="submit" className="btn-submit">Update Student</button>}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th>Student ID</th><th>Name</th><th>Email</th><th>Course</th><th>Year Level</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => {
                  const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ") || s.name || "N/A";
                  return (
                    <tr key={s.id}>
                      <td>{s.student_id}</td>
                      <td>{fullName}</td>
                      <td>{s.email}</td>
                      <td>{s.course || "—"}</td>
                      <td>{s.year_level || "—"}</td>
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
