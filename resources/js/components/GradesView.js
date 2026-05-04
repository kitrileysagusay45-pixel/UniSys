import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Download, Filter, Search, ChevronRight, AlertCircle, Calendar, Award } from "lucide-react";
import { exportGradeReport } from "../utils/ExportUtils";

export default function GradesView({ user, studentId, onBack }) {
  const [grades, setGrades] = useState([]);
  const [gwa, setGwa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");

  useEffect(() => {
    axios.get("/api/student/my-grades")
      .then(res => {
        setGrades(res.data.grades || res.data || []);
        setGwa(res.data.gwa || null);
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const academicYears = ["All", ...new Set(grades.map(g => g.academic_year).filter(Boolean))];
  const semesters = ["All", ...new Set(grades.map(g => g.semester).filter(Boolean))];

  const filtered = grades.filter(g => {
    const matchSearch = (g.course?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (g.course?.code || '').toLowerCase().includes(search.toLowerCase()) ||
                        (g.subject?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (g.subject?.code || '').toLowerCase().includes(search.toLowerCase());
    const matchYear = filterYear === "All" || g.academic_year === filterYear;
    const matchSem = filterSemester === "All" || g.semester === filterSemester;
    return matchSearch && matchYear && matchSem;
  });

  const fmtGrade = (v) => v !== null && v !== undefined ? parseFloat(v).toFixed(2) : "—";
  const gradeColor = (v) => {
    if (v === null || v === undefined) return '#94a3b8';
    return parseFloat(v) <= 3.0 ? '#059669' : '#dc2626';
  };
  const remarksBadge = (r) => {
    const colors = { Passed: '#059669', Failed: '#dc2626', Incomplete: '#f59e0b', Dropped: '#6b7280' };
    return { background: `${colors[r] || '#94a3b8'}15`, color: colors[r] || '#94a3b8', border: `1px solid ${colors[r] || '#94a3b8'}30` };
  };

  // Compute displayed GWA from filtered grades if no server GWA
  const computedGWA = () => {
    if (gwa !== null && gwa !== undefined) return parseFloat(gwa).toFixed(4);
    const withFinal = filtered.filter(g => g.final_grade);
    if (withFinal.length === 0) return "N/A";
    const total = withFinal.reduce((sum, g) => {
      const units = g.subject?.units || 3;
      return sum + (units * parseFloat(g.final_grade));
    }, 0);
    const totalUnits = withFinal.reduce((sum, g) => sum + (g.subject?.units || 3), 0);
    return totalUnits > 0 ? (total / totalUnits).toFixed(4) : "N/A";
  };

  if (loading) {
    return (<div className="grades-loading"><div className="spinner"></div><p>Loading academic records...</p></div>);
  }

  return (
    <div className="grades-view animated-fade-in">
      <div className="grades-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-btn" onClick={onBack} title="Back" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Academic Grades</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Three-period grading: Prelim, Midterm, Finals</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button 
            onClick={() => exportGradeReport(user?.name || user?.first_name || 'Student', filtered, 'AY 2025-2026')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
          >
            <Download size={18} /> Export to Excel
          </button>
      </div>
    </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', flex: '1', maxWidth: '300px' }}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Search subjects..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', outline: 'none', padding: '10px 0', width: '100%', fontSize: '0.9rem' }} />
        </div>
        <select value={filterSemester} onChange={e => setFilterSemester(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}>
          {semesters.map(s => <option key={s} value={s}>{s === 'All' ? 'All Semesters' : s}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}>
          {academicYears.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <AlertCircle size={48} style={{ marginBottom: '12px' }} />
          <h3>No records found</h3>
          <p>No grade records match your criteria.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Subject','Instructor','Term','Prelim','Midterm','Finals','Final Grade','Remarks'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: ['Prelim','Midterm','Finals','Final Grade'].includes(h) ? 'center' : 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((g, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div><span style={{ fontWeight: 700, color: '#1a5fb4', fontSize: '0.8rem' }}>{g.subject?.code || g.course?.code}</span></div>
                    <div style={{ fontSize: '0.85rem', color: '#374151' }}>{g.subject?.name || g.course?.name}</div>
                    {g.subject?.units && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{g.subject.units} units</div>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#475569' }}>{g.faculty ? `${g.faculty.first_name} ${g.faculty.last_name}` : "—"}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{g.semester}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{g.academic_year}</div>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: gradeColor(g.prelim), fontSize: '0.9rem' }}>{fmtGrade(g.prelim)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: gradeColor(g.midterm), fontSize: '0.9rem' }}>{fmtGrade(g.midterm)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: gradeColor(g.finals), fontSize: '0.9rem' }}>{fmtGrade(g.finals)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: gradeColor(g.final_grade), background: `${gradeColor(g.final_grade)}10`, padding: '4px 12px', borderRadius: '8px' }}>{fmtGrade(g.final_grade)}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ ...remarksBadge(g.remarks), padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>{g.remarks || "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '10px' }}><FileText size={22} color="#3b82f6" /></div>
          <div><span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Subjects</span><br/><span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{grades.length}</span></div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '10px' }}><Award size={22} color="#059669" /></div>
          <div><span style={{ fontSize: '0.8rem', color: '#64748b' }}>General Weighted Average</span><br/><span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>{computedGWA()}</span></div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#fef3c7', borderRadius: '10px', padding: '10px' }}><Calendar size={22} color="#f59e0b" /></div>
          <div><span style={{ fontSize: '0.8rem', color: '#64748b' }}>Passed</span><br/><span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>{grades.filter(g => g.remarks === 'Passed').length}</span> / <span style={{ color: '#dc2626' }}>{grades.filter(g => g.remarks === 'Failed').length} Failed</span></div>
        </div>
      </div>
    </div>
  );
}
