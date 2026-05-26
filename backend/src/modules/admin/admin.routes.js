const express = require('express');
const { authenticate, requireRole } = require('../../middlewares/auth');
const { getDashboardAnalyticsHandler } = require('./admin.dashboard.controller');
const {
  getMasterScheduleHandler,
  getBranchesHandler,
  createBroadcastHandler,
} = require('./admin.masterOps.controller');
const {
  getUsersHandler,
  createUserHandler,
  updateUserHandler,
  deactivateUserHandler,
} = require('./admin.users.controller');
const {
  getCoursesHandler,
  createCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  getRoomsHandler,
  getTeachersHandler,
  getClassesHandler,
  createClassHandler,
  updateClassHandler,
  deleteClassHandler,
} = require('./admin.catalog.controller');
const {
  getEnrollmentsHandler,
  addEnrollmentHandler,
  removeEnrollmentHandler,
} = require('./admin.enrollments.controller');

const router = express.Router();

router.use(authenticate, requireRole('manager'));

// Analytics
router.get('/dashboard/analytics', getDashboardAnalyticsHandler);

// Master Ops
router.get('/master-schedule', getMasterScheduleHandler);
router.get('/branches', getBranchesHandler);
router.post('/broadcasts', createBroadcastHandler);

// User Management
router.get('/users', getUsersHandler);
router.post('/users', createUserHandler);
router.put('/users/:user_id', updateUserHandler);
router.delete('/users/:user_id', deactivateUserHandler);

// Catalog - Courses
router.get('/catalog/courses', getCoursesHandler);
router.post('/catalog/courses', createCourseHandler);
router.put('/catalog/courses/:course_id', updateCourseHandler);
router.delete('/catalog/courses/:course_id', deleteCourseHandler);

// Catalog - Rooms & Teachers (for dropdowns)
router.get('/catalog/rooms', getRoomsHandler);
router.get('/catalog/teachers', getTeachersHandler);

// Catalog - Classes
router.get('/catalog/classes', getClassesHandler);
router.post('/catalog/classes', createClassHandler);
router.put('/catalog/classes/:class_id', updateClassHandler);
router.delete('/catalog/classes/:class_id', deleteClassHandler);

// Enrollments
router.get('/enrollments', getEnrollmentsHandler);
router.post('/enrollments', addEnrollmentHandler);
router.delete('/enrollments', removeEnrollmentHandler);

module.exports = router;
