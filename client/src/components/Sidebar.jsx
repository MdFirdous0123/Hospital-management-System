import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiUsers, FiUserPlus, FiCalendar, FiLogOut, FiActivity, FiFileText } from 'react-icons/fi';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); };
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    const roleBadgeClass = user?.role === 'admin' ? 'admin' : user?.role === 'doctor' ? 'doctor' : 'default';

    const links = [
        { to: '/', icon: <FiGrid />, label: 'Dashboard' },
        { to: '/patients', icon: <FiUsers />, label: 'Patients' },
        { to: '/doctors', icon: <FiUserPlus />, label: 'Doctors' },
        { to: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
        { to: '/prescriptions', icon: <FiFileText />, label: 'Prescriptions' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon"><FiActivity /></div>
                <div><h1>MediCare</h1><span>Pro HMS</span></div>
            </div>
            <nav className="sidebar-nav">
                <div className="nav-section-label">Main Menu</div>
                {links.map((link) => (
                    <NavLink key={link.to} to={link.to} end={link.to === '/'}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <span className="icon">{link.icon}</span>{link.label}
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="sidebar-user-info">
                    <div className="sidebar-avatar">
                        {initials}
                        <span className="online-pulse" />
                    </div>
                    <div className="sidebar-user-meta">
                        <span className="sidebar-user-name">{user?.name || 'User'}</span>
                        <span className={`sidebar-role-badge ${roleBadgeClass}`}>{user?.role || 'staff'}</span>
                    </div>
                </div>
                <button className="nav-link" onClick={handleLogout}>
                    <span className="icon"><FiLogOut /></span>Logout
                </button>
            </div>
        </aside>
    );
}
