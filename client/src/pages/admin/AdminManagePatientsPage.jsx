import React, { useEffect, useState } from 'react';
import { Activity, Users, Eye, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import patientService from '../../services/patientService';

export default function AdminManagePatientsPage() {
	const navigate = useNavigate();
	const [patients, setPatients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedPatient, setSelectedPatient] = useState(null);
	const [profileLoading, setProfileLoading] = useState(false);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const data = await patientService.getAllPatients();
				setPatients(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error('Failed to load patients', err);
				setError('Failed to load patients.');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this patient account? This action cannot be undone.')) return;
		try {
			await patientService.deletePatient(id);
			setPatients((prev) => prev.filter((p) => p.id !== id));
			if (selectedPatient && selectedPatient.id === id) {
				setSelectedPatient(null);
			}
		} catch (err) {
			console.error('Failed to delete patient', err);
			alert('Failed to delete patient');
		}
	};

	const handleViewProfile = async (id) => {
		setProfileLoading(true);
		try {
			const profile = await patientService.getPatientById(id);
			setSelectedPatient(profile);
		} catch (err) {
			console.error('Failed to load patient profile', err);
			alert('Failed to load patient profile');
		} finally {
			setProfileLoading(false);
		}
	};

	return (
		<div className="dashboard-layout">
			{/* Admin Sidebar */}
			<aside className="sidebar">
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
						<Activity color="var(--gradient-1)" size={24} />
					</div>
					<h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Admin Portal</h2>
				</div>

				<nav className="sidebar-nav">
					<div className="nav-item" onClick={() => navigate('/admin')}>
						<Activity size={20} /> Overview
					</div>
					<div className="nav-item active">
						<Users size={20} /> Manage Patients
					</div>
				</nav>

				<div style={{ marginTop: 'auto' }}>
					<div className="nav-item" onClick={() => navigate('/') }>
						<LogOut size={20} /> Sign Out
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="main-content">
				<header className="header">
					<div>
						<h1 className="text-h2">Manage Patients</h1>
						<p style={{ color: 'var(--text-secondary)' }}>
							View all registered patients, inspect their profile, and manage accounts.
						</p>
					</div>
				</header>

				{loading ? (
					<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
						Loading patients...
					</div>
				) : error ? (
					<div className="glass-panel" style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
				) : (
					<div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '2fr 1.2fr' : '1fr', gap: '24px' }}>
						{/* Patients list */}
						<section className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
								<h2 className="text-h3" style={{ margin: 0 }}>All Patients</h2>
								<span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{patients.length} records</span>
							</div>

							{patients.length === 0 ? (
								<p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
									No patients found.
								</p>
							) : (
								<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
									<thead>
										<tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
											<th style={{ padding: '8px 4px' }}>Name</th>
											<th style={{ padding: '8px 4px' }}>Email</th>
											<th style={{ padding: '8px 4px' }}>Phone</th>
											<th style={{ padding: '8px 4px' }}>Joined</th>
											<th style={{ padding: '8px 4px', textAlign: 'right' }}>Actions</th>
										</tr>
									</thead>
									<tbody>
										{patients.map((p) => (
											<tr key={p.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
												<td style={{ padding: '8px 4px' }}>{p.firstName} {p.lastName}</td>
												<td style={{ padding: '8px 4px' }}>{p.email}</td>
												<td style={{ padding: '8px 4px' }}>{p.phone}</td>
												<td style={{ padding: '8px 4px' }}>
													{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
												</td>
												<td style={{ padding: '8px 0', textAlign: 'right' }}>
													<button
														type="button"
														className="btn-outline"
														style={{ padding: '6px 10px', fontSize: '0.8rem', marginRight: '8px' }}
														onClick={() => handleViewProfile(p.id)}
													>
														<Eye size={14} style={{ marginRight: '4px' }} /> View
													</button>
													<button
														type="button"
														className="btn-outline"
														style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.5)' }}
														onClick={() => handleDelete(p.id)}
													>
														<Trash2 size={14} style={{ marginRight: '4px' }} /> Delete
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</section>

						{/* Profile preview */}
						{selectedPatient && (
							<section className="glass-panel" style={{ padding: '20px' }}>
								<h2 className="text-h3" style={{ marginBottom: '8px' }}>Patient Profile</h2>
								{profileLoading ? (
									<p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
								) : (
									<>
										<p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
											ID: {selectedPatient.id}
										</p>
										<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
											<div>
												<strong>Name:</strong> {selectedPatient.firstName} {selectedPatient.lastName}
											</div>
											<div>
												<strong>Email:</strong> {selectedPatient.email}
											</div>
											<div>
												<strong>Phone:</strong> {selectedPatient.phone}
											</div>
											{selectedPatient.dob && (
												<div>
													<strong>Date of Birth:</strong> {selectedPatient.dob}
												</div>
											)}
											{selectedPatient.gender && (
												<div>
													<strong>Gender:</strong> {selectedPatient.gender}
												</div>
											)}
										</div>
									</>
								)}
							</section>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
