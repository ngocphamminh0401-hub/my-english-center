const { pool } = require('../../config/db');

const getDashboardStats = async (teacherId) => {
  const currentClassesResult = await pool.query(
    `SELECT COUNT(*) AS count
     FROM classes
     WHERE teacher_id = $1
       AND start_date <= CURRENT_DATE
       AND end_date >= CURRENT_DATE`,
    [teacherId]
  );

  const pendingSubmissionsResult = await pool.query(
    `SELECT COUNT(*) AS count
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.assignment_id
     JOIN classes c ON a.class_id = c.class_id
     WHERE c.teacher_id = $1 AND s.status = 'submitted'`,
    [teacherId]
  );

  const announcementsResult = await pool.query(
    `SELECT announcement_id, title, content, created_at
     FROM announcements
     WHERE class_id IS NULL
     ORDER BY created_at DESC
     LIMIT 5`
  );

  return {
    currentClasses: Number(currentClassesResult.rows[0]?.count || 0),
    pendingSubmissions: Number(pendingSubmissionsResult.rows[0]?.count || 0),
    announcements: announcementsResult.rows,
  };
};

const getSchedules = async (teacherId, filters) => {
  const conditions = ['c.teacher_id = $1'];
  const values = [teacherId];
  let paramIndex = 2;

  if (filters.status) {
    if (filters.status === 'current') {
      conditions.push('c.start_date <= CURRENT_DATE AND c.end_date >= CURRENT_DATE');
    } else if (filters.status === 'upcoming') {
      conditions.push('c.start_date > CURRENT_DATE');
    } else if (filters.status === 'past') {
      conditions.push('c.end_date < CURRENT_DATE');
    } else {
      const error = new Error('Invalid status');
      error.status = 400;
      throw error;
    }
  }

  if (filters.startDate && filters.endDate) {
    conditions.push(
      `s.session_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`
    );
    values.push(filters.startDate, filters.endDate);
    paramIndex += 2;
  } else if (filters.startDate || filters.endDate) {
    const error = new Error('Invalid date_range');
    error.status = 400;
    throw error;
  }

  const result = await pool.query(
    `SELECT s.schedule_id,
            s.session_date,
            s.start_time,
            s.end_time,
            c.class_id,
            c.class_name,
            r.room_name,
            b.branch_name
     FROM schedules s
     JOIN classes c ON s.class_id = c.class_id
     LEFT JOIN rooms r ON c.room_id = r.room_id
     LEFT JOIN branches b ON r.branch_id = b.branch_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY s.session_date ASC, s.start_time ASC`,
    values
  );

  return result.rows;
};

module.exports = { getDashboardStats, getSchedules };
