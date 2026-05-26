const { pool } = require('../../config/db');
const { getDashboardStats, getSchedules } = require('./teacher.service');

const getDashboardStatsHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const stats = await getDashboardStats(teacherId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const getSchedulesHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { status, date_range: dateRange, start_date: startDate, end_date: endDate } = req.query;
    let start = startDate;
    let end = endDate;

    if (dateRange) {
      const parts = String(dateRange).split(',');
      if (parts.length === 2) {
        [start, end] = parts;
      } else {
        return res.status(400).json({ message: 'Invalid date_range' });
      }
    }

    const schedules = await getSchedules(teacherId, {
      status,
      startDate: start,
      endDate: end,
    });

    res.json({ schedules });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const getTeacherClassesHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { rows } = await pool.query(
      `SELECT cl.class_id, cl.class_name, cl.start_date, cl.end_date,
              co.title AS course_title,
              b.branch_name, r.room_name,
              COUNT(DISTINCT e.student_id) AS student_count,
              COUNT(DISTINCT s.schedule_id) AS session_count,
              CASE
                WHEN cl.end_date < CURRENT_DATE THEN 'past'
                WHEN cl.start_date > CURRENT_DATE THEN 'upcoming'
                ELSE 'current'
              END AS status
       FROM classes cl
       JOIN courses co ON co.course_id = cl.course_id
       LEFT JOIN branches b ON b.branch_id = cl.branch_id
       LEFT JOIN rooms r ON r.room_id = cl.room_id
       LEFT JOIN enrollments e ON e.class_id = cl.class_id
       LEFT JOIN schedules s ON s.class_id = cl.class_id
       WHERE cl.teacher_id = $1
       GROUP BY cl.class_id, cl.class_name, cl.start_date, cl.end_date,
                co.title, b.branch_name, r.room_name
       ORDER BY cl.start_date DESC NULLS LAST`,
      [teacherId]
    );
    res.json({ classes: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStatsHandler, getSchedulesHandler, getTeacherClassesHandler };
