import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../services/appointmentService';
import AppointmentCard from '../components/AppointmentCard';
import BookAppointmentModal from '../components/BookAppointmentModal';
import ConfirmDialog from '../components/ConfirmDialog';
import PatientSidebar from '../components/PatientSidebar';

export default function PatientDashboard() {
  const navigate = useNavigate();
  // Fetch from localStorage instead of mock ID
  const patientId = localStorage.getItem('userId') || 1;
  const firstName = localStorage.getItem('firstName') || 'User';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  
  // Modal States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  // Confirmation Dialog States
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, appointment: null });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAppointmentsByPatientId(patientId);
      setAppointments(data || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appointment) => {
    setConfirmDialog({ isOpen: true, appointment });
  };

  const executeCancellation = async () => {
    if (!confirmDialog.appointment) return;
    try {
      await appointmentService.cancelAppointment(confirmDialog.appointment.id);
      fetchAppointments();
    } catch (error) {
      console.error("Failed to cancel appointment", error);
    } finally {
      setConfirmDialog({ isOpen: false, appointment: null });
    }
  };

  const currentDate = new Date();

  // Categorize appointments
  const activeAppointments = appointments.filter(app => 
    (app.status === 'BOOKED' || app.status === 'PENDING' || app.status === 'ACCEPTED') && 
    new Date(app.appointmentDate) >= currentDate
  ).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  const pastAndCancelledAppointments = appointments.filter(app => 
    app.status === 'CANCELLED' || app.status === 'COMPLETED' || app.status === 'REJECTED' ||
    new Date(app.appointmentDate) < currentDate
  ).sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  const displayAppointments = activeTab === 'upcoming' ? activeAppointments : pastAndCancelledAppointments;
  const nextAppointment = activeAppointments.length > 0 ? activeAppointments[0] : null;

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
            <Activity color="#ec4899" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Patient Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item"><Heart size={20} /> My Health</div>
          <div className="nav-item active"><Calendar size={20} /> Appointments</div>
          <div className="nav-item" onClick={() => navigate('/symptom-checker')}><Stethoscope size={20} /> Symptom Checker</div>
          <div className="nav-item"><Clock size={20} /> Medical History</div>
          <div className="nav-item"><CreditCard size={20} /> Invoices & Payments</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => navigate('/')}><LogOut size={20} /> Sign Out</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">Hello, {firstName}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track your health and upcoming appointments.</p>
          </div>
          <button 
             className="btn-primary" 
             style={{ background: 'linear-gradient(to right, #ec4899, #f43f5e)' }}
             onClick={() => setIsBookModalOpen(true)}
          >
            <Calendar size={18} /> Book New Appointment
          </button>
        </header>

        {/* Featured Next Appointment Card (if any) */}
        {nextAppointment && activeTab === 'upcoming' && (
           <section className="glass-panel" style={{ padding: '24px', marginBottom: '32px', borderLeft: '4px solid var(--gradient-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <h3 style={{ color: 'var(--gradient-1)', fontWeight: 600, marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>Next Upcoming Appointment</h3>
                    <h2 className="text-h2">Doctor ID: {nextAppointment.doctorId}</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                       {new Date(nextAppointment.appointmentDate).toLocaleString()}
                    </p>
                 </div>
                 {/* Re-use AppointmentCard logic internally or keep it simple here */}
                 <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {Math.ceil((new Date(nextAppointment.appointmentDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Days Left</div>
                 </div>
              </div>
           </section>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--glass-border)', marginBottom: '24px' }}>
             <button 
                 onClick={() => setActiveTab('upcoming')}
                 style={{ 
                     background: 'transparent', border: 'none', padding: '12px 0', fontSize: '1.1rem', cursor: 'pointer',
                     color: activeTab === 'upcoming' ? 'var(--text-primary)' : 'var(--text-secondary)',
                     borderBottom: activeTab === 'upcoming' ? '2px solid var(--gradient-1)' : '2px solid transparent',
                     fontWeight: activeTab === 'upcoming' ? 600 : 400
                 }}>
                 Active Appointments ({activeAppointments.length})
             </button>
             <button 
                 onClick={() => setActiveTab('past')}
                 style={{ 
                     background: 'transparent', border: 'none', padding: '12px 0', fontSize: '1.1rem', cursor: 'pointer',
                     color: activeTab === 'past' ? 'var(--text-primary)' : 'var(--text-secondary)',
                     borderBottom: activeTab === 'past' ? '2px solid var(--gradient-1)' : '2px solid transparent',
                     fontWeight: activeTab === 'past' ? 600 : 400
                 }}>
                 History / Cancelled ({pastAndCancelledAppointments.length})
             </button>
        </div>

        {/* Appointment Grid */}
        {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading appointments...</div>
        ) : (
            <section className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {displayAppointments.map(app => (
                <AppointmentCard 
                   key={app.id} 
                   appointment={app} 
                   role="PATIENT"
                   onCancel={handleCancelClick}
                />
              ))}

              {displayAppointments.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                   <Calendar size={48} style={{ color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '16px' }} />
                   <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No appointments found</h3>
                   <p style={{ color: 'var(--text-secondary)' }}>
                      {activeTab === 'upcoming' ? "You have no scheduled appointments at the moment." : "You have no past or cancelled appointments."}
                   </p>
                </div>
              )}
            </section>
        )}
      </main>

      {/* Modals */}
      <BookAppointmentModal 
          isOpen={isBookModalOpen} 
          onClose={() => setIsBookModalOpen(false)} 
          patientId={patientId}
          onBooked={fetchAppointments}
      />

      <ConfirmDialog 
          isOpen={confirmDialog.isOpen}
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment? This action cannot be undone."
          confirmText="Yes, Cancel it"
          cancelText="Keep Appointment"
          onConfirm={executeCancellation}
          onCancel={() => setConfirmDialog({ isOpen: false, appointment: null })}
      />
    </div>
  );
}
