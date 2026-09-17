import { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import Header from '../components/Header';
import Modal from '../components/Modal';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';

const TIMES = ['08:00 AM','08:30 AM','09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];
const STATUSES = ['Scheduled', 'Completed', 'Cancelled'];
const EMPTY_FORM = { patient: '', doctor: '', date: '', time: '', reason: '', status: 'Scheduled' };

const statusClass = s => ({ Completed: 'badge-success', Cancelled: 'badge-danger', Scheduled: 'badge-warning' }[s]);

export default function Appointments() {
  const { data: appointments, setData: setAppointments, loading } = useData('/appointments');
  const { data: patients } = useData('/patients');
  const { data: doctors } = useData('/doctors');

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const setField = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = a => {
    setEditing(a._id);
    setForm({ patient: a.patient?._id || '', doctor: a.doctor?._id || '', date: a.date, time: a.time, reason: a.reason || '', status: a.status });
    setModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        const { data } = await API.put(`/appointments/${editing}`, form);
        setAppointments(prev => prev.map(a => a._id === editing ? data : a));
        toast.success('Appointment updated');
      } else {
        const { data } = await API.post('/appointments', form);
        setAppointments(prev => [data, ...prev]);
        toast.success('Appointment booked');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this appointment?')) return;
    try {
      await API.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a._id !== id));
      toast.success('Appointment deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = appointments.filter(a => {
    const matchSearch = [a.patient?.name, a.doctor?.name].some(v => v?.toLowerCase().includes(search.toLowerCase()));
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

        {/* Status filter tabs */}
        {!loading && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            {['all', ...STATUSES].map(s => {
              const count = s === 'all' ? appointments.length : appointments.filter(a => a.status === s).length;
              return (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: `1px solid ${filterStatus === s ? 'var(--primary)' : 'var(--border)'}`, background: filterStatus === s ? 'var(--primary)' : 'var(--bg-white)', color: filterStatus === s ? '#fff' : 'var(--text-dark)', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
                  {s === 'all' ? 'All' : s} ({count})
                </button>
              );
            })}
          </div>
        )}

        <div className="table-container animate-in">
          <div className="table-header">
            <h3>Appointments ({filtered.length})</h3>
            <input className="search-input" placeholder="Search by patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : appointments.length === 0 ? (
            <div className="empty-state"><div className="icon"><FiCalendar /></div><p>No appointments yet. Book the first one!</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Patient</th><th>Doctor</th><th>Specialization</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{a.patient?.name || 'N/A'}</td>
                    <td>Dr. {a.doctor?.name || 'N/A'}</td>
                    <td>{a.doctor?.specialization || '—'}</td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td><span className={`badge ${statusClass(a.status)}`}>{a.status}</span></td>
                    <td>
                      <div className="actions">
                        <button className="btn-icon" onClick={() => openEdit(a)}><FiEdit2 /></button>
                        <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(a._id)}><FiTrash2 /></button>
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
            title={editing ? 'Edit Appointment' : 'Book Appointment'}
            onClose={() => setModal(false)}
            footer={
              <>
                <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" form="apt-form">{editing ? 'Update' : 'Book'} Appointment</button>
              </>
            }
          >
            <form id="apt-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Patient *</label>
                  <select className="form-control" value={form.patient} onChange={setField('patient')} required>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Doctor *</label>
                  <select className="form-control" value={form.doctor} onChange={setField('doctor')} required>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Date *</label><input type="date" className="form-control" value={form.date} onChange={setField('date')} required /></div>
                <div className="form-group"><label>Time *</label>
                  <select className="form-control" value={form.time} onChange={setField('time')} required>
                    <option value="">Select Time</option>
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Reason</label><input className="form-control" value={form.reason} onChange={setField('reason')} placeholder="Reason for visit" /></div>
                <div className="form-group"><label>Status</label>
                  <select className="form-control" value={form.status} onChange={setField('status')}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  );
}
