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
import { GraduationCap, Users, Building2 } from "lucide-react";
import "../../sass/dashboard.scss";

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

export default function Dashboard({ user, onLogout }) {
  const { counts } = useCounts();
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [chartKey, setChartKey] = useState(0); // Key to force chart re-render
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalDepartments: 0
  });

  // Color palette for departments and courses
  const colorPalette = [
    '#3b82f6', // Blue
    '#f59e0b', // Orange
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#ef4444', // Red
    '#84cc16', // Lime
    '#f97316', // Dark Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#a855f7', // Purple Light
    '#f43f5e', // Rose
    '#0ea5e9', // Sky Blue
    '#eab308', // Yellow
    '#22c55e', // Green Light
  ];

  // Function to get consistent color for a label
  const getColorForLabel = (label, index) => {
    // Use index to cycle through colors
    return colorPalette[index % colorPalette.length];
  };

  // Function to generate colors array based on labels
  const generateColors = (labels) => {
    return labels.map((label, index) => getColorForLabel(label, index));
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for data updates from Settings or other components
    const handleDataUpdate = () => {
      fetchDashboardData();
      setChartKey(prevKey => prevKey + 1);
    };
    
    window.addEventListener('dataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdated', handleDataUpdate);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, facultiesRes, countsRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/faculties"),
        axios.get("/api/dashboard-counts")
      ]);

      const activeStudents = studentsRes.data.filter(s => s.status !== "Archived");
      const activeFaculties = facultiesRes.data.filter(f => f.status !== "Archived");

      setStudents(activeStudents);
      setFaculties(activeFaculties);
      setDashboardData({
        totalStudents: countsRes.data.students,
        totalFaculty: countsRes.data.faculties,
        totalCourses: countsRes.data.courses,
        totalDepartments: countsRes.data.departments
      });

      setChartKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  // Students per Course Data (dynamically calculated)
  const courseData = students.reduce((acc, student) => {
    acc[student.course] = (acc[student.course] || 0) + 1;
    return acc;
  }, {});

  const courseLabels = Object.keys(courseData);
  const studentsPerCourseData = {
    labels: courseLabels,
    datasets: [
      {
        label: "Students",
        data: Object.values(courseData),
        backgroundColor: generateColors(courseLabels),
        borderRadius: 6,
      },
    ],
  };

  // Faculty per Department Data (Doughnut) - dynamically calculated
  const facultyDeptData = faculties.reduce((acc, faculty) => {
    acc[faculty.department] = (acc[faculty.department] || 0) + 1;
    return acc;
  }, {});

  const facultyDeptLabels = Object.keys(facultyDeptData);
  const facultyPerDeptData = {
    labels: facultyDeptLabels,
    datasets: [
      {
        data: Object.values(facultyDeptData),
        backgroundColor: generateColors(facultyDeptLabels),
        borderWidth: 0,
      },
    ],
  };

  // Students per Department Data - dynamically calculated
  const studentDeptData = students.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {});

  const studentDeptLabels = Object.keys(studentDeptData);
  const studentsPerDeptData = {
    labels: studentDeptLabels,
    datasets: [
      {
        label: "Students",
        data: Object.values(studentDeptData),
        backgroundColor: generateColors(studentDeptLabels),
        borderRadius: 6,
      },
    ],
  };

  // Enrollment by Year Level Data - dynamically calculated
  const yearLevelData = students.reduce((acc, student) => {
    acc[student.year_level] = (acc[student.year_level] || 0) + 1;
    return acc;
  }, {});

  const yearLevelLabels = Object.keys(yearLevelData);
  const enrollmentData = {
    labels: yearLevelLabels,
    datasets: [
      {
        label: "Students",
        data: Object.values(yearLevelData),
        backgroundColor: generateColors(yearLevelLabels),
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          {user && user.profile_photo && (
            <img 
              src={user.profile_photo} 
              alt={user.username}
              className="user-avatar"
            />
          )}
          {user && !user.profile_photo && (
            <div className="user-avatar-placeholder">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <h2>Dashboard Overview</h2>
            {user && <p className="welcome-text">Welcome, {user.username}!</p>}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
      <div className="cards-grid">
        <div className="info-card">
          <div className="card-content">
            <h3>Total Students</h3>
            <p className="card-value">{dashboardData.totalStudents}</p>
          </div>
          <div className="card-icon">
            <GraduationCap size={32} strokeWidth={1.5} />
          </div>
        </div>

        <div className="info-card">
          <div className="card-content">
            <h3>Total Courses</h3>
            <p className="card-value">{dashboardData.totalCourses}</p>
          </div>
          <div className="card-icon">
            <GraduationCap size={32} strokeWidth={1.5} />
          </div>
        </div>

        <div className="info-card">
          <div className="card-content">
            <h3>Total Faculty</h3>
            <p className="card-value">{dashboardData.totalFaculty}</p>
          </div>
          <div className="card-icon">
            <Users size={32} strokeWidth={1.5} />
          </div>
        </div>

        <div className="info-card">
          <div className="card-content">
            <h3>Total Departments</h3>
            <p className="card-value">{dashboardData.totalDepartments}</p>
          </div>
          <div className="card-icon">
            <Building2 size={32} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-box">
          <div className="chart-header">
            <h3>Students per Course</h3>
            <p className="chart-subtitle">Distribution of {dashboardData.totalStudents} active students across programs</p>
          </div>
          <div className="chart-canvas">
            <Bar key={`course-chart-${chartKey}`} data={studentsPerCourseData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">
            <h3>Faculty per Department</h3>
            <p className="chart-subtitle">Distribution of faculty across various departments</p>
          </div>
          <div className="chart-canvas">
            <Doughnut key={`faculty-chart-${chartKey}`} data={facultyPerDeptData} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">
            <h3>Students per Department</h3>
            <p className="chart-subtitle">Student enrollment across academic departments</p>
          </div>
          <div className="chart-canvas">
            <Bar key={`dept-chart-${chartKey}`} data={studentsPerDeptData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-box">
          <div className="chart-header">
            <h3>Students by Year Level</h3>
            <p className="chart-subtitle">Student distribution across year levels</p>
          </div>
          <div className="chart-canvas">
            <Bar key={`year-chart-${chartKey}`} data={enrollmentData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-item">
          <p>System updated successfully</p>
          <span className="activity-time">Now</span>
        </div>
        <p className="activity-detail">{dashboardData.totalStudents} students and {dashboardData.totalFaculty} faculty members currently active</p>
      </div>
      </div>
    </div>
  );
}