const { pool } = require('../../config/db');

const getCourses = async () => {
  const result = await pool.query(
    `SELECT course_id, title, description, max_sessions
     FROM courses
     ORDER BY title`
  );
  return result.rows;
};

const createCourse = async (payload) => {
  const result = await pool.query(
    `INSERT INTO courses (title, description, max_sessions)
     VALUES ($1, $2, $3)
     RETURNING course_id`,
    [payload.title, payload.description || null, payload.max_sessions]
  );
  return { courseId: result.rows[0]?.course_id };
};

const updateCourse = async (courseId, payload) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (payload.title !== undefined) {
    fields.push(`title = $${index}`);
    values.push(payload.title);
    index += 1;
  }
  if (payload.description !== undefined) {
    fields.push(`description = $${index}`);
    values.push(payload.description || null);
    index += 1;
  }
  if (payload.max_sessions !== undefined) {
    fields.push(`max_sessions = $${index}`);
    values.push(payload.max_sessions);
    index += 1;
  }

  const result = await pool.query(
    `UPDATE courses SET ${fields.join(', ')} WHERE course_id = $${index}`,
    [...values, courseId]
  );

  return { updated: result.rowCount };
};

const deleteCourse = async (courseId) => {
  const result = await pool.query(
    `DELETE FROM courses WHERE course_id = $1`,
    [courseId]
  );
  return { deleted: result.rowCount };
};

const getTeachersForSelect = async () => {
  const result = await pool.query(
    `SELECT user_id, full_name FROM users WHERE role = 'teacher' AND is_active = TRUE ORDER BY full_name`
  );
  return result.rows;
};

const getBranches = async () => {
  const result = await pool.query(
    `SELECT branch_id, branch_name
     FROM branches
     ORDER BY branch_name`
  );
  return result.rows;
};

const getRooms = async (branchId) => {
  const values = [];
  let query = `SELECT room_id, room_name, branch_id FROM rooms`;
  if (branchId) {
    query += ` WHERE branch_id = $1`;
    values.push(branchId);
  }
  query += ` ORDER BY room_name`;
  const result = await pool.query(query, values);
  return result.rows;
};

const getClasses = async () => {
  const result = await pool.query(
    `SELECT c.class_id,
            c.class_name,
            c.max_students,
            c.start_date,
            c.end_date,
            c.course_id,
            co.title AS course_name,
            c.branch_id,
            b.branch_name,
            c.room_id,
            r.room_name,
            c.teacher_id,
            u.full_name AS teacher_name
     FROM classes c
     LEFT JOIN courses co ON c.course_id = co.course_id
     LEFT JOIN branches b ON c.branch_id = b.branch_id
     LEFT JOIN rooms r ON c.room_id = r.room_id
     LEFT JOIN users u ON c.teacher_id = u.user_id
     ORDER BY c.class_name`
  );
  return result.rows;
};

const createClass = async (payload) => {
  const result = await pool.query(
    `INSERT INTO classes (
        class_name,
        course_id,
        branch_id,
        room_id,
        teacher_id,
        max_students,
        start_date,
        end_date
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING class_id`,
    [
      payload.class_name,
      payload.course_id,
      payload.branch_id,
      payload.room_id || null,
      payload.teacher_id,
      payload.max_students,
      payload.start_date || null,
      payload.end_date || null,
    ]
  );
  return { classId: result.rows[0]?.class_id };
};

const updateClass = async (classId, payload) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    fields.push(`${key} = $${index}`);
    values.push(value === '' ? null : value);
    index += 1;
  });

  const result = await pool.query(
    `UPDATE classes SET ${fields.join(', ')} WHERE class_id = $${index}`,
    [...values, classId]
  );

  return { updated: result.rowCount };
};

const deleteClass = async (classId) => {
  const result = await pool.query(
    `DELETE FROM classes WHERE class_id = $1`,
    [classId]
  );
  return { deleted: result.rowCount };
};

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeachersForSelect,
  getBranches,
  getRooms,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
};
