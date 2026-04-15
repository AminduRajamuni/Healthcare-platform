import React, { useEffect, useState } from 'react';
import { Activity, Calendar, Users, FileText, Video, Clock, LogOut, ArrowLeft, ExternalLink } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import telemedicineService from '../../services/telemedicineService';

export default function DoctorActiveConsultationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!location.state?.session);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!session) {
      const load = async () => {
        setLoading(true);
        try {
          const data = await telemedicineService.getSessionById(id);
          setSession(data);
        } catch (err) {
          console.error('Failed to load session', err);
          setError('Failed to load session.');
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, session]);

  useEffect(() => {
    let timer;
    if (session && session.startTime) {
      const start = new Date(session.startTime).getTime();
      timer = setInterval(() => {
        setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [session]);

  const handleEnd = async () => {
    if (!window.confirm('End this consultation and mark the session as completed?')) return;
    try {
      const ended = await telemedicineService.endSession(id);
      setSession(ended);
      alert('Session ended.');
      navigate(`/doctor/teleconferences/session/${id}`);
    } catch (err) {
      console.error('Failed to end session', err);
      alert('Failed to end session.');
    }
  };

  const formattedElapsed = () => {
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
          <div className="nav-item"><Users size={20} /> My Patients</div>
          <div className="nav-item active" onClick={() => navigate('/doctor/teleconferences')}><Video size={20} /> Teleconferences</div>
          <div className="nav-item"><FileText size={20} /> Prescriptions</div>
          <div className="nav-item"><Clock size={20} /> Consult History</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => navigate('/')}><LogOut size={20} /> Sign Out</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <button
              type="button"
              className="btn-outline"
              style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => navigate(`/doctor/teleconferences/session/${id}`)}
            >
              <ArrowLeft size={16} /> Back to session details
            </button>
            <h1 className="text-h2">Active Consultation</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Use the meeting link to conduct the video consultation. Keep patient details and notes in view.
            </p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading session...</div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : session ? (
          <section className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div>
              <h3 className="text-h3" style={{ marginBottom: '8px' }}>Video Room</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                Open the meeting link in a new tab/window to start the video call.
              </p>
              <div
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  padding: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>Meeting link:</strong>{' '}
                  {session.videoLink ? (
                    <a
                      href={session.videoLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#38bdf8', textDecoration: 'underline' }}
                    >
                      {session.videoLink} <ExternalLink size={14} style={{ marginLeft: '4px' }} />
                    </a>
                  ) : (
                    'No link available yet.'
                  )}
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>Patient ID:</strong> {session.patientId} | <strong>Appointment ID:</strong> {session.appointmentId}
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>Status:</strong> {session.status}
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  <strong>Timer:</strong> {formattedElapsed()}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
                  onClick={handleEnd}
                >
                  End Session
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-h3" style={{ marginBottom: '8px' }}>Notes Snapshot</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                You can edit and save full notes from the session details page.
              </p>
              <div
                style={{
                  background: 'rgba(15,23,42,0.9)',
                  padding: '16px',
                  borderRadius: '8px',
                  minHeight: '140px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                }}
              >
                {session.notes || 'No notes recorded yet.'}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
