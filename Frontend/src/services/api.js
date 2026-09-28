import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Interceptor to attach Bearer Token to outgoing requests if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTH APIS
export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfileApi = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const changePasswordApi = async (data) => {
  const response = await api.post('/auth/change-password', data);
  return response.data;
};

// RESUME & ANALYSIS APIS
export const uploadResumeApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeResumeApi = async (data) => {
  const response = await api.post('/analysis/analyze', data);
  return response.data;
};

export const chatWithAnalysisApi = async (data) => {
  const response = await api.post('/analysis/chat', data);
  return response.data;
};

export const getHistoryApi = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const getAnalysisByIdApi = async (id) => {
  const response = await api.get(`/history/${id}`);
  return response.data;
};

export const deleteAnalysisApi = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

export default api;
