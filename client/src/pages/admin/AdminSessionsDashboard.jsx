import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, ClipboardList, Video, XCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import telemedicineService from '../../services/telemedicineService';

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
};

export default function AdminSessionsDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await telemedicineService.getAllSessions();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load telemedicine sessions', err);
        setError('Failed to load telemedicine sessions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const total = sessions.length;
    const scheduled = sessions.filter((s) => s.status === 'SCHEDULED').length;
    const completed = sessions.filter((s) => s.status === 'COMPLETED').length;
    const cancelled = sessions.filter((s) => s.status === 'CANCELLED').length;
    return { total, scheduled, completed, cancelled };
  }, [sessions]);

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.scheduledTime || b.startTime || 0) - new Date(a.scheduledTime || a.startTime || 0))
      .slice(0, 8);
  }, [sessions]);

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
          <div className="nav-item active"><Video size={20} /> Telemedicine Logs</div>
        </nav>
      </aside>

      <main className="main-content" style={{ overflowY: 'auto' }}>
        <header className="header">
          <div>
            <h1 className="text-h2">Telemedicine Logs</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Overview of all telemedicine activity across the platform.
            </p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/admin/sessions/create')}>
            Create Session
          </button>
        </header>

        <section className="card-grid" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Total Sessions', value: stats.total, icon: Video },
            { label: 'Scheduled Sessions', value: stats.scheduled, icon: Calendar },
            { label: 'Completed Sessions', value: stats.completed, icon: CheckCircle },
            { label: 'Cancelled Sessions', value: stats.cancelled, icon: XCircle },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <stat.icon size={18} color="var(--gradient-1)" />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</p>
              </div>
              <h3 className="text-h2" style={{ margin: 0 }}>{stat.value}</h3>
            </div>
          ))}
        </section>

        <section className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="text-h3" style={{ margin: 0 }}>Recent Sessions</h3>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-secondary)' }}>Loading sessions...</div>
          ) : error ? (
            <div style={{ color: '#ef4444' }}>{error}</div>
          ) : recentSessions.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)' }}>No sessions found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '8px 4px' }}>Session ID</th>
                    <th style={{ padding: '8px 4px' }}>Doctor</th>
                    <th style={{ padding: '8px 4px' }}>Patient</th>
                    <th style={{ padding: '8px 4px' }}>Scheduled</th>
                    <th style={{ padding: '8px 4px' }}>Status</th>
                    <th style={{ padding: '8px 4px' }}>Notes</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s) => (
                    <tr key={s.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '8px 4px' }}>#{s.id}</td>
                      <td style={{ padding: '8px 4px' }}>Doctor {s.doctorId}</td>
                      <td style={{ padding: '8px 4px' }}>Patient {s.patientId}</td>
                      <td style={{ padding: '8px 4px' }}>{formatDateTime(s.scheduledTime)}</td>
                      <td style={{ padding: '8px 4px' }}>{s.status}</td>
                      <td style={{ padding: '8px 4px' }}>{s.notes ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          onClick={() => navigate(`/admin/sessions/${s.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
