import { Activity, Heart, Calendar, Stethoscope, CreditCard, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
            <Activity color="#ec4899" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Patient Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active"><Heart size={20} /> My Health</div>
          <div className="nav-item"><Calendar size={20} /> Book Appointment</div>
          <div className="nav-item"><Stethoscope size={20} /> Symptom Checker</div>
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
            <h1 className="text-h2">Hello, Sarah</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Track your health and upcoming appointments.</p>
          </div>
          <button className="btn-primary" style={{ background: 'linear-gradient(to right, #ec4899, #f43f5e)' }}>
            <Calendar size={18} /> Book New Appointment
          </button>
        </header>

        {/* Dummy Dashboard Cards */}
        <section className="card-grid">
          <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
            <h3 className="text-h3" style={{ marginBottom: '16px' }}>Next Appointment</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ color: 'var(--gradient-2)', fontWeight: 600 }}>OCT</p>
                <h2 className="text-h2">15</h2>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Dr. Emily Chen</h4>
                <p style={{ color: 'var(--text-secondary)' }}>General Checkup • 10:30 AM</p>
                <button className="btn-outline" style={{ marginTop: '12px' }}>Join Teleconference</button>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 className="text-h3" style={{ marginBottom: '16px' }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Blood Pressure</span>
                <span style={{ fontWeight: 600 }}>120/80</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Heart Rate</span>
                <span style={{ fontWeight: 600 }}>72 bpm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Weight</span>
                <span style={{ fontWeight: 600 }}>65 kg</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
          <section className="glass-panel" style={{ padding: '24px' }}>
             <h3 className="text-h3" style={{ marginBottom: '16px' }}>Symptom Checker</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Not feeling well? Describe your symptoms to get recommendations.</p>
             <button className="btn-outline" style={{ width: '100%' }}>Start Symptom Check</button>
          </section>
          
          <section className="glass-panel" style={{ padding: '24px' }}>
             <h3 className="text-h3" style={{ marginBottom: '16px' }}>Recent Prescriptions</h3>
             <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '24px' }}>
               No active prescriptions.
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}
