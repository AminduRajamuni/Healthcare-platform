import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import telemedicineService from '../../services/telemedicineService';
import PatientSidebar from '../../components/PatientSidebar';

export default function PatientSessionListPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const patientId = localStorage.getItem('userId');
        if (!patientId) {
          setError('No patient ID found. Please log in again.');
          setLoading(false);
          return;
        }
        const data = await telemedicineService.getSessionsForPatient(patientId);
        setSessions(data || []);
      } catch (err) {
        setError('Failed to load telemedicine sessions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      <main className="main-content">
        <div className="header">
          <div>
            <h1 className="text-h2">My Telemedicine Sessions</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              View and join your upcoming and past video consultations.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : (
          <section className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {sessions.map((s) => (
              <div key={s.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Session #{s.id}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.status}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Doctor ID: {s.doctorId}
                </div>
                {s.scheduledTime && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Scheduled: {new Date(s.scheduledTime).toLocaleString()}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/patient/session/${s.id}/join`)}
                  >
                    Join Session
                  </button>
                  <button
                    className="btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/patient/session/${s.id}`)}
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                No telemedicine sessions found.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
