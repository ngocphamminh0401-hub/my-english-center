const { pool } = require('../../config/db');

const getEnrollmentsByClass = async (classId) => {
  const enrolledResult = await pool.query(
    `SELECT u.user_id AS student_id,
            u.full_name,
            u.email
     FROM enrollments e
     JOIN users u ON e.student_id = u.user_id
     WHERE e.class_id = $1 AND u.role = 'student'
     ORDER BY u.full_name`,
    [classId]
  );

  const availableResult = await pool.query(
    `SELECT u.user_id AS student_id,
            u.full_name,
            u.email
     FROM users u
     WHERE u.role = 'student'
       AND u.user_id NOT IN (
         SELECT student_id FROM enrollments WHERE class_id = $1
       )
     ORDER BY u.full_name`,
    [classId]
  );

  return {
    enrolled: enrolledResult.rows,
    available: availableResult.rows,
  };
};

const addEnrollment = async (classId, studentId) => {
  const exists = await pool.query(
    `SELECT 1 FROM enrollments WHERE class_id = $1 AND student_id = $2`,
    [classId, studentId]
  );
  if (exists.rowCount > 0) {
    const error = new Error('Student already enrolled');
    error.status = 409;
    throw error;
  }

  await pool.query(
    `INSERT INTO enrollments (class_id, student_id)
     VALUES ($1, $2)`,
    [classId, studentId]
  );

  return { added: true };
};

const removeEnrollment = async (classId, studentId) => {
  const result = await pool.query(
    `DELETE FROM enrollments WHERE class_id = $1 AND student_id = $2`,
    [classId, studentId]
  );

  if (result.rowCount === 0) {
    const error = new Error('Enrollment not found');
    error.status = 404;
    throw error;
  }

  return { removed: true };
};

module.exports = { getEnrollmentsByClass, addEnrollment, removeEnrollment };
