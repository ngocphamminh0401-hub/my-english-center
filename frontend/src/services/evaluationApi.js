import api from './studentApi';

export const getEvaluationStatus = async () => {
  const response = await api.get('/api/student/classes/evaluation-status');
  return response.data;
};

export const submitEvaluation = async (payload) => {
  const response = await api.post('/api/student/evaluations', payload);
  return response.data;
};
