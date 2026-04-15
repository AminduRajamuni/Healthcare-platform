import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, AlertCircle, CheckCircle, Clock, Heart, Send } from 'lucide-react';
import symptomService from '../services/symptomService';
import './SymptomChecker.css';

export default function SymptomChecker() {
    const navigate = useNavigate();
    const firstName = localStorage.getItem('firstName') || 'User';

    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        // Validation
        if (symptoms.trim().length < 3) {
            setError('Please enter at least 3 characters describing your symptoms');
            return;
        }

        if (symptoms.trim().length > 1000) {
            setError('Symptom description cannot exceed 1000 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await symptomService.analyzeSymptoms(symptoms);
            setResult(response);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze symptoms. Please try again.');
            console.error("Analysis error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency?.toUpperCase()) {
            case 'HIGH':
                return '#ef4444'; // red
            case 'MEDIUM':
                return '#f97316'; // orange
            case 'LOW':
                return '#22c55e'; // green
            default:
                return '#64748b'; // slate
        }
    };

    const getUrgencyIcon = (urgency) => {
        switch (urgency?.toUpperCase()) {
            case 'HIGH':
                return <AlertCircle size={20} />;
            case 'MEDIUM':
                return <Clock size={20} />;
            case 'LOW':
                return <CheckCircle size={20} />;
            default:
                return <Heart size={20} />;
        }
    };

    const handleBookAppointment = () => {
        // Pass result to appointment booking - navigate to patient dashboard with pre-filled specialty
        localStorage.setItem('recommendedSpecialty', result?.recommendedSpecialty);
        navigate('/patient');
    };

    const characterCount = symptoms.length;
    const characterLimit = 1000;

    return (
        <div className="symptom-checker-container">
            {/* Header Bar */}
            <div className="symptom-checker-header">
                <div className="header-content">
                    <button 
                        onClick={() => navigate('/patient')}
                        className="btn-back"
                        title="Go back to dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-title">
                        <Stethoscope size={28} color="#ec4899" />
                        <h1>Symptom Checker</h1>
                    </div>
                    <p className="header-subtitle">Get preliminary health insights based on your symptoms</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="symptom-checker-content">
                <div className="content-wrapper">
                    {/* Left Panel - Input Form */}
                    <div className="input-panel">
                        <div className="symptom-form">
                            <h2>Describe Your Symptoms</h2>
                            <p className="form-description">
                                Tell us what symptoms you're experiencing. Be as detailed as possible (e.g., location, duration, severity).
                            </p>

                            <form onSubmit={handleAnalyze} className="form">
                                <div className="form-group">
                                    <textarea
                                        value={symptoms}
                                        onChange={(e) => setSymptoms(e.target.value)}
                                        placeholder="Example: Fever, cough, and sore throat for 2 days..."
                                        className="glass-input symptom-textarea"
                                        rows={8}
                                        disabled={loading}
                                    />
                                    <div className="character-count">
                                        <span className={characterCount > characterLimit * 0.9 ? 'warning' : ''}>
                                            {characterCount} / {characterLimit}
                                        </span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="alert alert-error">
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn-primary btn-analyze"
                                    disabled={loading || symptoms.trim().length === 0}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Analyze Symptoms
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Info Box */}
                            <div className="info-box">
                                <h4>⚕️ Medical Disclaimer</h4>
                                <p>
                                    This symptom checker provides preliminary information only and should not be considered a medical diagnosis. 
                                    Always consult with a qualified healthcare professional for proper evaluation and treatment.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Results */}
                    <div className="results-panel">
                        {result ? (
                            <div className="results-card">
                                {/* Urgency Badge */}
                                <div className="urgency-section" style={{ borderTopColor: getUrgencyColor(result.urgency) }}>
                                    <div className="urgency-badge" style={{ backgroundColor: getUrgencyColor(result.urgency) }}>
                                        {getUrgencyIcon(result.urgency)}
                                        <span className="urgency-label">{result.urgency} URGENCY</span>
                                    </div>
                                </div>

                                {/* Results Content */}
                                <div className="results-content">
                                    {/* Recommended Specialty */}
                                    <div className="result-section">
                                        <h3 className="result-section-title">Recommended Specialty</h3>
                                        <div className="specialty-chip">
                                            <Stethoscope size={18} />
                                            <span>{result.recommendedSpecialty}</span>
                                        </div>
                                    </div>

                                    {/* Possible Conditions */}
                                    <div className="result-section">
                                        <h3 className="result-section-title">Possible Conditions</h3>
                                        <ul className="conditions-list">
                                            {result.possibleConditions && result.possibleConditions.map((condition, idx) => (
                                                <li key={idx} className="condition-item">
                                                    <span className="condition-dot"></span>
                                                    {condition}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Medical Advice */}
                                    <div className="result-section">
                                        <h3 className="result-section-title">Recommended Action</h3>
                                        <div className="advice-box">
                                            <p>{result.advice}</p>
                                        </div>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="disclaimer-box">
                                        <p>
                                            <strong>Disclaimer:</strong> {result.disclaimer}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="result-actions">
                                        <button 
                                            onClick={handleBookAppointment}
                                            className="btn-primary btn-book"
                                        >
                                            <Heart size={18} />
                                            Book Appointment
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSymptoms('');
                                                setResult(null);
                                                setError('');
                                            }}
                                            className="btn-secondary btn-reset"
                                        >
                                            New Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Stethoscope size={64} className="empty-icon" />
                                <h3>Analyze Your Symptoms</h3>
                                <p>Enter your symptoms on the left to get preliminary health insights and specialist recommendations.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
