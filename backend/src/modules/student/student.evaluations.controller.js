const { pool } = require('../../config/db');

const getEvaluationStatus = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;
    const result = await pool.query(
      `SELECT cl.class_id,
              cl.teacher_id,
              cl.class_name,
              c.max_sessions,
              COUNT(a.attendance_id) AS attended_sessions
       FROM classes cl
       JOIN courses c ON cl.course_id = c.course_id
       JOIN enrollments e ON e.class_id = cl.class_id AND e.student_id = $1
       JOIN schedules s ON s.class_id = cl.class_id
       JOIN attendance a
         ON a.schedule_id = s.schedule_id
        AND a.student_id = $1
        AND a.status = 'present'
       LEFT JOIN teacher_evaluations te
         ON te.class_id = cl.class_id
        AND te.student_id = $1
       GROUP BY cl.class_id, cl.teacher_id, cl.class_name, c.max_sessions
       HAVING COUNT(a.attendance_id) >= c.max_sessions
          AND COUNT(te.evaluation_id) = 0`,
      [studentId]
    );

    const classes = result.rows.map((row) => ({
      classId: row.class_id,
      className: row.class_name,
      teacherId: row.teacher_id,
      maxSessions: Number(row.max_sessions),
      attendedSessions: Number(row.attended_sessions),
    }));

    res.json({ classes });
  } catch (error) {
    next(error);
  }
};

const submitEvaluation = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const studentId = req.user.user_id;
    const { class_id: classId, teacher_id: teacherId, rating, comment } = req.body;

    if (!classId || !teacherId) {
      return res.status(400).json({ message: 'class_id and teacher_id are required' });
    }

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT evaluation_id
       FROM teacher_evaluations
       WHERE class_id = $1 AND student_id = $2`,
      [classId, studentId]
    );

    if (existing.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Evaluation already submitted' });
    }

    const classResult = await client.query(
      `SELECT cl.class_id,
              cl.teacher_id,
              c.max_sessions,
              COUNT(a.attendance_id) AS attended_sessions
       FROM classes cl
       JOIN courses c ON cl.course_id = c.course_id
       JOIN enrollments e ON e.class_id = cl.class_id AND e.student_id = $2
       LEFT JOIN schedules s ON s.class_id = cl.class_id
       LEFT JOIN attendance a
         ON a.schedule_id = s.schedule_id
        AND a.student_id = $2
        AND a.status = 'present'
       WHERE cl.class_id = $1
       GROUP BY cl.class_id, cl.teacher_id, c.max_sessions`,
      [classId, studentId]
    );

    if (classResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Forbidden' });
    }

    const classInfo = classResult.rows[0];
    if (String(classInfo.teacher_id) !== String(teacherId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Invalid teacher_id' });
    }

    if (Number(classInfo.attended_sessions) < Number(classInfo.max_sessions)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Class not completed yet' });
    }

    const insert = await client.query(
      `INSERT INTO teacher_evaluations (
         class_id,
         student_id,
         teacher_id,
         rating,
         comment
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING evaluation_id`,
      [classId, studentId, classInfo.teacher_id, ratingValue, comment || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ evaluationId: insert.rows[0].evaluation_id });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

module.exports = { getEvaluationStatus, submitEvaluation };
