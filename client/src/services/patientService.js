import axios from 'axios';

const API_URL = '/api/patients'; // Uses Vite proxy

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
};

const patientService = {
    getPatientById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching patient ${id}`, error);
            throw error;
        }
    },
    getAllPatients: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            // PatientController returns a paginated list directly (List<PatientListItemDto>)
            return response.data;
        } catch (error) {
            console.error("Error fetching all patients", error);
            throw error;
        }
    },
    deletePatient: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error deleting patient ${id}`, error);
            throw error;
        }
    }
};

export default patientService;
