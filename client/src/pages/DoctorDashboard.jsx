import { Calendar, Users, FileText, Video, Activity, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const navigate = useNavigate();

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
            <h1 className="text-h2">Good Morning, Dr. Smith</h1>
            <p style={{ color: 'var(--text-secondary)' }}>You have 8 consultations scheduled for today.</p>
          </div>
          <button className="btn-primary" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}>
            Start Next Consultation <Video size={18} />
          </button>
        </header>

        {/* Dummy Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          <section className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
            <h3 className="text-h3" style={{ marginBottom: '16px' }}>Upcoming Appointments</h3>
            <div style={{
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '80%',
              color: 'var(--text-secondary)',
              border: '1px dashed var(--glass-border)',
              borderRadius: '8px'
            }}>
              [ Appointments List Component Placeholder ]
            </div>
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
