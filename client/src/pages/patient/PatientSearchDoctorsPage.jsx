import React, { useState } from 'react';
import { Search, Stethoscope, MapPin, Phone } from 'lucide-react';
import patientService from '../../services/patientService';
import PatientSidebar from '../../components/PatientSidebar';

export default function PatientSearchDoctorsPage() {
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.searchDoctors(specialty.trim() || undefined);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to search doctors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">Search Doctors</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Find doctors by specialty and view their details.
            </p>
          </div>
        </header>

        <section className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <div style={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} style={{ color: 'var(--text-secondary)' }} />
              <input
                className="glass-input"
                placeholder="Filter by specialty (e.g. Cardiology, Neurology). Leave blank for all."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </section>

        {error && (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <section className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {results.map((doc) => (
            <article
              key={doc.id}
              className="glass-panel"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '999px',
                    background: 'var(--accent-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Stethoscope size={20} color="#3b82f6" />
                </div>
                <div>
                  <h2 className="text-h3" style={{ margin: 0 }}>
                    {doc.name || `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || 'Doctor'}
                  </h2>
                  {doc.specialty && (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{doc.specialty}</p>
                  )}
                </div>
              </div>

              {doc.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={16} /> {doc.location}
                </div>
              )}

              {doc.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Phone size={16} /> {doc.phone}
                </div>
              )}

              {doc.email && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {doc.email}
                </div>
              )}

              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-outline"
                  // In future: navigate to booking flow prefilled with this doctor
                >
                  Book Appointment
                </button>
              </div>
            </article>
          ))}

          {!loading && results.length === 0 && !error && (
            <div
              className="glass-panel"
              style={{
                gridColumn: '1 / -1',
                padding: '32px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              Start by searching for doctors using the specialty filter above.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
