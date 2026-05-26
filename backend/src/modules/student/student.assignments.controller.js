const { pool } = require('../../config/db');

const DUE_SOON_HOURS = 48;

const getAssignments = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;
    const result = await pool.query(
      `SELECT a.assignment_id,
              a.class_id,
              a.title,
              a.description,
              a.due_date,
              s.submission_id,
              s.status AS submission_status,
              s.submitted_at,
              s.content,
              s.file_url,
              s.grade,
              s.teacher_comment
       FROM assignments a
       JOIN enrollments e ON e.class_id = a.class_id
       LEFT JOIN submissions s
         ON s.assignment_id = a.assignment_id
        AND s.student_id = e.student_id
       WHERE e.student_id = $1
       ORDER BY a.due_date ASC NULLS LAST`,
      [studentId]
    );

    const now = new Date();
    const pending = [];
    const submitted = [];
    const graded = [];

    result.rows.forEach((row) => {
      const dueDate = row.due_date ? new Date(row.due_date) : null;
      const diffMs = dueDate ? dueDate - now : null;
      const isDueSoon =
        !row.submission_id &&
        diffMs !== null &&
        diffMs >= 0 &&
        diffMs <= DUE_SOON_HOURS * 60 * 60 * 1000;

      const assignment = {
        assignmentId: row.assignment_id,
        classId: row.class_id,
        title: row.title,
        description: row.description,
        dueDate: row.due_date,
        isDueSoon,
        submittedAt: row.submitted_at,
        content: row.content,
        fileUrl: row.file_url,
        grade: row.grade,
        teacherComment: row.teacher_comment,
      };

      if (!row.submission_id) {
        pending.push(assignment);
      } else if (row.submission_status === 'graded') {
        graded.push(assignment);
      } else {
        submitted.push(assignment);
      }
    });

    res.json({ pending, submitted, graded });
  } catch (error) {
    next(error);
  }
};

const submitAssignment = async (req, res, next) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    const studentId = req.user.user_id;
    const assignmentId = req.params.assignment_id;
    const { content } = req.body;

    const assignmentResult = await pool.query(
      `SELECT a.assignment_id, a.class_id, a.due_date
       FROM assignments a
       JOIN enrollments e ON e.class_id = a.class_id
       WHERE a.assignment_id = $1 AND e.student_id = $2`,
      [assignmentId, studentId]
    );

    if (assignmentResult.rowCount === 0) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const assignment = assignmentResult.rows[0];
    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return res.status(400).json({ message: 'Assignment is overdue' });
    }

    const existingSubmission = await pool.query(
      `SELECT submission_id
       FROM submissions
       WHERE assignment_id = $1 AND student_id = $2`,
      [assignmentId, studentId]
    );

    if (existingSubmission.rowCount > 0) {
      return res.status(409).json({ message: 'Assignment already submitted' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!content && !fileUrl) {
      return res
        .status(400)
        .json({ message: 'Content or file is required' });
    }

    const insertResult = await pool.query(
      `INSERT INTO submissions (
         assignment_id,
         student_id,
         content,
         file_url,
         status,
         submitted_at
       )
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING submission_id, assignment_id, status, submitted_at`,
      [assignmentId, studentId, content || null, fileUrl, 'submitted']
    );

    res.status(201).json({
      submission: insertResult.rows[0],
      fileUrl,
    });
  } catch (error) {
    next(error);
  }
};

const getAssignmentFeedback = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;
    const assignmentId = req.params.assignment_id;

    const result = await pool.query(
      `SELECT submission_id,
              grade,
              teacher_comment,
              status,
              submitted_at
       FROM submissions
       WHERE assignment_id = $1 AND student_id = $2
       LIMIT 1`,
      [assignmentId, studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ feedback: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAssignments, submitAssignment, getAssignmentFeedback };
