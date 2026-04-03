import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText } from 'lucide-react';
import '../../sass/settings.scss';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [studentRes, facultyRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/faculties'),
      ]);
      setStudents(studentRes.data.filter(s => s.status !== 'Archived'));
      setFaculties(facultyRes.data.filter(f => f.status !== 'Archived'));
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name || ''} ${s.middle_name || ''} ${s.last_name || ''} ${s.name || ''}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (s.student_id || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFaculties = faculties.filter(f => {
    const fullName = `${f.first_name || ''} ${f.middle_name || ''} ${f.last_name || ''} ${f.name || ''}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (f.faculty_id || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleGenerate = (type) => {
    const isStudent = type === 'students';
    const rows = isStudent ? filteredStudents : filteredFaculties;
    const title = isStudent ? 'Student Report' : 'Faculty Report';
    const date = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

    const tableHeaders = isStudent
      ? '<th>Student ID</th><th>Name</th><th>Email</th><th>Department</th><th>Course</th><th>Year Level</th><th>Status</th>'
      : '<th>Faculty ID</th><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Status</th>';

    const tableRows = rows.map(row => {
      const fullName = row.first_name && row.last_name
        ? `${row.first_name} ${row.middle_name ? row.middle_name + ' ' : ''}${row.last_name}`.trim()
        : row.name || 'N/A';
      const cells = isStudent
        ? `<td>${row.student_id || ''}</td><td>${fullName}</td><td>${row.email || ''}</td><td>${row.department || ''}</td><td>${row.course || ''}</td><td>${row.year_level || ''}</td><td>${row.status || ''}</td>`
        : `<td>${row.faculty_id || ''}</td><td>${fullName}</td><td>${row.email || ''}</td><td>${row.department || ''}</td><td>${row.position || ''}</td><td>${row.status || ''}</td>`;
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a2e; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .meta { font-size: 13px; color: #666; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #1a1a2e; color: #fff; padding: 10px 12px; text-align: left; }
      td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
      tr:nth-child(even) td { background: #f9fafb; }
      @media print { body { margin: 20px; } }
    </style></head><body>
    <h1>UniSys — ${title}</h1>
    <p class="meta">Generated on: ${date} &nbsp;|&nbsp; Total Records: ${rows.length}</p>
    <table><thead><tr>${tableHeaders}</tr></thead><tbody>${tableRows}</tbody></table>
    <script>window.onload = () => { window.print(); }<\/script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  // Download CSV report
  const handleDownload = (type) => {
    const rows = type === 'students' ? filteredStudents : filteredFaculties;
    const headers =
      type === 'students'
        ? ['Student ID', 'Name', 'Email', 'Department', 'Course', 'Year Level', 'Status']
        : ['Faculty ID', 'Name', 'Email', 'Department', 'Position', 'Status'];

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => {
        const fullName = `${row.first_name || ''} ${row.middle_name || ''} ${row.last_name || row.name || ''}`.trim();
        return type === 'students'
          ? [
              row.student_id,
              fullName,
              row.email,
              row.department,
              row.course,
              row.year_level,
              row.status,
            ].join(',')
          : [
              row.faculty_id,
              fullName,
              row.email,
              row.department,
              row.position,
              row.status,
            ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_report.csv`;
    link.click();
  };

  const totalReports = students.length + faculties.length;

  return (
    <div className='settings-container'>
      <div className='settings-header'>
        <div>
          <h2>Reports</h2>
          <p className='subtitle'>Generate and download reports for students and faculty</p>
        </div>
        <div className='settings-info'>
          <div className='info-badge'>
            <span className='info-label'>Total Students:</span>
            <span className='info-value'>{students.length}</span>
          </div>
          <div className='info-badge'>
            <span className='info-label'>Total Faculty:</span>
            <span className='info-value'>{faculties.length}</span>
          </div>
          <div className='info-badge'>
            <span className='info-label'>Total Reports:</span>
            <span className='info-value'>{totalReports}</span>
          </div>
        </div>
      </div>

      <div className='settings-content'>
        <div className='settings-tabs'>
          <button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Students
          </button>
          <button
            className={`tab-button ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            Faculty
          </button>
        </div>

        <div className='settings-body'>
          {/* BUTTONS ABOVE THE LINE */}
          <div className='report-action-buttons'>
            <button
              className='btn-report blue'
              onClick={() => handleGenerate(activeTab)}
            >
              <FileText size={16} /> Generate {activeTab === 'students' ? 'Student' : 'Faculty'} Report
            </button>
            <button
              className='btn-report dark-blue'
              onClick={() => handleDownload(activeTab)}
            >
              <Download size={16} /> Download {activeTab === 'students' ? 'Student' : 'Faculty'} Report
            </button>
          </div>

          <div className='table-header'>
            <h3>
              {activeTab === 'students'
                ? `Student Report (${filteredStudents.length} records)`
                : `Faculty Report (${filteredFaculties.length} records)`}
            </h3>
            <div className='search-box' style={{ maxWidth: '250px' }}>
              <input
                type='text'
                placeholder='Search...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className='settings-table-wrapper'>
            {activeTab === 'students' ? (
              <table className='settings-table'>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Year Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => {
                    const fullName = s.first_name && s.last_name
                      ? `${s.first_name} ${s.middle_name ? s.middle_name + ' ' : ''}${s.last_name}`.trim()
                      : s.name || 'N/A';
                    return (
                      <tr key={s.id}>
                        <td>{s.student_id}</td>
                        <td>{fullName}</td>
                        <td>{s.email}</td>
                        <td>{s.department}</td>
                        <td>{s.course}</td>
                        <td>{s.year_level}</td>
                        <td>
                          <span className={`status-badge ${s.status.toLowerCase()}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className='settings-table'>
                <thead>
                  <tr>
                    <th>Faculty ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculties.map((f) => {
                    const fullName = f.first_name && f.last_name
                      ? `${f.first_name} ${f.middle_name ? f.middle_name + ' ' : ''}${f.last_name}`.trim()
                      : f.name || 'N/A';
                    return (
                      <tr key={f.id}>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
