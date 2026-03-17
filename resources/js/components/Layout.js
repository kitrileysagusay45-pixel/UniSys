// resources/js/components/Layout.js
import React, { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminRegister from "./AdminRegister";
import Dashboard from "./Dashboard";
import Faculty from "./Faculty";
import Students from "./Students";
import Reports from "./Reports";
import Settings from "./Settings";
import Archive from "./Archive";
import Profile from "./Profile";
import { GraduationCap } from "lucide-react";
import "../../sass/layout.scss";

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check localStorage for existing session on initial load
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUser = localStorage.getItem('user');
    
    // Validate session: if logged in but no user data, clear invalid session
    if (loggedIn && !savedUser) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      return false;
    }
    
    return loggedIn;
  });
  const [showRegister, setShowRegister] = useState(false);
  const [page, setPage] = useState(() => {
    // Get page from URL path
    const path = window.location.pathname.replace('/', '') || 'dashboard';
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const savedUser = localStorage.getItem('user');
    
    // If logged in, return the path (or default to dashboard)
    if (loggedIn && savedUser) {
      const validPages = ['dashboard', 'faculty', 'students', 'reports', 'settings', 'archive', 'profile'];
      return validPages.includes(path) ? path : 'dashboard';
    }
    
    return null; // Not logged in, will show login page
  });
  const [user, setUser] = useState(() => {
    // Restore user data from localStorage on initial load
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const updatedUser = JSON.parse(savedUser);
        setUser(updatedUser);
        console.log('Layout: User data refreshed from localStorage');
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Persist login state to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    // Navigate to dashboard after login
    window.history.pushState({}, '', '/dashboard');
    setPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setPage("dashboard");
    // Clear localStorage on logout
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.history.pushState({}, '', '/adminlogin');
  };

  // Sync page state with URL on mount and browser back/forward
  useEffect(() => {
    const updatePageFromURL = () => {
      const path = window.location.pathname.replace('/', '') || 'dashboard';
      
      console.log('Layout: Current path:', path, 'Logged in:', isLoggedIn);
      
      if (!isLoggedIn) {
        // Not logged in - ensure we're on admin login page
        if (path !== 'adminlogin') {
          window.history.replaceState({}, '', '/adminlogin');
        }
      } else {
        // Logged in
        if (path === 'adminlogin') {
          // If logged in and on adminlogin, redirect to dashboard
          window.history.replaceState({}, '', '/dashboard');
          setPage('dashboard');
        } else {
          // Set page based on URL
          const validPages = ['dashboard', 'faculty', 'students', 'reports', 'settings', 'archive', 'profile'];
          if (validPages.includes(path)) {
            setPage(path);
          } else {
            setPage('dashboard');
            window.history.replaceState({}, '', '/dashboard');
          }
        }
      }
    };

    updatePageFromURL();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', updatePageFromURL);

    return () => {
      window.removeEventListener('popstate', updatePageFromURL);
    };
  }, [isLoggedIn]);

  // If not logged in, show AdminLogin or AdminRegister
  if (!isLoggedIn) {
    if (showRegister) {
      return <AdminRegister onBackToLogin={() => setShowRegister(false)} />;
    }
    return <AdminLogin onLogin={handleLogin} onRegister={() => setShowRegister(true)} />;
  }

  const menuItems = [
    { key: "dashboard", label: "Dashboard" },
    { key: "faculty", label: "Faculty" },
    { key: "students", label: "Students" },
    { key: "reports", label: "Reports" },
    { key: "settings", label: "Settings" },
    { key: "archive", label: "Archive" },
    { key: "profile", label: "Profile" },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-box">
            <h1 className="logo-text">UniSys</h1>
            <div className="logo-icon-wrapper">
              <GraduationCap size={40} strokeWidth={1.5} className="logo-icon" />
            </div>
          </div>
        </div>

        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={`nav-item ${page === item.key ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                setPage(item.key);
                window.history.pushState({}, '', `/${item.key}`);
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {page === "dashboard" && <Dashboard user={user} onLogout={handleLogout} />}
        {page === "faculty" && <Faculty />}
        {page === "students" && <Students />}
        {page === "reports" && <Reports />}
        {page === "settings" && <Settings />}
        {page === "archive" && <Archive />}
        {page === "profile" && <Profile user={user} onLogout={handleLogout} />}
      </main>
    </div>
  );
}
