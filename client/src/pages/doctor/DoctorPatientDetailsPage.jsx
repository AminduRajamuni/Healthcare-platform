import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, Users, FileText, Video, Clock, LogOut } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import patientService from '../../services/patientService';

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
};

export default function DoctorPatientDetailsPage() {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const doctorId = localStorage.getItem('userId');

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientData, historyData, prescriptionsData, reportsData, doctorAppointments] = await Promise.all([
          patientService.getPatientById(patientId),
          patientService.getMedicalHistory(patientId),
          patientService.getPrescriptions(patientId),
          patientService.getMedicalReports(patientId),
          doctorId ? appointmentService.getAppointmentsByDoctorId(doctorId) : Promise.resolve([]),
        ]);

        setPatient(patientData || null);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
        setReports(Array.isArray(reportsData) ? reportsData : []);

        const filteredAppointments = (doctorAppointments || []).filter(
          (appt) => String(appt.patientId) === String(patientId)
        );
        setAppointments(filteredAppointments);
      } catch (err) {
        console.error('Failed to load patient details', err);
        setError('Failed to load patient details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId, doctorId]);

  const patientName = useMemo(() => {
    if (!patient) return `Patient ${patientId}`;
    return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || `Patient ${patientId}`;
  }, [patient, patientId]);

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
          <div className="nav-item active" onClick={() => navigate('/doctor/patients')}><Users size={20} /> My Patients</div>
          <div className="nav-item" onClick={() => navigate('/doctor/teleconferences')}><Video size={20} /> Teleconferences</div>
          <div className="nav-item"><FileText size={20} /> Prescriptions</div>
          <div className="nav-item" onClick={() => navigate('/doctor/teleconferences')}><Clock size={20} /> Consult History</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => navigate('/') }><LogOut size={20} /> Sign Out</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">{patientName}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Patient details, records, and appointment history.
            </p>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading patient...</div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
        ) : (
          <>
            <section className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              <h3 className="text-h3" style={{ marginTop: 0 }}>Patient Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div><strong>Name:</strong> {patientName}</div>
                <div><strong>Email:</strong> {patient?.email || '-'}</div>
                <div><strong>Phone:</strong> {patient?.phone || '-'}</div>
                <div><strong>Gender:</strong> {patient?.gender || '-'}</div>
                <div><strong>DOB:</strong> {patient?.dob || '-'}</div>
              </div>
            </section>

            <section className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              <h3 className="text-h3" style={{ marginTop: 0 }}>Appointment History</h3>
              {appointments.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No appointments found.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '8px 4px' }}>Appointment ID</th>
                        <th style={{ padding: '8px 4px' }}>Status</th>
                        <th style={{ padding: '8px 4px' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                          <td style={{ padding: '8px 4px' }}>#{appt.id}</td>
                          <td style={{ padding: '8px 4px' }}>{appt.status}</td>
                          <td style={{ padding: '8px 4px' }}>{formatDateTime(appt.appointmentDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              <h3 className="text-h3" style={{ marginTop: 0 }}>Medical History</h3>
              {history.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No medical history records.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {history.map((item) => (
                    <li key={item.id} style={{ marginBottom: '6px' }}>
                      {item.condition || 'Condition'}{item.diagnosisDate ? ` - ${item.diagnosisDate}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
              <h3 className="text-h3" style={{ marginTop: 0 }}>Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No prescriptions found.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {prescriptions.map((item) => (
                    <li key={item.id} style={{ marginBottom: '6px' }}>
                      {item.medicationName || item.medication || 'Medication'}{item.dosage ? ` - ${item.dosage}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-panel" style={{ padding: '16px' }}>
              <h3 className="text-h3" style={{ marginTop: 0 }}>Medical Reports</h3>
              {reports.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No reports found.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {reports.map((item) => (
                    <li key={item.id} style={{ marginBottom: '6px' }}>
                      {item.description || 'Report'}{item.uploadDate ? ` - ${item.uploadDate}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
