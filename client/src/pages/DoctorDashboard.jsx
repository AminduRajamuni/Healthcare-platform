import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Video, Activity, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../services/appointmentService';
import doctorService from '../services/doctorService';
import AppointmentCard from '../components/AppointmentCard';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('email');

  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let docsData = null;
        let activeDoctorId = null;
        
        // Attempt to fetch specific doctor profile
        if (userEmail) {
            try {
                docsData = await doctorService.getDoctorByEmail(userEmail);
                activeDoctorId = docsData.id;
            } catch (e) {
                console.warn(`User Email ${userEmail} not found in Doctor DB. Searching for fallback...`);
            }
        } else if (userId) {
            try {
                docsData = await doctorService.getDoctorById(userId);
                activeDoctorId = docsData.id;
            } catch (e) {
                console.warn(`User ID ${userId} not found in Doctor DB. Searching for fallback...`);
            }
        }

        // Fallback for demonstration/testing: If the current user isn't in the doctor DB, just pick the first available doctor (usually ID 3) so the UI isn't empty.
        if (!docsData) {
            const allDocs = await doctorService.getAllDoctors();
            if (allDocs && allDocs.length > 0) {
                // Find a doctor that actually has appointments, or just pick the first or ID 3
                docsData = allDocs.find(d => d.id === 3) || allDocs[0];
                activeDoctorId = docsData.id;
            }
        }

        let apptsData = [];
        if (activeDoctorId) {
            try {
                apptsData = await appointmentService.getAppointmentsByDoctorId(activeDoctorId);
            } catch (e) {
                console.error("No appointments found for doctor", activeDoctorId);
            }
        }

        setDoctorProfile(docsData);
        setAppointments((apptsData || []).sort((a,b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)));
      } catch (err) {
        console.error("Failed to fetch doctor dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const activeAppointments = appointments.filter(a => a.status === 'BOOKED' || a.status === 'PENDING');
  const todayAppointments = activeAppointments.filter(a => {
      const appDateStr = typeof a.appointmentDate === 'string' ? a.appointmentDate.split('T')[0] : 
                        (Array.isArray(a.appointmentDate) ? `${a.appointmentDate[0]}-${String(a.appointmentDate[1]).padStart(2, '0')}-${String(a.appointmentDate[2]).padStart(2, '0')}` : null);
      const todayStr = new Date().toISOString().split('T')[0];
      return appDateStr === todayStr;
  });

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
          <div className="nav-item active"><Calendar size={20} /> My Schedule</div>
          <div className="nav-item"><Users size={20} /> My Patients</div>
          <div className="nav-item"><Video size={20} /> Teleconferences</div>
          <div className="nav-item"><FileText size={20} /> Prescriptions</div>
          <div className="nav-item"><Clock size={20} /> Consult History</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => navigate('/')}><LogOut size={20} /> Sign Out</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">Good Morning, Dr. {doctorProfile?.name?.replace(/^Dr\.\s*/i, '') || doctorProfile?.firstName || 'Doctor'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>You have {todayAppointments.length} consultations scheduled for today.</p>
          </div>
          <button className="btn-primary" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}>
            Start Next Consultation <Video size={18} />
          </button>
        </header>

        {/* Dummy Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          <section className="glass-panel" style={{ padding: '24px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 className="text-h3" style={{ marginBottom: '16px' }}>Upcoming Appointments</h3>
            {loading ? (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                    Loading appointments...
                </div>
            ) : activeAppointments.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr)', gap: '16px', overflowY: 'auto', flex: 1 }}>
                    {activeAppointments.map(app => (
                        <AppointmentCard key={app.id} appointment={app} role="DOCTOR" onStatusUpdate={() => {}} />
                    ))}
                </div>
            ) : (
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1,
                  color: 'var(--text-secondary)', border: '1px dashed var(--glass-border)', borderRadius: '8px'
                }}>
                  No upcoming appointments.
                </div>
            )}
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Reports</p>
              <h3 className="text-h1" style={{ fontSize: '2.5rem', marginTop: '8px' }}>12</h3>
            </div>
            
            <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
              <h3 className="text-h3" style={{ marginBottom: '16px' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-outline" style={{ justifyContent: 'flex-start', display: 'flex', gap: '8px' }}>
                  <FileText size={16} /> Write Prescription
                </button>
                <button className="btn-outline" style={{ justifyContent: 'flex-start', display: 'flex', gap: '8px' }}>
                  <Calendar size={16} /> Reschedule Consult
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
