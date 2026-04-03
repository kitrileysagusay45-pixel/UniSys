import React, { useState, useEffect } from "react";
import StudentDashboard from "./StudentDashboard";
import Profile from "./Profile";
import { GraduationCap, LayoutDashboard, User } from "lucide-react";
import "../../sass/student-layout.scss";

export default function StudentLayout({ user, onLogout }) {
  const [page, setPage] = useState("student-dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname.replace("/", "");
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
    { key: "student-dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "student-profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <div className="layout student-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo-box">
            <h1 className="logo-text">UniSys</h1>
            <div className="logo-icon-wrapper">
              <GraduationCap size={40} strokeWidth={1.5} className="logo-icon" />
            </div>
          </div>
          <span className="role-badge student">Student Portal</span>
        </div>
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.key} className={`nav-item ${page === item.key ? "active" : ""}`} onClick={() => navigate(item.key)}>
              {item.icon}<span>{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span></span><span></span><span></span>
        </button>
        {page === "student-dashboard" && <StudentDashboard user={user} />}
        {page === "student-profile" && <Profile user={user} onLogout={onLogout} />}
      </main>
    </div>
  );
}
