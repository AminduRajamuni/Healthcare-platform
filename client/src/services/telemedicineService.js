import axios from 'axios';

const API_URL = '/api/sessions';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const rawRole = localStorage.getItem('role');
  const role = rawRole ? rawRole.toUpperCase().replace(/^ROLE_/, '') : null;
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(userId && { 'X-User-Id': userId }),
      ...(role && { 'X-User-Role': role }),
    },
  };
};

const telemedicineService = {
  getAllSessions: async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },

  // Patient-facing
  getSessionsForPatient: async (patientId) => {
    const response = await axios.get(`${API_URL}/patient/${patientId}`, getAuthHeaders());
    return response.data;
  },

  // Doctor-facing
  getSessionsForDoctor: async (doctorId) => {
    const response = await axios.get(`${API_URL}/doctor/${doctorId}`, getAuthHeaders());
    return response.data;
  },

  createSession: async (payload) => {
    const response = await axios.post(API_URL, payload, getAuthHeaders());
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axios.post(`${API_URL}/${id}/join`, {}, getAuthHeaders());
    return response.data;
  },

  endSession: async (id) => {
    const response = await axios.post(`${API_URL}/${id}/end`, {}, getAuthHeaders());
    return response.data;
  },

  addSessionNotes: async (id, notes) => {
    const response = await axios.post(`${API_URL}/${id}/notes`, { notes }, getAuthHeaders());
    return response.data;
  },
};

export default telemedicineService;
