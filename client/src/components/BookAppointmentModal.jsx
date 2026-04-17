import React, { useState, useEffect } from 'react';
import { X, Search, Calendar as CalendarIcon, Clock, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import doctorService from '../services/doctorService';
import appointmentService from '../services/appointmentService';

const BookAppointmentModal = ({ isOpen, onClose, patientId, onBooked }) => {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('All');
    
    // Booking states
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Generate upcoming dates (next 7 days)
    const upcomingDates = Array.from({length: 7}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1); // Start from tomorrow
        return d;
    });

    // Generate 1-hour time slots for a day (e.g. 09:00 to 17:00)
    const exactSlots = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    const specializations = [
        "All", "Cardiology", "Psychiatry", "General Practitioner", "Pediatrics", "Orthopedics", "Neurology", "Dermatology", "Oncology", "Gastroenterology"
    ];

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedDoctor(null);
            setSelectedDate('');
            setSelectedTime('');
            setBookedSlots([]);
            setError(null);
            fetchDoctors();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!selectedDoctor || !selectedDate) {
            setBookedSlots([]);
            return;
        }

        const fetchDoctorAppointments = async () => {
            setLoadingSlots(true);
            try {
                const appointments = await appointmentService.getAppointmentsByDoctorId(selectedDoctor.id);
                const bookedForDate = appointments
                    .filter(app => {
                        if (!app.appointmentDate || app.status === 'CANCELLED') return false;
                        
                        let appDateStr = '';
                        if (Array.isArray(app.appointmentDate)) {
                            const [year, month, day] = app.appointmentDate;
                            appDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        } else if (typeof app.appointmentDate === 'string') {
                            appDateStr = app.appointmentDate.split('T')[0];
                        }
                        
                        return appDateStr === selectedDate;
                    })
                    .map(app => {
                        if (Array.isArray(app.appointmentDate)) {
                            const hour = app.appointmentDate[3] || 0;
                            const min = app.appointmentDate[4] || 0;
                            return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                        } else {
                            const timePart = app.appointmentDate.split('T')[1];
                            return timePart ? timePart.substring(0, 5) : "00:00";
                        }
                    });
                
                setBookedSlots(bookedForDate);
                
                // If the selected time is now booked, unselect it
                if (selectedTime && bookedForDate.includes(selectedTime)) {
                    setSelectedTime('');
                }
            } catch (err) {
                console.error("Failed to fetch slots for doctor", err);
                setBookedSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchDoctorAppointments();
    }, [selectedDoctor, selectedDate]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const data = await doctorService.getAllDoctors();
            setDoctors(data || []);
        } catch (err) {
            console.error("Failed to load doctors, using mock data for UI visual demonstration.");
            // Mock doctors if API fails or isn't built yet
            setDoctors([
                { id: 1, name: "Dr. Emily Chen", specialty: "Cardiologist", experience: "10 yrs" },
                { id: 2, name: "Dr. Michael Ross", specialty: "General Physician", experience: "5 yrs" },
                { id: 3, name: "Dr. Sarah Connor", specialty: "Neurologist", experience: "12 yrs" }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) return;
        setLoading(true);
        try {
            const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
            const payload = {
                patientId: patientId || 1, // fallback to 1 if not provided
                doctorId: selectedDoctor.id,
                appointmentDate: appointmentDateTime,
                status: "BOOKED"
            };
            await appointmentService.bookAppointment(payload);
            onBooked(); // Notify parent to refresh appointments
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || JSON.stringify(err.response?.data) || "Failed to book appointment.");
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(d => {
        const isVerified = d.isVerified === true || d.isVerified === undefined;
        const matchesSearch = ((d.name || d.firstName + ' ' + d.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.specialization || d.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()));
        
        const docSpec = d.specialization || d.specialty || 'General Practitioner';
        const matchesSpecialization = selectedSpecialization === 'All' || docSpec.toLowerCase() === selectedSpecialization.toLowerCase();

        return isVerified && matchesSearch && matchesSpecialization;
    });

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(13, 11, 20, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{
                position: 'relative', width: '90%', maxWidth: '600px', height: '80vh',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                animation: 'slide-up 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="text-h2" style={{ margin: 0, fontSize: '1.5rem' }}>
                        {step === 1 ? 'Select a Doctor' : step === 2 ? 'Choose Date & Time' : 'Confirm Booking'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{ display: 'flex', height: '4px', background: 'var(--glass-bg)' }}>
                    <div style={{ width: `${(step / 3) * 100}%`, background: 'linear-gradient(to right, var(--gradient-1), var(--gradient-2))', transition: 'width 0.3s ease' }}></div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div style={{ display: 'flex', gap: '20px', height: '100%', flexDirection: 'row' }}>
                            {/* Specialization Filter Sidebar */}
                            <div style={{ width: '180px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '12px', borderRight: '1px solid var(--glass-border)' }}>
                                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Specialization</h4>
                                {specializations.map(spec => (
                                    <button
                                        key={spec}
                                        onClick={() => setSelectedSpecialization(spec)}
                                        style={{
                                            padding: '10px 12px',
                                            textAlign: 'left',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: '1px solid ' + (selectedSpecialization === spec ? 'var(--gradient-1)' : 'transparent'),
                                            background: selectedSpecialization === spec ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                            color: selectedSpecialization === spec ? '#fff' : 'var(--text-secondary)',
                                            transition: 'all 0.2s',
                                            fontWeight: selectedSpecialization === spec ? 600 : 400
                                        }}
                                    >
                                        {spec}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Search by name or specialty..." 
                                        style={{ paddingLeft: '48px', width: '100%' }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                
                                {loading ? (
                                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>Loading doctors...</div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                        {filteredDoctors.map(doctor => (
                                            <div 
                                                key={doctor.id}
                                                style={{ 
                                                    padding: '16px', borderRadius: '12px', cursor: 'pointer',
                                                    background: selectedDoctor?.id === doctor.id ? 'rgba(168, 85, 247, 0.15)' : 'var(--glass-bg)',
                                                    border: `1px solid ${selectedDoctor?.id === doctor.id ? 'var(--gradient-1)' : 'var(--glass-border)'}`,
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onClick={() => setSelectedDoctor(doctor)}
                                            >
                                                <div>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{doctor.name || `${doctor.firstName} ${doctor.lastName}`}</h4>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{doctor.specialization || doctor.specialty || 'General Practitioner'}</p>
                                                </div>
                                                {selectedDoctor?.id === doctor.id && <UserCheck size={20} color="#a855f7" />}
                                            </div>
                                        ))}
                                        {filteredDoctors.length === 0 && (
                                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>No doctors found.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Date Selection */}
                            <div>
                                <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CalendarIcon size={18} color="var(--gradient-1)" /> Select Date
                                </h4>
                                <div style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                                    {upcomingDates.map((date, i) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const isSelected = selectedDate === dateStr;
                                        return (
                                            <div 
                                                key={i}
                                                onClick={() => setSelectedDate(dateStr)}
                                                style={{ 
                                                    minWidth: '80px', padding: '12px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                                    background: isSelected ? 'linear-gradient(to bottom, #a855f7, #8b5cf6)' : 'var(--glass-bg)',
                                                    border: '1px solid var(--glass-border)',
                                                    color: isSelected ? '#fff' : 'var(--text-primary)'
                                                }}
                                            >
                                                <div style={{ fontSize: '0.8rem', opacity: isSelected ? 0.9 : 0.6, marginBottom: '4px' }}>
                                                    {date.toLocaleString('default', { weekday: 'short' })}
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                                    {date.getDate()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Selection */}
                            {selectedDate && (
                                <div style={{ animation: 'fade-in 0.3s ease-out' }}>
                                    <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={18} color="var(--gradient-2)" /> Available Slots
                                        {loadingSlots && <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>(Loading...)</span>}
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        {exactSlots.map((time) => {
                                            const isSelected = selectedTime === time;
                                            const isBooked = bookedSlots.includes(time);
                                            return (
                                                <div 
                                                    key={time}
                                                    onClick={() => !isBooked && setSelectedTime(time)}
                                                    style={{
                                                        padding: '12px', borderRadius: '8px', textAlign: 'center', cursor: isBooked ? 'not-allowed' : 'pointer',
                                                        background: isBooked ? 'rgba(255, 255, 255, 0.03)' : isSelected ? 'rgba(236, 72, 153, 0.2)' : 'var(--glass-bg)',
                                                        border: `1px solid ${isSelected ? '#ec4899' : 'var(--glass-border)'}`,
                                                        color: isBooked ? 'rgba(255, 255, 255, 0.2)' : isSelected ? '#ec4899' : 'var(--text-primary)',
                                                        fontWeight: isSelected ? 600 : 400,
                                                        textDecoration: isBooked ? 'line-through' : 'none'
                                                    }}
                                                >
                                                    {time}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', marginTop: '24px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                                <CheckCircle size={40} color="#10b981" />
                            </div>
                            <h3 className="text-h3">Confirm Details</h3>
                            
                            <div style={{ width: '100%', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Doctor</span>
                                    <span style={{ fontWeight: 600 }}>{selectedDoctor?.name || 'Dr. Emily Chen'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Date</span>
                                    <span style={{ fontWeight: 600 }}>{selectedDate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Time</span>
                                    <span style={{ fontWeight: 600 }}>{selectedTime}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    {step > 1 ? (
                        <button className="btn-outline" onClick={() => setStep(s => s - 1)} disabled={loading}>
                            Back
                        </button>
                    ) : (
                        <div></div> 
                    )}
                    
                    {step < 3 ? (
                        <button 
                            className="btn-primary" 
                            style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)' }}
                            onClick={() => setStep(s => s + 1)}
                            disabled={
                                (step === 1 && !selectedDoctor) || 
                                (step === 2 && (!selectedDate || !selectedTime))
                            }
                        >
                            Continue
                        </button>
                    ) : (
                        <button 
                            className="btn-primary" 
                            style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
                            onClick={handleBook}
                            disabled={loading}
                        >
                            {loading ? 'Booking...' : 'Confirm Book'}
                        </button>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .form-input {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--glass-border);
                    color: var(--text-primary);
                    padding: 12px 16px;
                    border-radius: 8px;
                    outline: none;
                    transition: all 0.2s;
                }
                .form-input:focus {
                    border-color: var(--gradient-1);
                    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
                }
            `}</style>
        </div>
    );
};

export default BookAppointmentModal;
