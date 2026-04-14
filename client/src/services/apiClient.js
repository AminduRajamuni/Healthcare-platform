/**
 * API Client - Base HTTP utility for all API calls
 * Handles authentication, error handling, and request/response formatting
 */

const API_BASE_URL = 'http://localhost:8084'; // API Gateway

/**
 * Get authorization token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken') || null;
};

/**
 * Get user role from localStorage
 */
const getUserRole = () => {
  return localStorage.getItem('userRole') || 'PATIENT';
};

/**
 * Make HTTP requests with automatic auth headers and error handling
 */
export const apiCall = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
  } = options;

  const token = getAuthToken();
  const role = getUserRole();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-User-Role': role,
    ...headers,
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    method,
    headers: defaultHeaders,
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, fetchOptions);

    // Handle response
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.message || data?.error || 'API Error',
        data,
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * GET request
 */
export const get = (endpoint, headers = {}) => {
  return apiCall(endpoint, { method: 'GET', headers });
};

/**
 * POST request
 */
export const post = (endpoint, body, headers = {}) => {
  return apiCall(endpoint, { method: 'POST', body, headers });
};

/**
 * PUT request
 */
export const put = (endpoint, body, headers = {}) => {
  return apiCall(endpoint, { method: 'PUT', body, headers });
};

/**
 * DELETE request
 */
export const deleteRequest = (endpoint, headers = {}) => {
  return apiCall(endpoint, { method: 'DELETE', headers });
};
