import { useEffect, useState } from 'react';
import { Loader2, User } from 'lucide-react';
import patientService from '../services/patientService';
import PatientSidebar from '../components/PatientSidebar';

export default function PatientProfilePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: localStorage.getItem('patient_address') || '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const patientId = localStorage.getItem('userId');

  useEffect(() => {
    const load = async () => {
      if (!patientId) {
        setError('No patient ID found. Please log in again.');
        setLoading(false);
        return;
      }
      try {
        const profile = await patientService.getPatientById(patientId);
        setFormData((prev) => ({
          ...prev,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          dob: profile.dob || '',
          gender: profile.gender || '',
        }));
      } catch (err) {
        setError('Failed to load patient profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dob: formData.dob || null,
        gender: formData.gender,
      };
      await patientService.updatePatient(patientId, payload);
      localStorage.setItem('firstName', formData.firstName);
      localStorage.setItem('patient_address', formData.address || '');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <PatientSidebar />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <PatientSidebar />
      <main className="main-content">
        <div className="header">
          <div>
            <h1 className="text-h2">My Profile</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              View and update your personal information.
            </p>
          </div>
        </div>

        <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '999px' }}>
              <User size={24} color="#ec4899" />
            </div>
            <h2 className="text-h3">Patient Details</h2>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
              {success}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>First Name</label>
              <input
                className="glass-input"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Last Name</label>
              <input
                className="glass-input"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
            <input
              className="glass-input"
              name="email"
              value={formData.email}
              disabled
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Contact</label>
              <input
                className="glass-input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
              <input
                type="date"
                className="glass-input"
                name="dob"
                value={formData.dob || ''}
                onChange={handleChange}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gender</label>
            <select
              className="glass-input"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Address</label>
            <textarea
              className="glass-input"
              name="address"
              rows={3}
              placeholder="Street, city, postal code"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ width: '100%', marginTop: '8px', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
}
