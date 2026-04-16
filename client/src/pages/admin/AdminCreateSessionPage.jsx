import React, { useState } from 'react';
import { Activity, Calendar, ClipboardList, Video, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import telemedicineService from '../../services/telemedicineService';

export default function AdminCreateSessionPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    appointmentId: '',
    doctorId: '',
    patientId: '',
    scheduledTime: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.appointmentId || !form.doctorId || !form.patientId || !form.scheduledTime) {
      setError('Please fill all fields.');
      return;
    }

    const normalizeDateTime = (value) => {
      if (!value) return value;
      if (typeof value === 'string' && value.length === 16) {
        return `${value}:00`;
      }
      return value;
    };

    const payload = {
      appointmentId: Number(form.appointmentId),
      doctorId: Number(form.doctorId),
      patientId: Number(form.patientId),
      scheduledTime: normalizeDateTime(form.scheduledTime),
    };

    setSubmitting(true);
    try {
      await telemedicineService.createSession(payload);
      navigate('/admin/sessions');
    } catch (err) {
      console.error('Failed to create telemedicine session', err);
      const message = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(message ? `Failed to create session: ${message}` : 'Failed to create session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
            <Activity color="var(--gradient-1)" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Admin Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/admin')}><Activity size={20} /> Overview</div>
          <div className="nav-item" onClick={() => navigate('/admin/patients')}><ClipboardList size={20} /> Manage Patients</div>
          <div className="nav-item" onClick={() => navigate('/admin/sessions')}><Video size={20} /> Telemedicine Logs</div>
          <div className="nav-item active"><PlusCircle size={20} /> Create Session</div>
        </nav>
      </aside>

      <main className="main-content" style={{ overflowY: 'auto' }}>
        <header className="header">
          <div>
            <h1 className="text-h2">Create Telemedicine Session</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manually create a telemedicine session for an appointment.
            </p>
          </div>
        </header>

        <section className="glass-panel" style={{ padding: '16px', maxWidth: '720px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
            <label>
              <span style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Appointment ID</span>
              <input
                className="glass-input"
                name="appointmentId"
                value={form.appointmentId}
                onChange={handleChange}
                placeholder="Appointment ID"
              />
            </label>

            <label>
              <span style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Doctor ID</span>
              <input
                className="glass-input"
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                placeholder="Doctor ID"
              />
            </label>

            <label>
              <span style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Patient ID</span>
              <input
                className="glass-input"
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
                placeholder="Patient ID"
              />
            </label>

            <label>
              <span style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Scheduled Time</span>
              <input
                className="glass-input"
                name="scheduledTime"
                type="datetime-local"
                value={form.scheduledTime}
                onChange={handleChange}
              />
            </label>

            {error ? (
              <div style={{ color: '#ef4444' }}>{error}</div>
            ) : null}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Session'}
              </button>
              <button type="button" className="btn-outline" onClick={() => navigate('/admin/sessions')}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
