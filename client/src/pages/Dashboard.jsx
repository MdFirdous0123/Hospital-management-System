import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import API from '../services/api';
import { FiUsers, FiUserPlus, FiCalendar, FiFileText, FiPlus, FiArrowRight, FiTrendingUp } from 'react-icons/fi';

function DonutChart({ data, size = 120 }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return (
        <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--border)" strokeWidth="14" />
                <text x="60" y="64" textAnchor="middle" fontSize="14" fill="var(--text-muted)" fontFamily="Outfit">0</text>
            </svg>
        </div>
    );
    let cumulative = 0;
    const radius = 48, circumference = 2 * Math.PI * radius;
    return (
        <div style={{ width: size, height: size, position: 'relative' }}>
            <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                {data.map((item, i) => {
                    const pct = item.value / total;
                    const offset = (cumulative / total) * circumference;
                    cumulative += item.value;
                    return <circle key={i} cx="60" cy="60" r={radius} fill="none" stroke={item.color} strokeWidth="14"
                        strokeDasharray={`${pct * circumference} ${circumference}`} strokeDashoffset={-offset}
                        style={{ transition: 'stroke-dasharray 0.8s ease' }} />;
                })}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-dark)', fontFamily: 'Outfit' }}>{total}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Total</span>
            </div>
        </div>
    );
}

function AnimatedCount({ value }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (value === 0) return;
        let start = 0;
        const step = Math.max(1, Math.ceil(value / 30));
        const timer = setInterval(() => {
            start += step;
            if (start >= value) { setDisplay(value); clearInterval(timer); }
            else setDisplay(start);
        }, 30);
        return () => clearInterval(timer);
    }, [value]);
    return <>{display}</>;
}

