import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function PatientRegisterForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dob: '',
    gender: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      dob: form.dob ? form.dob : null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>First name</label>
          <input
            name="firstName"
            className="glass-input"
            placeholder="John"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Last name</label>
          <input
            name="lastName"
            className="glass-input"
            placeholder="Doe"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email</label>
        <input
          type="email"
          name="email"
          className="glass-input"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Phone</label>
        <input
          name="phone"
          className="glass-input"
          placeholder="07XXXXXXXX"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date of birth</label>
          <input
            type="date"
            name="dob"
            className="glass-input"
            value={form.dob}
            onChange={handleChange}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Gender</label>
          <select
            name="gender"
            className="glass-input"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
        <input
          type="password"
          name="password"
          className="glass-input"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
        />
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.8 : 1 }} disabled={loading}>
        {loading ? 'Creating account...' : 'Create account'} <ArrowRight size={18} />
      </button>
    </form>
  );
}
