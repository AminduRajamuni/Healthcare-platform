import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import PatientLoginForm from '../components/auth/PatientLoginForm';
import { loginPatient } from '../services/patientAuthService';

export default function PatientLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (credentials) => {
    try {
      setError('');
      setLoading(true);
      const data = await loginPatient(credentials);
      if (data.token) {
        localStorage.setItem('patient_token', data.token);
        if (data.role) {
          localStorage.setItem('role', data.role);
        }
        navigate('/patient');
      }
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '12px',
            borderRadius: '12px',
            display: 'inline-flex',
          }}>
            <Activity color="#a855f7" size={32} />
          </div>
          <h1 className="text-h2">
            Patient login
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Access your appointments, medical history, and prescriptions.
          </p>
        </div>

        {error && (
          <div className="glass-panel" style={{ padding: '12px 16px', borderLeft: '3px solid #ef4444', color: '#fecaca', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <PatientLoginForm onSubmit={handleLogin} loading={loading} />

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          New to the platform?{' '}
          <Link to="/patient/register" style={{ color: 'var(--gradient-1)' }}>
            Create a patient account
          </Link>
        </p>
      </div>
    </div>
  );
}
