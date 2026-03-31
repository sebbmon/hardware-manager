import axios from 'axios';

// proxy
const baseURL = '/api/';

const api = axios.create({
  baseURL: baseURL,
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
          await axios.post(`${baseURL}logout/`, {}, { withCredentials: true });
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
