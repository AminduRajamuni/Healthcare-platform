import React, { useEffect, useState } from 'react';
import { Activity, Calendar, Users, FileText, Video, Clock, LogOut, ArrowLeft, PenSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import telemedicineService from '../../services/telemedicineService';

export default function DoctorSessionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await telemedicineService.getSessionById(id);
        setSession(data);
        setNotesDraft(data?.notes || '');
      } catch (err) {
        console.error('Failed to load session', err);
        setError('Failed to load session details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleJoin = async () => {
    try {
      const joined = await telemedicineService.joinSession(id);
      navigate(`/doctor/teleconferences/session/${id}/active`, { state: { session: joined } });
    } catch (err) {
      console.error('Failed to join session', err);
      alert('Failed to join session.');
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('End this session and mark it as completed?')) return;
    try {
      const ended = await telemedicineService.endSession(id);
      setSession(ended);
      alert('Session ended and marked as completed.');
    } catch (err) {
      console.error('Failed to end session', err);
      alert('Failed to end session.');
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const updated = await telemedicineService.addSessionNotes(id, notesDraft || '');
      setSession(updated);
      alert('Session notes saved.');
    } catch (err) {
      console.error('Failed to save notes', err);
      alert('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
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
          <div className="nav-item" onClick={() => navigate('/doctor/patients')}><Users size={20} /> My Patients</div>
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
              onClick={() => navigate('/doctor/teleconferences')}
            >
              <ArrowLeft size={16} /> Back to sessions
            </button>
            <h1 className="text-h2">Session Details</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Review session information, join, end, and record consultation notes.
            </p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading session...</div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : session ? (
          <>
            <section className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="text-h3" style={{ margin: 0 }}>Session #{session.id}</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{session.status}</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginTop: '12px',
                  fontSize: '0.9rem',
                }}
              >
                <div><strong>Patient ID:</strong> {session.patientId}</div>
                <div><strong>Appointment ID:</strong> {session.appointmentId}</div>
                <div><strong>Scheduled:</strong> {session.scheduledTime ? new Date(session.scheduledTime).toLocaleString() : '-'}</div>
                <div><strong>Started:</strong> {session.startTime ? new Date(session.startTime).toLocaleString() : '-'}</div>
                <div><strong>Ended:</strong> {session.endTime ? new Date(session.endTime).toLocaleString() : '-'}</div>
                <div><strong>Video link:</strong> {session.videoLink || '-'}</div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                {(session.status === 'SCHEDULED' || session.status === 'ONGOING') && (
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={handleJoin}
                  >
                    <Video size={16} /> Join Session
                  </button>
                )}
                {session.status === 'ONGOING' && (
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444' }}
                    onClick={handleEnd}
                  >
                    End Session
                  </button>
                )}
              </div>
            </section>

            <section className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 className="text-h3" style={{ margin: 0 }}>Session Notes</h3>
                <PenSquare size={18} style={{ color: 'var(--gradient-1)' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                Record diagnosis, recommendations, and prescription notes for this consultation.
              </p>
              <textarea
                className="glass-input"
                style={{ width: '100%', minHeight: '150px', resize: 'vertical' }}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Enter session notes here..."
              />
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={savingNotes}
                  onClick={handleSaveNotes}
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
