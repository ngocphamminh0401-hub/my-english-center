import api from './studentApi';

export const getTeacherDashboardStats = async () => {
  const response = await api.get('/api/teacher/dashboard/stats');
  return response.data;
};

export const getTeacherSchedules = async (params) => {
  const response = await api.get('/api/teacher/schedules', { params });
  return response.data;
};

export const getTeacherClasses = async () => {
  const response = await api.get('/api/teacher/classes');
  return response.data;
};
