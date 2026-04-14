/**
 * Symptom Checker Service
 * Communicates with SymptomChecker-Service backend (Port 8087)
 */

import { post } from './apiClient';

/**
 * Analyze symptoms and get health recommendations
 * @param {string} symptoms - Patient's symptom description
 * @returns {Promise<Object>} - Analysis result with conditions, specialty, urgency, advice
 */
export const analyzeSymptoms = async (symptoms) => {
  try {
    const response = await post('/api/symptoms/analyze', {
      symptoms: symptoms.trim(),
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Symptom Analysis Error:', error);
    
    // Handle different error types
    let errorMessage = 'Failed to analyze symptoms. Please try again.';
    
    if (error.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
      // Clear invalid token
      localStorage.removeItem('authToken');
    } else if (error.status === 400) {
      errorMessage = error.message || 'Invalid symptom input. Please check and try again.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    return {
      success: false,
      error: errorMessage,
      statusCode: error.status,
    };
  }
};

/**
 * Get urgency color and badge styling
 */
export const getUrgencyStyle = (urgency) => {
  const styles = {
    HIGH: {
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      label: '🔴 High Priority',
      badge: 'urgency-high',
    },
    MEDIUM: {
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      label: '🟡 Moderate',
      badge: 'urgency-medium',
    },
    LOW: {
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      label: '🟢 Low Priority',
      badge: 'urgency-low',
    },
  };

  return styles[urgency] || styles.LOW;
};

/**
 * Save symptom to local history
 */
export const saveSymptoamHistory = (symptoms, analysis) => {
  try {
    const history = JSON.parse(localStorage.getItem('symptomHistory')) || [];
    
    const entry = {
      id: Date.now(),
      symptoms,
      analysis,
      timestamp: new Date().toISOString(),
    };

    history.unshift(entry);
    
    // Keep only last 20 entries
    const limitedHistory = history.slice(0, 20);
    localStorage.setItem('symptomHistory', JSON.stringify(limitedHistory));
    
    return entry;
  } catch (error) {
    console.error('Error saving symptom history:', error);
  }
};

/**
 * Get symptom history
 */
export const getSymptoamHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('symptomHistory')) || [];
  } catch (error) {
    console.error('Error retrieving symptom history:', error);
    return [];
  }
};

/**
 * Clear symptom history
 */
export const clearSymptoamHistory = () => {
  try {
    localStorage.removeItem('symptomHistory');
    return true;
  } catch (error) {
    console.error('Error clearing symptom history:', error);
    return false;
  }
};
