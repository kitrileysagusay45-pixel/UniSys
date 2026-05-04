import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, Activity, PieChart, TrendingUp, Users, BookOpen, AlertCircle, ChevronRight, Filter, Search, Calendar, BarChart2 } from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('summary'); // summary | students | faculty | audit
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, facultyRes, logsRes, enrollmentRes, gradesRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/faculties'),
        axios.get('/api/system/audit-logs'),
        axios.get('/api/admin/reports/enrollment'),
        axios.get('/api/admin/reports/grades')
      ]);
      setStudents(studentRes.data.filter(s => s.status !== 'Archived'));
      setFaculties(facultyRes.data.filter(f => f.status !== 'Archived'));
      setAuditLogs(logsRes.data || []);
      setEnrollmentData(Array.isArray(enrollmentRes.data) ? enrollmentRes.data : (enrollmentRes.data?.data || []));
      setGradeData(gradesRes.data || null);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
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

  const filteredLogs = auditLogs.filter(log => {
    return log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (log.description || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleGenerate = (type) => {
    if (type === 'audit') return;

    let rows, title, tableHeaders;
    const date = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });

    if (type === 'students') {
      rows = filteredStudents;
      title = 'Student Report';
      tableHeaders = '<th>Student ID</th><th>Name</th><th>Email</th><th>Department</th><th>Course</th><th>Year Level</th><th>Status</th>';
    } else if (type === 'faculty') {
      rows = filteredFaculties;
      title = 'Faculty Report';
      tableHeaders = '<th>Faculty ID</th><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Status</th>';
    } else if (type === 'enrollment') {
      rows = enrollmentData;
      title = 'Enrollment Summary Report';
      tableHeaders = '<th>Department</th><th>Students</th><th>Sections</th>';
    }

    const tableRows = rows.map(row => {
      let cells = '';
      if (type === 'students') {
        const fullName = `${row.first_name || ''} ${row.middle_name ? row.middle_name + ' ' : ''}${row.last_name}`.trim() || row.name || 'N/A';
        cells = `<td>${row.student_id || ''}</td><td>${fullName}</td><td>${row.email || ''}</td><td>${row.department || ''}</td><td>${row.course || ''}</td><td>${row.year_level || ''}</td><td>${row.status || ''}</td>`;
      } else if (type === 'faculty') {
        const fullName = `${row.first_name || ''} ${row.middle_name ? row.middle_name + ' ' : ''}${row.last_name}`.trim() || row.name || 'N/A';
        cells = `<td>${row.faculty_id || ''}</td><td>${fullName}</td><td>${row.email || ''}</td><td>${row.department || ''}</td><td>${row.position || ''}</td><td>${row.status || ''}</td>`;
      } else if (type === 'enrollment') {
        cells = `<td>${row.department}</td><td>${row.student_count}</td><td>${row.section_count}</td>`;
      }
      return `<tr>${cells}</tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
      h1 { font-size: 24px; color: #0f172a; margin-bottom: 8px; }
      .meta { font-size: 14px; color: #64748b; margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      th { background: #0f172a; color: #fff; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
      td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
      tr:nth-child(even) td { background: #f8fafc; }
      @media print { body { margin: 20px; } button { display: none; } }
    </style></head><body>
    <h1>UniSys — ${title}</h1>
    <p class="meta">Generated on: ${date} &nbsp;|&nbsp; Total Records: ${rows.length}</p>
    <table><thead><tr>${tableHeaders}</tr></thead><tbody>${tableRows}</tbody></table>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  };

  const handleDownload = (type) => {
    let rows, headers;
    if (type === 'students') {
      rows = filteredStudents;
      headers = ['Student ID', 'Name', 'Email', 'Department', 'Course', 'Year Level', 'Status'];
    } else if (type === 'faculty') {
      rows = filteredFaculties;
      headers = ['Faculty ID', 'Name', 'Email', 'Department', 'Position', 'Status'];
    } else if (type === 'enrollment') {
      rows = enrollmentData;
      headers = ['Department', 'Students', 'Sections'];
    }

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => {
        if (type === 'students') {
          const fullName = `${row.first_name || ''} ${row.middle_name || ''} ${row.last_name || row.name || ''}`.trim();
          return [row.student_id, fullName, row.email, row.department, row.course, row.year_level, row.status].join(',');
        } else if (type === 'faculty') {
          const fullName = `${row.first_name || ''} ${row.middle_name || ''} ${row.last_name || row.name || ''}`.trim();
          return [row.faculty_id, fullName, row.email, row.department, row.position, row.status].join(',');
        } else if (type === 'enrollment') {
          return [row.department, row.student_count, row.section_count].join(',');
        }
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_report.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className='settings-container' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className='spinner'></div>
      </div>
    );
  }

  return (
    <div className='settings-container animated-fade-in'>
      <div className='settings-header'>
        <div>
          <h2>Reports & Analytics</h2>
          <p className='subtitle'>Strategic overview and detailed academic logs</p>
        </div>
        <div className='quick-actions' style={{ display: 'flex', gap: '10px' }}>
          <button className='btn-report blue' onClick={() => handleGenerate(activeTab === 'summary' ? 'enrollment' : activeTab)}>
             <FileText size={18} /> Print Current View
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className='stats-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className='stat-card' style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '10px', borderRadius: '12px' }}><Users size={24} /></div>
          <div><p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Students</p><p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{students.length}</p></div>
        </div>
        <div className='stat-card' style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#f0fdf4', color: '#22c55e', padding: '10px', borderRadius: '12px' }}><TrendingUp size={24} /></div>
          <div><p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Enrollment</p><p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{enrollmentData.reduce((acc, curr) => acc + curr.student_count, 0)}</p></div>
        </div>
        <div className='stat-card' style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#fff7ed', color: '#f97316', padding: '10px', borderRadius: '12px' }}><BookOpen size={24} /></div>
          <div><p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Sections</p><p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{enrollmentData.reduce((acc, curr) => acc + curr.section_count, 0)}</p></div>
        </div>
        <div className='stat-card' style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '1rem', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ background: '#faf5ff', color: '#a855f7', padding: '10px', borderRadius: '12px' }}><Activity size={24} /></div>
          <div><p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Audit Logs</p><p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{auditLogs.length}</p></div>
        </div>
      </div>

      <div className='settings-content'>
        <div className='settings-tabs' style={{ marginBottom: '1.5rem' }}>
          <button className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary & Grades</button>
          <button className={`tab-button ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>Student List</button>
          <button className={`tab-button ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => setActiveTab('faculty')}>Faculty List</button>
          <button className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>Audit Logs</button>
        </div>

        <div className='settings-body'>
          {activeTab === 'summary' ? (
            <div className='summary-view animated-fade-in'>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Enrollment Summary Table */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}><Filter size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Enrollment by Department</h3>
                    <button onClick={() => handleDownload('enrollment')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>CSV</button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr><th style={{ padding: '12px', fontSize: '0.75rem', textAlign: 'left' }}>Department</th><th style={{ padding: '12px', fontSize: '0.75rem', textAlign: 'center' }}>Students</th><th style={{ padding: '12px', fontSize: '0.75rem', textAlign: 'center' }}>Sections</th></tr>
                    </thead>
                    <tbody>
                      {enrollmentData.map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{d.department}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', textAlign: 'center' }}>{d.student_count}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', textAlign: 'center' }}>{d.section_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grade Distribution */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem' }}>
                   <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}><PieChart size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Grade Distribution</h3>
                   {gradeData ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f0fdf4', borderRadius: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#166534' }}>Passed Students</span>
                          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#166534' }}>{gradeData.distribution?.Passed || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff1f2', borderRadius: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#991b1b' }}>Failed Students</span>
                          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#991b1b' }}>{gradeData.distribution?.Failed || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fef3c7', borderRadius: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#92400e' }}>Incomplete</span>
                          <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#92400e' }}>{gradeData.distribution?.Incomplete || 0}</span>
                        </div>
                        <div style={{ marginTop: '10px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem' }}>
                            <span>Average GWA Across All Depts:</span>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{gradeData.average_gwa ? parseFloat(gradeData.average_gwa).toFixed(4) : 'N/A'}</span>
                          </div>
                        </div>
                     </div>
                   ) : (
                     <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No grade data available.</div>
                   )}
                </div>
              </div>

              {/* Department Performance List */}
              <div style={{ marginTop: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                 <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem' }}><BarChart2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Department Academic Performance</h3>
                 </div>
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '12px', fontSize: '0.75rem', textAlign: 'left' }}>Department</th>
                        <th style={{ padding: '12px', fontSize: '0.75rem', textAlign: 'center' }}>Avg GWA</th>
                        <th style={{ padding: '12px', fontSize: '0.75rem', textAlign: 'center' }}>Pass Rate</th>
                        <th style={{ padding: '12px', fontSize: '0.75rem', textAlign: 'center' }}>Total Grades</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradeData?.department_averages?.map((d, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{d.department}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', textAlign: 'center', color: '#3b82f6', fontWeight: 700 }}>{parseFloat(d.avg_gwa).toFixed(4)}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                               <div style={{ width: '60px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${(d.pass_count / d.total_count) * 100}%`, height: '100%', background: '#22c55e' }}></div>
                               </div>
                               <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{Math.round((d.pass_count / d.total_count) * 100)}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', textAlign: 'center', color: '#64748b' }}>{d.total_count}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          ) : (
            <>
              <div className='table-header' style={{ marginBottom: '1rem' }}>
                <h3>
                  {activeTab === 'students' && `Complete Student Registry (${filteredStudents.length})`}
                  {activeTab === 'faculty' && `Faculty Member Directory (${filteredFaculties.length})`}
                  {activeTab === 'audit' && `Security & Activity Logs (${filteredLogs.length})`}
                </h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className='search-box' style={{ maxWidth: '250px' }}>
                    <Search size={16} className='search-icon' />
                    <input type='text' placeholder='Search records...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  {activeTab !== 'audit' && (
                    <button className='secondary-btn' onClick={() => handleDownload(activeTab)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
                      <Download size={16} /> CSV
                    </button>
                  )}
                </div>
              </div>

              <div className='settings-table-wrapper'>
                {activeTab === 'students' && (
                  <table className='settings-table'>
                    <thead>
                      <tr><th>Student ID</th><th>Name</th><th>Email</th><th>Department</th><th>Course</th><th>Year Level</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => (
                        <tr key={s.id}>
                          <td><span style={{ fontWeight: 700, color: '#3b82f6' }}>{s.student_id}</span></td>
                          <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                          <td>{s.email}</td>
                          <td>{s.department}</td>
                          <td>{s.course}</td>
                          <td>{s.year_level}</td>
                          <td><span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'faculty' && (
                  <table className='settings-table'>
                    <thead>
                      <tr><th>Faculty ID</th><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {filteredFaculties.map((f) => (
                        <tr key={f.id}>
                          <td><span style={{ fontWeight: 700, color: '#3b82f6' }}>{f.faculty_id}</span></td>
                          <td style={{ fontWeight: 600 }}>{f.first_name} {f.last_name}</td>
                          <td>{f.email}</td>
                          <td>{f.department}</td>
                          <td>{f.position}</td>
                          <td><span className={`status-badge ${f.status.toLowerCase()}`}>{f.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'audit' && (
                  <table className='settings-table'>
                    <thead>
                      <tr><th>Timestamp</th><th>Action</th><th>Description</th><th>IP Address</th></tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map(log => (
                        <tr key={log.id}>
                          <td><span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(log.created_at).toLocaleString()}</span></td>
                          <td><span style={{ padding: '4px 8px', borderRadius: '6px', background: '#f1f5f9', fontWeight: 700, fontSize: '0.75rem' }}>{log.action}</span></td>
                          <td style={{ fontSize: '0.85rem' }}>{log.description}</td>
                          <td><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.ip_address || '—'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
