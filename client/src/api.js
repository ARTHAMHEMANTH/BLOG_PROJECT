import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'),
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error("API ERROR:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default api;
