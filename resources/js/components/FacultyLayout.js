import React, { useState, useEffect } from "react";
import FacultyDashboard from "./FacultyDashboard";
import FacultyStudents from "./FacultyStudents";
import FacultySubjects from "./FacultySubjects";
import Profile from "./Profile";
import { GraduationCap, LayoutDashboard, Users, User, BookOpen, Circle } from "lucide-react";
import TopNavbar from "./TopNavbar";
// import "../../sass/layout.scss";

export default function FacultyLayout({ user, onLogout }) {
  const [page, setPage] = useState("faculty-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname.split("/").pop();
      const valid = ["faculty-dashboard", "faculty-students", "faculty-subjects", "faculty-profile"];
      if (valid.includes(path)) setPage(path);
    };
    window.addEventListener("popstate", updatePage);
    return () => window.removeEventListener("popstate", updatePage);
  }, []);

  const navigate = (key) => {
    setPage(key);
    window.history.pushState({}, "", `/${key}`);
    setSidebarOpen(false);
  };

  const menuItems = [
    { key: "faculty-dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "faculty-subjects", label: "My Subjects", icon: <BookOpen size={18} /> },
    { key: "faculty-students", label: "My Students", icon: <Users size={18} /> },
    { key: "faculty-profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo-box">
             <div className="logo-icon-wrapper">
              <GraduationCap size={24} strokeWidth={2.5} className="logo-icon" />
            </div>
            <h1 className="logo-text">UniSys</h1>
          </div>
          <span className="portal-badge faculty">FACULTY PORTAL</span>
        </div>
        <nav className="nav-container">
          <ul className="nav-menu">
            {menuItems.map(item => (
              <li key={item.key} className={`nav-item ${page === item.key ? "active" : ""}`} onClick={() => navigate(item.key)}>
                <div className="icon-wrapper">{item.icon}</div>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="system-status">
            <Circle size={8} fill="#10b981" stroke="none" className="status-dot pulsing" />
            <span>System Online</span>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <TopNavbar user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />
        
        <div className="page-content-wrapper">
          {page === "faculty-dashboard" && <FacultyDashboard user={user} />}
          {page === "faculty-subjects" && <FacultySubjects user={user} />}
          {page === "faculty-students" && <FacultyStudents user={user} />}
          {page === "faculty-profile" && <Profile user={user} onLogout={onLogout} />}
        </div>
      </main>
    </div>
  );
}
