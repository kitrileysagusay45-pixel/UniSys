import React, { useState, useEffect, useRef } from "react";
import { Bell, Moon, Sun, Search, Menu, User, LogOut, ChevronDown } from "lucide-react";
import "../../sass/top-navbar.scss";

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
    { id: 1, text: "System maintenance at midnight", time: "1h ago" },
    { id: 2, text: "New announcements available", time: "2h ago" },
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
    <div className="top-navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <Menu size={24} />
        </button>
      </div>

      <div className="navbar-right">
        {/* Dark Mode Toggle */}
        <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications */}
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className="icon-btn notification-bell" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            <span className="badge">2</span>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                <button className="mark-read">Mark all as read</button>
              </div>
              <div className="dropdown-list">
                {notifications.map(n => (
                  <div key={n.id} className="notification-item">
                    <p>{n.text}</p>
                    <span>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-wrapper" ref={profileRef}>
          <div className="nav-profile" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
            <div className="avatar-mini">
              {user?.profile_photo ? (
                <img src={user.profile_photo} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">{(user?.name || user?.first_name || "U").charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="profile-info-mini">
              <span className="nav-username">{user?.name || user?.first_name || "User"}</span>
              <span className="nav-role">{(user?.role || "admin").charAt(0).toUpperCase() + (user?.role || "admin").slice(1)}</span>
            </div>
            <ChevronDown size={14} className={`chevron ${showProfileDropdown ? 'rotate' : ''}`} />
          </div>

          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-user-info">
                <p className="user-name">{user?.name || user?.first_name || "User"}</p>
                <p className="user-email">{user?.email || "user@unisys.com"}</p>
              </div>
              <div className="dropdown-actions">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={onLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
