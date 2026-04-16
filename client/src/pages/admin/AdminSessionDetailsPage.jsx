import React, { useEffect, useState } from 'react';
import { Activity, Calendar, ClipboardList, Video, LogOut } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import telemedicineService from '../../services/telemedicineService';

const formatDateTime = (value) => {
	if (!value) return '-';
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return String(value);
	return d.toLocaleString();
};

export default function AdminSessionDetailsPage() {
	const navigate = useNavigate();
	const { id } = useParams();

	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [notesDraft, setNotesDraft] = useState('');
	const [savingNotes, setSavingNotes] = useState(false);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await telemedicineService.getSessionById(id);
				setSession(data);
				setNotesDraft(data?.notes || '');
			} catch (err) {
				console.error('Failed to load session details', err);
				setError('Failed to load session details.');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	const handleJoin = async () => {
		try {
			const updated = await telemedicineService.joinSession(id);
			setSession(updated);
		} catch (err) {
			console.error('Failed to join session', err);
			alert('Failed to join session.');
		}
	};

	const handleEnd = async () => {
		if (!window.confirm('End this session and mark it as completed?')) return;
		try {
			const updated = await telemedicineService.endSession(id);
			setSession(updated);
		} catch (err) {
			console.error('Failed to end session', err);
			alert('Failed to end session.');
		}
	};

	const handleSaveNotes = async () => {
		setSavingNotes(true);
		try {
			const updated = await telemedicineService.addSessionNotes(id, notesDraft || '');
			setSession(updated);
			alert('Notes saved.');
		} catch (err) {
			console.error('Failed to save notes', err);
			alert('Failed to save notes.');
		} finally {
			setSavingNotes(false);
		}
	};

	return (
		<div className="dashboard-layout">
			<aside className="sidebar">
				<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
					<div style={{ background: 'var(--accent-bg)', padding: '8px', borderRadius: '8px' }}>
						<Activity color="var(--gradient-1)" size={24} />
					</div>
					<h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Admin Portal</h2>
				</div>

				<nav className="sidebar-nav">
					<div className="nav-item" onClick={() => navigate('/admin')}><Activity size={20} /> Overview</div>
					<div className="nav-item" onClick={() => navigate('/admin/patients')}><ClipboardList size={20} /> Manage Patients</div>
					<div className="nav-item active" onClick={() => navigate('/admin/sessions')}><Video size={20} /> Telemedicine Logs</div>
				</nav>

				<div style={{ marginTop: 'auto' }}>
					<div className="nav-item" onClick={() => navigate('/')}><LogOut size={20} /> Sign Out</div>
				</div>
			</aside>

			<main className="main-content" style={{ overflowY: 'auto' }}>
				<header className="header">
					<div>
						<h1 className="text-h2">Session Details</h1>
						<p style={{ color: 'var(--text-secondary)' }}>
							View and manage telemedicine session details.
						</p>
					</div>
					<button className="btn-outline" onClick={() => navigate('/admin/sessions')}>
						Back to Logs
					</button>
				</header>

				{loading ? (
					<div style={{ color: 'var(--text-secondary)' }}>Loading session...</div>
				) : error ? (
					<div style={{ color: '#ef4444' }}>{error}</div>
				) : session ? (
					<>
						<section className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<h2 className="text-h3" style={{ margin: 0 }}>Session #{session.id}</h2>
								<span style={{ color: 'var(--text-secondary)' }}>{session.status}</span>
							</div>

							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
									gap: '12px',
									marginTop: '12px',
									fontSize: '0.9rem',
								}}
							>
								<div><strong>Session ID:</strong> {session.id}</div>
								<div><strong>Doctor ID:</strong> {session.doctorId}</div>
								<div><strong>Patient ID:</strong> {session.patientId}</div>
								<div><strong>Appointment ID:</strong> {session.appointmentId}</div>
								<div><strong>Scheduled:</strong> {formatDateTime(session.scheduledTime)}</div>
								<div><strong>Started:</strong> {formatDateTime(session.startTime)}</div>
								<div><strong>Ended:</strong> {formatDateTime(session.endTime)}</div>
								<div><strong>Video link:</strong> {session.videoLink || '-'}</div>
							</div>

							<div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
								<button type="button" className="btn-primary" onClick={handleJoin}>
									Join Session
								</button>
								<button type="button" className="btn-outline" onClick={handleEnd}>
									End Session
								</button>
							</div>
						</section>

						<section className="glass-panel" style={{ padding: '16px' }}>
							<h3 className="text-h3" style={{ marginTop: 0 }}>Session Notes</h3>
							<textarea
								className="glass-input"
								style={{ width: '100%', minHeight: '140px', resize: 'vertical' }}
								value={notesDraft}
								onChange={(e) => setNotesDraft(e.target.value)}
								placeholder="Enter session notes..."
							/>
							<div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
								<button type="button" className="btn-primary" disabled={savingNotes} onClick={handleSaveNotes}>
									{savingNotes ? 'Saving...' : 'Add Notes'}
								</button>
							</div>
						</section>
					</>
				) : null}
			</main>
		</div>
	);
}
