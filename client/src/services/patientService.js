import axios from 'axios';

const API_URL = '/api/patients'; // Uses Vite proxy

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const rawRole = localStorage.getItem('role');
    const role = rawRole ? rawRole.toUpperCase().replace(/^ROLE_/, '') : null;
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...(userId && { 'X-User-Id': userId }),
            ...(role && { 'X-User-Role': role })
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
    updatePatient: async (id, payload) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, payload, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error updating patient ${id}`, error);
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
    },
    getMedicalHistory: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}/medical-history`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching medical history for patient ${id}`, error);
            throw error;
        }
    },
    getPrescriptions: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}/prescriptions`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching prescriptions for patient ${id}`, error);
            throw error;
        }
    },
    getMedicalReports: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}/reports`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching medical reports for patient ${id}`, error);
            throw error;
        }
    },
    uploadMedicalReport: async (id, file, description) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            const headers = {
                ...(token && { 'Authorization': `Bearer ${token}` })
            };

            const response = await axios.post(`${API_URL}/${id}/reports`, formData, { headers });
            return response.data;
        } catch (error) {
            console.error(`Error uploading medical report for patient ${id}`, error);
            throw error;
        }
    },
    deleteMedicalReport: async (id, reportId) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}/reports/${reportId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error deleting medical report ${reportId} for patient ${id}`, error);
            throw error;
        }
    },
    searchDoctors: async (specialty) => {
        try {
            const params = specialty ? { specialty } : {};
            const response = await axios.get(`${API_URL}/doctors/search`, {
                ...getAuthHeaders(),
                params
            });
            return response.data;
        } catch (error) {
            console.error('Error searching doctors', error);
            throw error;
        }
    },
    getPatientsByDoctor: async (doctorId) => {
        try {
            const response = await axios.get(`${API_URL}/doctor/${doctorId}/summary`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching patients for doctor ${doctorId}`, error);
            throw error;
        }
    }
};

export default patientService;
