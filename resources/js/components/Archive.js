import React, { useState, useEffect } from "react";
import axios from "axios";
import { RotateCcw, Search, Trash2 } from "lucide-react";
import { useCounts } from "../Context/CountContext";
import "../../sass/faculty.scss"; // Reuse Faculty UI styling

export default function Archive() {
  const { refreshCounts } = useCounts();
  const [archives, setArchives] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all archived data (students + faculty)
  const fetchArchives = async () => {
    try {
      const [studentsRes, facultiesRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/faculties"),
      ]);

      const archivedStudents = studentsRes.data
        .filter((s) => s.status === "Archived")
        .map((s) => ({
          ...s,
          type: "Student",
          id_value: s.student_id,
          archived_date: s.updated_at,
        }));

      const archivedFaculties = facultiesRes.data
        .filter((f) => f.status === "Archived")
        .map((f) => ({
          ...f,
          type: "Faculty",
          id_value: f.faculty_id,
          archived_date: f.updated_at,
        }));

      setArchives([...archivedStudents, ...archivedFaculties]);
    } catch (err) {
      console.error("Failed to fetch archives:", err);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  // Filter archives by search input (ID or name)
  const filteredArchives = archives.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.email?.toLowerCase().includes(query) ||
      item.id_value?.toLowerCase().includes(query) ||
      item.department?.toLowerCase().includes(query)
    );
  });

  // Restore record
  const handleRestore = async (item) => {
    if (!confirm(`Restore ${item.name}?`)) return;

    try {
      const endpoint = item.type === "Student" ? "students" : "faculties";
      await axios.patch(`/api/${endpoint}/${item.id}/restore`);

      await fetchArchives();
      await refreshCounts();

      window.dispatchEvent(
        new CustomEvent("dataUpdated", {
          detail: { type: endpoint, timestamp: Date.now() },
        })
      );

      alert("✅ Restored successfully!");
    } catch (err) {
      console.error("Restore error:", err);
      alert("❌ Failed to restore record.");
    }
  };

  // Permanently delete record
  const handleDelete = async (item) => {
    if (
      !confirm(
        `⚠️ PERMANENT DELETE: This will completely remove ${item.name} from the database. This action cannot be undone. Continue?`
      )
    )
      return;

    try {
      const endpoint = item.type === "Student" ? "students" : "faculties";
      await axios.delete(`/api/${endpoint}/${item.id}`);

      await fetchArchives();
      await refreshCounts();

      alert("🗑️ Record permanently deleted!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete record.");
    }
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div>
          <h2>Archive Management</h2>
          <p className="subtitle">Search and manage archived records</p>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-body">
          {/* Header with Search */}
          <div className="table-header">
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flex: 1,
              }}
            >
              <h3>Archived Records</h3>
              <div className="search-box" style={{ maxWidth: "300px" }}>
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by ID, name, or department"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="settings-table-wrapper">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>{/* Course or Position */}Details</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchives.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#9ca3af",
                      }}
                    >
                      No archived records found
                    </td>
                  </tr>
                ) : (
                  filteredArchives.map((item) => (
                    <tr key={`${item.type}-${item.id}`}>
                      <td>{item.type}</td>
                      <td>{item.id_value}</td>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.department}</td>
                      <td>
                        {item.type === "Student"
                          ? `${item.course || "N/A"} (${item.year_level || "N/A"})`
                          : `${item.position || "Instructor"} (${item.faculty_rank || "N/A"})`}
                      </td>
                      <td>
                        <span className="status-badge archived">Archived</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleRestore(item)}
                            className="btn-icon btn-edit"
                            title="Restore"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="btn-icon btn-delete"
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
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
