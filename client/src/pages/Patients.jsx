import { useState } from 'react';
import { useData } from '../hooks/useData';
import Header from '../components/Header';
import Modal from '../components/Modal';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMPTY_FORM = { name: '', age: '', gender: 'Male', phone: '', email: '', address: '', bloodGroup: '', medicalHistory: '' };
const AVATAR_COLORS = ['#38bda8', '#6c5ce7', '#2980b9', '#e67e22', '#e84393', '#27ae60', '#e74c3c', '#f39c12'];

// Pick a consistent color based on the patient's name
const avatarColor = name => {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Map blood group letter to CSS class
const bloodClass = bg => {
  const letter = bg.replace(/[+-]/, '').toUpperCase();
  const map = { A: 'badge-blood-a', B: 'badge-blood-b', AB: 'badge-blood-ab', O: 'badge-blood-o' };
  return map[letter] || 'badge-info';
};

export default function Patients() {
  const { data: patients, setData: setPatients, loading } = useData('/patients');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null); // holds the _id of the patient being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  // Helper: update a single form field
  const setField = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = p => {
    setEditing(p._id);
    setForm({ name: p.name, age: p.age, gender: p.gender, phone: p.phone, email: p.email || '', address: p.address || '', bloodGroup: p.bloodGroup || '', medicalHistory: p.medicalHistory || '' });
    setModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        const { data } = await API.put(`/patients/${editing}`, form);
        setPatients(prev => prev.map(p => p._id === editing ? data : p));
        toast.success('Patient updated');
      } else {
        const { data } = await API.post('/patients', form);
        setPatients(prev => [data, ...prev]);
        toast.success('Patient added');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this patient?')) return;
    try {
      await API.delete(`/patients/${id}`);
      setPatients(prev => prev.filter(p => p._id !== id));
      toast.success('Patient deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = patients.filter(p =>
    [p.name, p.phone, p.bloodGroup].some(v => v?.toLowerCase().includes(search.toLowerCase()))
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

          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : patients.length === 0 ? (
            <div className="empty-state"><div className="icon"><FiUsers /></div><p>No patients yet. Add your first!</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Patient</th><th>Age</th><th>Gender</th><th>Phone</th><th>Blood Group</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="patient-cell">
                        <div className="patient-avatar" style={{ background: avatarColor(p.name) }}>
                          {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="patient-name">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.age} yrs</td>
                    <td>{p.gender}</td>
                    <td>{p.phone}</td>
                    <td><span className={`badge ${bloodClass(p.bloodGroup || '')}`}>{p.bloodGroup || '—'}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon" onClick={() => openEdit(p)}><FiEdit2 /></button>
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(p._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {modal && (
          <Modal
            title={editing ? 'Edit Patient' : 'Add New Patient'}
            onClose={() => setModal(false)}
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" form="patient-form">{editing ? 'Update' : 'Add'} Patient</button>
              </>
            }
          >
            <form id="patient-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={setField('name')} required /></div>
                <div className="form-group"><label>Age *</label><input type="number" className="form-control" value={form.age} onChange={setField('age')} required min="0" max="150" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Gender *</label>
                  <select className="form-control" value={form.gender} onChange={setField('gender')}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group"><label>Phone *</label><input className="form-control" value={form.phone} onChange={setField('phone')} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={setField('email')} /></div>
                <div className="form-group"><label>Blood Group</label>
                  <select className="form-control" value={form.bloodGroup} onChange={setField('bloodGroup')}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Address</label><input className="form-control" value={form.address} onChange={setField('address')} /></div>
              <div className="form-group"><label>Medical History</label><textarea className="form-control" value={form.medicalHistory} onChange={setField('medicalHistory')} placeholder="Any past conditions..." /></div>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
}
