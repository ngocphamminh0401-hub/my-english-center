import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ec_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('ec_token');
      localStorage.removeItem('ec_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getStudentDashboard = async () => {
  const response = await api.get('/api/student/dashboard');
  return response.data;
};

export const getStudentCourses = async () => {
  const response = await api.get('/api/student/courses');
  return response.data;
};

export const getStudentSchedule = async () => {
  const response = await api.get('/api/student/schedule');
  return response.data;
};

export const getStudentAnnouncements = async () => {
  const response = await api.get('/api/student/announcements');
  return response.data;
};

export default api;
