import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, CreditCard } from 'lucide-react';
import paymentService from '../services/paymentService'; // assuming they are in sibling directories/services
import doctorService from '../services/doctorService';
import patientService from '../services/patientService';

const AppointmentCard = ({ appointment, onCancel, onHardDelete, role = "PATIENT" }) => {
    const [paymentStatus, setPaymentStatus] = useState("Loading...");
    const [targetName, setTargetName] = useState(() => 
        role === "PATIENT" ? `Doctor ID: ${appointment.doctorId}` : `Patient ID: ${appointment.patientId}`
    );

    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    
    // Calculate remaining days
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isFuture = diffDays > 0;
    
    useEffect(() => {
        // Only fetch payment if appointment is not cancelled? We can fetch it anyway.
        const fetchPayment = async () => {
            try {
                const pStatus = await paymentService.getPaymentStatus(appointment.id);
                // Based on Payment.java enum: SUCCESS, PENDING, FAILED, etc.
                setPaymentStatus(pStatus.status === "SUCCESS" ? "Paid" : "Pending");
            } catch (err) {
                setPaymentStatus("Not Done");
            }
        };
        fetchPayment();
    }, [appointment.id]);

    useEffect(() => {
        const fetchName = async () => {
            try {
                if (role === "PATIENT") {
                    const doc = await doctorService.getDoctorById(appointment.doctorId);
                    setTargetName(doc.name || `${doc.firstName} ${doc.lastName}`);
                } else {
                    const pat = await patientService.getPatientById(appointment.patientId);
                    setTargetName(`${pat.firstName} ${pat.lastName}`);
                }
            } catch (err) {
                console.error("Could not fetch profile name", err);
            }
        };
        fetchName();
    }, [appointment.doctorId, appointment.patientId, role]);

    const getStatusTheme = (status) => {
        switch (status) {
            case 'BOOKED':
            case 'PENDING':
                return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <Clock size={16} /> };
            case 'COMPLETED':
                return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle size={16} /> };
            case 'CANCELLED':
                return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <XCircle size={16} /> };
            default:
                return { color: 'var(--text-secondary)', bg: 'var(--glass-bg)', icon: <AlertCircle size={16} /> };
        }
    };

    const statusTheme = getStatusTheme(appointment.status);

    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                        background: 'var(--glass-bg)', 
                        border: '1px solid var(--glass-border)',
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        textAlign: 'center' 
                    }}>
                        <p style={{ color: 'var(--gradient-1)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                            {appointmentDate.toLocaleString('default', { month: 'short' })}
                        </p>
                        <h2 className="text-h2" style={{ margin: 0 }}>
                            {appointmentDate.getDate()}
                        </h2>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} style={{ color: 'var(--text-secondary)' }} />
                            {targetName}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <Clock size={14} /> {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {isFuture && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                            <p style={{ color: 'var(--gradient-2)', fontSize: '0.85rem', marginTop: '4px', fontWeight: 500 }}>
                                In {diffDays} {diffDays === 1 ? 'day' : 'days'}
                            </p>
                        )}
                    </div>
                </div>
                
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.85rem', 
                    fontWeight: 500,
                    color: statusTheme.color,
                    background: statusTheme.bg,
                    padding: '4px 10px',
                    borderRadius: '20px'
                }}>
                    {statusTheme.icon}
                    {appointment.status}
                </div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                     <CreditCard size={16} />
                     Payment Status:
                 </div>
                 <span style={{ 
                     fontWeight: 600, 
                     color: paymentStatus === 'Paid' ? '#10b981' : paymentStatus === 'Not Done' ? '#ef4444' : '#f59e0b'
                 }}>
                     {paymentStatus}
                 </span>
            </div>

            {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && isFuture && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button 
                        className="btn-outline" 
                        style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                        onClick={() => onCancel(appointment)}
                    >
                        Cancel Appointment
                    </button>
                    {/* Add Pay functionality if needed here */}
                </div>
            )}

            {appointment.status === 'CANCELLED' && role === 'ADMIN' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button 
                        className="btn-outline" 
                        style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', color: '#ef4444' }}
                        onClick={() => onHardDelete(appointment)}
                    >
                        Delete Permanently
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;
