import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            padding: '12px', 
            borderRadius: '12px',
            display: 'inline-flex'
          }}>
            <Activity color="#a855f7" size={32} />
          </div>
          <h1 className="text-h1">
            Healthcare is the new <br/>
            <span className="text-gradient">standard for wellness</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            The delightfully smart medical platform.
          </p>
        </div>

        {/* Login Form Container */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email address</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="you@example.com" 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--gradient-1)' }}>Forgot?</a>
            </div>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="••••••••" 
            />
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>
            Log in <ArrowRight size={18} />
          </button>
        </div>

        {/* Development Quick Links */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            DEVELOPMENT: QUICK LOGIN AS
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-outline" onClick={() => navigate('/admin')}>Admin</button>
            <button className="btn-outline" onClick={() => navigate('/doctor')}>Doctor</button>
            <button className="btn-outline" onClick={() => navigate('/patient')}>Patient</button>
          </div>
        </div>

      </div>
    </div>
  );
}
