import axios from 'axios';

// Ensure the port corresponds to the payment-service or API Gateway.
// Utilize the Vite proxy or API Gateway mapping
const API_URL = '/api/payments';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
};

const paymentService = {
    getPaymentStatus: async (appointmentId) => {
        try {
            const response = await axios.get(`${API_URL}/appointment/${appointmentId}`, getAuthHeaders());
            // It will return Payment entity with status like "COMPLETED", "PENDING", etc.
            return response.data;
        } catch (error) {
            // If resource not found (payment not made), it might return 404
            console.error("Error fetching payment status, it might not exist yet.", error);
            throw error;
        }
    }
};

export default paymentService;
