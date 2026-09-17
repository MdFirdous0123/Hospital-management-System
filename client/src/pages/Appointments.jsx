import { useState, useEffect } from 'react';
import Header from '../components/Header';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiX } from 'react-icons/fi';

const emptyForm = { patient: '', doctor: '', date: '', time: '', reason: '', status: 'Scheduled' };
const TIMES = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        Promise.all([API.get('/appointments'), API.get('/patients'), API.get('/doctors')])
            .then(([a, p, d]) => { setAppointments(a.data); setPatients(p.data); setDoctors(d.data); })
            .catch(() => toast.error('Failed to load data'))
            .finally(() => setLoading(false));
    }, []);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (a) => {
        setEditing(a._id);
        setForm({ patient: a.patient?._id || '', doctor: a.doctor?._id || '', date: a.date, time: a.time, reason: a.reason || '', status: a.status });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                const { data } = await API.put(`/appointments/${editing}`, form);
                setAppointments(appointments.map(a => a._id === editing ? data : a));
                toast.success('Appointment updated');
            } else {
                const { data } = await API.post('/appointments', form);
                setAppointments([data, ...appointments]);
                toast.success('Appointment booked');
            }
            setShowModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving appointment'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this appointment?')) return;
        try {
            await API.delete(`/appointments/${id}`);
            setAppointments(appointments.filter(a => a._id !== id));
            toast.success('Appointment deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const filtered = appointments.filter(a => {
        const matchSearch = (a.patient?.name || '').toLowerCase().includes(search.toLowerCase()) || (a.doctor?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || a.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <Header title="Appointments" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2>Appointments</h2><p>Schedule and manage patient appointments</p></div>
                    <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Book Appointment</button>
                </div>

                {!loading && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                        {['all', 'Scheduled', 'Completed', 'Cancelled'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: `1px solid ${filterStatus === s ? 'var(--primary)' : 'var(--border)'}`, background: filterStatus === s ? 'var(--primary)' : 'var(--bg-white)', color: filterStatus === s ? '#fff' : 'var(--text-dark)', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
                                {s === 'all' ? `All (${appointments.length})` : `${s} (${appointments.filter(a => a.status === s).length})`}
                            </button>
                        ))}
                    </div>
                )}

                <div className="table-container animate-in">
                    <div className="table-header">
                        <h3>Appointments ({filtered.length})</h3>
                        <input className="search-input" placeholder="Search by patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {loading ? <div className="empty-state"><p>Loading...</p></div> :
                        appointments.length === 0 ? <div className="empty-state"><div className="icon"><FiCalendar /></div><p>No appointments yet. Book your first appointment!</p></div> :
                        <table>
                            <thead><tr><th>Patient</th><th>Doctor</th><th>Specialization</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(a => (
                                    <tr key={a._id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{a.patient?.name || 'N/A'}</td>
                                        <td>Dr. {a.doctor?.name || 'N/A'}</td>
                                        <td>{a.doctor?.specialization || '—'}</td>
                                        <td>{a.date}</td>
                                        <td>{a.time}</td>
                                        <td><span className={`badge ${a.status === 'Completed' ? 'badge-success' : a.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>{a.status}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn-icon" onClick={() => openEdit(a)}><FiEdit2 /></button>
                                                <button className="btn-icon" onClick={() => handleDelete(a._id)} style={{ color: 'var(--danger)' }}><FiTrash2 /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>}
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editing ? 'Edit Appointment' : 'Book Appointment'}</h3>
                                <button className="btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group"><label>Patient *</label>
                                            <select className="form-control" value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })} required>
                                                <option value="">Select Patient</option>
                                                {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group"><label>Doctor *</label>
                                            <select className="form-control" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} required>
                                                <option value="">Select Doctor</option>
                                                {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Date *</label><input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                                        <div className="form-group"><label>Time *</label>
                                            <select className="form-control" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required>
                                                <option value="">Select Time</option>
                                                {TIMES.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Reason</label><input className="form-control" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for visit" /></div>
                                        <div className="form-group"><label>Status</label>
                                            <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                                <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Book'} Appointment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
