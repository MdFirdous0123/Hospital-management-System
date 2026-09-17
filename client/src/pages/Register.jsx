import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { FiActivity, FiShield, FiCalendar, FiFileText } from 'react-icons/fi';

const features = [
    { icon: <FiShield />, title: 'Secure Patient Records', sub: 'HIPAA-compliant encrypted data storage' },
    { icon: <FiCalendar />, title: 'Smart Scheduling', sub: 'Real-time appointment booking & tracking' },
    { icon: <FiFileText />, title: 'Digital Prescriptions', sub: 'Paperless prescription management system' },
];

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const { data } = await API.post('/auth/register', form);
            login(data.user, data.token); navigate('/');
        } catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel">
                <div className="auth-blob auth-blob-1" />
                <div className="auth-blob auth-blob-2" />
                <div className="auth-panel-content">
                    <div className="auth-panel-logo">
                        <div className="logo-icon"><FiActivity /></div>
                        <div><h1>MediCare</h1><p>Pro HMS</p></div>
                    </div>
                    <div className="auth-panel-tagline">Join the Future of <span>Healthcare</span> Management</div>
                    <p className="auth-panel-sub">Set up your hospital account in seconds and start managing patients, doctors, and appointments.</p>
                    <div className="auth-features">
                        {features.map((f, i) => (
                            <div key={i} className="auth-feature">
                                <div className="auth-feature-icon">{f.icon}</div>
                                <div className="auth-feature-text"><p>{f.title}</p><span>{f.sub}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="auth-card animate-in">
                <div className="auth-brand">
                    <div className="auth-icon"><FiActivity /></div>
                    <h2>Create Account</h2>
                    <p>Join MediCare HMS — it's free to get started</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-control" placeholder="Dr. John Doe"
                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-control" placeholder="you@hospital.com"
                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-control" placeholder="Min. 6 characters" minLength={6}
                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account →'}
                    </button>
                </form>
                <div className="auth-link">Already have an account? <Link to="/login">Sign in</Link></div>
            </div>
        </div>
    );
}
