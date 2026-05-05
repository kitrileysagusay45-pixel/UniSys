import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bell, Moon, Sun, Search, Menu, User, LogOut, ChevronDown, Settings, CreditCard, Shield, BookOpen, AlertCircle, Info } from "lucide-react";
// import "../../sass/top-navbar.scss";

const timeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const getIcon = (iconName) => {
  switch(iconName) {
    case 'system': case 'settings': return <Settings size={14} />;
    case 'user': return <User size={14} />;
    case 'book': case 'book-open': return <BookOpen size={14} />;
    case 'alert': return <AlertCircle size={14} />;
    default: return <Info size={14} />;
  }
};

export default function TopNavbar({ user, onToggleSidebar, onLogout }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications?limit=5');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.is_read) {
      try {
        await axios.post(`/api/notifications/${n.id}/mark-read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(notifications.map(item => item.id === n.id ? { ...item, is_read: true } : item));
      } catch (err) {
        console.error("Error marking as read", err);
      }
    }
    
    if (n.action_link) {
      setShowNotifications(false);
      window.history.pushState({}, "", n.action_link);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    window.history.pushState({}, "", "/notifications");
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleProfileClick = () => {
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
              {unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>
            
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  {unreadCount > 0 && <button className="mark-all-read" onClick={handleMarkAllRead}>Mark all as read</button>}
                </div>
                <div className="dropdown-content">
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className="notification-item" 
                        onClick={() => handleNotificationClick(n)}
                        style={{ 
                          cursor: 'pointer', 
                          background: n.is_read ? 'transparent' : '#f0fdfa',
                          borderLeft: n.is_read ? '3px solid transparent' : '3px solid #0d7c66',
                        }}
                      >
                        <div className={`notification-icon ${n.type || 'info'}`}>
                          {getIcon(n.icon)}
                        </div>
                        <div className="notification-text">
                          <p style={{ fontWeight: n.is_read ? 500 : 700, color: n.is_read ? '#64748b' : '#0f172a' }}>{n.title}</p>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.message}</p>
                          <span>{timeAgo(n.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="dropdown-footer">
                  <button onClick={handleViewAllNotifications}>View All Notifications</button>
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
                <button className="dropdown-link" onClick={() => {
                  const role = user?.role || "admin";
                  let path = "/security-settings";
                  if (role === "faculty") path = "/faculty-security";
                  if (role === "student") path = "/student-security";
                  window.history.pushState({}, "", path);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  setShowProfileDropdown(false);
                }}>
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
