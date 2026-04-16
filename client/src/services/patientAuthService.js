const API_BASE_URL = import.meta.env.VITE_PATIENT_SERVICE_URL || 'http://localhost:8080';

export async function loginPatient(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return response.json();
}

export async function registerPatient(data) {
  const response = await fetch(`${API_BASE_URL}/api/patients/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = `Registration failed (${response.status})`;
    throw new Error(message);
  }

  return response.json();
}
