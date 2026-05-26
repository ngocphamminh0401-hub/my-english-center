const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticate, requireRole } = require('../../middlewares/auth');
const { getDashboard, getCourses, getPersonalSchedule, getAnnouncements } = require('./student.controller');
const {
  getAssignments,
  submitAssignment,
  getAssignmentFeedback,
} = require('./student.assignments.controller');
const {
  getEvaluationStatus,
  submitEvaluation,
} = require('./student.evaluations.controller');

const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedExtensions = new Set(['.doc', '.docx', '.pdf', '.mp3', '.wav']);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const timestamp = Date.now();
    cb(null, `${req.user.user_id}_${timestamp}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      req.fileValidationError =
        'Chỉ hỗ trợ file Word, PDF hoặc Audio (mp3, wav).';
      return cb(null, false);
    }
    return cb(null, true);
  },
});

const router = express.Router();

router.use(authenticate, requireRole('student'));

router.get('/dashboard', getDashboard);
router.get('/courses', getCourses);
router.get('/schedule', getPersonalSchedule);
router.get('/announcements', getAnnouncements);
router.get('/assignments', getAssignments);
router.post(
  '/assignments/:assignment_id/submit',
  upload.single('file'),
  submitAssignment
);
router.get('/assignments/:assignment_id/feedback', getAssignmentFeedback);
router.get('/classes/evaluation-status', getEvaluationStatus);
router.post('/evaluations', submitEvaluation);

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ message: 'File size exceeds 10MB' });
    }
    return res.status(400).json({ message: err.message });
  }
  return next(err);
});

module.exports = router;
