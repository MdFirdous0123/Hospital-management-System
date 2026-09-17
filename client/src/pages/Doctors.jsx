import { useState, useEffect } from 'react';
import Header from '../components/Header';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUserPlus, FiX } from 'react-icons/fi';

const emptyForm = { name: '', specialization: '', phone: '', email: '', experience: '', qualification: '', available: true };
const SPECIALIZATIONS = ['Cardiology','Dermatology','Endocrinology','Gastroenterology','General Practice','Gynecology','Nephrology','Neurology','Oncology','Ophthalmology','Orthopedics','Pediatrics','Psychiatry','Pulmonology','Radiology','Surgery','Urology'];

export default function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');

    useEffect(() => {
        API.get('/doctors')
            .then(({ data }) => setDoctors(data))
            .catch(() => toast.error('Failed to load doctors'))
            .finally(() => setLoading(false));
    }, []);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (d) => {
        setEditing(d._id);
        setForm({ name: d.name, specialization: d.specialization, phone: d.phone, email: d.email || '', experience: d.experience || '', qualification: d.qualification || '', available: d.available });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                const { data } = await API.put(`/doctors/${editing}`, form);
                setDoctors(doctors.map(d => d._id === editing ? data : d));
                toast.success('Doctor updated');
            } else {
                const { data } = await API.post('/doctors', form);
                setDoctors([data, ...doctors]);
                toast.success('Doctor added');
            }
            setShowModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving doctor'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this doctor?')) return;
        try {
            await API.delete(`/doctors/${id}`);
            setDoctors(doctors.filter(d => d._id !== id));
            toast.success('Doctor deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const filtered = doctors.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Header title="Doctors" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2>Doctors</h2><p>Manage medical staff and specializations</p></div>
                    <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Doctor</button>
                </div>
                <div className="table-container animate-in">
                    <div className="table-header">
                        <h3>All Doctors ({filtered.length})</h3>
                        <input className="search-input" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {loading ? <div className="empty-state"><p>Loading...</p></div> :
                        doctors.length === 0 ? <div className="empty-state"><div className="icon"><FiUserPlus /></div><p>No doctors found. Add your first doctor!</p></div> :
                        <table>
                            <thead><tr><th>Name</th><th>Specialization</th><th>Phone</th><th>Experience</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(d => (
                                    <tr key={d._id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Dr. {d.name}</td>
                                        <td><span className="badge badge-info">{d.specialization}</span></td>
                                        <td>{d.phone}</td>
                                        <td>{d.experience ? `${d.experience} yrs` : '—'}</td>
                                        <td><span className={`badge ${d.available ? 'badge-success' : 'badge-danger'}`}>{d.available ? 'Available' : 'Unavailable'}</span></td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn-icon" onClick={() => openEdit(d)}><FiEdit2 /></button>
                                                <button className="btn-icon" onClick={() => handleDelete(d._id)} style={{ color: 'var(--danger)' }}><FiTrash2 /></button>
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
                                <h3>{editing ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                                <button className="btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                                        <div className="form-group"><label>Specialization *</label>
                                            <select className="form-control" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} required>
                                                <option value="">Select Specialization</option>
                                                {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Phone *</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
                                        <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Experience (years)</label><input type="number" className="form-control" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} min="0" /></div>
                                        <div className="form-group"><label>Qualification</label><input className="form-control" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. MBBS, MD" /></div>
                                    </div>
                                    <div className="form-group"><label>Availability</label>
                                        <select className="form-control" value={form.available} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
                                            <option value="true">Available</option>
                                            <option value="false">Unavailable</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Doctor</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
