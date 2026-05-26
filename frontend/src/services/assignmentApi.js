import api from './studentApi';

export const getStudentAssignments = async () => {
  const response = await api.get('/api/student/assignments');
  return response.data;
};

export const submitAssignment = async (assignmentId, payload) => {
  const formData = new FormData();
  if (payload.content) {
    formData.append('content', payload.content);
  }
  if (payload.file) {
    formData.append('file', payload.file);
  }

  const response = await api.post(
    `/api/student/assignments/${assignmentId}/submit`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

export const getAssignmentFeedback = async (assignmentId) => {
  const response = await api.get(
    `/api/student/assignments/${assignmentId}/feedback`
  );
  return response.data;
};
