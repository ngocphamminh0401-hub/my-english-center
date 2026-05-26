const {
  createAssignment,
  getAssignmentsForClass,
  getSubmissionsBoard,
  gradeSubmission,
} = require('./teacher.assignments.service');

const createAssignmentHandler = async (req, res, next) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    const teacherId = req.user.user_id;
    const { class_id: classId } = req.params;
    const { title, description, due_date: dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await createAssignment(teacherId, classId, {
      title,
      description,
      due_date: dueDate || null,
      file_url: fileUrl,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const getAssignmentsForClassHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { class_id: classId } = req.params;
    const result = await getAssignmentsForClass(teacherId, classId);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const getSubmissionsBoardHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { assignment_id: assignmentId } = req.params;
    const board = await getSubmissionsBoard(teacherId, assignmentId);
    res.json(board);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const gradeSubmissionHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { submission_id: submissionId } = req.params;
    const { grade, teacher_comment: teacherComment } = req.body;

    if (grade === undefined || grade === null || Number.isNaN(Number(grade))) {
      return res.status(400).json({ message: 'Grade is required' });
    }

    const result = await gradeSubmission(teacherId, submissionId, {
      grade: Number(grade),
      teacher_comment: teacherComment || null,
    });

    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createAssignmentHandler,
  getAssignmentsForClassHandler,
  getSubmissionsBoardHandler,
  gradeSubmissionHandler,
};
