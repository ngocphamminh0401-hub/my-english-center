const { pool } = require('../../config/db');

const getTeacherClass = async (teacherId, classId) => {
  const result = await pool.query(
    `SELECT class_id, class_name
     FROM classes
     WHERE class_id = $1 AND teacher_id = $2`,
    [classId, teacherId]
  );
  return result.rows[0];
};

const createAssignment = async (teacherId, classId, payload) => {
  const classInfo = await getTeacherClass(teacherId, classId);
  if (!classInfo) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO assignments (class_id, title, description, due_date, file_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING assignment_id`,
    [
      classId,
      payload.title,
      payload.description || null,
      payload.due_date || null,
      payload.file_url || null,
    ]
  );

  return {
    assignmentId: result.rows[0]?.assignment_id,
    className: classInfo.class_name,
  };
};

const getAssignmentsForClass = async (teacherId, classId) => {
  const classInfo = await getTeacherClass(teacherId, classId);
  if (!classInfo) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  const result = await pool.query(
    `SELECT a.assignment_id,
            a.title,
            a.description,
            a.due_date,
            a.file_url,
            COUNT(s.submission_id) FILTER (WHERE s.status = 'submitted') AS pending_count,
            COUNT(s.submission_id) FILTER (WHERE s.status = 'graded') AS graded_count,
            COUNT(s.submission_id) AS total_submissions
     FROM assignments a
     LEFT JOIN submissions s ON s.assignment_id = a.assignment_id
     WHERE a.class_id = $1
     GROUP BY a.assignment_id
     ORDER BY a.due_date DESC NULLS LAST`,
    [classId]
  );

  return {
    classInfo,
    assignments: result.rows,
  };
};

const getSubmissionsBoard = async (teacherId, assignmentId) => {
  const assignmentResult = await pool.query(
    `SELECT a.assignment_id,
            a.title,
            a.description,
            a.due_date,
            a.file_url,
            a.class_id,
            c.class_name
     FROM assignments a
     JOIN classes c ON a.class_id = c.class_id
     WHERE a.assignment_id = $1 AND c.teacher_id = $2`,
    [assignmentId, teacherId]
  );

  if (assignmentResult.rowCount === 0) {
    const error = new Error('Assignment not found');
    error.status = 404;
    throw error;
  }

  const assignment = assignmentResult.rows[0];

  const studentsResult = await pool.query(
    `SELECT u.user_id AS student_id,
            u.full_name,
            s.submission_id,
            s.status,
            s.content,
            s.file_url,
            s.grade,
            s.teacher_comment
     FROM enrollments e
     JOIN users u ON e.student_id = u.user_id
     LEFT JOIN submissions s
       ON s.assignment_id = $1
      AND s.student_id = u.user_id
     WHERE e.class_id = $2 AND u.role = 'student'
     ORDER BY u.full_name`,
    [assignmentId, assignment.class_id]
  );

  const notSubmitted = [];
  const pending = [];
  const graded = [];

  studentsResult.rows.forEach((row) => {
    const item = {
      studentId: row.student_id,
      fullName: row.full_name,
      submissionId: row.submission_id,
      status: row.status,
      content: row.content,
      fileUrl: row.file_url,
      grade: row.grade,
      teacherComment: row.teacher_comment,
    };

    if (!row.submission_id) {
      notSubmitted.push(item);
    } else if (row.status === 'graded') {
      graded.push(item);
    } else {
      pending.push(item);
    }
  });

  return { assignment, notSubmitted, pending, graded };
};

const gradeSubmission = async (teacherId, submissionId, payload) => {
  const submissionResult = await pool.query(
    `SELECT s.submission_id,
            a.assignment_id,
            c.class_id
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.assignment_id
     JOIN classes c ON a.class_id = c.class_id
     WHERE s.submission_id = $1 AND c.teacher_id = $2`,
    [submissionId, teacherId]
  );

  if (submissionResult.rowCount === 0) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  await pool.query(
    `UPDATE submissions
     SET grade = $1,
         teacher_comment = $2,
         status = 'graded'
     WHERE submission_id = $3`,
    [payload.grade, payload.teacher_comment, submissionId]
  );

  return { submissionId };
};

module.exports = {
  createAssignment,
  getAssignmentsForClass,
  getSubmissionsBoard,
  gradeSubmission,
};