function WeeklyBarChart({ appointments }) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dateStr = d.toISOString().slice(0, 10);
        const count = appointments.filter(a => a.date === dateStr).length;
        return { label: i === 6 ? 'Today' : days[d.getDay()], count, isToday: i === 6 };
    });
    const maxCount = Math.max(...weekData.map(d => d.count), 1);
    return (
        <div className="bar-chart-wrapper">
            <div className="bar-chart-bars">
                {weekData.map((d, i) => (
                    <div key={i} className="bar-col">
                        <span className="bar-val" style={{ color: d.count > 0 ? 'var(--text-dark)' : 'var(--text-muted)' }}>{d.count > 0 ? d.count : ''}</span>
                        <div className="bar-fill" style={{
                            height: `${Math.max((d.count / maxCount) * 90, 4)}px`,
                            background: d.isToday ? 'linear-gradient(180deg, var(--primary), var(--primary-dark))' : 'var(--border)',
                            boxShadow: d.isToday ? '0 2px 8px rgba(56,189,168,0.35)' : 'none',
                        }} />
                        <span className="bar-label" style={{ color: d.isToday ? 'var(--primary)' : 'var(--text-muted)', fontWeight: d.isToday ? 700 : 500 }}>{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [allAppointments, setAllAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([API.get('/dashboard/stats'), API.get('/appointments')])
            .then(([statsRes, aptsRes]) => { setStats(statsRes.data); setAllAppointments(aptsRes.data); })
            .catch(() => {}).finally(() => setLoading(false));
    }, []);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) return <><Header title="Dashboard" /><div className="page-content"><p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p></div></>;

    const appointmentData = [
        { label: 'Scheduled', value: stats?.scheduledCount || 0, color: '#e67e22' },
        { label: 'Completed', value: stats?.completedCount || 0, color: '#27ae60' },
        { label: 'Cancelled', value: stats?.cancelledCount || 0, color: '#e74c3c' },
    ];
    const genderData = [
        { label: 'Male', value: stats?.genderBreakdown?.male || 0, color: '#2980b9' },
        { label: 'Female', value: stats?.genderBreakdown?.female || 0, color: '#e84393' },
        { label: 'Other', value: stats?.genderBreakdown?.other || 0, color: '#6c5ce7' },
    ];
    const todayCount = allAppointments.filter(a => a.date === new Date().toISOString().slice(0, 10)).length;

    return (
        <>
            <Header title="Dashboard" />
            <div className="page-content">
                <div className="welcome-banner animate-in">
                    <div>
                        <h2>{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h2>
                        <p>Here's what's happening at your hospital today</p>
                    </div>
                    <div className="welcome-date">
                        <span className="date-day">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
                        <span className="date-full">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card animate-in" onClick={() => navigate('/patients')} style={{ cursor: 'pointer' }}>
                        <div className="stat-icon"><FiUsers /></div>
                        <div><h3><AnimatedCount value={stats?.totalPatients || 0} /></h3><p>Total Patients</p></div>
                        <span className="stat-trend up"><FiTrendingUp style={{ fontSize: 10, marginRight: 2 }} />Active</span>
                    </div>
                    <div className="stat-card animate-in" onClick={() => navigate('/doctors')} style={{ cursor: 'pointer', animationDelay: '0.1s' }}>
                        <div className="stat-icon"><FiUserPlus /></div>
                        <div><h3><AnimatedCount value={stats?.totalDoctors || 0} /></h3><p>Total Doctors</p></div>
                        <span className="stat-trend up"><FiTrendingUp style={{ fontSize: 10, marginRight: 2 }} />On Duty</span>
                    </div>
                    <div className="stat-card animate-in" onClick={() => navigate('/appointments')} style={{ cursor: 'pointer', animationDelay: '0.2s' }}>
                        <div className="stat-icon"><FiCalendar /></div>
                        <div><h3><AnimatedCount value={stats?.totalAppointments || 0} /></h3><p>Appointments</p></div>
                        {todayCount > 0 && <span className="stat-trend neutral">+{todayCount} today</span>}
                    </div>
                    <div className="stat-card animate-in" onClick={() => navigate('/prescriptions')} style={{ cursor: 'pointer', animationDelay: '0.3s' }}>
                        <div className="stat-icon"><FiFileText /></div>
                        <div><h3><AnimatedCount value={stats?.totalPrescriptions || 0} /></h3><p>Prescriptions</p></div>
                        <span className="stat-trend up"><FiTrendingUp style={{ fontSize: 10, marginRight: 2 }} />Issued</span>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="card chart-card animate-in" style={{ animationDelay: '0.35s' }}>
                        <h4>Appointment Status</h4>
                        <div className="chart-content">
                            <DonutChart data={appointmentData} />
                            <div className="chart-legend">
                                {appointmentData.map((d, i) => (
                                    <div key={i} className="legend-item">
                                        <span className="legend-dot" style={{ background: d.color }} />
                                        <span className="legend-label">{d.label}</span>
                                        <span className="legend-value">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card chart-card animate-in" style={{ animationDelay: '0.4s' }}>
                        <h4>Weekly Activity <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(last 7 days)</span></h4>
                        <WeeklyBarChart appointments={allAppointments} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Today highlighted in teal</span>
                        </div>
                    </div>

                    <div className="card quick-actions-card animate-in" style={{ animationDelay: '0.45s' }}>
                        <h4>Quick Actions</h4>
                        <div className="quick-actions">
                            <button className="quick-action" onClick={() => navigate('/patients')}>
                                <span className="qa-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><FiPlus /></span>
                                <span>New Patient</span><FiArrowRight className="qa-arrow" />
                            </button>
                            <button className="quick-action" onClick={() => navigate('/doctors')}>
                                <span className="qa-icon" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}><FiPlus /></span>
                                <span>New Doctor</span><FiArrowRight className="qa-arrow" />
                            </button>
                            <button className="quick-action" onClick={() => navigate('/appointments')}>
                                <span className="qa-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}><FiPlus /></span>
                                <span>Book Appointment</span><FiArrowRight className="qa-arrow" />
                            </button>
                            <button className="quick-action" onClick={() => navigate('/prescriptions')}>
                                <span className="qa-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}><FiPlus /></span>
                                <span>Write Prescription</span><FiArrowRight className="qa-arrow" />
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18, marginTop: 18 }}>
                    <div className="card chart-card animate-in" style={{ animationDelay: '0.5s' }}>
                        <h4>Patient Demographics</h4>
                        <div className="chart-content">
                            <DonutChart data={genderData} />
                            <div className="chart-legend">
                                {genderData.map((d, i) => (
                                    <div key={i} className="legend-item">
                                        <span className="legend-dot" style={{ background: d.color }} />
                                        <span className="legend-label">{d.label}</span>
                                        <span className="legend-value">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="table-container animate-in" style={{ animationDelay: '0.55s' }}>
                        <div className="table-header">
                            <h3>Recent Appointments</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>View All <FiArrowRight /></button>
                        </div>
                        {stats?.recentAppointments?.length > 0 ? (
                            <table>
                                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                                <tbody>
                                    {stats.recentAppointments.slice(0, 5).map((apt) => (
                                        <tr key={apt._id}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{apt.patient?.name || 'N/A'}</td>
                                            <td>Dr. {apt.doctor?.name || 'N/A'}</td>
                                            <td>{apt.date}</td>
                                            <td>{apt.time}</td>
                                            <td><span className={`badge ${apt.status === 'Completed' ? 'badge-success' : apt.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>{apt.status}</span></td>
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
