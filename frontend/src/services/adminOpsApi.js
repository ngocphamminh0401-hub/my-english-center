import api from './studentApi';

export const getBranches = async () => {
  const response = await api.get('/api/admin/branches');
  return response.data.branches;
};

/**
 * Fetches the master schedule for a date range.
 * @param {{ startDate: string, endDate: string, branchId?: number|null }} params
 */
export const getMasterSchedule = async ({ startDate, endDate, branchId }) => {
  const params = { start_date: startDate, end_date: endDate };
  if (branchId != null) params.branch_id = branchId;

  const response = await api.get('/api/admin/master-schedule', { params });
  return response.data.schedules;
};

/**
 * Sends a system-wide broadcast announcement.
 * @param {{ title: string, content: string, targetType: 'all'|'teachers'|'students' }} payload
 */
export const createBroadcast = async ({ title, content, targetType }) => {
  const response = await api.post('/api/admin/broadcasts', {
    title,
    content,
    targetType,
  });
  return response.data;
};
