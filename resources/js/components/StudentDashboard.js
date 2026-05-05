import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpen, Clock, MapPin, User, Calendar, 
  FileText, Bell, Info, AlertTriangle, Award, 
  Hash, Layers, CheckCircle, ArrowRight,
  TrendingUp, Star, CalendarDays, ClipboardList
} from "lucide-react";
import GradesView from "./GradesView";

export default function StudentDashboard({ user }) {
  const [schedule, setSchedule] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [totalUnits, setTotalUnits] = useState(0);
  const [gwa, setGwa] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [viewingGrades, setViewingGrades] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("schedule");

  const getStanding = (gwaValue) => {
    if (gwaValue === null || gwaValue === undefined) return { label: "N/A", color: "#64748b" };
    const val = parseFloat(gwaValue);
    if (val <= 1.25) return { label: "Dean's List (1st Class)", color: "#10b981" };
    if (val <= 1.75) return { label: "Dean's List (2nd Class)", color: "#3b82f6" };
    if (val <= 3.0) return { label: "Good Standing", color: "#6366f1" };
    return { label: "Needs Improvement", color: "#f59e0b" };
  };

  const standing = getStanding(gwa);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const [schedRes, annRes, gwaRes] = await Promise.all([
          axios.get('/api/student/schedule'),
          axios.get('/api/student/announcements'),
          axios.get('/api/student/gwa'),
        ]);
        setSchedule(schedRes.data.schedule || []);
        setStudentInfo(schedRes.data.student || null);
        setTotalUnits(schedRes.data.total_units || 0);
        setAnnouncements(annRes.data || []);
        setGwa(gwaRes.data?.overall_gwa);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        try {
          const profileId = user.profile_id || user.id;
          const subRes = await axios.get(`/api/subjects/student/${profileId}`);
          const mapped = subRes.data.map(s => ({
            id: s.id, code: s.code, name: s.name, units: s.units || 3,
            room: s.room?.name || s.room || 'TBA', day: s.schedule_day || 'TBA',
            time_start: s.time_start, time_end: s.time_end,
            time_display: s.time_start && s.time_end ? `${s.time_start} - ${s.time_end}` : 'TBA',
            instructor: s.faculty ? `${s.faculty.first_name} ${s.faculty.last_name}` : 'TBA',
            section: s.section, semester: s.semester, academic_year: s.academic_year,
          }));
          setSchedule(mapped);
          setTotalUnits(mapped.reduce((sum, s) => sum + (parseInt(s.units) || 3), 0));
        } catch (e) { console.error(e); }
      } finally { setLoading(false); }
    };
    fetchData();
    // Listen for admin enrollment updates
    const handler = () => { fetchData(); };
    window.addEventListener('dataUpdated', handler);
    return () => window.removeEventListener('dataUpdated', handler);
  }, [user]);

  if (viewingGrades) {
    return <GradesView user={user} studentId={user.id} onBack={() => setViewingGrades(false)} />;
  }

  const getTodaySchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return schedule.filter(s => (s.day || '').includes(today));
  };

  const todayClasses = getTodaySchedule();

  const deadlines = announcements.filter(a => 
    ['requirement', 'exam', 'activity'].includes(a.category?.toLowerCase())
  );

  const fmtGwa = (v) => v === null || v === undefined ? "N/A" : parseFloat(v).toFixed(4);

  const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const tdStyle = { padding: '12px 16px', fontSize: '0.85rem' };

  return (
    <div className="student-dash">
      <div className="dash-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Welcome back, {user?.first_name || "Student"}!</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#64748b', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Hash size={16} /> {user?.student_id || "STU-2026-0001"}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16} /> {studentInfo?.section || user?.section || "SECTION A"}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={16} /> {studentInfo?.year_level || user?.year_level || "1st Year"}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setViewingGrades(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 16px', background: '#1a5fb4', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(26,95,180,0.2)' }}>
            <FileText size={18} /> View My Grades
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Current GWA</p>
             <div style={{ background: `${standing.color}15`, color: standing.color, padding: '8px', borderRadius: '12px' }}><Award size={20} /></div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: '4px 0' }}>{fmtGwa(gwa)}</h3>
          <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', margin: '12px 0' }}>
            <div style={{ width: gwa ? `${Math.min(100, (5 - gwa) / 4 * 100)}%` : '0%', height: '100%', background: standing.color, borderRadius: '4px' }}></div>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: standing.color }}>{standing.label}</p>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Academic Load</p>
             <div style={{ background: '#eef2ff', color: '#6366f1', padding: '8px', borderRadius: '12px' }}><BookOpen size={20} /></div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: '4px 0' }}>{totalUnits} Units</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Across {schedule.length} enrolled subjects</p>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Attendance</p>
             <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '12px' }}><CheckCircle size={20} /></div>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: '4px 0' }}>98%</h3>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#10b981' }}>Good attendance record</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Today's Classes Widget */}
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: '#1e293b' }}>
                <CalendarDays size={22} color="#6366f1" /> Today's Journey
              </h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '4px 12px', borderRadius: '99px' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {todayClasses.length > 0 ? todayClasses.map((s, i) => (
                <div key={i} style={{ background: '#fff', padding: '1.25rem', borderRadius: '20px', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: '#6366f1' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#6366f1', fontSize: '0.85rem' }}>{s.code}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{s.room}</span>
                  </div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', color: '#334155', fontWeight: 700 }}>{s.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                      <Clock size={14} /> {s.time_display}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                      <User size={14} /> {s.instructor}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                   No classes scheduled for today. Take some time to rest or study!
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9' }}>
              {['schedule','subjects'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: activeTab === tab ? '3px solid #6366f1' : '3px solid transparent', color: activeTab === tab ? '#6366f1' : '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  {tab === 'schedule' ? 'Weekly Schedule' : 'Enrolled Subjects'}
                </button>
              ))}
            </div>

            {activeTab === 'schedule' ? (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                    {['Code','Subject','Units','Day','Time','Room','Instructor'].map(h => <th key={h} style={{...thStyle, textAlign: h === 'Units' ? 'center' : 'left'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {schedule.length === 0 ? (
                      <tr><td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No subjects enrolled yet.</td></tr>
                    ) : schedule.map((s, i) => (
                      <tr key={s.id || i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={tdStyle}><span style={{ fontWeight: 700, color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: '6px' }}>{s.code}</span></td>
                        <td style={{...tdStyle, fontWeight: 600, color: '#334155'}}>{s.name}</td>
                        <td style={{...tdStyle, textAlign: 'center', fontWeight: 700, color: '#64748b'}}>{s.units||3}</td>
                        <td style={{...tdStyle, color: '#64748b'}}>{s.day}</td>
                        <td style={{...tdStyle, color: '#64748b'}}>{s.time_display||'TBA'}</td>
                        <td style={tdStyle}><span style={{ color: '#475569', fontWeight: 500 }}>{s.room||'TBA'}</span></td>
                        <td style={{...tdStyle, color: '#475569'}}>{s.instructor||'TBA'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
                {schedule.map((s, i) => (
                  <div key={s.id||i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 800, color: '#6366f1', background: '#eef2ff', padding: '3px 10px', borderRadius: '8px', fontSize: '0.85rem' }}>{s.code}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{s.units||3} Units</span>
                    </div>
                    <h4 style={{ margin: '0 0 15px', fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{s.name}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><MapPin size={16} color="#14b8a6" /> {s.room||'TBA'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Clock size={16} color="#6366f1" /> {s.day} {s.time_display ? `| ${s.time_display}` : ''}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><User size={16} color="#f59e0b" /> {s.instructor||'TBA'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Announcements */}
        <div className="sidebar-widgets" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Critical Deadlines Widget */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: '#1e293b' }}>
              <ClipboardList size={20} color="#f59e0b" /> Critical Deadlines
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {deadlines.length > 0 ? deadlines.slice(0, 4).map(d => (
                <div key={d.id} style={{ padding: '10px', borderRadius: '12px', background: '#fffbeb', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>{d.title}</span>
                    <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>{d.category.toUpperCase()}</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#b45309' }}>{d.content.substring(0, 60)}...</p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <CheckCircle size={32} color="#10b981" style={{ opacity: 0.2, marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>No urgent deadlines!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
