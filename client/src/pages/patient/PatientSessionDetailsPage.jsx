import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import telemedicineService from '../../services/telemedicineService';
import PatientSidebar from '../../components/PatientSidebar';

export default function PatientSessionDetailsPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await telemedicineService.getSessionById(id);
        setSession(data);
      } catch (err) {
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      <main className="main-content">
        <div className="header">
          <div>
            <h1 className="text-h2">Session Details</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Review your telemedicine consultation and doctor notes.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : session ? (
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 className="text-h3">Session #{session.id}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Doctor ID: {session.doctorId}</p>
            <p style={{ color: 'var(--text-secondary)' }}>Appointment ID: {session.appointmentId}</p>
            <p style={{ color: 'var(--text-secondary)' }}>Status: {session.status}</p>
            {session.scheduledTime && (
              <p style={{ color: 'var(--text-secondary)' }}>
                Scheduled: {new Date(session.scheduledTime).toLocaleString()}
              </p>
            )}
            {session.startTime && (
              <p style={{ color: 'var(--text-secondary)' }}>
                Started: {new Date(session.startTime).toLocaleString()}
              </p>
            )}
            {session.endTime && (
              <p style={{ color: 'var(--text-secondary)' }}>
                Ended: {new Date(session.endTime).toLocaleString()}
              </p>
            )}
            {session.notes && (
              <div style={{ marginTop: '8px' }}>
                <h3 className="text-h3">Doctor Notes</h3>
                <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', background: 'rgba(15,23,42,0.9)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {session.notes}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
