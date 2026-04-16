import React from 'react';
import { Activity, Calendar, Users, FileText, Video, Clock, LogOut, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PatientSidebar() {
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path) => location.pathname === path;

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
					className={`nav-item ${isActive('/patient') ? 'active' : ''}`}
					onClick={() => navigate('/patient')}
				>
					<Calendar size={20} /> My Appointments
				</div>
				<div
					className={`nav-item ${isActive('/patient/profile') ? 'active' : ''}`}
					onClick={() => navigate('/patient/profile')}
				>
					<Users size={20} /> My Profile
				</div>
				<div
					className={`nav-item ${isActive('/patient/sessions') ? 'active' : ''}`}
					onClick={() => navigate('/patient/sessions')}
				>
					<Video size={20} /> Telemedicine Sessions
				</div>
				<div
					className={`nav-item ${isActive('/patient/medical-history') ? 'active' : ''}`}
					onClick={() => navigate('/patient/medical-history')}
				>
					<FileText size={20} /> Medical History
				</div>
				<div
					className={`nav-item ${isActive('/patient/prescriptions') ? 'active' : ''}`}
					onClick={() => navigate('/patient/prescriptions')}
				>
					<FileText size={20} /> Prescriptions
				</div>
				<div
					className={`nav-item ${isActive('/patient/reports') ? 'active' : ''}`}
					onClick={() => navigate('/patient/reports')}
				>
					<FileText size={20} /> Medical Reports
				</div>
				<div
					className={`nav-item ${isActive('/patient/search-doctors') ? 'active' : ''}`}
					onClick={() => navigate('/patient/search-doctors')}
				>
					<Search size={20} /> Search Doctors
				</div>
			</nav>

			<div style={{ marginTop: 'auto' }}>
				<div className="nav-item" onClick={() => navigate('/') }>
					<LogOut size={20} /> Sign Out
				</div>
			</div>
		</aside>
	);
}

