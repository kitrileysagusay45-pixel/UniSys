import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, Settings, User, BookOpen, AlertCircle, Info, Check, Clock } from "lucide-react";

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
    case 'system': case 'settings': return <Settings size={20} />;
    case 'user': return <User size={20} />;
    case 'book': case 'book-open': return <BookOpen size={20} />;
    case 'alert': return <AlertCircle size={20} />;
    default: return <Info size={20} />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications?limit=100'); // Fetch more for full page
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.is_read) {
      try {
        await axios.post(`/api/notifications/${n.id}/mark-read`);
        setNotifications(notifications.map(item => item.id === n.id ? { ...item, is_read: true } : item));
      } catch (err) {
        console.error("Error marking as read", err);
      }
    }
    
    if (n.action_link) {
      window.history.pushState({}, "", n.action_link);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="notifications-page animated-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={24} color="#1a5fb4" /> Notifications
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>View all your recent activity and alerts.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={handleMarkAllRead}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
              background: '#f0fdfa', color: '#0d7c66', border: '1px solid #ccfbf1', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 600 
            }}
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ background: '#f8fafc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
            <Bell size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>You're all caught up!</h3>
          <p style={{ margin: 0, color: '#64748b' }}>No new notifications to display.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div 
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                gap: '16px',
                cursor: n.action_link ? 'pointer' : 'default',
                transition: 'all 0.2s',
                boxShadow: n.is_read ? 'none' : '0 4px 6px -1px rgba(13, 124, 102, 0.1)',
                borderLeft: n.is_read ? '4px solid transparent' : '4px solid #0d7c66'
              }}
              onMouseEnter={(e) => { if(n.action_link) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { if(n.action_link) e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ 
                background: n.is_read ? '#f8fafc' : '#ccfbf1', 
                color: n.is_read ? '#94a3b8' : '#0d7c66',
                width: '48px', height: '48px', borderRadius: '12px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
              }}>
                {getIcon(n.icon)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#1e293b', fontWeight: n.is_read ? 500 : 700 }}>
                  {n.title}
                </h4>
                <p style={{ margin: '0 0 8px', color: '#475569', lineHeight: '1.5' }}>
                  {n.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <Clock size={14} />
                  <span>{timeAgo(n.created_at)}</span>
                  {!n.is_read && <span style={{ marginLeft: '10px', background: '#0d7c66', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 600 }}>New</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
