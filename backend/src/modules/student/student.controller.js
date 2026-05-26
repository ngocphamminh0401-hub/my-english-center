const { pool } = require('../../config/db');

const computeStreak = (dates) => {
  if (!dates.length) return 0;
  let streak = 1;
  let prev = new Date(dates[0]);
  for (let i = 1; i < dates.length; i += 1) {
    const current = new Date(dates[i]);
    const diffDays = Math.floor((prev - current) / 86400000);
    if (diffDays === 1) {
      streak += 1;
      prev = current;
    } else {
      break;
    }
  }
  return streak;
};

const getDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;

    const [userResult, attendanceResult, upcomingResult, pendingResult] =
      await Promise.all([
        pool.query(
          'SELECT user_id, full_name, email FROM users WHERE user_id = $1',
          [studentId]
        ),
        pool.query(
          `SELECT DISTINCT s.session_date::date AS date
           FROM schedules s
           JOIN attendance a ON a.schedule_id = s.schedule_id
           WHERE a.student_id = $1 AND a.status = 'present'
           ORDER BY date DESC
           LIMIT 365`,
          [studentId]
        ),
        pool.query(
          `SELECT s.schedule_id, s.session_date, s.start_time, s.end_time,
                  c.class_name, co.title AS course_title,
                  r.room_name, b.branch_name
           FROM enrollments e
           JOIN classes c ON e.class_id = c.class_id
           JOIN courses co ON c.course_id = co.course_id
           JOIN schedules s ON s.class_id = c.class_id
           LEFT JOIN rooms r ON r.room_id = s.room_id
           LEFT JOIN branches b ON b.branch_id = r.branch_id
           WHERE e.student_id = $1
             AND s.session_date >= CURRENT_DATE
           ORDER BY s.session_date ASC, s.start_time ASC
           LIMIT 3`,
          [studentId]
        ),
        pool.query(
          `SELECT COUNT(*) AS count
           FROM assignments a
           JOIN classes c ON a.class_id = c.class_id
           JOIN enrollments e ON e.class_id = c.class_id
           WHERE e.student_id = $1
             AND NOT EXISTS (
               SELECT 1 FROM submissions su
               WHERE su.assignment_id = a.assignment_id
                 AND su.student_id = $1
             )`,
          [studentId]
        ),
      ]);

    const user = userResult.rows[0];
    const streak = computeStreak(attendanceResult.rows.map((r) => r.date));

    const upcomingSchedules = upcomingResult.rows.map((row) => ({
      scheduleId: row.schedule_id,
      sessionDate: row.session_date instanceof Date
        ? row.session_date.toISOString().substring(0, 10)
        : String(row.session_date),
      startTime: String(row.start_time).substring(0, 5),
      endTime: String(row.end_time).substring(0, 5),
      className: row.class_name,
      courseTitle: row.course_title,
      roomName: row.room_name || 'Chưa xác định',
      branchName: row.branch_name || '',
    }));

    res.json({
      studentId,
      name: user?.full_name || user?.email || 'Học viên',
      streak,
      upcomingSchedules,
      pendingAssignments: Number(pendingResult.rows[0]?.count || 0),
    });
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;
    const result = await pool.query(
      `SELECT co.course_id,
              co.title,
              co.max_sessions,
              cl.class_id,
              cl.class_name,
              cl.start_date,
              cl.end_date,
              u.full_name AS teacher_name,
              COUNT(DISTINCT s.schedule_id) AS total_sessions,
              COUNT(DISTINCT CASE WHEN a.status = 'present' THEN s.schedule_id END) AS attended_sessions,
              COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN s.schedule_id END) AS absent_sessions
       FROM enrollments e
       JOIN classes cl ON e.class_id = cl.class_id
       JOIN courses co ON cl.course_id = co.course_id
       JOIN users u ON u.user_id = cl.teacher_id
       LEFT JOIN schedules s ON s.class_id = cl.class_id
       LEFT JOIN attendance a ON a.schedule_id = s.schedule_id AND a.student_id = e.student_id
       WHERE e.student_id = $1
       GROUP BY co.course_id, co.title, co.max_sessions,
                cl.class_id, cl.class_name, cl.start_date, cl.end_date, u.full_name
       ORDER BY cl.start_date DESC NULLS LAST`,
      [studentId]
    );

    const MAX_SESSIONS = 30;

    const courses = result.rows.map((row) => {
      const maxSessions = Number(row.max_sessions) || MAX_SESSIONS;
      const totalSessions = Number(row.total_sessions) || 0;
      const attendedSessions = Number(row.attended_sessions) || 0;
      const absentSessions = Number(row.absent_sessions) || 0;
      const isCompleted = attendedSessions >= maxSessions;

      return {
        courseId: row.course_id,
        classId: row.class_id,
        className: row.class_name,
        title: row.title,
        teacherName: row.teacher_name,
        startDate: row.start_date,
        endDate: row.end_date,
        maxSessions,
        totalSessions,
        attendedSessions,
        absentSessions,
        isCompleted,
      };
    });

    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

const getPersonalSchedule = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;
    const result = await pool.query(
      `SELECT s.schedule_id,
              s.session_date,
              s.start_time,
              s.end_time,
              c.class_id,
              c.class_name,
              co.title AS course_title,
              r.room_name,
              b.branch_name,
              a.status AS attendance_status,
              ROW_NUMBER() OVER (PARTITION BY c.class_id ORDER BY s.session_date ASC) AS session_number
       FROM enrollments e
       JOIN classes c ON e.class_id = c.class_id
       JOIN courses co ON c.course_id = co.course_id
       JOIN schedules s ON s.class_id = c.class_id
       LEFT JOIN rooms r ON r.room_id = s.room_id
       LEFT JOIN branches b ON b.branch_id = r.branch_id
       LEFT JOIN attendance a ON a.schedule_id = s.schedule_id AND a.student_id = $1
       WHERE e.student_id = $1
       ORDER BY s.session_date ASC, s.start_time ASC`,
      [studentId]
    );

    const sessions = result.rows.map((row) => ({
      scheduleId: row.schedule_id,
      sessionDate: row.session_date instanceof Date
        ? row.session_date.toISOString().substring(0, 10)
        : String(row.session_date),
      startTime: String(row.start_time).substring(0, 5),
      endTime: String(row.end_time).substring(0, 5),
      classId: row.class_id,
      className: row.class_name,
      courseTitle: row.course_title,
      roomName: row.room_name || 'Chưa xác định',
      branchName: row.branch_name || '',
      attendanceStatus: row.attendance_status || null,
      sessionNumber: Number(row.session_number),
    }));

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const studentId = req.user.user_id;
    const result = await pool.query(
      `SELECT a.announcement_id,
              a.title,
              a.content,
              a.created_at,
              u.full_name AS author_name,
              c.class_name
       FROM announcements a
       JOIN classes c ON a.class_id = c.class_id
       JOIN enrollments e ON e.class_id = c.class_id
       JOIN users u ON u.user_id = a.author_id
       WHERE e.student_id = $1
       ORDER BY a.created_at DESC
       LIMIT 10`,
      [studentId]
    );

    const announcements = result.rows.map((row) => ({
      id: row.announcement_id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      authorName: row.author_name,
      className: row.class_name,
    }));

    res.json({ announcements });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getCourses, getPersonalSchedule, getAnnouncements };
