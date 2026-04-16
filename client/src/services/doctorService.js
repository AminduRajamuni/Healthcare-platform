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
    },
    updateDoctor: async (id, doctorData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, doctorData, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error updating doctor ${id}`, error);
            throw error;
        }
    },
    updateDoctorAvailability: async (id, isAvailable) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/availability`, { isAvailable }, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error updating doctor availability ${id}`, error);
            throw error;
        }
    },
    getDoctorSchedules: async (doctorId) => {
        try {
            const response = await axios.get(`${API_URL}/${doctorId}/schedules`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching schedules for doctor ${doctorId}`, error);
            throw error;
        }
    },
    createDoctorSchedule: async (doctorId, payload) => {
        try {
            const response = await axios.post(`${API_URL}/${doctorId}/schedules`, payload, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error creating schedule for doctor ${doctorId}`, error);
            throw error;
        }
    },
    updateDoctorSchedule: async (doctorId, scheduleId, payload) => {
        try {
            const response = await axios.put(`${API_URL}/${doctorId}/schedules/${scheduleId}`, payload, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error updating schedule ${scheduleId}`, error);
            throw error;
        }
    },
    deleteDoctorSchedule: async (doctorId, scheduleId) => {
        try {
            const response = await axios.delete(`${API_URL}/${doctorId}/schedules/${scheduleId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error deleting schedule ${scheduleId}`, error);
            throw error;
        }
    },
    getAvailableDoctorSlots: async (doctorId, date) => {
        try {
            const response = await axios.get(`${API_URL}/${doctorId}/schedules/available-slots`, {
                ...getAuthHeaders(),
                params: { date }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching available slots for doctor ${doctorId}`, error);
            throw error;
        }
    },
    decideAppointment: async (doctorId, appointmentId, decision) => {
        try {
            const response = await axios.put(
                `${API_URL}/${doctorId}/appointments/${appointmentId}/decision`,
                { decision },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error(`Error deciding appointment ${appointmentId}`, error);
            throw error;
        }
    },
    issuePrescription: async (doctorId, patientId, payload) => {
        try {
            const response = await axios.post(
                `${API_URL}/${doctorId}/patients/${patientId}/prescriptions`,
                payload,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error(`Error issuing prescription for patient ${patientId}`, error);
            throw error;
        }
    },
    getPatientReports: async (doctorId, patientId) => {
        try {
            const response = await axios.get(`${API_URL}/${doctorId}/patients/${patientId}/reports`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching reports for patient ${patientId}`, error);
            throw error;
        }
    },
    getTelemedicineSessions: async (doctorId) => {
        try {
            const response = await axios.get(`${API_URL}/${doctorId}/telemedicine/sessions`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching telemedicine sessions for doctor ${doctorId}`, error);
            throw error;
        }
    },
    joinTelemedicineSession: async (doctorId, sessionId) => {
        try {
            const response = await axios.post(
                `${API_URL}/${doctorId}/telemedicine/sessions/${sessionId}/join`,
                {},
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error(`Error joining telemedicine session ${sessionId}`, error);
            throw error;
        }
    },
    endTelemedicineSession: async (doctorId, sessionId) => {
        try {
            const response = await axios.post(
                `${API_URL}/${doctorId}/telemedicine/sessions/${sessionId}/end`,
                {},
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error(`Error ending telemedicine session ${sessionId}`, error);
            throw error;
        }
    }
};

export default doctorService;
