import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';
import { FiSun, FiMoon, FiBell, FiGrid, FiUsers, FiUserPlus, FiCalendar, FiFileText } from 'react-icons/fi';

const PAGE_ICONS = { Dashboard: <FiGrid />, Patients: <FiUsers />, Doctors: <FiUserPlus />, Appointments: <FiCalendar />, Prescriptions: <FiFileText /> };

export default function Header({ title }) {
    const { user } = useAuth();
    const { isDark, toggle } = useTheme();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    const [showNotif, setShowNotif] = useState(false);
    const [notifs, setNotifs] = useState([]);
    const [notifCount, setNotifCount] = useState(0);
    const notifRef = useRef(null);

    useEffect(() => {
        API.get('/appointments').then(({ data }) => {
            const today = new Date().toISOString().slice(0, 10);
            const todayApts = data.filter(a => a.date === today);
            const scheduled = todayApts.filter(a => a.status === 'Scheduled');
            const built = [
                scheduled.length > 0 && { id: 1, color: '#e67e22', text: `${scheduled.length} appointment${scheduled.length > 1 ? 's' : ''} scheduled today`, sub: 'Action required' },
                todayApts.length > 0 && { id: 2, color: '#27ae60', text: `${todayApts.length} total appointment${todayApts.length > 1 ? 's' : ''} today`, sub: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) },
            ].filter(Boolean);
            setNotifs(built);
            setNotifCount(scheduled.length);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="header">
            <div className="header-breadcrumb">
                <div className="page-icon">{PAGE_ICONS[title] || <FiGrid />}</div>
                <h2>{title}</h2>
            </div>
            <div className="header-right">
                <button className="theme-toggle" onClick={toggle} title={isDark ? 'Light Mode' : 'Dark Mode'}>
                    {isDark ? <FiSun /> : <FiMoon />}
                </button>
                <div className="notif-wrapper" ref={notifRef}>
                    <button className="notif-btn" onClick={() => setShowNotif(v => !v)}>
                        <FiBell />
                        {notifCount > 0 && <span className="notif-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
                    </button>
                    {showNotif && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown-header">
                                <h4>Notifications</h4>
                                <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            {notifs.length > 0 ? notifs.map(n => (
                                <div key={n.id} className="notif-item">
                                    <span className="notif-dot" style={{ background: n.color }} />
                                    <div><p>{n.text}</p><span>{n.sub}</span></div>
                                </div>
                            )) : <div className="notif-empty">✅ No pending notifications for today</div>}
                        </div>
                    )}
                </div>
                <div className="header-user">
                    <div className="avatar">{initials}</div>
                    <div className="user-info"><p>{user?.name}</p><span>{user?.role}</span></div>
                </div>
            </div>
        </header>
    );
}
