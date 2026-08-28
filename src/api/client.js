import axios from 'axios';

// ── Base config ───────────────────────────────────────────────────────────────
const BASE_URL     = import.meta.env.VITE_API_BASE_URL;
const AUTH_KEY     = import.meta.env.VITE_AUTHORIZATION_KEY || '';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor ───────────────────────────────────────────────────────
client.interceptors.request.use(
  (config) => {
    if (AUTH_KEY) {
      config.headers['Authorization-Key'] = AUTH_KEY;
    }

    const token = sessionStorage.getItem('mala_bistronome__auth_token');
    if (token) {
      config.headers['Authorization'] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
function handleSessionExpiry() {
  sessionStorage.removeItem('mala_bistronome__auth_token');
  sessionStorage.removeItem('mala_bistronome__mobileNo');
  sessionStorage.removeItem('mala_bistronome__user');
  window.location.href = '/login';
}

client.interceptors.response.use(
  (response) => {
    const { responseCode, responseMessage } = response.data || {};
    if (responseCode === '30') {
      handleSessionExpiry();
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    if (responseCode !== undefined && responseCode !== '00') {
      const msg =
        responseMessage?.english ||
        (typeof responseMessage === 'string' ? responseMessage : null) ||
        `API error (code: ${responseCode})`;
      return Promise.reject(new Error(msg));
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      handleSessionExpiry();
    }
    const friendlyMessage =
      status === 404 ? 'The requested information could not be found. Please try again.' :
      status === 500 ? 'Something went wrong on our end. Please try again shortly.' :
      status === 503 ? 'The service is temporarily unavailable. Please try again later.' :
      error.message === 'Network Error' ? 'Unable to connect. Please check your internet connection.' :
      error.code === 'ECONNABORTED' ? 'The request took too long. Please try again.' :
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(friendlyMessage));
  }
);

export default client;
