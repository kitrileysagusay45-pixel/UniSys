import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Edit2, Trash2, BookOpen, GraduationCap, AlertCircle, CheckCircle } from "lucide-react";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", department_id: "", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/programs");
      // Handle Laravel pagination (res.data.data) or simple array (res.data)
      const data = res.data.data ?? res.data;
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
      setError("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/api/departments");
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingProgram) {
        await axios.put(`/api/programs/${editingProgram.id}`, form);
      } else {
        await axios.post("/api/programs", form);
      }
      fetchPrograms();
      setShowModal(false);
      setEditingProgram(null);
      setForm({ name: "", code: "", department_id: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save program");
    }
  };

  const handleEdit = (p) => {
    setEditingProgram(p);
    setForm({ 
      name: p.name, 
      code: p.code, 
      department_id: p.department_id || "", 
      description: p.description || "" 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      await axios.delete(`/api/programs/${id}`);
      fetchPrograms();
    } catch (err) {
      alert("Failed to delete program. It might be linked to students.");
    }
  };

  const filtered = programs.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="programs-page animated-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Degree Programs</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>Manage university academic offerings and curricula</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => { setEditingProgram(null); setForm({ name: "", code: "", department_id: "", description: "" }); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1a5fb4', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> Add Program
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: '20px', display: 'flex', gap: '1rem' }}>
        <div className="search-box" style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search programs by name or code..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
          />
        </div>
      </div>

      <div className="programs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div className="spinner" style={{ marginBottom: '1rem' }}>Loading programs...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 8px', color: '#475569' }}>No programs found</h3>
            <p style={{ margin: 0, color: '#64748b' }}>Try adjusting your search or add a new program.</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="program-card shadow-sm" style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', position: 'relative' }}>
              <div className="card-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#1e40af', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{p.code}</span>
                <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} style={{ border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 700 }}>{p.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className={`status-badge ${p.department?.status?.toLowerCase() === 'active' ? 'active' : 'archived'}`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: p.department?.status?.toLowerCase() === 'active' ? '#dcfce7' : '#fee2e2', color: p.department?.status?.toLowerCase() === 'active' ? '#166534' : '#991b1b' }}>
                  {p.department?.status ?? 'Active'}
                </span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{p.department?.name ?? 'No Department'}</p>
              </div>

              <div className="card-details" style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#94a3b8" />
                  <span>Head: <strong>{p.department?.head ?? '—'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} color="#94a3b8" />
                  <span>Created: {new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="card-stats" style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <GraduationCap size={14} color="#94a3b8" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.students_count || 0} Students</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>{editingProgram ? "Edit Program" : "Add New Program"}</h3>
            {error && <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Program Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. BS in Computer Science" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Program Code</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. BSCS" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
               <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Department</label>
                <select 
                  value={form.department_id} 
                  onChange={e => setForm({...form, department_id: e.target.value})} 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1a5fb4', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{editingProgram ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
