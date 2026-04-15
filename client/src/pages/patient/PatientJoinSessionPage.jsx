import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Video } from 'lucide-react';
import telemedicineService from '../../services/telemedicineService';
import PatientSidebar from '../../components/PatientSidebar';

export default function PatientJoinSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const joined = await telemedicineService.joinSession(id);
        setSession(joined);
      } catch (err) {
        setError('Failed to join session');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar />
        <main className="main-content">
          <div className="header">
            <h1 className="text-h2">Joining Session...</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      <main className="main-content">
        <div className="header">
          <div>
            <h1 className="text-h2">Telemedicine Session</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Video consultation with your doctor.
            </p>
          </div>
        </div>
        {error && (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444', marginBottom: '16px' }}>{error}</div>
        )}
        <div className="glass-panel" style={{ padding: '32px', minHeight: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <Video size={64} style={{ color: 'var(--gradient-1)' }} />
          <h2 className="text-h3">Video call placeholder</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', textAlign: 'center' }}>
            Integrate a WebRTC or video SDK here to enable real-time video consultations.
          </p>
          {session && session.videoLink && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Video link: <a href={session.videoLink} target="_blank" rel="noreferrer" style={{ color: 'var(--gradient-1)' }}>{session.videoLink}</a>
            </p>
          )}
          <button className="btn-outline" style={{ marginTop: '16px' }} onClick={() => navigate('/patient/sessions')}>
            Leave Session
          </button>
        </div>
      </main>
    </div>
  );
}
