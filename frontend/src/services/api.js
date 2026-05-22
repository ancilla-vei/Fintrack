import axios from 'axios';

const BASE_URL = 'https://fintrack-1-h5ob.onrender.com/api';

// Set auth token for all requests
const token = localStorage.getItem('fintrack_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Interceptor to always attach latest token
axios.interceptors.request.use(config => {
  const t = localStorage.getItem('fintrack_token');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// Expenses
export const expenseAPI = {
  getAll: (params) => axios.get(`${BASE_URL}/expenses`, { params }),
  create: (data) => axios.post(`${BASE_URL}/expenses`, data),
  update: (id, data) => axios.put(`${BASE_URL}/expenses/${id}`, data),
  delete: (id) => axios.delete(`${BASE_URL}/expenses/${id}`),
};

// Income
export const incomeAPI = {
  getAll: (params) => axios.get(`${BASE_URL}/income`, { params }),
  create: (data) => axios.post(`${BASE_URL}/income`, data),
  update: (id, data) => axios.put(`${BASE_URL}/income/${id}`, data),
  delete: (id) => axios.delete(`${BASE_URL}/income/${id}`),
};

// Auth
export const authAPI = {
  login: (data) => axios.post(`${BASE_URL}/auth/login`, data),
  register: (data) => axios.post(`${BASE_URL}/auth/register`, data),
};

// Export PDF
export const exportPDF = () => {
  const token = localStorage.getItem('fintrack_token');
  fetch(`${BASE_URL}/export/pdf`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fintrack-report.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    });
};