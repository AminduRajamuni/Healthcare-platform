import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import patientService from '../../services/patientService';
import PatientSidebar from '../../components/PatientSidebar';

export default function PatientPrescriptionsPage() {
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
        const data = await patientService.getPrescriptions(patientId);
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load prescriptions.');
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
            <h1 className="text-h2">Prescriptions</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              View the medicines prescribed to you and how to take them.
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
            No prescriptions found.
          </div>
        ) : (
          <section className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {items
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((item) => (
                <div key={item.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="text-h3" style={{ margin: 0 }}>{item.medicine}</h2>
                    {item.date && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Dosage: {item.dosage}
                  </div>
                  {item.doctorName && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Prescribed by Dr. {item.doctorName}
                    </div>
                  )}
                  {item.instructions && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {item.instructions}
                    </div>
                  )}
                </div>
              ))}
          </section>
        )}
      </main>
    </div>
  );
}
