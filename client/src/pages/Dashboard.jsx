import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import API from '../services/api';
import { FiUsers, FiUserPlus, FiCalendar, FiFileText, FiPlus, FiArrowRight, FiTrendingUp } from 'react-icons/fi';

// Animated counter that counts up from 0 to the given value
function Counter({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!value) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(current);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}</>;
}

// SVG donut chart — takes array of { label, value, color }
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 120, r = 48, circumference = 2 * Math.PI * r;
  let cumulative = 0;

  if (!total) return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="14" />
      <text x="60" y="65" textAnchor="middle" fontSize="14" fill="var(--text-muted)">0</text>
    </svg>
  );

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        {data.map((item, i) => {
          const pct = item.value / total;
          const offset = -(cumulative / total) * circumference;
          cumulative += item.value;
          return <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={item.color} strokeWidth="14" strokeDasharray={`${pct * circumference} ${circumference}`} strokeDashoffset={offset} />;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'Outfit' }}>{total}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total</span>
      </div>
    </div>
  );
}

// Bar chart for last 7 days of appointments
function WeeklyChart({ appointments }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return {
      label: i === 6 ? 'Today' : days[d.getDay()],
      count: appointments.filter(a => a.date === dateStr).length,
      isToday: i === 6,
    };
  });

  const max = Math.max(...weekData.map(d => d.count), 1);

  return (
    <div className="bar-chart-bars">
      {weekData.map((d, i) => (
        <div key={i} className="bar-col">
          <span className="bar-val">{d.count > 0 ? d.count : ''}</span>
          <div className="bar-fill" style={{ height: `${Math.max((d.count / max) * 90, 4)}px`, background: d.isToday ? 'linear-gradient(180deg,var(--primary),var(--primary-dark))' : 'var(--border)', boxShadow: d.isToday ? '0 2px 8px rgba(56,189,168,0.35)' : 'none' }} />
          <span className="bar-label" style={{ color: d.isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: d.isToday ? 700 : 500 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/dashboard/stats'), API.get('/appointments')])
      .then(([s, a]) => { setStats(s.data); setAppointments(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayCount = appointments.filter(a => a.date === new Date().toISOString().slice(0, 10)).length;

  const statCards = [
    { label: 'Total Patients', value: stats?.totalPatients, icon: <FiUsers />, route: '/patients', trend: 'Active' },
    { label: 'Total Doctors', value: stats?.totalDoctors, icon: <FiUserPlus />, route: '/doctors', trend: 'On Duty' },
    { label: 'Appointments', value: stats?.totalAppointments, icon: <FiCalendar />, route: '/appointments', trend: todayCount > 0 ? `+${todayCount} today` : null },
    { label: 'Prescriptions', value: stats?.totalPrescriptions, icon: <FiFileText />, route: '/prescriptions', trend: 'Issued' },
  ];

  const appointmentChart = [
    { label: 'Scheduled', value: stats?.scheduledCount || 0, color: '#e67e22' },
    { label: 'Completed', value: stats?.completedCount || 0, color: '#27ae60' },
    { label: 'Cancelled', value: stats?.cancelledCount || 0, color: '#e74c3c' },
  ];

  const genderChart = [
    { label: 'Male', value: stats?.genderBreakdown?.male || 0, color: '#2980b9' },
    { label: 'Female', value: stats?.genderBreakdown?.female || 0, color: '#e84393' },
    { label: 'Other', value: stats?.genderBreakdown?.other || 0, color: '#6c5ce7' },
  ];

  const quickActions = [
    { label: 'New Patient', route: '/patients', bg: 'var(--primary-light)', color: 'var(--primary)' },
    { label: 'New Doctor', route: '/doctors', bg: 'var(--secondary-light)', color: 'var(--secondary)' },
    { label: 'Book Appointment', route: '/appointments', bg: 'var(--info-light)', color: 'var(--info)' },
    { label: 'Write Prescription', route: '/prescriptions', bg: 'var(--warning-light)', color: 'var(--warning)' },
  ];

  if (loading) return <><Header title="Dashboard" /><div className="page-content"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div></>;

  return (
    <>
      <Header title="Dashboard" />
      <div className="page-content">

        {/* Welcome banner */}
        <div className="welcome-banner animate-in">
          <div>
            <h2>{greeting()}, {user?.name?.split(' ')[0]} 👋</h2>
            <p>Here's what's happening at your hospital today</p>
          </div>
          <div className="welcome-date">
            <span className="date-day">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
            <span className="date-full">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stats-grid">
          {statCards.map((card, i) => (
            <div key={i} className="stat-card animate-in" onClick={() => navigate(card.route)} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="stat-icon">{card.icon}</div>
              <div><h3><Counter value={card.value || 0} /></h3><p>{card.label}</p></div>
              {card.trend && <span className="stat-trend up"><FiTrendingUp style={{ fontSize: 10, marginRight: 2 }} />{card.trend}</span>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="dashboard-grid">
          <div className="card chart-card animate-in">
            <h4>Appointment Status</h4>
            <div className="chart-content">
              <DonutChart data={appointmentChart} />
              <div className="chart-legend">
                {appointmentChart.map((d, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span className="legend-label">{d.label}</span>
                    <span className="legend-value">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card chart-card animate-in" style={{ animationDelay: '0.1s' }}>
            <h4>Weekly Activity <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(last 7 days)</span></h4>
            <div className="bar-chart-wrapper"><WeeklyChart appointments={appointments} /></div>
          </div>

          <div className="card quick-actions-card animate-in" style={{ animationDelay: '0.15s' }}>
            <h4>Quick Actions</h4>
            <div className="quick-actions">
              {quickActions.map((qa, i) => (
                <button key={i} className="quick-action" onClick={() => navigate(qa.route)}>
                  <span className="qa-icon" style={{ background: qa.bg, color: qa.color }}><FiPlus /></span>
                  <span>{qa.label}</span>
                  <FiArrowRight className="qa-arrow" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row — demographics + recent appointments */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18, marginTop: 18 }}>
          <div className="card chart-card animate-in" style={{ animationDelay: '0.2s' }}>
            <h4>Patient Demographics</h4>
            <div className="chart-content">
              <DonutChart data={genderChart} />
              <div className="chart-legend">
                {genderChart.map((d, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: d.color }} />
                    <span className="legend-label">{d.label}</span>
                    <span className="legend-value">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="table-container animate-in" style={{ animationDelay: '0.25s' }}>
            <div className="table-header">
              <h3>Recent Appointments</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>View All <FiArrowRight /></button>
            </div>
            {stats?.recentAppointments?.length > 0 ? (
              <table>
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recentAppointments.map(a => (
                    <tr key={a._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{a.patient?.name || 'N/A'}</td>
                      <td>Dr. {a.doctor?.name || 'N/A'}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td><span className={`badge ${a.status === 'Completed' ? 'badge-success' : a.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state"><div className="icon"><FiCalendar /></div><p>No appointments yet.</p></div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
