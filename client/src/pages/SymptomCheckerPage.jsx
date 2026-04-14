import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { analyzeSymptoms, getUrgencyStyle, saveSymptoamHistory } from '../services/symptomCheckerService';
import '../styles/SymptomChecker.css';

export default function SymptomCheckerPage() {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleSymptomChange = (e) => {
    setSymptoms(e.target.value);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    // Validation
    if (!symptoms.trim()) {
      setError('Please describe your symptoms');
      return;
    }

    if (symptoms.trim().length < 3) {
      setError('Symptom description must be at least 3 characters');
      return;
    }

    if (symptoms.trim().length > 1000) {
      setError('Symptom description must not exceed 1000 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await analyzeSymptoms(symptoms);

      if (response.success) {
        // Save to history
        saveSymptoamHistory(symptoms, response.data);
        setResults(response.data);
      } else {
        setError(response.error || 'Failed to analyze symptoms. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigate('/patient', { state: { specialty: results?.recommendedSpecialty } });
  };

  const handleNewAnalysis = () => {
    setSymptoms('');
    setResults(null);
    setError(null);
  };

  const urgencyStyle = results ? getUrgencyStyle(results.urgency) : null;

  return (
    <div className="symptom-checker-container">
      {/* Header */}
      <header className="symptom-checker-header">
        <button className="btn-back" onClick={() => navigate('/patient')}>
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <div>
          <h1 className="text-h1">Smart Symptom Checker</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Describe your symptoms and get preliminary health suggestions
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="symptom-checker-main">
        {/* Form Section */}
        {!results ? (
          <section className="glass-panel symptom-input-section">
            <h2 className="text-h2" style={{ marginBottom: '16px' }}>
              Describe Your Symptoms
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Please provide a detailed description of what you're experiencing. Include when it started, intensity, and any other relevant information.
            </p>

            <form onSubmit={handleAnalyze} className="symptom-form">
              <div className="form-group">
                <label style={{ color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                  Symptoms ({symptoms.length}/1000)
                </label>
                <textarea
                  value={symptoms}
                  onChange={handleSymptomChange}
                  placeholder="Example: I have a fever around 101°F, persistent cough for 2 days, and a sore throat. Started yesterday morning..."
                  className="symptom-textarea"
                  disabled={loading}
                  maxLength={1000}
                />
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !symptoms.trim()}
                style={{ width: '100%' }}
              >
                {loading ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Analyzing Symptoms...
                  </>
                ) : (
                  'Analyze Symptoms'
                )}
              </button>
            </form>

            {/* Info Box */}
            <div className="disclaimer-box">
              <AlertCircle size={20} />
              <div>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Important Disclaimer</p>
                <p>
                  This tool provides preliminary observations based on symptoms. It is not a medical diagnosis. Always consult with a qualified healthcare professional for proper evaluation and treatment.
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Results Section */}
        {results && (
          <section className="symptom-results-section">
            {/* Urgency Badge */}
            <div className="urgency-badge" style={{ borderColor: urgencyStyle.color, backgroundColor: urgencyStyle.bgColor }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                {results.urgency === 'HIGH' ? '🔴' : results.urgency === 'MEDIUM' ? '🟡' : '🟢'}
              </div>
              <p style={{ color: urgencyStyle.color, fontWeight: 700, fontSize: '1.1rem' }}>
                {urgencyStyle.label}
              </p>
            </div>

            {/* Recommended Specialty */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="text-h3" style={{ marginBottom: '12px' }}>
                Recommended Medical Specialty
              </h3>
              <p style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--gradient-1)' }}>
                {results.recommendedSpecialty}
              </p>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
                Consider scheduling an appointment with a {results.recommendedSpecialty.toLowerCase()}
              </p>
            </div>

            {/* Possible Conditions */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 className="text-h3" style={{ marginBottom: '16px' }}>
                Possible Conditions
              </h3>
              <div className="conditions-list">
                {results.possibleConditions && results.possibleConditions.length > 0 ? (
                  results.possibleConditions.map((condition, index) => (
                    <div key={index} className="condition-item">
                      <CheckCircle size={18} style={{ color: 'var(--gradient-2)' }} />
                      <span>{condition}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No specific conditions identified.</p>
                )}
              </div>
            </div>

            {/* Medical Advice */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', borderLeft: `4px solid ${urgencyStyle.color}` }}>
              <h3 className="text-h3" style={{ marginBottom: '12px' }}>
                Recommended Actions
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                {results.advice}
              </p>
            </div>

            {/* Disclaimer */}
            <div className="disclaimer-box">
              <AlertCircle size={20} />
              <div>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Medical Disclaimer</p>
                <p>{results.disclaimer}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn-primary" onClick={handleBookAppointment}>
                Book Appointment with {results.recommendedSpecialty}
              </button>
              <button className="btn-outline" onClick={handleNewAnalysis}>
                New Analysis
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
