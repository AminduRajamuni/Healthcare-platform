import axios from 'axios';

const API_URL = '/api/admin';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
};

const adminService = {
    getPlatformStats: async () => {
        try {
            const response = await axios.get(`${API_URL}/system/stats`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching platform stats", error);
            throw error;
        }
    }
};

export default adminService;
