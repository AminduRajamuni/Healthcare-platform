import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, Users, FileText, Video, Clock, LogOut, Filter, Plus, Eye, PhoneCall } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import telemedicineService from '../../services/telemedicineService';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';

export default function DoctorTeleconferencesPage() {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem('userId');

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [patientFilter, setPatientFilter] = useState('');
  const [activeTab, setActiveTab] = useState('MY_SESSIONS');

  const [appointments, setAppointments] = useState([]);
  const [creating, setCreating] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [patientMap, setPatientMap] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!doctorId) {
        setError('Doctor ID not found in session.');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [sessionData, apptData] = await Promise.all([
          telemedicineService.getSessionsForDoctor(doctorId),
          appointmentService.getAppointmentsByDoctorId(doctorId),
        ]);
        setSessions(Array.isArray(sessionData) ? sessionData : []);
        setAppointments(Array.isArray(apptData) ? apptData : []);
      } catch (err) {
        console.error('Failed to load teleconferences data', err);
        setError('Failed to load teleconferences data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  useEffect(() => {
    const loadPatients = async () => {
      const ids = new Set();
      sessions.forEach((s) => s.patientId && ids.add(String(s.patientId)));
      appointments.forEach((a) => a.patientId && ids.add(String(a.patientId)));

      const missing = Array.from(ids).filter((id) => !patientMap[id]);
      if (missing.length === 0) return;

      const next = { ...patientMap };
      await Promise.all(
        missing.slice(0, 50).map(async (id) => {
          try {
            const p = await patientService.getPatientById(id);
            next[id] = p;
          } catch {
            next[id] = null;
          }
        })
      );
      setPatientMap(next);
    };

    loadPatients();
  }, [sessions, appointments]);

  const patientLabel = (patientId) => {
    const p = patientMap[String(patientId)];
    if (!p) return `Patient ${patientId}`;
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
    return name || p.name || `Patient ${patientId}`;
  };

  const isConfirmedAppointment = (appt) => {
    const status = String(appt?.status || '').toUpperCase();
    return status === 'BOOKED' || status === 'ACCEPTED' || status === 'CONFIRMED';
  };

  const confirmedAppointments = useMemo(() => {
    const existingAppointmentIds = new Set(sessions.map((s) => String(s.appointmentId)));
    return appointments.filter(
      (a) => isConfirmedAppointment(a) && !existingAppointmentIds.has(String(a.id))
    );
  }, [appointments, sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (activeTab === 'COMPLETED' && s.status !== 'COMPLETED') return false;
      if (activeTab === 'CREATE') return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (patientFilter) {
        const needle = patientFilter.trim().toLowerCase();
        const byId = String(s.patientId).includes(needle);
        const byName = patientLabel(s.patientId).toLowerCase().includes(needle);
        if (!byId && !byName) return false;
      }
      return true;
    });
  }, [sessions, statusFilter, patientFilter, activeTab, patientMap]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedAppointmentId) return;

    const appointment = confirmedAppointments.find((a) => String(a.id) === selectedAppointmentId);
    if (!appointment) return;

    const normalizeDateTime = (value) => {
      if (!value) return value;
      if (typeof value === 'string' && value.length === 16) {
        return `${value}:00`;
      }
      return value;
    };

    const payload = {
      appointmentId: appointment.id,
      doctorId: Number(doctorId),
      patientId: appointment.patientId,
      scheduledTime: normalizeDateTime(scheduledTime || appointment.appointmentDate),
    };

    try {
      setCreating(true);
      const session = await telemedicineService.createSession(payload);
      setSessions((prev) => [session, ...prev]);
      setSelectedAppointmentId('');
      setScheduledTime('');
      setSelectedPatient(null);
      alert('Telemedicine session created successfully.');
    } catch (err) {
      console.error('Failed to create session', err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Session already exists for this appointment';

      console.log('Create Session Error:', err);
      alert(message);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!selectedAppointmentId) {
      setSelectedPatient(null);
      return;
    }

    const appt = confirmedAppointments.find((a) => String(a.id) === selectedAppointmentId);
    if (!appt?.patientId) {
      setSelectedPatient(null);
      return;
    }

    const cached = patientMap[String(appt.patientId)];
    if (cached) {
      setSelectedPatient(cached);
      return;
    }

    patientService.getPatientById(appt.patientId)
      .then((p) => setSelectedPatient(p))
      .catch(() => setSelectedPatient(null));
  }, [selectedAppointmentId, confirmedAppointments, patientMap]);

  const handleJoin = async (id) => {
    try {
      const session = await telemedicineService.joinSession(id);
      navigate(`/doctor/teleconferences/session/${id}/active`, { state: { session } });
    } catch (err) {
      console.error('Failed to join session', err);
      alert('Failed to join session.');
    }
  };

  const handleEnd = async (id) => {
    if (!window.confirm('End this session and mark it as completed?')) return;
    try {
      const updated = await telemedicineService.endSession(id);
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error('Failed to end session', err);
      alert('Failed to end session.');
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
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
          <div className="nav-item active"><Video size={20} /> Teleconferences</div>
          <div className="nav-item"><FileText size={20} /> Prescriptions</div>
          <div className="nav-item" onClick={() => setActiveTab('COMPLETED')}><Clock size={20} /> Consult History</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => navigate('/')}><LogOut size={20} /> Sign Out</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">Teleconferences</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your virtual consultations, join sessions, and review completed visits.
            </p>
          </div>
        </header>

        {/* Tabs */}
        <section style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('MY_SESSIONS')}
              className="btn-tab"
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'MY_SESSIONS' ? 'var(--gradient-1)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'MY_SESSIONS' ? '2px solid var(--gradient-1)' : '2px solid transparent',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              My Sessions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('COMPLETED')}
              className="btn-tab"
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'COMPLETED' ? 'var(--gradient-1)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'COMPLETED' ? '2px solid var(--gradient-1)' : '2px solid transparent',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Completed Sessions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CREATE')}
              className="btn-tab"
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'CREATE' ? 'var(--gradient-1)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'CREATE' ? '2px solid var(--gradient-1)' : '2px solid transparent',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Create Session
            </button>
          </div>
        </section>

        {/* Create session */}
        {activeTab === 'CREATE' && (
          <section className="glass-panel" style={{ padding: '16px', marginBottom: '24px' }}>
            <h3 className="text-h3" style={{ marginBottom: '8px' }}>Create Telemedicine Session</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
              Link a confirmed appointment to a telemedicine session and optionally choose a scheduled time.
            </p>
            <form
              onSubmit={handleCreateSession}
              style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}
            >
              <select
                className="glass-input"
                style={{ minWidth: '220px' }}
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
              >
                <option value="">Select appointment</option>
                {confirmedAppointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} - {patientLabel(a.patientId)} -{' '}
                    {a.appointmentDate ? new Date(a.appointmentDate).toLocaleString() : ''}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                className="glass-input"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={creating || !selectedAppointmentId}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> {creating ? 'Creating...' : 'Create Session'}
              </button>
            </form>

            {selectedAppointmentId && (
              <div style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div><strong>Patient:</strong> {selectedPatient ? patientLabel(selectedPatient.id) : patientLabel(confirmedAppointments.find((a) => String(a.id) === selectedAppointmentId)?.patientId)}</div>
                <div><strong>Email:</strong> {selectedPatient?.email || '-'}</div>
                <div><strong>Phone:</strong> {selectedPatient?.phone || '-'}</div>
              </div>
            )}
          </section>
        )}

        {/* Filters */}
        {activeTab !== 'CREATE' && (
          <section
            className="glass-panel"
            style={{
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Filter size={18} style={{ color: 'var(--gradient-1)' }} />
            <select
              className="glass-input"
              style={{ maxWidth: '180px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <input
              className="glass-input"
              placeholder="Filter by patient name or ID"
              style={{ maxWidth: '220px' }}
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
            />
          </section>
        )}

        {/* Sessions list */}
        {activeTab !== 'CREATE' && (loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading sessions...</div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : (
          <section className="glass-panel" style={{ padding: '16px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 4px' }}>Session</th>
                  <th style={{ padding: '8px 4px' }}>Patient</th>
                  <th style={{ padding: '8px 4px' }}>Appointment</th>
                  <th style={{ padding: '8px 4px' }}>Scheduled</th>
                  <th style={{ padding: '8px 4px' }}>Status</th>
                  <th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '8px 4px' }}>#{s.id}</td>
                    <td style={{ padding: '8px 4px' }}>{patientLabel(s.patientId)}</td>
                    <td style={{ padding: '8px 4px' }}>{s.appointmentId}</td>
                    <td style={{ padding: '8px 4px' }}>
                      {s.scheduledTime ? new Date(s.scheduledTime).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '8px 4px' }}>{s.status}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        style={{ padding: '6px 10px', fontSize: '0.8rem', marginRight: '8px' }}
                        onClick={() => navigate(`/doctor/teleconferences/session/${s.id}`)}
                      >
                        <Eye size={14} style={{ marginRight: '4px' }} /> Details
                      </button>
                      {(s.status === 'SCHEDULED' || s.status === 'ONGOING') && (
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleJoin(s.id)}
                        >
                          <PhoneCall size={14} style={{ marginRight: '4px' }} /> Join
                        </button>
                      )}
                      {s.status === 'ONGOING' && (
                        <button
                          type="button"
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.8rem', marginLeft: '8px' }}
                          onClick={() => handleEnd(s.id)}
                        >
                          End
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No sessions found for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        ))}
      </main>
    </div>
  );
}
