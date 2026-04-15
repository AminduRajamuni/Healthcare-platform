import axios from 'axios';

const API_URL = '/api/doctors'; // Uses Vite proxy

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
};

const doctorService = {
    getAllDoctors: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            // It could be wrapped in an object or just a plain list
            // E.g. { content: [...] } for pagination or [...] for direct list.
            return response.data.content ? response.data.content : response.data;
        } catch (error) {
            console.error("Error fetching doctors", error);
            throw error;
        }
    },
    getDoctorById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching doctor ${id}`, error);
            throw error;
        }
    },
    getDoctorByEmail: async (email) => {
        try {
            const response = await axios.get(`${API_URL}/email/${email}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching doctor by email ${email}`, error);
            throw error;
        }
    },
    verifyDoctor: async (id) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/verify`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error verifying doctor ${id}`, error);
            throw error;
        }
    },
    deleteDoctor: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error deleting doctor ${id}`, error);
            throw error;
        }
    }
};

export default doctorService;
