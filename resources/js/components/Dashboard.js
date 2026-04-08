// resources/js/components/Dashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCounts } from "../Context/CountContext";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { GraduationCap, Users, Building2, TrendingUp, Calendar, Plus, BookOpen, Bell, Info, AlertTriangle } from "lucide-react";
// import "../../sass/dashboard.scss";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ user }) {
  const { counts } = useCounts();
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [chartKey, setChartKey] = useState(0); 
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalDepartments: 0
  });

  const [announcements, setAnnouncements] = useState([]);
  const [activeSemester, setActiveSemester] = useState("");

  const colorPalette = [
    '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', 
    '#06b6d4', '#ef4444', '#84cc16', '#f97316', '#6366f1', 
    '#14b8a6', '#a855f7', '#f43f5e', '#0ea5e9', '#eab308'
  ];

  const getColorForLabel = (label, index) => colorPalette[index % colorPalette.length];
  const generateColors = (labels) => labels.map((label, index) => getColorForLabel(label, index));

  useEffect(() => {
    fetchDashboardData();
    const handleDataUpdate = () => {
      fetchDashboardData();
      setChartKey(prevKey => prevKey + 1);
    };
    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, facultiesRes, countsRes, annRes, settingsRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/faculties"),
        axios.get("/api/dashboard-counts"),
        axios.get("/api/announcements/dashboard"),
        axios.get("/api/system/settings")
      ]);

      setStudents(studentsRes.data.filter(s => s.status !== "Archived"));
      setFaculties(facultiesRes.data.filter(f => f.status !== "Archived"));
      setDashboardData({
        totalStudents: countsRes.data.students,
        totalFaculty: countsRes.data.faculties,
        totalCourses: countsRes.data.courses,
        totalDepartments: countsRes.data.departments
      });
      
      setAnnouncements(annRes.data);
      if (settingsRes.data.active_semester) {
        setActiveSemester(settingsRes.data.active_semester);
      }

      setChartKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  // Chart Data Calculations
  const courseData = students.reduce((acc, student) => { acc[student.course] = (acc[student.course] || 0) + 1; return acc; }, {});
  const studentsPerCourseData = { labels: Object.keys(courseData), datasets: [{ label: "Students", data: Object.values(courseData), backgroundColor: generateColors(Object.keys(courseData)), borderRadius: 6 }] };

  const facultyDeptData = faculties.reduce((acc, faculty) => { acc[faculty.department] = (acc[faculty.department] || 0) + 1; return acc; }, {});
  const facultyPerDeptData = { labels: Object.keys(facultyDeptData), datasets: [{ data: Object.values(facultyDeptData), backgroundColor: generateColors(Object.keys(facultyDeptData)), borderWidth: 0 }] };

  const studentDeptData = students.reduce((acc, student) => { acc[student.department] = (acc[student.department] || 0) + 1; return acc; }, {});
  const studentsPerDeptData = { labels: Object.keys(studentDeptData), datasets: [{ label: "Students", data: Object.values(studentDeptData), backgroundColor: generateColors(Object.keys(studentDeptData)), borderRadius: 6 }] };

  const yearLevelData = students.reduce((acc, student) => { acc[student.year_level] = (acc[student.year_level] || 0) + 1; return acc; }, {});
  const enrollmentData = { labels: Object.keys(yearLevelData), datasets: [{ label: "Students", data: Object.values(yearLevelData), backgroundColor: generateColors(Object.keys(yearLevelData)), borderRadius: 6 }] };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: "#f3f4f6" } }, x: { grid: { display: false } } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { usePointStyle: true, padding: 15 } } } };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-left">
          <div>
            <h2>Dashboard Overview</h2>
            <p className="welcome-text" style={{margin: 0}}>{activeSemester ? `Active Semester: ${activeSemester}` : 'System Overview'}</p>
          </div>
        </div>
        <div className="quick-actions" style={{ display: 'flex', gap: '10px' }}>
            <button className="primary-btn" onClick={() => window.history.pushState({}, '', '/students')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /> Add Student</button>
            <button className="secondary-btn" onClick={() => window.history.pushState({}, '', '/faculty')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}><Plus size={16} /> Add Faculty</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="cards-grid">
          <div className="info-card">
            <div className="card-content">
              <h3>Total Students</h3>
              <p className="card-value">{dashboardData.totalStudents}</p>
              <div style={{display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '0.8rem', marginTop: '5px'}}>
                <TrendingUp size={14} style={{marginRight: '4px'}}/> +5.2% this month
              </div>
            </div>
            <div className="card-icon"><GraduationCap size={32} strokeWidth={1.5} /></div>
          </div>
          <div className="info-card">
            <div className="card-content">
              <h3>Total Courses</h3>
              <p className="card-value">{dashboardData.totalCourses}</p>
              <div style={{display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '0.8rem', marginTop: '5px'}}>
                <TrendingUp size={14} style={{marginRight: '4px'}}/> +1.0% this month
              </div>
            </div>
            <div className="card-icon"><BookOpen size={32} strokeWidth={1.5} /></div>
          </div>
          <div className="info-card">
            <div className="card-content">
              <h3>Total Faculty</h3>
              <p className="card-value">{dashboardData.totalFaculty}</p>
              <div style={{display: 'flex', alignItems: 'center', color: '#10b981', fontSize: '0.8rem', marginTop: '5px'}}>
                <TrendingUp size={14} style={{marginRight: '4px'}}/> +2.4% this month
              </div>
            </div>
            <div className="card-icon"><Users size={32} strokeWidth={1.5} /></div>
          </div>
          <div className="info-card">
            <div className="card-content">
              <h3>Total Departments</h3>
              <p className="card-value">{dashboardData.totalDepartments}</p>
            </div>
            <div className="card-icon"><Building2 size={32} strokeWidth={1.5} /></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>
          <div className="chart-section" style={{ margin: 0 }}>
            <div className="chart-box">
              <div className="chart-header">
                <h3>Students per Course</h3>
              </div>
              <div className="chart-canvas"><Bar key={`c-c-${chartKey}`} data={studentsPerCourseData} options={chartOptions} /></div>
            </div>
            <div className="chart-box">
              <div className="chart-header">
                <h3>Faculty per Department</h3>
              </div>
              <div className="chart-canvas"><Doughnut key={`f-c-${chartKey}`} data={facultyPerDeptData} options={doughnutOptions} /></div>
            </div>
            <div className="chart-box">
              <div className="chart-header">
                <h3>Students per Department</h3>
              </div>
              <div className="chart-canvas"><Bar key={`s-d-c-${chartKey}`} data={studentsPerDeptData} options={chartOptions} /></div>
            </div>
            <div className="chart-box">
              <div className="chart-header">
                <h3>Students by Year Level</h3>
              </div>
              <div className="chart-canvas"><Bar key={`y-c-${chartKey}`} data={enrollmentData} options={chartOptions} /></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="activity-section" style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                <Bell size={20} className="text-primary" /> Announcements
              </h3>
              {announcements.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {announcements.map(ann => (
                    <div key={ann.id} style={{ padding: '12px', borderRadius: '8px', background: ann.type === 'urgent' ? '#fff1f2' : '#f8fafc', borderLeft: `4px solid ${ann.type === 'urgent' ? '#e11d48' : '#3b82f6'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {ann.type === 'urgent' ? <AlertTriangle size={14} color="#e11d48" /> : <Info size={14} color="#3b82f6" />}
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: ann.type === 'urgent' ? '#9f1239' : '#1e40af' }}>{ann.title}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{ann.content}</p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>{new Date(ann.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #64748b)' }}>No new announcements.</p>
              )}
              <button 
                onClick={() => window.history.pushState({}, '', '/announcements')}
                style={{ width: '100%', marginTop: '1rem', padding: '8px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}
              >
                Manage Announcements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
