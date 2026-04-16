import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import PatientRegisterForm from '../components/auth/PatientRegisterForm';
import { registerPatient } from '../services/patientAuthService';

export default function PatientRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (payload) => {
    try {
      setError('');
      setLoading(true);
      await registerPatient(payload);
      navigate('/patient/login');
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            Patient registration
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Create your account to book appointments, upload reports, and view your health history.
          </p>
        </div>

        {error && (
          <div className="glass-panel" style={{ padding: '12px 16px', borderLeft: '3px solid #ef4444', color: '#fecaca', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <PatientRegisterForm onSubmit={handleRegister} loading={loading} />

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/patient/login" style={{ color: 'var(--gradient-1)' }}>
            Log in as patient
          </Link>
        </p>
      </div>
    </div>
  );
}
