import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Loader2, UserPlus } from 'lucide-react';

export default function PatientRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    gender: 'Other'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = { ...formData, role: 'PATIENT' };
      
      const response = await fetch('/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to register. Email may already be in use.');
      }

      // Automatically navigate to login page on success
      navigate('/?registered=true');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '12px', display: 'inline-flex' }}>
            <UserPlus color="#ec4899" size={32} />
          </div>
          <h2 className="text-h2">Join as <span className="text-gradient">Patient</span></h2>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your details to create your healthcare portal account.</p>
        </div>

        <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
             <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
               {error}
             </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>First Name</label>
              <input type="text" name="firstName" className="glass-input" required onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Last Name</label>
              <input type="text" name="lastName" className="glass-input" required onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" className="glass-input" required onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" name="password" className="glass-input" required minLength={8} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone</label>
              <input type="text" name="phone" className="glass-input" required onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
              <input type="date" name="dob" className="glass-input" required onChange={handleChange} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gender</label>
             <select name="gender" className="glass-input" onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
             </select>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : 'Create Account'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem' }}>
             <Link to="/" style={{ color: 'var(--text-secondary)' }}>Already have an account? <span style={{ color: 'var(--gradient-1)' }}>Log in</span></Link>
          </div>
        </form>

      </div>
    </div>
  );
}
