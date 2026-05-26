const { pool } = require('../../config/db');

/**
 * Fetches all scheduled sessions in the given date range.
 * Join path: schedules → classes → rooms → branches → users (teacher)
 * NOTE: Assumes schedules.room_id. If room_id lives on classes, change the JOIN accordingly.
 */
const getMasterSchedule = async ({ startDate, endDate, branchId }) => {
  const params = [startDate, endDate];
  let branchFilter = '';

  if (branchId) {
    params.push(branchId);
    branchFilter = `AND b.branch_id = $${params.length}`;
  }

  const result = await pool.query(
    `SELECT
       s.schedule_id,
       s.session_date,
       s.start_time,
       s.end_time,
       c.class_id,
       c.class_name,
       r.room_id,
       r.room_name,
       b.branch_id,
       b.branch_name,
       u.full_name  AS teacher_name,
       COUNT(e.student_id) AS enrolled_count
     FROM schedules s
     JOIN classes  c ON c.class_id   = s.class_id
     JOIN rooms    r ON r.room_id    = s.room_id
     JOIN branches b ON b.branch_id  = r.branch_id
     JOIN users    u ON u.user_id    = c.teacher_id
     LEFT JOIN enrollments e ON e.class_id = c.class_id
     WHERE s.session_date BETWEEN $1 AND $2
       ${branchFilter}
     GROUP BY
       s.schedule_id, s.session_date, s.start_time, s.end_time,
       c.class_id,   c.class_name,
       r.room_id,    r.room_name,
       b.branch_id,  b.branch_name,
       u.full_name
     ORDER BY s.session_date, s.start_time`,
    params
  );

  return result.rows.map((row) => ({
    scheduleId: row.schedule_id,
    date: row.session_date instanceof Date
      ? row.session_date.toISOString().substring(0, 10)
      : String(row.session_date),
    startTime: row.start_time,
    endTime: row.end_time,
    classId: row.class_id,
    className: row.class_name,
    roomId: row.room_id,
    roomName: row.room_name,
    branchId: row.branch_id,
    branchName: row.branch_name,
    teacherName: row.teacher_name,
    enrolledCount: Number(row.enrolled_count || 0),
  }));
};

const getBranches = async () => {
  const result = await pool.query(
    `SELECT branch_id, branch_name FROM branches ORDER BY branch_name`
  );
  return result.rows.map((row) => ({
    branchId: row.branch_id,
    branchName: row.branch_name,
  }));
};

module.exports = { getMasterSchedule, getBranches };
