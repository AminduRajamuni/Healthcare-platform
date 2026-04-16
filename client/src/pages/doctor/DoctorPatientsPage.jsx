import React, { useEffect, useState } from 'react';
import { Activity, Calendar, Users, FileText, Video, Clock, LogOut, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import patientService from '../../services/patientService';

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
};

export default function DoctorPatientsPage() {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem('userId');

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!doctorId) {
        setError('Doctor ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await patientService.getPatientsByDoctor(doctorId);
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load doctor patients', err);
        setError('Failed to load patients.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
            <Activity color="#3b82f6" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Doctor Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate('/doctor')}><Calendar size={20} /> My Schedule</div>
          <div className="nav-item active" onClick={() => navigate('/doctor/patients')}><Users size={20} /> My Patients</div>
          <div className="nav-item" onClick={() => navigate('/doctor/teleconferences')}><Video size={20} /> Teleconferences</div>
          <div className="nav-item"><FileText size={20} /> Prescriptions</div>
          <div className="nav-item" onClick={() => navigate('/doctor/teleconferences')}><Clock size={20} /> Consult History</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => navigate('/')}><LogOut size={20} /> Sign Out</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">My Patients</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Patients who have appointments with you.
            </p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading patients...</div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : (
          <section className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 4px' }}>Patient Name</th>
                  <th style={{ padding: '8px 4px' }}>Email</th>
                  <th style={{ padding: '8px 4px' }}>Phone</th>
                  <th style={{ padding: '8px 4px' }}>Last Appointment</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.patientId} style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '8px 4px' }}>{`${p.firstName || ''} ${p.lastName || ''}`.trim() || `Patient ${p.patientId}`}</td>
                    <td style={{ padding: '8px 4px' }}>{p.email || '-'}</td>
                    <td style={{ padding: '8px 4px' }}>{p.phone || '-'}</td>
                    <td style={{ padding: '8px 4px' }}>{formatDateTime(p.lastAppointmentDate)}</td>
                    <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => navigate(`/doctor/patients/${p.patientId}`)}
                      >
                        <Eye size={14} style={{ marginRight: '4px' }} /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
