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
import { 
  GraduationCap, Users, Building2, TrendingUp, Calendar, 
  Plus, BookOpen, Bell, Info, AlertTriangle, Activity, 
  Clock, CheckCircle, ArrowUpRight, Zap, Download
} from "lucide-react";
import { exportStudentReport } from "../utils/ExportUtils";

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

// Sparkline component for stat cards
const Sparkline = ({ color = "#6366f1" }) => (
  <svg width="60" height="20" viewBox="0 0 60 20" style={{ marginLeft: '10px' }}>
    <path
      d="M0 15 Q 15 5, 30 12 T 60 8"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
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
    totalDepartments: 0,
    pendingStudents: 0,
    pendingFaculty: 0
  });

  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
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

  const handleExport = async () => {
    try {
      const res = await axios.get("/api/students");
      exportStudentReport(res.data, 'AY 2025-2026');
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, facultiesRes, countsRes, annRes, settingsRes, logsRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/faculties"),
        axios.get("/api/dashboard-counts"),
        axios.get("/api/announcements/dashboard"),
        axios.get("/api/system/settings"),
        axios.get("/api/system/audit-logs")
      ]);

      setStudents(studentsRes.data.filter(s => s.status !== "Archived"));
      setFaculties(facultiesRes.data.filter(f => f.status !== "Archived"));
      setDashboardData({
        totalStudents: countsRes.data.students,
        totalFaculty: countsRes.data.faculties,
        totalCourses: countsRes.data.courses,
        totalDepartments: countsRes.data.departments,
        pendingStudents: studentsRes.data.filter(s => s.status === 'Pending').length,
        pendingFaculty: facultiesRes.data.filter(f => f.status === 'Pending').length
      });
      
      setAnnouncements(annRes.data);
      setAuditLogs(logsRes.data || []);
      if (settingsRes.data.active_semester) {
        setActiveSemester(settingsRes.data.active_semester);
      }

      setChartKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  const chartColors = {
    primary: '#6366f1', // Indigo
    secondary: '#14b8a6', // Teal
    accent: '#f59e0b', // Amber
    neutral: '#64748b', // Slate
    bg: '#f8fafc'
  };

  // Chart Data Calculations
  const courseData = students.reduce((acc, student) => { acc[student.course] = (acc[student.course] || 0) + 1; return acc; }, {});
  const studentsPerCourseData = { 
    labels: Object.keys(courseData), 
    datasets: [{ 
      label: "Students", 
      data: Object.values(courseData), 
      backgroundColor: chartColors.primary, 
      borderRadius: 8,
      hoverBackgroundColor: '#4f46e5'
    }] 
  };

  const facultyDeptData = faculties.reduce((acc, faculty) => { acc[faculty.department] = (acc[faculty.department] || 0) + 1; return acc; }, {});
  const facultyPerDeptData = { 
    labels: Object.keys(facultyDeptData), 
    datasets: [{ 
      data: Object.values(facultyDeptData), 
      backgroundColor: [chartColors.primary, chartColors.secondary, chartColors.accent, '#8b5cf6', '#ec4899'], 
      borderWidth: 0,
      hoverOffset: 15
    }] 
  };

  const studentDeptData = students.reduce((acc, student) => { acc[student.department] = (acc[student.department] || 0) + 1; return acc; }, {});
  const studentsPerDeptData = { 
    labels: Object.keys(studentDeptData), 
    datasets: [{ 
      label: "Students", 
      data: Object.values(studentDeptData), 
      backgroundColor: chartColors.secondary, 
      borderRadius: 8 
    }] 
  };

  const yearLevelData = students.reduce((acc, student) => { 
    if (student.year_level && student.year_level !== "null") {
      acc[student.year_level] = (acc[student.year_level] || 0) + 1; 
    }
    return acc; 
  }, {});
  const enrollmentData = { 
    labels: Object.keys(yearLevelData).sort(), 
    datasets: [{ 
      label: "Students", 
      data: Object.values(yearLevelData), 
      backgroundColor: '#8b5cf6', 
      borderRadius: 8 
    }] 
  };

  const chartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    }, 
    scales: { 
      y: { 
        beginAtZero: true, 
        grid: { color: "#f1f5f9", drawBorder: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      }, 
      x: { 
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } }
      } 
    } 
  };
  
  const doughnutOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    cutout: '70%',
    plugins: { 
      legend: { 
        position: "bottom", 
        labels: { 
          usePointStyle: true, 
          padding: 20,
          font: { size: 12, family: 'Inter' },
          color: '#475569'
        } 
      } 
    } 
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Administrative Insights</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{activeSemester ? `Academic Year 2025-2026 | ${activeSemester}` : 'System Overview'}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="export-btn" 
              onClick={handleExport}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
            >
              <Download size={18} /> Export Data
            </button>
            <button className="primary-btn" onClick={() => window.history.pushState({}, '', '/announcements')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)' }}>
              <Zap size={18} /> New Broadcast
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {[
            { label: 'Create Schedule', icon: Calendar, path: '/subjects', color: '#f59e0b' },
            { label: 'Post Announcement', icon: Bell, path: '/announcements', color: '#8b5cf6' }
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => { window.history.pushState({}, '', action.path); window.dispatchEvent(new PopStateEvent('popstate')); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = action.color}
              onMouseOut={e => e.currentTarget.style.borderColor = '#f1f5f9'}
            >
              <div style={{ background: `${action.color}15`, color: action.color, padding: '8px', borderRadius: '8px' }}>
                <action.icon size={20} />
              </div>
              <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Students', value: dashboardData.totalStudents, icon: GraduationCap, color: '#6366f1', trend: '+5.2%' },
            { label: 'Total Faculty', value: dashboardData.totalFaculty, icon: Users, color: '#14b8a6', trend: '+2.4%' },
            { label: 'Active Courses', value: dashboardData.totalCourses, icon: BookOpen, color: '#f59e0b', trend: '+1.0%' },
            { label: 'Departments', value: dashboardData.totalDepartments, icon: Building2, color: '#8b5cf6', trend: 'Stable' }
          ].map((stat, i) => (
            <div key={i} className="info-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '8px' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{stat.value}</h3>
                </div>
                <div style={{ background: `${stat.color}10`, color: stat.color, padding: '10px', borderRadius: '12px' }}>
                  <stat.icon size={24} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: stat.trend.includes('+') ? '#10b981' : '#64748b', background: stat.trend.includes('+') ? '#dcfce7' : '#f1f5f9', padding: '2px 8px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {stat.trend.includes('+') && <TrendingUp size={12} />} {stat.trend}
                </span>
                <Sparkline color={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {(dashboardData.pendingStudents > 0 || dashboardData.pendingFaculty > 0) && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#3b82f615', color: '#3b82f6', padding: '8px', borderRadius: '50%' }}>
              <Info size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>Action Required: Pending Registrations</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                There are <strong>{dashboardData.pendingStudents}</strong> students and <strong>{dashboardData.pendingFaculty}</strong> faculty members awaiting approval.
              </p>
            </div>
            <button 
              onClick={() => { window.history.pushState({}, '', '/students'); window.dispatchEvent(new PopStateEvent('popstate')); }}
              style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
            >
              Review Now
            </button>
          </div>
        )}


        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          <div className="chart-grid-main" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div className="chart-box" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Students per Course</h4>
              <div style={{ height: '240px' }}><Bar key={`c-c-${chartKey}`} data={studentsPerCourseData} options={chartOptions} /></div>
            </div>
            <div className="chart-box" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Faculty by Department</h4>
              <div style={{ height: '240px' }}><Doughnut key={`f-c-${chartKey}`} data={facultyPerDeptData} options={doughnutOptions} /></div>
            </div>
            <div className="chart-box" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Students by Department</h4>
              <div style={{ height: '240px' }}><Bar key={`s-d-c-${chartKey}`} data={studentsPerDeptData} options={chartOptions} /></div>
            </div>
            <div className="chart-box" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Academic Population by Year</h4>
              <div style={{ height: '240px' }}><Bar key={`y-c-${chartKey}`} data={enrollmentData} options={chartOptions} /></div>
            </div>
          </div>

          <div className="sidebar-widgets" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Recent Activity Feed */}
            <div className="widget-box" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} style={{ color: '#6366f1' }} /> Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {auditLogs.length > 0 ? auditLogs.slice(0, 6).map((log, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.action?.includes('delete') ? '#ef4444' : '#10b981' }}></div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', fontWeight: 600, lineHeight: '1.4' }}>{log.action}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Clock size={12} style={{ color: '#94a3b8' }} />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No recent activities found.</p>
                )}
              </div>
            </div>

            {/* Announcements */}
            <div className="widget-box" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', color: '#fff' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={20} style={{ color: '#fbbf24' }} /> Broadcasts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {announcements.slice(0, 3).map((ann, i) => (
                  <div key={i} style={{ paddingBottom: i < 2 ? '1rem' : 0, borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#f8fafc' }}>{ann.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>{ann.content?.substring(0, 80)}...</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => { window.history.pushState({}, '', '/announcements'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                style={{ width: '100%', marginTop: '1.25rem', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                View Bulletin Board
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
