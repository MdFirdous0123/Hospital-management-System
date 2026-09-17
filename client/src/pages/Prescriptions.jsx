import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
    FiPlus, FiTrash2, FiFileText, FiX, FiPlusCircle, FiMinusCircle,
    FiUploadCloud, FiDownload, FiMessageSquare, FiCheck,
    FiClock, FiAlertCircle, FiImage, FiFile
} from 'react-icons/fi';

const emptyMedicine = { name: '', dosage: '', duration: '' };
const emptyForm = { patient: '', doctor: '', diagnosis: '', medicines: [{ ...emptyMedicine }], notes: '', followUpDate: '' };

const STATUS_CONFIG = {
    pending: { label: 'Pending Review', color: '#e67e22', bg: 'rgba(230,126,34,0.12)', icon: <FiClock /> },
    contacted: { label: 'Doctor Contacted', color: '#2980b9', bg: 'rgba(41,128,185,0.12)', icon: <FiMessageSquare /> },
    resolved: { label: 'Resolved', color: '#27ae60', bg: 'rgba(39,174,96,0.12)', icon: <FiCheck /> },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function UploadZone({ file, onFile, onClear }) {
    const inputRef = useRef();
    const [dragging, setDragging] = useState(false);
    const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); };
    const isImage = file && file.type?.startsWith('image/');
    return (
        <div>
            {!file ? (
                <div onClick={() => inputRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    style={{ border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--primary-light)' : 'var(--bg-body)', transition: 'all 0.2s ease' }}>
                    <div style={{ fontSize: 36, color: 'var(--primary)', marginBottom: 10 }}><FiUploadCloud /></div>
                    <p style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: 14 }}>Drag & drop your prescription here</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>or click to browse • JPG, PNG, PDF up to 10 MB</p>
                    <input ref={inputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
                </div>
            ) : (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--bg-body)' }}>
                    {isImage ? (
                        <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', background: '#000' }} />
                    ) : (
                        <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FiFile style={{ fontSize: 32, color: 'var(--danger)' }} />
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-dark)' }}>{file.name}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB · PDF Document</p>
                            </div>
                        </div>
                    )}
                    <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{file.name}</span>
                        <button type="button" onClick={onClear} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14 }}><FiX /> Remove</button>
                    </div>
                </div>
            )}
        </div>
    );
}

