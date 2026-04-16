import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Loader2, Stethoscope } from 'lucide-react';

export default function DoctorRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    gender: 'Other',
    specialization: '',
    availability: 'Mon-Fri, 9AM-5PM'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Create Patient Auth Credentials (Role: DOCTOR)
      const authPayload = {
         firstName: formData.firstName,
         lastName: formData.lastName,
         email: formData.email,
         phone: formData.phone,
         password: formData.password,
         dob: formData.dob,
         gender: formData.gender,
         role: 'DOCTOR'
      };
      
      const authResponse = await fetch('/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authPayload),
      });

      if (!authResponse.ok) {
        throw new Error('Failed to register auth credentials. Email may already be in use.');
      }

      // 2. Create Doctor Profile Details
      const profilePayload = {
         name: `Dr. ${formData.firstName} ${formData.lastName}`,
         specialization: formData.specialization,
         email: formData.email,
         phone: formData.phone,
         availability: formData.availability,
         isAvailable: true,
         isVerified: false
      };

      const profileResponse = await fetch('/api/doctors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });

      if (!profileResponse.ok) {
         throw new Error('Failed to create doctor professional profile');
      }

      setSuccess('Doctor profile created successfully! Redirecting to login...');
      // Navigate to login page on dual success after showing the success message briefly
      setTimeout(() => {
        navigate('/?registered=true');
      }, 1500);
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
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '12px', display: 'inline-flex' }}>
            <Stethoscope color="#3b82f6" size={32} />
          </div>
          <h2 className="text-h2">Join as <span className="text-gradient-alt">Doctor</span></h2>
          <p style={{ color: 'var(--text-secondary)' }}>Set up your professional portal profile and credentials.</p>
        </div>

        <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && (
             <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
               {error}
             </div>
          )}
          {success && (
             <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
               {success}
             </div>
          )}

          {/* Section: Personal Info */}
          <h3 style={{ fontSize: '1.1rem', color: 'white', marginTop: '8px' }}>Personal Info (Auth)</h3>

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
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email (Username)</label>
            <input type="email" name="email" className="glass-input" required onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" name="password" className="glass-input" required minLength={8} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Phone</label>
              <input type="text" name="phone" className="glass-input" required onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
              <input type="date" name="dob" className="glass-input" max={new Date().toISOString().split('T')[0]} required onChange={handleChange} style={{ colorScheme: 'dark' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gender</label>
               <select name="gender" className="glass-input" onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
               </select>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--glass-border)', margin: '16px 0' }} />

          {/* Section: Professional Info */}
          <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Professional Profile</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Specialization</label>
            <div className="glass-input-wrapper">
               <select name="specialization" className="glass-input" required onChange={handleChange} value={formData.specialization}>
                  <option value="" disabled>Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="General Practitioner">General Practitioner</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
               </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Default Availability</label>
            <input type="text" name="availability" className="glass-input" value={formData.availability} required onChange={handleChange} />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', width: '100%', marginTop: '16px', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Registering...</> : 'Create Professional Account'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.9rem' }}>
             <Link to="/" style={{ color: 'var(--text-secondary)' }}>Already have an account? <span style={{ color: 'var(--gradient-1)' }}>Log in</span></Link>
          </div>
        </form>

      </div>
    </div>
  );
}
