import { Users, Activity, Calendar, CreditCard, Video, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
            <Activity color="var(--gradient-1)" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Admin Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active"><Activity size={20} /> Overview</div>
          <div className="nav-item"><Users size={20} /> Users & Roles</div>
          <div className="nav-item"><Calendar size={20} /> All Appointments</div>
          <div className="nav-item"><CreditCard size={20} /> Payments</div>
          <div className="nav-item"><Video size={20} /> Telemedicine Logs</div>
          <div className="nav-item"><Settings size={20} /> System Settings</div>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="nav-item" onClick={() => navigate('/')}><LogOut size={20} /> Sign Out</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="text-h2">Welcome back, Admin</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening across the platform today.</p>
          </div>
          <button className="btn-primary">Generate Report</button>
        </header>

        {/* Dummy Metrics */}
        <section className="card-grid">
          {[
            { title: 'Total Patients', value: '2,405', change: '+12%' },
            { title: 'Active Doctors', value: '142', change: '+3%' },
            { title: 'Today\'s Appointments', value: '384', change: '+24%' },
            { title: 'Revenue (MTD)', value: '$45,231', change: '+8%' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel" style={{ padding: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.title}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '8px' }}>
                <h3 className="text-h1" style={{ fontSize: '2.5rem' }}>{stat.value}</h3>
                <span style={{ color: '#34d399', fontWeight: 500 }}>{stat.change}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Placeholder Table area */}
        <section className="glass-panel" style={{ padding: '24px', flex: 1, minHeight: '300px' }}>
          <h3 className="text-h3" style={{ marginBottom: '16px' }}>Recent System Activity</h3>
          <div style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '80%',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--glass-border)',
            borderRadius: '8px'
          }}>
            [ Activity Log Component Placeholder ]
          </div>
        </section>
      </main>
    </div>
  );
}
