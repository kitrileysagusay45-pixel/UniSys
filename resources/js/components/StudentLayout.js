import React, { useState, useEffect } from "react";
import StudentDashboard from "./StudentDashboard";
import Profile from "./Profile";
import { GraduationCap, LayoutDashboard, User, Circle } from "lucide-react";
import TopNavbar from "./TopNavbar";
import "../../sass/layout.scss";

export default function StudentLayout({ user, onLogout }) {
  const [page, setPage] = useState("student-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname.split("/").pop();
      const valid = ["student-dashboard", "student-profile"];
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
    { key: "student-dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { key: "student-profile", label: "Profile", icon: <User size={18} /> },
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
          <span className="portal-badge student">STUDENT PORTAL</span>
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
          {page === "student-dashboard" && <StudentDashboard user={user} />}
          {page === "student-profile" && <Profile user={user} onLogout={onLogout} />}
        </div>
      </main>
    </div>
  );
}
