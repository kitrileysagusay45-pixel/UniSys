import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, BookOpen, Building2, Plus, Calendar, 
  Bell, Info, AlertTriangle, FileText, Clock, 
  MapPin, Hash, CheckCircle, GraduationCap, ArrowRight,
  TrendingUp, CalendarDays, ClipboardCheck, Download
} from "lucide-react";
import { exportToExcel } from "../utils/ExportUtils";

export default function FacultyDashboard({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [sectionData, setSectionData] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const profileId = user.profile_id || user.id;
        const [schedRes, stuRes, annRes, myAnnRes] = await Promise.all([
          axios.get('/api/faculty/schedule'),
          axios.get(`/api/faculty/${profileId}/students`),
          axios.get('/api/announcements/dashboard'),
          axios.get('/api/faculty/my-announcements'),
        ]);
        setSchedule(schedRes.data.schedule || []);
        setFacultyInfo(schedRes.data.faculty || null);
        setTotalUnits(schedRes.data.total_units || 0);
        setTotalSubjects(schedRes.data.total_subjects || 0);
        setStudentCount(stuRes.data.length);
        
        // Process section breakdown
        const sections = {};
        stuRes.data.forEach(s => {
          sections[s.section] = (sections[s.section] || 0) + 1;
        });
        setSectionData(Object.entries(sections).map(([name, count]) => ({ name, count })));

        setAnnouncements(annRes.data || []);
        setMyAnnouncements(myAnnRes.data || []);
      } catch (err) {
        console.error("Faculty Dashboard fetch error:", err);
        // Fallback
        try {
          const profileId = user.profile_id || user.id;
          const subRes = await axios.get(`/api/faculty/${profileId}/subjects`);
          setSchedule(subRes.data.map(s => ({
            id: s.id, code: s.code, name: s.name, units: s.units || 3,
            room: s.room?.name || 'TBA', day: s.schedule_day || 'TBA',
            time_start: s.time_start, time_end: s.time_end,
            time_display: s.time_start && s.time_end ? `${s.time_start} - ${s.time_end}` : 'TBA',
            section: s.section, semester: s.semester, academic_year: s.academic_year,
            enrolled_count: 0,
          })));
          setTotalSubjects(subRes.data.length);
        } catch (e) { console.error(e); }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const getTodaySchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return schedule.filter(s => (s.day || '').includes(today));
  };

  const todayClasses = getTodaySchedule();

  const thStyle = { padding: '12px 14px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const tdStyle = { padding: '12px 14px', fontSize: '0.85rem' };

  return (
    <div className="faculty-dash">
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Welcome, {user?.name || user?.first_name || "Faculty"}!</h2>
          <p className="subtitle" style={{margin: 0}}>Faculty Dashboard — {user?.department || "Department"}</p>
          {facultyInfo?.position && <p style={{margin: '5px 0 0', fontSize: '0.85rem', color: '#64748b'}}>Position: {facultyInfo.position}</p>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => exportToExcel({ 
              filename: 'Faculty_Schedule', 
              title: `Teaching Schedule: ${user?.name || 'Faculty'}`, 
              headers: ['Code', 'Subject', 'Section', 'Day', 'Time', 'Room', 'Students'],
              data: schedule.map(s => ({
                code: s.code,
                subject: s.name,
                section: s.section,
                day: s.day,
                time: s.time_display,
                room: s.room,
                students: s.enrolled_count || 0
              }))
            })}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
          >
            <Download size={18} /> Export Schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Subjects</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{totalSubjects}</h3>
            </div>
            <div style={{ background: '#ecfdf5', color: '#10b981', padding: '10px', borderRadius: '12px' }}>
              <BookOpen size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
             <TrendingUp size={14} /> Full workload
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Handling Students</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{studentCount}</h3>
            </div>
            <div style={{ background: '#eef2ff', color: '#6366f1', padding: '10px', borderRadius: '12px' }}>
              <Users size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b' }}>
             Across {sectionData.length} active sections
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Teaching Units</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{totalUnits}</h3>
            </div>
            <div style={{ background: '#fffbeb', color: '#f59e0b', padding: '10px', borderRadius: '12px' }}>
              <Hash size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#f59e0b' }}>
             Current semester total
          </div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Announcements</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{myAnnouncements.length}</h3>
            </div>
            <div style={{ background: '#fdf2f8', color: '#ec4899', padding: '10px', borderRadius: '12px' }}>
              <Bell size={24} />
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '4px' }}>
             <CheckCircle size={14} /> View Broadcasts
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Weekly Teaching Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Today's Schedule Widget */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                <CalendarDays size={20} color="#6366f1" /> Today's Schedule
              </h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '4px 12px', borderRadius: '99px' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {todayClasses.length > 0 ? todayClasses.map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.9rem' }}>{s.code}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{s.section}</span>
                  </div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#334155' }}>{s.name}</h4>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                      <Clock size={14} /> {s.time_display}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                      <MapPin size={14} /> {s.room}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                   No classes scheduled for today. Enjoy your day!
                </div>
              )}
            </div>
          </div>

          {/* Full Schedule Table */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem', color: '#1e293b' }}>
              <BookOpen size={22} color="#14b8a6" /> Weekly Teaching Workload
            </h3>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                  {['Code','Subject','Section','Day','Time','Room','Students'].map(h => (
                    <th key={h} style={{...thStyle, textAlign: h === 'Students' ? 'center' : 'left'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {schedule.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No subjects assigned yet.</td></tr>
                  ) : schedule.map((s, i) => (
                    <tr key={s.id||i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={tdStyle}><span style={{ fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: '6px' }}>{s.code}</span></td>
                      <td style={{...tdStyle, fontWeight: 600, color: '#334155'}}>{s.name}</td>
                      <td style={tdStyle}><span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{s.section}</span></td>
                      <td style={{...tdStyle, color: '#64748b'}}>{s.day}</td>
                      <td style={{...tdStyle, color: '#64748b'}}>{s.time_display || 'TBA'}</td>
                      <td style={tdStyle}><span style={{ color: '#64748b' }}>{s.room || 'TBA'}</span></td>
                      <td style={{...tdStyle, textAlign: 'center', fontWeight: 700, color: '#14b8a6'}}>{s.enrolled_count ?? '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar-widgets" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Grade Submission Tracker */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: '#1e293b' }}>
              <ClipboardCheck size={20} color="#f59e0b" /> Grade Submissions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {schedule.slice(0, 3).map((s, i) => (
                <div key={i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>{s.code} - {s.section}</span>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Pending</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', background: '#f59e0b' }}></div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => { window.history.pushState({}, '', '/faculty-subjects'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                style={{ width: '100%', marginTop: '5px', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Go to Grading Sheet
              </button>
            </div>
          </div>

          {/* Student Breakdown */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: '#1e293b' }}>
              <GraduationCap size={20} color="#14b8a6" /> My Students
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sectionData.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f0fdfa', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f766e' }}>{s.name}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488' }}>{s.count} Students</span>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements with Quick Post */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '1.5rem', borderRadius: '16px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem' }}>
                <Bell size={18} color="#fbbf24" /> Announcements
              </h3>
              <button 
                onClick={() => setShowAnnounceModal(true)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '4px', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myAnnouncements.length > 0 ? myAnnouncements.slice(0, 3).map(ann => (
                <div key={ann.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{ann.title}</span>
                    <span style={{ fontSize: '0.65rem', background: '#334155', padding: '1px 6px', borderRadius: '4px', color: '#94a3b8' }}>{ann.section || 'All'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>{ann.content.substring(0, 60)}...</p>
                </div>
              )) : (<p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No announcements posted.</p>)}
            </div>
            <button 
              onClick={() => { window.history.pushState({}, '', '/faculty-dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); }}
              style={{ width: '100%', marginTop: '1rem', padding: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Manage Bulletin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
