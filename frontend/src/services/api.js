import axios from 'axios';

const BASE = '/api';

// Expenses
export const expenseAPI = {
  getAll: (params) => axios.get(`${BASE}/expenses`, { params }),
  create: (data) => axios.post(`${BASE}/expenses`, data),
  update: (id, data) => axios.put(`${BASE}/expenses/${id}`, data),
  delete: (id) => axios.delete(`${BASE}/expenses/${id}`),
};

// Income
export const incomeAPI = {
  getAll: (params) => axios.get(`${BASE}/income`, { params }),
  create: (data) => axios.post(`${BASE}/income`, data),
  update: (id, data) => axios.put(`${BASE}/income/${id}`, data),
  delete: (id) => axios.delete(`${BASE}/income/${id}`),
};

// Export
export const exportPDF = () => {
  const token = localStorage.getItem('fintrack_token');
  const link = document.createElement('a');
  link.href = `/api/export/pdf`;
  link.download = 'fintrack-report.pdf';
  // Use fetch with auth header
  fetch('/api/export/pdf', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
    });
};
