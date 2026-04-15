import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowRight, Activity, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Pointing to proxy which routes to patient-service where AuthController handles /api/auth/login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      
      // Save token (usually in localStorage)
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('role', data.role);
      }

      // Navigate based on role
      const role = data.role ? data.role.toUpperCase() : 'PATIENT';
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DOCTOR') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

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
        <form className="glass-panel" onSubmit={handleLogin} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email address</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Logging in...</> : <>Log in <ArrowRight size={18} /></>}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
             Don't have an account? <br/>
             <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Link to="/register/patient" style={{ color: 'var(--gradient-1)' }}>Register as Patient</Link>
                <span>|</span>
                <Link to="/register/doctor" style={{ color: '#3b82f6' }}>Register as Doctor</Link>
             </div>
          </div>
        </form>

      </div>
    </div>
  );
}
