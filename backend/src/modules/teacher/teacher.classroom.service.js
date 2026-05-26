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

const getClassStudents = async (teacherId, classId) => {
  const classInfo = await getTeacherClass(teacherId, classId);
  if (!classInfo) return { classInfo: null, students: [] };

  const result = await pool.query(
    `SELECT u.user_id AS student_id,
            u.full_name,
            u.email
     FROM enrollments e
     JOIN users u ON e.student_id = u.user_id
     WHERE e.class_id = $1 AND u.role = 'student'
     ORDER BY u.full_name`,
    [classId]
  );

  return { classInfo, students: result.rows };
};

const getScheduleInfo = async (teacherId, classId, scheduleId) => {
  const result = await pool.query(
    `SELECT s.schedule_id,
            s.session_date,
            s.start_time,
            s.end_time,
            c.class_id,
            c.class_name
     FROM schedules s
     JOIN classes c ON s.class_id = c.class_id
     WHERE s.schedule_id = $1 AND s.class_id = $2 AND c.teacher_id = $3`,
    [scheduleId, classId, teacherId]
  );
  return result.rows[0];
};

const getScheduleAttendance = async (teacherId, classId, scheduleId) => {
  const schedule = await getScheduleInfo(teacherId, classId, scheduleId);
  if (!schedule) return { schedule: null, students: [] };

  const result = await pool.query(
    `SELECT u.user_id AS student_id,
            u.full_name,
            a.status,
            a.note
     FROM enrollments e
     JOIN users u ON e.student_id = u.user_id
     LEFT JOIN attendance a
       ON a.student_id = e.student_id
      AND a.schedule_id = $1
     WHERE e.class_id = $2 AND u.role = 'student'
     ORDER BY u.full_name`,
    [scheduleId, classId]
  );

  return { schedule, students: result.rows };
};

const saveAttendance = async (teacherId, classId, scheduleId, records) => {
  const client = await pool.connect();
  try {
    const schedule = await getScheduleInfo(teacherId, classId, scheduleId);
    if (!schedule) {
      const error = new Error('Schedule not found');
      error.status = 404;
      throw error;
    }

    const enrolledResult = await client.query(
      `SELECT student_id FROM enrollments WHERE class_id = $1`,
      [classId]
    );
    const enrolledSet = new Set(
      enrolledResult.rows.map((row) => String(row.student_id))
    );

    const invalidStudent = records.find(
      (record) => !enrolledSet.has(String(record.student_id))
    );
    if (invalidStudent) {
      const error = new Error('Invalid student_id');
      error.status = 400;
      throw error;
    }

    await client.query('BEGIN');

    const values = [];
    const placeholders = [];
    records.forEach((record, index) => {
      const base = index * 4;
      values.push(scheduleId, record.student_id, record.status, record.note || null);
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`
      );
    });

    const insertQuery = `
      INSERT INTO attendance (schedule_id, student_id, status, note)
      VALUES ${placeholders.join(',')}
      ON CONFLICT (schedule_id, student_id)
      DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note
    `;

    await client.query(insertQuery, values);
    await client.query('COMMIT');

    return { saved: records.length };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const createClassAnnouncement = async (teacherId, classId, payload) => {
  const classInfo = await getTeacherClass(teacherId, classId);
  if (!classInfo) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO announcements (class_id, author_id, title, content)
     VALUES ($1, $2, $3, $4)
     RETURNING announcement_id, created_at`,
    [classId, teacherId, payload.title, payload.content]
  );

  return {
    announcementId: result.rows[0]?.announcement_id,
    createdAt: result.rows[0]?.created_at,
  };
};

const getClassAnnouncements = async (teacherId, classId) => {
  const classInfo = await getTeacherClass(teacherId, classId);
  if (!classInfo) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  const result = await pool.query(
    `SELECT announcement_id, title, content, created_at, author_id
     FROM announcements
     WHERE class_id = $1
     ORDER BY created_at DESC`,
    [classId]
  );

  return result.rows;
};

module.exports = {
  getTeacherClass,
  getClassStudents,
  getScheduleAttendance,
  saveAttendance,
  createClassAnnouncement,
  getClassAnnouncements,
};
