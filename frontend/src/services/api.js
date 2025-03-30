import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchTasks = async () => {
  const response = await axios.get(`${API_URL}/tasks`);
  return response.data;
};

export const fetchTask = async (taskId) => {
  const response = await axios.get(`${API_URL}/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await axios.post(`${API_URL}/tasks`, taskData);
  return response.data;
};

export const fetchTaskData = async (taskId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.company) params.append('company', filters.company);
  if (filters.year) params.append('year', filters.year);
  
  const response = await axios.get(`${API_URL}/tasks/${taskId}/data`, { params });
  return response.data;
};

export const fetchTaskAnalytics = async (taskId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.company) params.append('company', filters.company);
    if (filters.year) params.append('year', filters.year);
    
    const response = await axios.get(`${API_URL}/tasks/${taskId}/analytics`, { params });
    return response.data;
};

export const exportTaskData = async (taskId, format = 'csv', filters = {}) => {
  const params = new URLSearchParams();
  params.append('format', format);
  if (filters.company) params.append('company', filters.company);
  if (filters.year) params.append('year', filters.year);
  
  window.location.href = `${API_URL}/tasks/${taskId}/export?${params.toString()}`;
};