import React from 'react';
import { Activity, Calendar, Users, FileText, Video, Clock, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DoctorSidebar() {
	const navigate = useNavigate();
	const location = useLocation();

	const isActive = (path) => location.pathname.startsWith(path);

	return (
		<aside className="sidebar">
			<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
					<Activity color="#34d399" size={24} />
				</div>
				<h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Doctor Portal</h2>
			</div>

			<nav className="sidebar-nav">
				<div
					className={`nav-item ${isActive('/doctor') && location.pathname === '/doctor' ? 'active' : ''}`}
					onClick={() => navigate('/doctor')}
				>
					<Calendar size={20} /> My Appointments
				</div>
        <div
					className={`nav-item ${isActive('/doctor/patients') ? 'active' : ''}`}
					onClick={() => navigate('/doctor/patients')}
				>
					<Users size={20} /> Patients
				</div>
				<div
					className={`nav-item ${isActive('/doctor/teleconferences') ? 'active' : ''}`}
					onClick={() => navigate('/doctor/teleconferences')}
				>
					<Video size={20} /> Telemedicine
				</div>
			</nav>

			<div style={{ marginTop: 'auto' }}>
				<div className="nav-item" onClick={() => {
            localStorage.clear();
            navigate('/');
        }}><LogOut size={20} /> Sign Out</div>
			</div>
		</aside>
	);
}
