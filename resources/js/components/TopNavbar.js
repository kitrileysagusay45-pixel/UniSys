import React, { useState, useEffect, useRef } from "react";
import { Bell, Moon, Sun, Search, Menu, User, LogOut, ChevronDown, Settings, CreditCard, Shield } from "lucide-react";
// import "../../sass/top-navbar.scss";

export default function TopNavbar({ user, onToggleSidebar, onLogout }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const notifications = [
    { id: 1, text: "System maintenance scheduled for 12:00 AM", time: "1h ago", type: "system" },
    { id: 2, text: "New faculty member assigned to your department", time: "2h ago", type: "user" },
    { id: 3, text: "Monthly report is now available for download", time: "5h ago", type: "report" },
  ];

  const handleProfileClick = () => {
    // Navigate to profile page
    const role = user?.role || "admin";
    let path = "/profile";
    if (role === "faculty") path = "/faculty-profile";
    if (role === "student") path = "/student-profile";
    
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setShowProfileDropdown(false);
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button className="mobile-toggle" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={20} />
        </button>
        
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search for students, subjects..." />
        </div>
      </div>

      <div className="navbar-right">
        {/* Quick Actions */}
        <div className="nav-actions">
           <button className="action-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="notification-wrapper" ref={notificationRef}>
            <button 
              className={`action-btn notification-bell ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all as read</button>
                </div>
                <div className="dropdown-content">
                  {notifications.map(n => (
                    <div key={n.id} className="notification-item">
                      <div className={`notification-icon ${n.type}`}>
                        {n.type === 'system' ? <Settings size={14} /> : n.type === 'user' ? <User size={14} /> : <CreditCard size={14} />}
                      </div>
                      <div className="notification-text">
                        <p>{n.text}</p>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <button>View All Notifications</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Chip */}
        <div className="user-section" ref={profileRef}>
          <div className={`user-chip ${showProfileDropdown ? 'active' : ''}`} onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div className="user-avatar-mini">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="User Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {(user?.name || user?.first_name || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="online-indicator"></span>
            </div>
            <div className="user-meta-mini">
              <span className="user-name-mini">{user?.name || user?.first_name || "Admin"}</span>
              <span className="user-role-mini">{(user?.role || "admin").toUpperCase()}</span>
            </div>
            <ChevronDown size={14} className={`chevron-icon ${showProfileDropdown ? 'rotate' : ''}`} />
          </div>

          {showProfileDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-user-plate">
                <div className="plate-avatar">
                   {(user?.name || user?.first_name || "A").charAt(0).toUpperCase()}
                </div>
                <div className="plate-text">
                  <span className="plate-name">{user?.name || user?.first_name || "Admin User"}</span>
                  <span className="plate-email">{user?.email || "admin@unisys.com"}</span>
                </div>
              </div>
              
              <div className="dropdown-links">
                <button className="dropdown-link" onClick={handleProfileClick}>
                  <User size={16} />
                  <span>Account Settings</span>
                </button>
                <button className="dropdown-link">
                  <Shield size={16} />
                  <span>Security & Privacy</span>
                </button>
              </div>

              <div className="dropdown-footer">
                <button className="logout-btn" onClick={onLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
