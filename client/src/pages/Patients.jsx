import { useState, useEffect } from 'react';
import Header from '../components/Header';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiX } from 'react-icons/fi';

const emptyForm = { name: '', age: '', gender: 'Male', phone: '', email: '', address: '', bloodGroup: '', medicalHistory: '' };

const AVATAR_COLORS = ['#38bda8','#6c5ce7','#2980b9','#e67e22','#e84393','#27ae60','#e74c3c','#f39c12'];
function avatarColor(name = '') {
    let hash = 0;
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function bloodBadgeClass(bg = '') {
    const g = bg.replace(/[+-]/, '').toUpperCase();
    if (g === 'A') return 'badge badge-blood-a';
    if (g === 'B') return 'badge badge-blood-b';
    if (g === 'AB') return 'badge badge-blood-ab';
    if (g === 'O') return 'badge badge-blood-o';
    return 'badge badge-info';
}

export default function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');

    useEffect(() => {
        API.get('/patients')
            .then(({ data }) => setPatients(data))
            .catch(() => toast.error('Failed to load patients'))
            .finally(() => setLoading(false));
    }, []);

    const openAdd = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (p) => {
        setEditing(p._id);
        setForm({ name: p.name, age: p.age, gender: p.gender, phone: p.phone, email: p.email || '', address: p.address || '', bloodGroup: p.bloodGroup || '', medicalHistory: p.medicalHistory || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                const { data } = await API.put(`/patients/${editing}`, form);
                setPatients(patients.map(p => p._id === editing ? data : p));
                toast.success('Patient updated');
            } else {
                const { data } = await API.post('/patients', form);
                setPatients([data, ...patients]);
                toast.success('Patient added');
            }
            setShowModal(false);
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving patient'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this patient?')) return;
        try {
            await API.delete(`/patients/${id}`);
            setPatients(patients.filter(p => p._id !== id));
            toast.success('Patient deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search) ||
        (p.bloodGroup || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Header title="Patients" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2>Patients</h2><p>Manage patient records and medical history</p></div>
                    <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Patient</button>
                </div>
                <div className="table-container animate-in">
                    <div className="table-header">
                        <h3>All Patients ({filtered.length})</h3>
                        <input className="search-input" placeholder="Search by name, phone or blood group..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {loading ? <div className="empty-state"><p>Loading...</p></div> :
                        patients.length === 0 ? <div className="empty-state"><div className="icon"><FiUsers /></div><p>No patients found. Add your first patient!</p></div> :
                        <table>
                            <thead><tr><th>Patient</th><th>Age</th><th>Gender</th><th>Phone</th><th>Blood Group</th><th>Actions</th></tr></thead>
                            <tbody>
                                {filtered.map(p => {
                                    const initials = p.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                    return (
                                        <tr key={p._id}>
                                            <td>
                                                <div className="patient-cell">
                                                    <div className="patient-avatar" style={{ background: avatarColor(p.name) }}>{initials}</div>
                                                    <span className="patient-name">{p.name}</span>
                                                </div>
                                            </td>
                                            <td>{p.age} yrs</td>
                                            <td>{p.gender}</td>
                                            <td>{p.phone}</td>
                                            <td><span className={bloodBadgeClass(p.bloodGroup)}>{p.bloodGroup || '—'}</span></td>
                                            <td>
                                                <div className="actions">
                                                    <button className="btn-icon" onClick={() => openEdit(p)}><FiEdit2 /></button>
                                                    <button className="btn-icon" onClick={() => handleDelete(p._id)} style={{ color: 'var(--danger)' }}><FiTrash2 /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>}
                </div>

                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>{editing ? 'Edit Patient' : 'Add New Patient'}</h3>
                                <button className="btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                                        <div className="form-group"><label>Age *</label><input type="number" className="form-control" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} required min="0" max="150" /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Gender *</label><select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select></div>
                                        <div className="form-group"><label>Phone *</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                        <div className="form-group"><label>Blood Group</label>
                                            <select className="form-control" value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                                                <option value="">Select</option>
                                                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group"><label>Address</label><input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
                                    <div className="form-group"><label>Medical History</label><textarea className="form-control" value={form.medicalHistory} onChange={e => setForm({ ...form, medicalHistory: e.target.value })} placeholder="Any past medical conditions..." /></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Patient</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
