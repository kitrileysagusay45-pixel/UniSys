import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Archive, ArchiveRestore } from 'lucide-react';
import { useCounts } from '../Context/CountContext';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import { useToast } from './useToast';
import '../../sass/settings.scss';

export default function Settings() {
  const { refreshCounts } = useCounts();
  const { toasts, addToast, removeToast } = useToast();
  const [confirmArchive, setConfirmArchive] = useState({ isOpen: false, id: null });
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentAcademicYear, setCurrentAcademicYear] = useState('');
  const [activeDepartmentsCount, setActiveDepartmentsCount] = useState(0);
  const [activeCoursesCount, setActiveCoursesCount] = useState(0);

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      // Fetch all data for counts regardless of active tab
      const [deptRes, courseRes, yearRes] = await Promise.all([
        axios.get('/api/departments'),
        axios.get('/api/courses'),
        axios.get('/api/academic-years')
      ]);
      
      setDepartments(deptRes.data);
      setCourses(courseRes.data);
      setAcademicYears(yearRes.data);
      
      // Calculate active counts
      const activeDepts = deptRes.data.filter(d => d.status === 'Active').length;
      const activeCourses = courseRes.data.filter(c => c.status === 'Active').length;
      setActiveDepartmentsCount(activeDepts);
      setActiveCoursesCount(activeCourses);
      
      // Find current academic year (the one with status 'Active')
      const activeYear = yearRes.data.find(y => y.status === 'Active');
      setCurrentAcademicYear(activeYear ? activeYear.year : 'N/A');
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'departments' ? 'departments' :
                       activeTab === 'courses' ? 'courses' : 'academic-years';
      if (editingId) {
        await axios.put(`/api/${endpoint}/${editingId}`, formData);
        addToast('Updated successfully!', 'success');
      } else {
        await axios.post(`/api/${endpoint}`, formData);
        addToast('Added successfully!', 'success');
      }
      await fetchData();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: endpoint, timestamp: Date.now() } }));
      setTimeout(() => closeForm(), 100);
    } catch (err) {
      const errors = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : (err.response?.data?.message || 'Unknown error');
      addToast('Failed to save. ' + errors, 'error');
    }
  };

  const handleArchive = (id) => {
    setConfirmArchive({ isOpen: true, id });
  };

  const confirmDoArchive = async () => {
    const id = confirmArchive.id;
    setConfirmArchive({ isOpen: false, id: null });
    try {
      const endpoint = activeTab === 'departments' ? 'departments' :
                       activeTab === 'courses' ? 'courses' : 'academic-years';
      await axios.patch(`/api/${endpoint}/${id}/archive`);
      await fetchData();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: endpoint, timestamp: Date.now() } }));
      addToast('Archived successfully!', 'info');
    } catch (err) {
      addToast('Failed to archive.', 'error');
    }
  };

  const handleRestore = async (id) => {
    try {
      const endpoint = activeTab === 'departments' ? 'departments' :
                       activeTab === 'courses' ? 'courses' : 'academic-years';
      await axios.patch(`/api/${endpoint}/${id}/restore`);
      await fetchData();
      await refreshCounts();
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: { type: endpoint, timestamp: Date.now() } }));
      addToast('Restored successfully!', 'success');
    } catch (err) {
      addToast('Failed to restore.', 'error');
    }
  };

  const openForm = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      if (activeTab === 'departments') {
        setFormData({ code: '', name: '', head: '', status: 'Active' });
      } else if (activeTab === 'courses') {
        setFormData({ code: '', name: '', department: '', credits: '', status: 'Active' });
      } else {
        setFormData({ year: '', start_date: '', end_date: '', status: 'Active' });
      }
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  const renderTable = () => {
    if (activeTab === 'departments') {
      return (
        <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Head</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className={dept.status === 'Archived' ? 'archived-row' : ''}>
                  <td>{dept.code}</td>
                  <td>{dept.name}</td>
                  <td>{dept.head}</td>
                  <td>
                    <span className={`status-badge ${dept.status.toLowerCase()}`}>
                      {dept.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {dept.status !== 'Archived' ? (
                        <>
                          <button
                            onClick={() => openForm(dept)}
                            className="btn-icon btn-edit"
                            title="Edit"
                            style={{borderColor: '#10b981', color: '#10b981'}}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleArchive(dept.id)}
                            className="btn-icon btn-archive"
                            title="Archive"
                            style={{borderColor: '#ef4444', color: '#ef4444'}}
                          >
                            <Archive size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(dept.id)}
                          className="btn-icon btn-restore"
                          title="Restore"
                          style={{borderColor: '#10b981', color: '#10b981'}}
                        >
                          <ArchiveRestore size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === 'courses') {
      return (
        <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className={course.status === 'Archived' ? 'archived-row' : ''}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.department}</td>
                  <td>{course.credits}</td>
                  <td>
                    <span className={`status-badge ${course.status.toLowerCase()}`}>
                      {course.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {course.status !== 'Archived' ? (
                        <>
                          <button
                            onClick={() => openForm(course)}
                            className="btn-icon btn-edit"
                            title="Edit"
                            style={{borderColor: '#10b981', color: '#10b981'}}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleArchive(course.id)}
                            className="btn-icon btn-archive"
                            title="Archive"
                            style={{borderColor: '#ef4444', color: '#ef4444'}}
                          >
                            <Archive size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(course.id)}
                          className="btn-icon btn-restore"
                          title="Restore"
                          style={{borderColor: '#10b981', color: '#10b981'}}
                        >
                          <ArchiveRestore size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="settings-table-wrapper">
          <table className="settings-table">
            <thead>
              <tr>
                <th>Academic Year</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {academicYears.map((year) => (
                <tr key={year.id} className={year.status === 'Archived' ? 'archived-row' : ''}>
                  <td>{year.year}</td>
                  <td>{year.start_date}</td>
                  <td>{year.end_date}</td>
                  <td>
                    <span className={`status-badge ${year.status.toLowerCase()}`}>
                      {year.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {year.status !== 'Archived' ? (
                        <>
                          <button
                            onClick={() => openForm(year)}
                            className="btn-icon btn-edit"
                            title="Edit"
                            style={{borderColor: '#10b981', color: '#10b981'}}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleArchive(year.id)}
                            className="btn-icon btn-archive"
                            title="Archive"
                            style={{borderColor: '#ef4444', color: '#ef4444'}}
                          >
                            <Archive size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestore(year.id)}
                          className="btn-icon btn-restore"
                          title="Restore"
                          style={{borderColor: '#10b981', color: '#10b981'}}
                        >
                          <ArchiveRestore size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  const renderForm = () => {
    if (activeTab === 'departments') {
      return (
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Code</label>
            <input
              type="text"
              placeholder="e.g., CS, CHEM"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="e.g., Computer Science"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Head</label>
            <input
              type="text"
              placeholder="e.g., John Doe"
              value={formData.head || ''}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={closeForm} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">
              {editingId ? 'Update' : 'Add'} Department
            </button>
          </div>
        </form>
      );
    } else if (activeTab === 'courses') {
      return (        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Code</label>
            <input
              type="text"
              placeholder="e.g., CS101"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="e.g., Introduction to Programming"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.filter(d => d.status !== 'Archived').map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Credits</label>
            <input
              type="number"
              placeholder="e.g., 3"
              value={formData.credits || ''}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={closeForm} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">
              {editingId ? 'Update' : 'Add'} Course
            </button>
          </div>
        </form>
      );
    } else {
      return (
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Academic Year</label>
            <input
              type="text"
              placeholder="e.g., 2024-2025"
              value={formData.year || ''}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.start_date || ''}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={closeForm} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">
              {editingId ? 'Update' : 'Add'} Academic Year
            </button>
          </div>
        </form>
      );
    }
  };

  return (
    <div className="settings-container">
      <Toast toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        isOpen={confirmArchive.isOpen}
        type="warning"
        title="Archive Item"
        message="Are you sure you want to archive this item? You can restore it later."
        confirmText="Archive"
        onConfirm={confirmDoArchive}
        onCancel={() => setConfirmArchive({ isOpen: false, id: null })}
      />
      <div className="settings-header">
        <div>
          <h2>Settings</h2>
          <p className="subtitle">Manage courses, departments, and academic years</p>
        </div>
        <div className="settings-info">
          <div className="info-badge">
            <span className="info-label">Academic Year:</span>
            <span className="info-value">{currentAcademicYear}</span>
          </div>
          <div className="info-badge">
            <span className="info-label">Active Departments:</span>
            <span className="info-value">{activeDepartmentsCount}</span>
          </div>
          <div className="info-badge">
            <span className="info-label">Active Courses:</span>
            <span className="info-value">{activeCoursesCount}</span>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button
            className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Course
          </button>
          <button
            className={`tab-button ${activeTab === 'academic-years' ? 'active' : ''}`}
            onClick={() => setActiveTab('academic-years')}
          >
            Academic Years
          </button>
        </div>

        <div className="settings-body">
          <div className="table-header">
            <h3>
              {activeTab === 'departments' && 'Departments'}
              {activeTab === 'courses' && 'Courses'}
              {activeTab === 'academic-years' && 'Academic Years'}
            </h3>
            <button className="btn-add-setting" onClick={() => openForm()}>
              + Add {activeTab === 'departments' ? 'Department' : activeTab === 'courses' ? 'Course' : 'Academic Year'}
            </button>
          </div>

          {renderTable()}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingId ? 'Edit' : 'Add'} {activeTab === 'departments' ? 'Department' : activeTab === 'courses' ? 'Course' : 'Academic Year'}
            </h3>
            {renderForm()}
          </div>
        </div>
      )}
    </div>
  );
}
