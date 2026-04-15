import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  setup:   (data) => api.post('/auth/setup', data),
  login:   (data) => api.post('/auth/login', data),
  logout:  ()     => api.post('/auth/logout'),
  refresh: (data) => api.post('/auth/refresh', data),
};

// ── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  list:       ()       => api.get('/users'),
  get:        (id)     => api.get(`/users/${id}`),
  create:     (data)   => api.post('/users', data),
  update:     (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id)     => api.delete(`/users/${id}`),
  me:         ()       => api.get('/users/me'),
  updatePass: (data)   => api.put('/users/me/password', data),
};

// ── Tasks ─────────────────────────────────────────────────────
export const tasksAPI = {
  list:       (params) => api.get('/tasks', { params }),
  get:        (id)     => api.get(`/tasks/${id}`),
  create:     (data)   => api.post('/tasks', data),
  update:     (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus:(id, status) => api.patch(`/tasks/${id}/status`, { status }),
  remove:     (id)     => api.delete(`/tasks/${id}`),
  overdue:    ()       => api.get('/tasks/overdue'),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
  byUser:  () => api.get('/dashboard/by-user'),
};
