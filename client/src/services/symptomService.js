import axios from 'axios';

const API_URL = '/api/symptoms';

// Utility to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
};

const symptomService = {
    analyzeSymptoms: async (symptoms) => {
        try {
            const response = await axios.post(
                `${API_URL}/analyze`,
                { symptoms },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error("Error analyzing symptoms", error);
            throw error;
        }
    }
};

export default symptomService;
