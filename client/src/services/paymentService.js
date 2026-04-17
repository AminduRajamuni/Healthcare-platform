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
    getAllPayments: async () => {
        try {
            const response = await axios.get(API_URL, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error fetching payments.", error);
            throw error;
        }
    },
    getPaymentStatus: async (appointmentId) => {
        try {
            const response = await axios.get(`${API_URL}/appointment/${appointmentId}`, getAuthHeaders());
            // It will return Payment entity with status like "COMPLETED", "PENDING", etc.
            return response.data;
        } catch (error) {
            // 404 is expected when no payment record exists for the appointment yet.
            if (error?.response?.status === 404) {
                return null;
            }
            console.error("Error fetching payment status.", error);
            throw error;
        }
    },
    initiatePayHerePayment: async (payload) => {
        try {
            const response = await axios.post(`${API_URL}/payhere/initiate`, payload, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error("Error initiating PayHere payment.", {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
                payload,
            });
            throw error;
        }
    },
    getPaymentByOrderId: async (orderId) => {
        try {
            const response = await axios.get(`${API_URL}/order/${orderId}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error fetching payment by order ${orderId}.`, error);
            throw error;
        }
    },
    cancelPaymentByOrderId: async (orderId) => {
        try {
            const response = await axios.post(`${API_URL}/order/${orderId}/cancel`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error(`Error canceling payment order ${orderId}.`, error);
            throw error;
        }
    }
};

export default paymentService;
