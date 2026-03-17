import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Search, Plus, Edit2, Archive, ArchiveRestore } from "lucide-react";
import "../../sass/faculty.scss";

export default function Faculty() {
  const { refreshCounts } = useCounts();
  const [faculties, setFaculties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [departmentsList, setDepartmentsList] = useState([]);

  const [form, setForm] = useState({
    faculty_id: "",
    employee_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    age: "",
    sex: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    employment_type: "Full-Time",
    date_hired: "",
    office_phone: "",
    address: "",
    status: "Active",
  });

  // Fetch data
  const fetchFaculties = async () => {
    try {
      const res = await axios.get("/api/faculties");
      setFaculties(res.data);
    } catch (err) {
      console.error("Failed to fetch faculties:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments for Faculty...');
      const res = await axios.get("/api/departments");
      console.log('Departments response:', res.data);
      
      const activeDepts = res.data.filter(d => d.status !== 'Archived');
      console.log('Active departments:', activeDepts);
      
      setDepartmentsList(activeDepts);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      console.error('Error response:', err.response);
    }
  };

  useEffect(() => {
    fetchFaculties();
    fetchDepartments();
    
    // Listen for data updates from Settings
    const handleDataUpdate = (event) => {
      console.log('Faculty: Data updated, refetching departments...', event.detail);
      if (event.detail.type === 'departments') {
        fetchDepartments();
      }
      // Also refresh faculty list to show updated counts in dashboard
      fetchFaculties();
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  // Form options
  const positions = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Instructor', 'Senior Lecturer', 'Adjunct Professor', 'Visiting Professor', 'Research Fellow', 'Teaching Assistant', 'Dean', 'Department Head', 'Coordinator'];
  const employmentTypes = ['Full-Time', 'Part-Time', 'Adjunct'];
  const sexOptions = ['Male', 'Female'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.first_name || !form.last_name || !form.email || !form.department || !form.employment_type) {
      alert('⚠️ Please fill in all required fields (First Name, Last Name, Email, Department, Employment Type).');
      return;
    }
    
    console.log('Submitting faculty form:', form);
    
    try {
      // convert age to number if present
      const payload = {
        faculty_id: form.faculty_id,
        employee_id: form.employee_id,
        first_name: form.first_name,
        middle_name: form.middle_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth || null,
        age: form.age !== "" && form.age != null ? parseInt(form.age, 10) : null,
        sex: form.sex,
        email: form.email,
        phone: form.phone,
        department: form.department,
        position: form.position,
        employment_type: form.employment_type,
        date_hired: form.date_hired || null,
        office_phone: form.office_phone,
        address: form.address,
        status: form.status,
      };

      if (editingId) {
        const response = await axios.put(`/api/faculties/${editingId}`, payload);
        console.log('Update response:', response.data);
        alert("✅ Faculty updated successfully!");
      } else {
        const response = await axios.post("/api/faculties", payload);
        console.log('Create response:', response.data);
        alert("✅ Faculty added successfully!");
      }

      await fetchFaculties();
      await refreshCounts();
      
      // Broadcast update event for dashboard to refresh
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { type: 'faculties', timestamp: Date.now() } 
      }));
      
      closeForm();
    } catch (error) {
      console.error("Save Faculty Error:", error);
      console.error('Error response:', error.response);
      
      // Show detailed error message
      let errorMessage = '❌ Failed to save faculty.';
      if (error.response?.data?.message) {
        errorMessage += '\n' + error.response.data.message;
      }
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        errorMessage += '\n' + errors.join('\n');
      }
      alert(errorMessage);
    }
  };

  const openForm = async (faculty = null) => {
    // Refresh departments when form opens
    await fetchDepartments();
    
    if (faculty) {
      setEditingId(faculty.id);
      setForm({
        faculty_id: faculty.faculty_id || "",
        employee_id: faculty.employee_id || "",
        first_name: faculty.first_name || "",
        middle_name: faculty.middle_name || "",
        last_name: faculty.last_name || "",
        date_of_birth: faculty.date_of_birth || "",
        age: faculty.age != null ? String(faculty.age) : "",
        sex: faculty.sex || "",
        email: faculty.email || "",
        phone: faculty.phone || "",
        department: faculty.department || "",
        position: faculty.position || "",
        employment_type: faculty.employment_type || "Full-Time",
        date_hired: faculty.date_hired || "",
        office_phone: faculty.office_phone || "",
        address: faculty.address || "",
        status: faculty.status || "Active",
      });
    } else {
      setEditingId(null);
      setForm({
        faculty_id: "",
        employee_id: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        age: "",
        sex: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        employment_type: "Full-Time",
        date_hired: "",
        office_phone: "",
        address: "",
        status: "Active",
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleArchive = async (id) => {
    if (!confirm("Archive this faculty?")) return;
    try {
      await axios.patch(`/api/faculties/${id}/archive`);
      await fetchFaculties();
      await refreshCounts();
      
      // Broadcast update event for dashboard to refresh
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { type: 'faculties', timestamp: Date.now() } 
      }));
      
      alert("📦 Faculty archived successfully!");
    } catch (err) {
      console.error("Archive Faculty Error:", err);
      alert("❌ Failed to archive faculty.");
    }
  };

  const handleRestore = async (id) => {
    try {
      await axios.patch(`/api/faculties/${id}/restore`);
      await fetchFaculties();
      await refreshCounts();
      
      // Broadcast update event for dashboard to refresh
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { type: 'faculties', timestamp: Date.now() } 
      }));
      
      alert("✅ Faculty restored successfully!");
    } catch (err) {
      console.error("Restore Faculty Error:", err);
      alert("❌ Failed to restore faculty.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('⚠️ PERMANENT DELETE: This will completely remove the faculty from the database. This action cannot be undone. Are you sure?')) return;
    
    try {
      await axios.delete(`/api/faculties/${id}`);
      await fetchFaculties();
      await refreshCounts();
      
      // Broadcast update event for dashboard to refresh
      window.dispatchEvent(new CustomEvent('dataUpdated', { 
        detail: { type: 'faculties', timestamp: Date.now() } 
      }));
      
      closeForm();
      alert('🗑️ Faculty permanently deleted from database!');
    } catch (err) {
      console.error('Delete Faculty Error:', err);
      alert('❌ Failed to delete faculty.');
    }
  };

  // Get unique departments for filter
  const departments = ["All", ...new Set(faculties.map(f => f.department))];

  // Filter faculties based on search and department (only show active)
  const filteredFaculties = faculties.filter(f => {
    const matchesSearch = (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (f.faculty_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (f.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "All" || f.department === departmentFilter;
    const isActive = f.status !== 'Archived';
    return matchesSearch && matchesDepartment && isActive;
  });

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div>
          <h2>Faculty Management</h2>
          <p className="subtitle">Manage faculty members and their information</p>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-body">
          <div className="table-header">
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', flex: 1}}>
              <h3>Faculty Members</h3>
              <div className="search-box" style={{maxWidth: '250px'}}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search Faculty"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                className="department-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === "All" ? "Departments" : dept}</option>
                ))}
              </select>
            </div>
            <button className="btn-add-setting" onClick={() => openForm()}>
              + Add Faculty
            </button>
          </div>

      {/* ✅ Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingId ? "Edit Faculty" : "Add New Faculty"}
            </h3>

            <form onSubmit={handleSubmit} className="modal-form">
              <h4 style={{marginTop: 0, color: '#003366', borderBottom: '2px solid #d4af37', paddingBottom: '0.5rem'}}>📋 Personal Information</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    placeholder="Middle Name"
                    value={form.middle_name}
                    onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => {
                      const dob = e.target.value;
                      if (!dob) {
                        // if cleared, also clear age
                        setForm(prev => ({ ...prev, date_of_birth: "", age: "" }));
                        return;
                      }
                      const birthDate = new Date(dob);
                      const today = new Date();
                      let ageCalc = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        ageCalc--;
                      }
                      setForm(prev => ({ ...prev, date_of_birth: dob, age: String(ageCalc) }));
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="Age"
                    value={form.age}
                    onChange={(e) => {
                      const val = e.target.value;
                      // allow empty or digits only
                      if (val === "" || /^[0-9]+$/.test(val)) {
                        // when user types age manually, clear date_of_birth to avoid conflict
                        setForm(prev => ({ ...prev, age: val, date_of_birth: "" }));
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Sex</label>
                  <select 
                    value={form.sex}
                    onChange={(e) => setForm({ ...form, sex: e.target.value })}
                  >
                    <option value="">Select Sex</option>
                    {sexOptions.map(sex => (
                      <option key={sex} value={sex}>{sex}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 style={{marginTop: '1.5rem', color: '#003366', borderBottom: '2px solid #d4af37', paddingBottom: '0.5rem'}}>📞 Contact Information</h4>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <h4 style={{marginTop: '1.5rem', color: '#003366', borderBottom: '2px solid #d4af37', paddingBottom: '0.5rem'}}>💼 Employment Details</h4>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departmentsList.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  >
                    <option value="">Select Position</option>
                    {positions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Employment Type *</label>
                <div style={{display: 'flex', gap: '1.5rem', marginTop: '0.5rem'}}>
                  {employmentTypes.map(type => (
                    <label key={type} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                      <input
                        type="radio"
                        name="employment_type"
                        value={type}
                        checked={form.employment_type === type}
                        onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                        style={{cursor: 'pointer'}}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Date Hired</label>
                <input
                  type="date"
                  value={form.date_hired}
                  onChange={(e) => setForm({ ...form, date_hired: e.target.value })}
                />
              </div>

              <div className="modal-actions" style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between'}}>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  {editingId && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleArchive(editingId)}
                        className="btn-icon"
                        style={{padding: '0.5rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        title="Archive Faculty"
                      >
                        📦 Archive
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(editingId)}
                        className="btn-icon"
                        style={{padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                        title="Permanently Delete"
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                  >
                    {editingId ? "Update Faculty" : "Add Faculty"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

          <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th>Faculty ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.map((f) => {
                // Prefer explicit name parts (first/middle/last). Fall back to f.name or 'N/A'.
                const nameParts = [];
                if (f.first_name) nameParts.push(f.first_name.trim());
                if (f.middle_name) nameParts.push(f.middle_name.trim());
                if (f.last_name) nameParts.push(f.last_name.trim());
                const fullName = nameParts.length ? nameParts.join(' ') : (f.name || 'N/A');
                
                return (
                <tr key={f.id} className={f.status === "Archived" ? "archived-row" : ""}>
                  <td>{f.faculty_id}</td>
                  <td>{fullName}</td>
                  <td>{f.email}</td>
                  <td>{f.department}</td>
                  <td>{f.position}</td>
                  <td>
                    <span className={`status-badge ${f.status.toLowerCase()}`}>
                      {f.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openForm(f)}
                        className="btn-icon btn-edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleArchive(f.id)}
                        className="btn-icon btn-archive"
                        title="Archive"
                      >
                        <Archive size={16} />
                      </button>
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
    </div>
  );
}
