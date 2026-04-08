import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Edit2, Trash2, Bell, Calendar, Info, AlertTriangle, MapPin, Clock, Filter, Users } from "lucide-react";

export default function Announcements() {
  const [activeTab, setActiveTab] = useState("announcements");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/${activeTab}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    if (activeTab === "announcements") {
      setForm({ title: "", content: "", type: "info", target_role: "all", expiry_date: "" });
    } else {
      setForm({ title: "", description: "", event_date: "", location: "", type: "academic" });
    }
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm(item);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingItem) {
        await axios.put(`/api/${activeTab}/${editingItem.id}`, form);
      } else {
        await axios.post(`/api/${activeTab}`, form);
      }
      fetchItems();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save item");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    try {
      await axios.delete(`/api/${activeTab}/${id}`);
      fetchItems();
    } catch (err) {
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="announcements-page animated-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Communication & Events</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>Broadcast updates and manage the university calendar</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={openAddModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#1a5fb4', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
        >
          <Plus size={18} /> Add {activeTab === "announcements" ? "Announcement" : "Event"}
        </button>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '1px' }}>
        <button 
          onClick={() => setActiveTab("announcements")} 
          style={{ padding: '10px 20px', border: 'none', background: activeTab === 'announcements' ? '#fff' : 'transparent', borderBottom: activeTab === 'announcements' ? '2px solid #1a5fb4' : 'none', color: activeTab === 'announcements' ? '#1a5fb4' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
        >
          <Bell size={16} style={{ marginBottom: '-3px', marginRight: '6px' }} /> Announcements
        </button>
        <button 
          onClick={() => setActiveTab("events")} 
          style={{ padding: '10px 20px', border: 'none', background: activeTab === 'events' ? '#fff' : 'transparent', borderBottom: activeTab === 'events' ? '2px solid #1a5fb4' : 'none', color: activeTab === 'events' ? '#1a5fb4' : '#64748b', fontWeight: 600, cursor: 'pointer' }}
        >
          <Calendar size={16} style={{ marginBottom: '-3px', marginRight: '6px' }} /> Events
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      ) : (
        <div className="items-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8' }}>
              No {activeTab} found. Click "Add" to create one.
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="item-card shadow-premium" style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ padding: '10px', borderRadius: '10px', background: activeTab === 'announcements' ? '#f0fdfa' : '#eff6ff', color: activeTab === 'announcements' ? '#0d7c66' : '#1e40af' }}>
                    {activeTab === 'announcements' ? <Bell size={24} /> : <Calendar size={24} />}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{item.title}</h4>
                    <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#64748b' }}>{activeTab === 'announcements' ? item.content : item.description}</p>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                      {activeTab === 'announcements' ? (
                        <>
                          <span style={{ color: item.type === 'urgent' ? '#e11d48' : '#3b82f6', textTransform: 'uppercase' }}>{item.type}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {item.target_role}</span>
                        </>
                      ) : (
                        <>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(item.event_date).toLocaleDateString()}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {item.location || "TBA"}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(item)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>{editingItem ? "Edit" : "Add"} {activeTab.slice(0, -1)}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              
              {activeTab === 'announcements' ? (
                <>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Content</label>
                    <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Type</label>
                      <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <option value="info">Information</option>
                        <option value="urgent">Urgent</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Target Role</label>
                      <select value={form.target_role} onChange={e => setForm({...form, target_role: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <option value="all">All Roles</option>
                        <option value="student">Students Only</option>
                        <option value="faculty">Faculty Only</option>
                        <option value="admin">Admins Only</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Event Date</label>
                      <input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600 }}>Location</label>
                      <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Quadrangle" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#1a5fb4', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{editingItem ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
