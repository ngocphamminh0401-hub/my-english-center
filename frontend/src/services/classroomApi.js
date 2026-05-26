import api from './studentApi';

export const getClassStudents = async (classId) => {
  const response = await api.get(`/api/teacher/classes/${classId}/students`);
  return response.data;
};

export const getClassAttendance = async (classId, scheduleId) => {
  const response = await api.get(
    `/api/teacher/classes/${classId}/schedules/${scheduleId}/attendance`
  );
  return response.data;
};

export const saveClassAttendance = async (classId, scheduleId, payload) => {
  const response = await api.post(
    `/api/teacher/classes/${classId}/schedules/${scheduleId}/attendance`,
    payload
  );
  return response.data;
};

export const getClassAnnouncements = async (classId) => {
  const response = await api.get(`/api/teacher/classes/${classId}/announcements`);
  return response.data;
};

export const createClassAnnouncement = async (classId, payload) => {
  const response = await api.post(
    `/api/teacher/classes/${classId}/announcements`,
    payload
  );
  return response.data;
};
