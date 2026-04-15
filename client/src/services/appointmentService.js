import axios from 'axios';

// Assuming we have an API Gateway or the service runs directly on port 8083.
// Utilize the Vite proxy or API Gateway mapping
const API_URL = '/api/appointments';

// Utility to get auth headers if/when security is turned back on or token is available
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
};

const appointmentService = {
    bookAppointment: async (appointmentData) => {
        try {
            const response = await axios.post(API_URL, appointmentData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error booking appointment", error);
            throw error;
        }
    },

    getAppointmentsByPatientId: async (patientId) => {
        try {
            const response = await axios.get(`${API_URL}/patient/${patientId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching patient appointments", error);
            throw error;
        }
    },

    getAppointmentsByDoctorId: async (doctorId) => {
        try {
            const response = await axios.get(`${API_URL}/doctor/${doctorId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching doctor appointments", error);
            throw error;
        }
    },

    getAllAppointments: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching all appointments", error);
            throw error;
        }
    },

    updateAppointmentStatus: async (appointmentId, status) => {
        try {
            const response = await axios.put(`${API_URL}/${appointmentId}/status?status=${status}`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error updating appointment status", error);
            throw error;
        }
    },

    cancelAppointment: async (appointmentId) => {
        try {
            const response = await axios.delete(`${API_URL}/${appointmentId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error cancelling appointment", error);
            throw error;
        }
    },

    hardDeleteAppointment: async (appointmentId) => {
        try {
            const response = await axios.delete(`${API_URL}/${appointmentId}/hard`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error hard deleting appointment", error);
            throw error;
        }
    }
};

export default appointmentService;
