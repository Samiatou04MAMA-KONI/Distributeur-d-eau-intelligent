import axios from 'axios';

const API = axios.create({
  baseURL: 'https://distributeur-d-eau-intelligent-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (error) {
        console.error('Erreur parsing token', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API; 