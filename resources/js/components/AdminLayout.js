import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Faculty from "./Faculty";
import Students from "./Students";
import Subjects from "./Subjects";
import Reports from "./Reports";
import Settings from "./Settings";
import Archive from "./Archive";
import Profile from "./Profile";
import { GraduationCap, LayoutDashboard, Users, BookOpen, GraduationCap as GradIcon, BarChart3, Settings as SettingsIcon, Archive as ArchiveIcon, User } from "lucide-react";
import "../../sass/layout.scss";

export default function AdminLayout({ user, onLogout }) {
  const [page, setPage] = useState(() => {
    const path = window.location.pathname.replace("/", "") || "dashboard";
    const validPages = ["dashboard", "faculty", "students", "subjects", "reports", "settings", "archive", "profile"];
    return validPages.includes(path) ? path : "dashboard";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const updatePage = () => {
      const path = window.location.pathname.replace("/", "") || "dashboard";
      const validPages = ["dashboard", "faculty", "students", "subjects", "reports", "settings", "archive", "profile"];
      if (validPages.includes(path)) setPage(path);
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
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "faculty", label: "Faculty", icon: <Users size={20} /> },
    { key: "students", label: "Students", icon: <GradIcon size={20} /> },
    { key: "subjects", label: "Subjects", icon: <BookOpen size={20} /> },
    { key: "reports", label: "Reports", icon: <BarChart3 size={20} /> },
    { key: "settings", label: "Settings", icon: <SettingsIcon size={20} /> },
    { key: "archive", label: "Archive", icon: <ArchiveIcon size={20} /> },
    { key: "profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo-box">
            <h1 className="logo-text">UniSys</h1>
            <div className="logo-icon-wrapper">
              <GraduationCap size={40} strokeWidth={1.5} className="logo-icon" />
            </div>
          </div>
          <span className="role-badge admin">Admin Portal</span>
        </div>

        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={`nav-item ${page === item.key ? "active" : ""}`}
              onClick={() => navigate(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span></span><span></span><span></span>
        </button>

        {page === "dashboard" && <Dashboard user={user} />}
        {page === "faculty" && <Faculty />}
        {page === "students" && <Students />}
        {page === "subjects" && <Subjects />}
        {page === "reports" && <Reports />}
        {page === "settings" && <Settings />}
        {page === "archive" && <Archive />}
        {page === "profile" && <Profile user={user} onLogout={onLogout} />}
      </main>
    </div>
  );
}