function UploadedFileViewer({ rx }) {
    const [show, setShow] = useState(false);
    if (!rx.uploadedFile?.filename) return null;
    const fileUrl = `/uploads/${rx.uploadedFile.filename}`;
    const isImage = rx.uploadedFile.mimetype?.startsWith('image/');
    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setShow(!show)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', cursor: 'pointer' }}>
                    {isImage ? <FiImage /> : <FiFile />} {show ? 'Hide' : 'View'} Prescription
                </button>
                <a href={fileUrl} download={rx.uploadedFile.originalName}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'var(--bg-input)', color: 'var(--text-dark)', border: '1px solid var(--border)', textDecoration: 'none' }}>
                    <FiDownload /> Download
                </a>
            </div>
            {show && (
                <div style={{ marginTop: 10, borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {isImage ? (
                        <img src={fileUrl} alt="Uploaded Prescription" style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block', background: '#000' }} />
                    ) : (
                        <iframe src={fileUrl} title="Prescription PDF" style={{ width: '100%', height: 400, border: 'none' }} />
                    )}
                </div>
            )}
        </div>
    );
}

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [replyModal, setReplyModal] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [uploadForm, setUploadForm] = useState({ patient: '', doctor: '', notes: '' });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        Promise.all([API.get('/prescriptions'), API.get('/patients'), API.get('/doctors')])
            .then(([r, p, d]) => { setPrescriptions(r.data); setPatients(p.data); setDoctors(d.data); })
            .catch(() => toast.error('Failed to load data'))
            .finally(() => setLoading(false));
    }, []);

    const addMedicine = () => setForm({ ...form, medicines: [...form.medicines, { ...emptyMedicine }] });
    const removeMedicine = (i) => setForm({ ...form, medicines: form.medicines.filter((_, idx) => idx !== i) });
    const updateMedicine = (i, field, value) => {
        const meds = [...form.medicines]; meds[i] = { ...meds[i], [field]: value };
        setForm({ ...form, medicines: meds });
    };

    const handleWriteSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/prescriptions', form);
            setPrescriptions([data, ...prescriptions]);
            toast.success('Prescription created'); setShowWriteModal(false);
            setForm({ ...emptyForm, medicines: [{ ...emptyMedicine }] });
        } catch (err) { toast.error(err.response?.data?.message || 'Error creating prescription'); }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) return toast.error('Please select a file to upload');
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', uploadFile); fd.append('patient', uploadForm.patient);
            fd.append('doctor', uploadForm.doctor); fd.append('notes', uploadForm.notes);
            const { data } = await API.post('/prescriptions/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPrescriptions([data, ...prescriptions]);
            toast.success('Prescription uploaded! Doctor will review and contact you.');
            setShowUploadModal(false); setUploadFile(null); setUploadForm({ patient: '', doctor: '', notes: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
        finally { setUploading(false); }
    };

    const updateStatus = async (id, contactStatus) => {
        try {
            const { data } = await API.patch(`/prescriptions/${id}/status`, { contactStatus });
            setPrescriptions(prescriptions.map(p => p._id === id ? data : p));
            toast.success(`Status updated to "${STATUS_CONFIG[contactStatus].label}"`);
        } catch { toast.error('Failed to update status'); }
    };

    const submitReply = async () => {
        if (!replyModal) return;
        try {
            const { data } = await API.patch(`/prescriptions/${replyModal.id}/status`, { doctorReply: replyText, contactStatus: 'contacted' });
            setPrescriptions(prescriptions.map(p => p._id === replyModal.id ? data : p));
            toast.success('Reply saved'); setReplyModal(null); setReplyText('');
        } catch { toast.error('Failed to save reply'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this prescription?')) return;
        try { await API.delete(`/prescriptions/${id}`); setPrescriptions(prescriptions.filter(p => p._id !== id)); toast.success('Prescription deleted'); }
        catch { toast.error('Failed to delete'); }
    };

    const filtered = prescriptions.filter(p => {
        const matchSearch = (p.patient?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.doctor?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            p.diagnosis.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'all' || p.type === filterType;
        return matchSearch && matchType;
    });

    const uploadedCount = prescriptions.filter(p => p.type === 'uploaded').length;
    const writtenCount = prescriptions.filter(p => p.type === 'written').length;
    const pendingCount = prescriptions.filter(p => p.type === 'uploaded' && p.contactStatus === 'pending').length;

    return (
        <>
            <Header title="Prescriptions" />
            <div className="page-content">
                <div className="page-header">
                    <div><h2>Prescriptions</h2><p>Manage written prescriptions & uploaded prescription images</p></div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary" onClick={() => setShowUploadModal(true)}><FiUploadCloud /> Upload Prescription</button>
                        <button className="btn btn-primary" onClick={() => { setForm({ ...emptyForm, medicines: [{ ...emptyMedicine }] }); setShowWriteModal(true); }}><FiPlus /> Write Prescription</button>
                    </div>
                </div>

                {!loading && (
                    <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                        {[
                            { label: 'All Prescriptions', value: prescriptions.length, color: 'var(--primary)', type: 'all' },
                            { label: 'Written by Doctors', value: writtenCount, color: 'var(--info)', type: 'written' },
                            { label: 'Uploaded by Patients', value: uploadedCount, color: 'var(--secondary)', type: 'uploaded' },
                            ...(pendingCount > 0 ? [{ label: 'Pending Review', value: pendingCount, color: 'var(--warning)', type: 'uploaded' }] : []),
                        ].map(s => (
                            <button key={s.type + s.label} onClick={() => setFilterType(s.type)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 'var(--radius)', background: filterType === s.type ? s.color : 'var(--bg-white)', border: `1px solid ${filterType === s.type ? s.color : 'var(--border)'}`, color: filterType === s.type ? '#fff' : 'var(--text-dark)', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: 13, fontWeight: 600 }}>
                                <span style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</span>
                                <span style={{ fontWeight: 500, opacity: 0.85 }}>{s.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                <div className="table-container animate-in">
                    <div className="table-header">
                        <h3>{filterType === 'all' ? 'All' : filterType === 'written' ? 'Written' : 'Uploaded'} Prescriptions ({filtered.length})</h3>
                        <input className="search-input" placeholder="Search by patient, doctor or diagnosis..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {loading ? <div className="empty-state"><p>Loading...</p></div> :
                        filtered.length === 0 ? <div className="empty-state"><div className="icon"><FiFileText /></div><p>No prescriptions found</p></div> : (
                            <div className="prescription-list">
                                {filtered.map(rx => (
                                    <div key={rx._id} className="prescription-card" style={{ borderLeft: `4px solid ${rx.type === 'uploaded' ? 'var(--secondary)' : 'var(--primary)'}` }}>
                                        <div className="rx-header">
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                                    <h4>{rx.patient?.name || 'N/A'}</h4>
                                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px', background: rx.type === 'uploaded' ? 'var(--secondary-light)' : 'var(--primary-light)', color: rx.type === 'uploaded' ? 'var(--secondary)' : 'var(--primary)' }}>
                                                        {rx.type === 'uploaded' ? '📎 Uploaded' : '✏️ Written'}
                                                    </span>
                                                    {rx.type === 'uploaded' && <StatusBadge status={rx.contactStatus} />}
                                                </div>
                                                <span className="rx-meta">{rx.type === 'uploaded' ? 'Requesting' : 'by'} Dr. {rx.doctor?.name || 'N/A'}{rx.doctor?.specialization ? ` • ${rx.doctor.specialization}` : ''}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                <span className="rx-date">{new Date(rx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                {rx.type === 'uploaded' && (
                                                    <>
                                                        <select value={rx.contactStatus} onChange={e => updateStatus(rx._id, e.target.value)}
                                                            style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-dark)', cursor: 'pointer' }}>
                                                            <option value="pending">Pending</option>
                                                            <option value="contacted">Contacted</option>
                                                            <option value="resolved">Resolved</option>
                                                        </select>
                                                        <button className="btn-icon" onClick={() => { setReplyModal({ id: rx._id }); setReplyText(rx.doctorReply || ''); }} title="Add doctor reply" style={{ color: 'var(--info)' }}><FiMessageSquare /></button>
                                                    </>
                                                )}
                                                <button className="btn-icon" onClick={() => handleDelete(rx._id)} style={{ color: 'var(--danger)' }}><FiTrash2 /></button>
                                            </div>
                                        </div>
                                        {rx.type === 'uploaded' ? (
                                            <>
                                                <UploadedFileViewer rx={rx} />
                                                {rx.notes && <div className="rx-notes" style={{ marginTop: 10 }}><strong>Patient Notes:</strong> {rx.notes}</div>}
                                                {rx.doctorReply && (
                                                    <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--info-light)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(41,128,185,0.2)' }}>
                                                        <strong style={{ fontSize: 12, color: 'var(--info)' }}><FiMessageSquare style={{ verticalAlign: 'middle', marginRight: 4 }} />Doctor's Reply:</strong>
                                                        <p style={{ marginTop: 4, fontSize: 13, color: 'var(--text-body)' }}>{rx.doctorReply}</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="rx-diagnosis"><strong>Diagnosis:</strong> {rx.diagnosis}</div>
                                                <div className="rx-medicines">
                                                    <table className="medicines-table">
                                                        <thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th></tr></thead>
                                                        <tbody>{rx.medicines.map((med, i) => <tr key={i}><td>{med.name}</td><td>{med.dosage}</td><td>{med.duration}</td></tr>)}</tbody>
                                                    </table>
                                                </div>
                                                {rx.notes && <div className="rx-notes"><strong>Notes:</strong> {rx.notes}</div>}
                                                {rx.followUpDate && <div className="rx-followup"><strong>Follow-up:</strong> {rx.followUpDate}</div>}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                </div>

                {showWriteModal && (
                    <div className="modal-overlay" onClick={() => setShowWriteModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
                            <div className="modal-header"><h3>✏️ Write Prescription</h3><button className="btn-icon" onClick={() => setShowWriteModal(false)}><FiX /></button></div>
                            <form onSubmit={handleWriteSubmit}>
                                <div className="modal-body">
                                    <div className="form-row">
                                        <div className="form-group"><label>Patient *</label><select className="form-control" value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })} required><option value="">Select Patient</option>{patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                                        <div className="form-group"><label>Doctor *</label><select className="form-control" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} required><option value="">Select Doctor</option>{doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}</select></div>
                                    </div>
                                    <div className="form-group"><label>Diagnosis *</label><input className="form-control" value={form.diagnosis} onChange={e => setForm({ ...form, diagnosis: e.target.value })} required placeholder="e.g. Viral Fever" /></div>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Medicines *</span>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={addMedicine}><FiPlusCircle /> Add</button>
                                        </label>
                                        {form.medicines.map((med, i) => (
                                            <div key={i} className="medicine-row">
                                                <input className="form-control" placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} required />
                                                <input className="form-control" placeholder="Dosage" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} required />
                                                <input className="form-control" placeholder="Duration" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} required />
                                                {form.medicines.length > 1 && <button type="button" className="btn-icon" onClick={() => removeMedicine(i)} style={{ color: 'var(--danger)', flexShrink: 0 }}><FiMinusCircle /></button>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Follow-up Date</label><input type="date" className="form-control" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} /></div>
                                        <div className="form-group"><label>Notes</label><input className="form-control" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes" /></div>
                                    </div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowWriteModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Prescription</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {showUploadModal && (
                    <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                            <div className="modal-header"><h3>📎 Upload Prescription</h3><button className="btn-icon" onClick={() => setShowUploadModal(false)}><FiX /></button></div>
                            <form onSubmit={handleUploadSubmit}>
                                <div className="modal-body">
                                    <div style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--info-light)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(41,128,185,0.2)', fontSize: 13, color: 'var(--info)' }}>
                                        <FiAlertCircle style={{ verticalAlign: 'middle', marginRight: 6 }} />Upload your existing prescription image or PDF. The doctor will review it and contact you.
                                    </div>
                                    <div className="form-group"><label>Prescription File *</label><UploadZone file={uploadFile} onFile={setUploadFile} onClear={() => setUploadFile(null)} /></div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Patient *</label><select className="form-control" value={uploadForm.patient} onChange={e => setUploadForm({ ...uploadForm, patient: e.target.value })} required><option value="">Select Patient</option>{patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
                                        <div className="form-group"><label>Preferred Doctor *</label><select className="form-control" value={uploadForm.doctor} onChange={e => setUploadForm({ ...uploadForm, doctor: e.target.value })} required><option value="">Select Doctor</option>{doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization}</option>)}</select></div>
                                    </div>
                                    <div className="form-group"><label>Additional Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label><textarea className="form-control" value={uploadForm.notes} onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })} placeholder="Describe your symptoms or any questions for the doctor..." style={{ minHeight: 70 }} /></div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={uploading}><FiUploadCloud /> {uploading ? 'Uploading...' : 'Upload & Request Review'}</button></div>
                            </form>
                        </div>
                    </div>
                )}

                {replyModal && (
                    <div className="modal-overlay" onClick={() => setReplyModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
                            <div className="modal-header"><h3><FiMessageSquare /> Doctor's Reply</h3><button className="btn-icon" onClick={() => setReplyModal(null)}><FiX /></button></div>
                            <div className="modal-body">
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Write a reply for the patient. Status will be set to "Contacted".</p>
                                <div className="form-group"><label>Reply / Instructions</label><textarea className="form-control" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="e.g. Please come in for a follow-up..." style={{ minHeight: 100 }} /></div>
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setReplyModal(null)}>Cancel</button><button type="button" className="btn btn-primary" onClick={submitReply}><FiCheck /> Save Reply</button></div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
