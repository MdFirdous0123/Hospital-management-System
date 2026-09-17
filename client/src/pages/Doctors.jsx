import { useState } from 'react';
import { useData } from '../hooks/useData';
import Header from '../components/Header';
import Modal from '../components/Modal';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'General Practice', 'Gynecology', 'Nephrology', 'Neurology',
  'Oncology', 'Ophthalmology', 'Orthopedics', 'Pediatrics',
  'Psychiatry', 'Pulmonology', 'Radiology', 'Surgery', 'Urology',
];
const EMPTY_FORM = { name: '', specialization: '', phone: '', email: '', experience: '', qualification: '', available: true };

export default function Doctors() {
  const { data: doctors, setData: setDoctors, loading } = useData('/doctors');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const setField = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = d => {
    setEditing(d._id);
    setForm({ name: d.name, specialization: d.specialization, phone: d.phone, email: d.email || '', experience: d.experience || '', qualification: d.qualification || '', available: d.available });
    setModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        const { data } = await API.put(`/doctors/${editing}`, form);
        setDoctors(prev => prev.map(d => d._id === editing ? data : d));
        toast.success('Doctor updated');
      } else {
        const { data } = await API.post('/doctors', form);
        setDoctors(prev => [data, ...prev]);
        toast.success('Doctor added');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await API.delete(`/doctors/${id}`);
      setDoctors(prev => prev.filter(d => d._id !== id));
      toast.success('Doctor deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = doctors.filter(d =>
    [d.name, d.specialization].some(v => v?.toLowerCase().includes(search.toLowerCase()))
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

          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : doctors.length === 0 ? (
            <div className="empty-state"><div className="icon"><FiUserPlus /></div><p>No doctors yet. Add your first!</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Specialization</th><th>Phone</th><th>Experience</th><th>Status</th><th>Actions</th></tr>
              </thead>
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
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(d._id)}><FiTrash2 /></button>
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
            title={editing ? 'Edit Doctor' : 'Add New Doctor'}
            onClose={() => setModal(false)}
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" form="doctor-form">{editing ? 'Update' : 'Add'} Doctor</button>
              </>
            }
          >
            <form id="doctor-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input className="form-control" value={form.name} onChange={setField('name')} required /></div>
                <div className="form-group"><label>Specialization *</label>
                  <select className="form-control" value={form.specialization} onChange={setField('specialization')} required>
                    <option value="">Select Specialization</option>
                    {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone *</label><input className="form-control" value={form.phone} onChange={setField('phone')} required /></div>
                <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={setField('email')} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Experience (years)</label><input type="number" className="form-control" value={form.experience} onChange={setField('experience')} min="0" /></div>
                <div className="form-group"><label>Qualification</label><input className="form-control" value={form.qualification} onChange={setField('qualification')} placeholder="e.g. MBBS, MD" /></div>
              </div>
              <div className="form-group"><label>Availability</label>
                <select className="form-control" value={form.available} onChange={e => setForm(prev => ({ ...prev, available: e.target.value === 'true' }))}>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
}
