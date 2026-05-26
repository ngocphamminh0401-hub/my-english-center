const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticate, requireRole } = require('../../middlewares/auth');
const {
  getDashboardStatsHandler,
  getSchedulesHandler,
  getTeacherClassesHandler,
} = require('./teacher.controller');
const {
  getClassStudentsHandler,
  getAttendanceHandler,
  saveAttendanceHandler,
  createAnnouncementHandler,
  getAnnouncementsHandler,
} = require('./teacher.classroom.controller');
const {
  createAssignmentHandler,
  getAssignmentsForClassHandler,
  getSubmissionsBoardHandler,
  gradeSubmissionHandler,
} = require('./teacher.assignments.controller');

const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = new Set(['.pdf', '.mp3', '.wav']);
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const timestamp = Date.now();
    cb(null, `assignment_${req.user.user_id}_${timestamp}_${safeName}`);
  },
});

const assignmentUpload = multer({
  storage: assignmentStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      req.fileValidationError =
        'Chỉ hỗ trợ file PDF hoặc Audio (mp3, wav).';
      return cb(null, false);
    }
    return cb(null, true);
  },
});

const router = express.Router();

router.use(authenticate, requireRole('teacher'));

router.get('/dashboard/stats', getDashboardStatsHandler);
router.get('/schedules', getSchedulesHandler);
router.get('/classes', getTeacherClassesHandler);
router.get('/classes/:class_id/students', getClassStudentsHandler);
router.get(
  '/classes/:class_id/schedules/:schedule_id/attendance',
  getAttendanceHandler
);
router.post(
  '/classes/:class_id/schedules/:schedule_id/attendance',
  saveAttendanceHandler
);
router.get('/classes/:class_id/announcements', getAnnouncementsHandler);
router.post('/classes/:class_id/announcements', createAnnouncementHandler);
router.get('/classes/:class_id/assignments', getAssignmentsForClassHandler);
router.post(
  '/classes/:class_id/assignments',
  assignmentUpload.single('file'),
  createAssignmentHandler
);
router.get(
  '/assignments/:assignment_id/submissions-board',
  getSubmissionsBoardHandler
);
router.put('/submissions/:submission_id/grade', gradeSubmissionHandler);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File size exceeds 20MB' });
    }
    return res.status(400).json({ message: err.message });
  }
  return next(err);
});

module.exports = router;
