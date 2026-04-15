import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Heart, Calendar, Stethoscope, CreditCard, Clock, FileText, Pill, LogOut } from 'lucide-react';

export default function PatientSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname || '';

  const isProfile = path.startsWith('/patient/profile');
  const isAppointments = path === '/patient';
  const isTelemedicine = path.startsWith('/patient/sessions') || path.startsWith('/patient/session/');
    const isMedicalHistory = path.startsWith('/patient/medical-history');
    const isPrescriptions = path.startsWith('/patient/prescriptions');
    const isReports = path.startsWith('/patient/reports');

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
          <Activity color="#ec4899" size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Patient Portal</h2>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${isProfile ? 'active' : ''}`}
          onClick={() => navigate('/patient/profile')}
        >
          <Heart size={20} /> My Profile
        </div>
        <div
          className={`nav-item ${isAppointments ? 'active' : ''}`}
          onClick={() => navigate('/patient')}
        >
          <Calendar size={20} /> Appointments
        </div>
        <div
          className={`nav-item ${isTelemedicine ? 'active' : ''}`}
          onClick={() => navigate('/patient/sessions')}
        >
          <Stethoscope size={20} /> Telemedicine Sessions
        </div>
        <div
          className={`nav-item ${isMedicalHistory ? 'active' : ''}`}
          onClick={() => navigate('/patient/medical-history')}
        >
          <Clock size={20} /> Medical History
        </div>
        <div
          className={`nav-item ${isPrescriptions ? 'active' : ''}`}
          onClick={() => navigate('/patient/prescriptions')}
        >
          <Pill size={20} /> Prescriptions
        </div>
        <div
          className={`nav-item ${isReports ? 'active' : ''}`}
          onClick={() => navigate('/patient/reports')}
        >
          <FileText size={20} /> Medical Reports
        </div>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div className="nav-item" onClick={() => navigate('/')}
        >
          <LogOut size={20} /> Sign Out
        </div>
      </div>
    </aside>
  );
}
