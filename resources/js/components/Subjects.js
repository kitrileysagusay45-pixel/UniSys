import React, { useState } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Search, Edit2, Archive } from "lucide-react";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import { useToast } from "./useToast";
import "../../sass/subjects.scss";

export default function Subjects() {
  const { refreshCounts } = useCounts();
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const [form, setForm] = useState({
    code: "", name: "", department: "", course_id: "", faculty_id: "",
    room_id: "", schedule_day: "", schedule_time: "", time_start: "",
    time_end: "", semester: "", academic_year: "", status: "Active",
  });

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const semesters = ["1st Semester", "2nd Semester", "Summer"];

  const fetchSubjects = async () => {
    try { const res = await axios.get("/api/subjects"); setSubjects(res.data); } catch (err) { console.error(err); }
  };
  const fetchFaculties = async () => {
    try { const res = await axios.get("/api/faculties"); setFaculties(res.data.filter(f => f.status === "Active")); } catch (err) { console.error(err); }
  };
  const fetchCourses = async () => {
    try { const res = await axios.get("/api/courses"); setCourses(res.data.filter(c => c.status !== "Archived")); } catch (err) { console.error(err); }
  };
  const fetchDepartments = async () => {
    try { const res = await axios.get("/api/departments"); setDepartments(res.data.filter(d => d.status !== "Archived")); } catch (err) { console.error(err); }
  };
  const fetchAcademicYears = async () => {
    try { const res = await axios.get("/api/academic-years"); setAcademicYears(res.data.filter(y => y.status !== "Archived")); } catch (err) { console.error(err); }
  };

  React.useEffect(() => {
    fetchSubjects();
    fetchFaculties();
    fetchCourses();
    fetchDepartments();
    fetchAcademicYears();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.course_id) payload.course_id = null;
      if (!payload.faculty_id) payload.faculty_id = null;
      if (!payload.room_id) payload.room_id = null;

      if (editingId) {
        await axios.put(`/api/subjects/${editingId}`, payload);
        addToast('Subject updated successfully.', 'success');
      } else {
        await axios.post("/api/subjects", payload);
        addToast('Subject added successfully.', 'success');
      }
      await fetchSubjects();
      closeForm();
    } catch (err) {
      const errors = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : '';
      addToast('Failed to save subject. ' + errors, 'error');
    }
  };

  const openForm = (subject = null) => {
    if (subject) {
      setEditingId(subject.id);
      setForm({
        code: subject.code || "", name: subject.name || "", department: subject.department || "",
        course_id: subject.course_id || "", faculty_id: subject.faculty_id || "",
        room_id: subject.room_id || "", schedule_day: subject.schedule_day || "",
        schedule_time: subject.schedule_time || "",
        time_start: subject.time_start || "", time_end: subject.time_end || "",
        semester: subject.semester || "",
        academic_year: subject.academic_year || "", status: subject.status || "Active",
      });
    } else {
      setEditingId(null);
      setForm({ code: "", name: "", department: "", course_id: "", faculty_id: "", room_id: "",
        schedule_day: "", schedule_time: "", time_start: "", time_end: "", semester: "", academic_year: "", status: "Active" });
    }
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleArchive = async () => {
    const id = archiveTarget;
    setArchiveTarget(null);
    try {
      await axios.patch(`/api/subjects/${id}/archive`);
      await fetchSubjects();
      addToast('Subject archived.', 'info');
    } catch (err) { addToast('Failed to archive subject.', 'error'); }
  };

  const deptFilterOptions = ["All", ...new Set(subjects.map(s => s.department).filter(Boolean))];
  const filtered = subjects.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (s.name || "").toLowerCase().includes(q) || (s.code || "").toLowerCase().includes(q);
    const matchesDept = departmentFilter === "All" || s.department === departmentFilter;
    return matchesSearch && matchesDept && s.status !== "Archived";
  });

  return (
    <div className="settings-container">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={archiveTarget !== null}
        type="warning"
        title="Archive Subject"
        message="Are you sure you want to archive this subject?"
        confirmText="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
      <div className="settings-header">
        <div><h2>Subject Management</h2><p className="subtitle">Manage subjects, schedules, and assignments</p></div>
      </div>
      <div className="settings-content">
        <div className="settings-body">
          <div className="table-header">
            <div style={{display:"flex",gap:"1rem",alignItems:"center",flex:1}}>
              <h3>Subjects</h3>
              <div className="search-box" style={{maxWidth:"250px"}}>
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search Subjects" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <select className="department-filter" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
                {deptFilterOptions.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
              </select>
            </div>
            <button className="btn-add-setting" onClick={() => openForm()}>+ Add Subject</button>
          </div>

          {showForm && (
            <div className="modal-overlay" onClick={closeForm}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{editingId ? "Edit Subject" : "Add New Subject"}</h3>
                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-row">
                    <div className="form-group"><label>Subject Code *</label>
                      <input type="text" placeholder="e.g. CS101" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                    </div>
                    <div className="form-group"><label>Subject Name *</label>
                      <input type="text" placeholder="Subject Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Department</label>
                      <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Assigned Faculty</label>
                      <select value={form.faculty_id} onChange={e => setForm({...form, faculty_id: e.target.value})}>
                        <option value="">Select Faculty</option>
                        {faculties.map(f => <option key={f.id} value={f.id}>{f.first_name} {f.last_name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Schedule Day</label>
                      <select value={form.schedule_day} onChange={e => setForm({...form, schedule_day: e.target.value})}>
                        <option value="">Select Day</option>
                        {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Time Start</label>
                      <input type="time" value={form.time_start} onChange={e => setForm({...form, time_start: e.target.value})} />
                    </div>
                    <div className="form-group"><label>Time End</label>
                      <input type="time" value={form.time_end} onChange={e => setForm({...form, time_end: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Semester</label>
                      <select value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}>
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Academic Year</label>
                      <select value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})}>
                        <option value="">Select Academic Year</option>
                        {academicYears.map(y => <option key={y.id} value={y.year}>{y.year}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="modal-actions" style={{marginTop:"1.5rem",display:"flex",justifyContent:"flex-end",gap:"0.5rem"}}>
                    <button type="button" onClick={closeForm} className="btn-cancel">Cancel</button>
                    <button type="submit" className="btn-submit">{editingId ? "Update" : "Add Subject"}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead><tr>
                <th>Code</th><th>Name</th><th>Department</th><th>Faculty</th><th>Schedule</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>{s.code}</td>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.faculty ? `${s.faculty.first_name} ${s.faculty.last_name}` : "—"}</td>
                    <td>{s.schedule_day ? `${s.schedule_day} ${s.time_start || ""} - ${s.time_end || ""}` : "—"}</td>
                    <td><span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => openForm(s)} className="btn-icon btn-edit" title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => setArchiveTarget(s.id)} className="btn-icon btn-archive" title="Archive"><Archive size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
