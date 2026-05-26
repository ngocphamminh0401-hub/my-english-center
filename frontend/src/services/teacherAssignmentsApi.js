import api from './studentApi';

export const getTeacherAssignments = async (classId) => {
  const response = await api.get(`/api/teacher/classes/${classId}/assignments`);
  return response.data;
};

export const createTeacherAssignment = async (classId, payload) => {
  const formData = new FormData();
  formData.append('title', payload.title);
  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (payload.due_date) {
    formData.append('due_date', payload.due_date);
  }
  if (payload.file) {
    formData.append('file', payload.file);
  }

  const response = await api.post(
    `/api/teacher/classes/${classId}/assignments`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const getSubmissionsBoard = async (assignmentId) => {
  const response = await api.get(
    `/api/teacher/assignments/${assignmentId}/submissions-board`
  );
  return response.data;
};

export const gradeSubmission = async (submissionId, payload) => {
  const response = await api.put(
    `/api/teacher/submissions/${submissionId}/grade`,
    payload
  );
  return response.data;
};
