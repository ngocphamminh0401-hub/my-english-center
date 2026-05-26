import api from './studentApi';

// Dashboard
export const getAdminAnalytics = () =>
  api.get('/api/admin/dashboard/analytics').then((r) => r.data);

// Users
export const getAdminUsers = (params) =>
  api.get('/api/admin/users', { params }).then((r) => r.data);

export const createAdminUser = (payload) =>
  api.post('/api/admin/users', payload).then((r) => r.data);

export const updateAdminUser = (userId, payload) =>
  api.put(`/api/admin/users/${userId}`, payload).then((r) => r.data);

export const deactivateAdminUser = (userId) =>
  api.delete(`/api/admin/users/${userId}`).then((r) => r.data);

// Catalog - Courses
export const getAdminCourses = () =>
  api.get('/api/admin/catalog/courses').then((r) => r.data);

export const createAdminCourse = (payload) =>
  api.post('/api/admin/catalog/courses', payload).then((r) => r.data);

export const updateAdminCourse = (courseId, payload) =>
  api.put(`/api/admin/catalog/courses/${courseId}`, payload).then((r) => r.data);

export const deleteAdminCourse = (courseId) =>
  api.delete(`/api/admin/catalog/courses/${courseId}`).then((r) => r.data);

// Catalog - Rooms & Teachers (dropdowns)
export const getAdminRooms = (branchId) =>
  api.get('/api/admin/catalog/rooms', { params: branchId ? { branch_id: branchId } : {} }).then((r) => r.data);

export const getAdminTeachers = () =>
  api.get('/api/admin/catalog/teachers').then((r) => r.data);

// Catalog - Classes
export const getAdminClasses = () =>
  api.get('/api/admin/catalog/classes').then((r) => r.data);

export const createAdminClass = (payload) =>
  api.post('/api/admin/catalog/classes', payload).then((r) => r.data);

export const updateAdminClass = (classId, payload) =>
  api.put(`/api/admin/catalog/classes/${classId}`, payload).then((r) => r.data);

export const deleteAdminClass = (classId) =>
  api.delete(`/api/admin/catalog/classes/${classId}`).then((r) => r.data);

// Enrollments
export const getEnrollments = (classId) =>
  api.get('/api/admin/enrollments', { params: { class_id: classId } }).then((r) => r.data);

export const addEnrollment = (payload) =>
  api.post('/api/admin/enrollments', payload).then((r) => r.data);

export const removeEnrollment = (payload) =>
  api.delete('/api/admin/enrollments', { data: payload }).then((r) => r.data);
