import React, { useState, useEffect } from "react";
import FacultyDashboard from "./FacultyDashboard";
import FacultyStudents from "./FacultyStudents";
import FacultySubjects from "./FacultySubjects";
import Profile from "./Profile";
import { GraduationCap, LayoutDashboard, Users, User, BookOpen } from "lucide-react";
import TopNavbar from "./TopNavbar";
import "../../sass/faculty-layout.scss";

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
    { key: "faculty-dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "faculty-subjects", label: "My Subjects", icon: <BookOpen size={20} /> },
    { key: "faculty-students", label: "My Students", icon: <Users size={20} /> },
    { key: "faculty-profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <div className="layout faculty-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <div className="logo-box">
            <h1 className="logo-text">UniSys</h1>
            <div className="logo-icon-wrapper">
              <GraduationCap size={40} strokeWidth={1.5} className="logo-icon" />
            </div>
          </div>
          <span className="role-badge faculty">Faculty Portal</span>
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
        <TopNavbar user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />
        {page === "faculty-dashboard" && <FacultyDashboard user={user} />}
        {page === "faculty-subjects" && <FacultySubjects user={user} />}
        {page === "faculty-students" && <FacultyStudents user={user} />}
        {page === "faculty-profile" && <Profile user={user} onLogout={onLogout} />}
      </main>
    </div>
  );
}
