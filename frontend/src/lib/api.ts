import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {

        // If token is rejected (401), 
        // forcing cookies to be deleted
        try {
          await axios.post('http://localhost:8000/api/logout/', {}, { withCredentials: true });
        } catch (e) {
          // Ignoring logout errors, because we are redirecting anyway
        }

        // Now, with a clean slate, we redirect the user to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
