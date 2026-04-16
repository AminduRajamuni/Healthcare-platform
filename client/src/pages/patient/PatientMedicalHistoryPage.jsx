import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import patientService from '../../services/patientService';
import PatientSidebar from '../../components/PatientSidebar';

export default function PatientMedicalHistoryPage() {
  const [items, setItems] = useState([]);
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
        const data = await patientService.getMedicalHistory(patientId);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load medical history.');
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
            <h1 className="text-h2">Medical History</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Review diagnoses and notes from your doctors over time.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" />
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : items.length === 0 ? (
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No medical history records found.
          </div>
        ) : (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((item) => (
                <div key={item.id} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px' }}>
                  <div style={{ width: '4px', borderRadius: '999px', background: 'var(--gradient-1)', marginRight: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <h2 className="text-h3" style={{ margin: 0 }}>{item.condition}</h2>
                      {item.date && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p style={{ color: 'var(--text-secondary)', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </section>
        )}
      </main>
    </div>
  );
}
