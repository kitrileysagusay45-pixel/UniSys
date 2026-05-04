import React, { useState, useEffect } from "react";
import axios from "axios";
import { RotateCcw, Search, Trash2, Users, GraduationCap, Building2, BookOpen, Calendar } from "lucide-react";
import { useCounts } from "../Context/CountContext";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import { useToast } from "./useToast";

export default function Archive() {
  const { refreshCounts } = useCounts();
  const [archives, setArchives] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toasts, addToast, removeToast } = useToast();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, action: null });

  // Fetch all archived data
  const fetchArchives = async () => {
    try {
      const [studentsRes, facultiesRes, deptRes, courseRes, yearRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/faculties"),
        axios.get("/api/departments"),
        axios.get("/api/courses"),
        axios.get("/api/academic-years"),
      ]);

      const archivedStudents = studentsRes.data
        .filter((s) => s.status === "Archived")
        .map((s) => ({
          ...s,
          type: "Student",
          icon: <Users size={16} />,
          id_value: s.student_id,
          display_name: s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || "N/A",
          details: `${s.course || "N/A"} (${s.year_level || "N/A"})`,
          archived_date: s.updated_at,
        }));

      const archivedFaculties = facultiesRes.data
        .filter((f) => f.status === "Archived")
        .map((f) => ({
          ...f,
          type: "Faculty",
          icon: <GraduationCap size={16} />,
          id_value: f.faculty_id,
          display_name: `${f.first_name || ""} ${f.last_name || ""}`.trim() || "N/A",
          details: `${f.position || "Instructor"} (${f.faculty_rank || "N/A"})`,
          archived_date: f.updated_at,
        }));

      const archivedDepts = deptRes.data
        .filter((d) => d.status === "Archived")
        .map((d) => ({
          ...d,
          type: "Department",
          icon: <Building2 size={16} />,
          id_value: d.code,
          display_name: d.name,
          details: `Dean: ${d.dean || d.head || "N/A"}`,
          archived_date: d.updated_at,
        }));

      const archivedCourses = courseRes.data
        .filter((c) => c.status === "Archived")
        .map((c) => ({
          ...c,
          type: "Course",
          icon: <BookOpen size={16} />,
          id_value: c.code,
          display_name: c.name,
          details: `Dept: ${c.department || "N/A"}`,
          archived_date: c.updated_at,
        }));

      const archivedYears = yearRes.data
        .filter((y) => y.status === "Archived")
        .map((y) => ({
          ...y,
          type: "Academic Year",
          icon: <Calendar size={16} />,
          id_value: y.year,
          display_name: `SY ${y.year}`,
          details: `${y.start_date} to ${y.end_date}`,
          archived_date: y.updated_at,
        }));

      setArchives([
        ...archivedStudents, 
        ...archivedFaculties, 
        ...archivedDepts, 
        ...archivedCourses, 
        ...archivedYears
      ]);
    } catch (err) {
      console.error("Failed to fetch archives:", err);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const filteredArchives = archives.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.display_name?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query) ||
      item.id_value?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query)
    );
  });

  const handleRestore = (item) => {
    setConfirmModal({ isOpen: true, item, action: 'restore' });
  };

  const handleDelete = (item) => {
    setConfirmModal({ isOpen: true, item, action: 'delete' });
  };

  const handleConfirm = async () => {
    const { item, action } = confirmModal;
    setConfirmModal({ isOpen: false, item: null, action: null });
    
    let endpoint = "";
    if (item.type === "Student") endpoint = "students";
    else if (item.type === "Faculty") endpoint = "faculties";
    else if (item.type === "Department") endpoint = "departments";
    else if (item.type === "Course") endpoint = "courses";
    else if (item.type === "Academic Year") endpoint = "academic-years";

    try {
      if (action === 'restore') {
        await axios.patch(`/api/${endpoint}/${item.id}/restore`);
        await fetchArchives();
        await refreshCounts();
        window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { type: endpoint, timestamp: Date.now() } }));
        addToast(`${item.display_name} restored successfully.`, 'success');
      } else {
        await axios.delete(`/api/${endpoint}/${item.id}`);
        await fetchArchives();
        await refreshCounts();
        addToast(`${item.display_name} deleted from archive.`, 'info');
      }
    } catch (err) {
      console.error(`${action} error:`, err);
      addToast(`Failed to ${action} record.`, 'error');
    }
  };

  return (
    <div className="settings-container animated-fade-in">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.action === 'delete' ? 'danger' : 'warning'}
        title={confirmModal.action === 'delete' ? 'Remove Record' : 'Restore Record'}
        message={
          confirmModal.action === 'delete'
            ? `This will permanently remove ${confirmModal.item?.display_name} from the archive list.`
            : `Restore ${confirmModal.item?.display_name} to active records?`
        }
        confirmText={confirmModal.action === 'delete' ? 'Remove' : 'Restore'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, item: null, action: null })}
      />
      <div className="settings-header">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>Archive Management</h2>
          <p className="subtitle">Manage archived records, departments, courses, and academic years</p>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-body">
          <div className="table-header">
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Archived Items</h3>
              <div className="search-box" style={{ maxWidth: "350px", position: 'relative' }}>
                <Search size={18} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by ID, name, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px', width: '100%', borderRadius: '10px', border: '1px solid #e2e8f0', height: '40px' }}
                />
              </div>
            </div>
          </div>

          <div className="settings-table-wrapper" style={{ marginTop: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table className="settings-table">
              <thead>
                <tr>
                  <th style={{ padding: '16px' }}>Type</th>
                  <th>ID / Code</th>
                  <th>Display Name</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchives.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
                      No archived records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredArchives.map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#475569' }}>
                          <span style={{ color: '#6366f1' }}>{item.icon}</span>
                          {item.type}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{item.id_value}</td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{item.display_name}</td>
                      <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{item.details}</td>
                      <td>
                        <span className="status-badge archived" style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Archived</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleRestore(item)} className="btn-icon btn-edit" title="Restore" style={{ border: '1px solid #e2e8f0', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>
                            <RotateCcw size={16} color="#6366f1" />
                          </button>
                          <button onClick={() => handleDelete(item)} className="btn-icon btn-delete" title="Delete" style={{ border: '1px solid #fee2e2', padding: '6px', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
