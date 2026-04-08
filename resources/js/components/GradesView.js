import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Download, Filter, Search, ChevronRight, AlertCircle, Calendar } from "lucide-react";
// import "../../sass/grades.scss";

export default function GradesView({ studentId, onBack }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState("All");

  useEffect(() => {
    axios.get("/api/student/my-grades")
      .then(res => {
        setGrades(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const academicYears = ["All", ...new Set(grades.map(g => g.academic_year))];

  const filteredGrades = grades.filter(g => {
    const matchesSearch = g.course?.name?.toLowerCase().includes(search.toLowerCase()) || 
                         g.course?.code?.toLowerCase().includes(search.toLowerCase());
    const matchesYear = filterYear === "All" || g.academic_year === filterYear;
    return matchesSearch && matchesYear;
  });

  if (loading) {
    return (
      <div className="grades-loading">
        <div className="spinner"></div>
        <p>Loading academic records...</p>
      </div>
    );
  }

  return (
    <div className="grades-view animated-fade-in">
      <div className="grades-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack} title="Back to Dashboard">
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div className="header-info">
            <h1>Academic Grades</h1>
            <p>Official transcript of records and semester summaries</p>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="export-btn">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grades-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search subjects..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredGrades.length === 0 ? (
        <div className="empty-grades">
          <AlertCircle size={48} />
          <h3>No records found</h3>
          <p>We couldn't find any grade records matching your criteria.</p>
        </div>
      ) : (
        <div className="grades-table-container shadow-premium">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Instructor</th>
                <th>Term</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map((g, idx) => (
                <tr key={idx} className="grade-row">
                  <td className="subject-cell">
                    <div className="subject-info">
                      <span className="code">{g.course?.code}</span>
                      <span className="name">{g.course?.name}</span>
                    </div>
                  </td>
                  <td className="instructor-cell">
                    {g.faculty ? `${g.faculty.first_name} ${g.faculty.last_name}` : "N/A"}
                  </td>
                  <td className="term-cell">
                    <div className="term-info">
                      <span className="semester">{g.semester}</span>
                      <span className="year">{g.academic_year}</span>
                    </div>
                  </td>
                  <td className="grade-cell">
                    <span className={`grade-badge ${parseFloat(g.grade) <= 3.0 ? 'pass' : 'fail'}`}>
                      {parseFloat(g.grade).toFixed(2)}
                    </span>
                  </td>
                  <td className="remarks-cell">
                    <span className={`remarks-badge ${g.remarks?.toLowerCase()}`}>
                      {g.remarks || "No Remarks"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grades-summary-cards">
        <div className="summary-card shadow-sm">
          <div className="card-icon blue"><FileText /></div>
          <div className="card-content">
            <span className="label">Total Subjects</span>
            <span className="value">{grades.length}</span>
          </div>
        </div>
        <div className="summary-card shadow-sm">
          <div className="card-icon green"><Calendar /></div>
          <div className="card-content">
            <span className="label">Current GPA</span>
            <span className="value">
              {(grades.reduce((acc, g) => acc + parseFloat(g.grade), 0) / (grades.length || 1)).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
