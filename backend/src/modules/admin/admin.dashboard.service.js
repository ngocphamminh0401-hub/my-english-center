const { pool } = require('../../config/db');

const getOverviewStats = async () => {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE role = 'student' AND is_active = TRUE) AS active_students,
       COUNT(*) FILTER (WHERE role = 'teacher' AND is_active = TRUE) AS total_teachers
     FROM users`
  );

  const classesResult = await pool.query(
    `SELECT COUNT(*) AS open_classes
     FROM classes
     WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE`
  );

  const submissionsResult = await pool.query(
    `SELECT COUNT(*) AS pending_submissions FROM submissions WHERE status = 'submitted'`
  );

  return {
    activeStudents: Number(result.rows[0]?.active_students || 0),
    totalTeachers: Number(result.rows[0]?.total_teachers || 0),
    openClasses: Number(classesResult.rows[0]?.open_classes || 0),
    pendingSubmissions: Number(submissionsResult.rows[0]?.pending_submissions || 0),
  };
};

const getAttendanceRate = async () => {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE a.status = 'present') AS present_count,
       COUNT(*) FILTER (WHERE a.status = 'absent') AS absent_count
     FROM attendance a
     JOIN schedules s ON a.schedule_id = s.schedule_id
     WHERE date_trunc('month', s.session_date) = date_trunc('month', CURRENT_DATE)`
  );

  const present = Number(result.rows[0]?.present_count || 0);
  const absent = Number(result.rows[0]?.absent_count || 0);
  const total = present + absent;

  return {
    present,
    absent,
    presentRate: total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0,
    absentRate: total > 0 ? Number(((absent / total) * 100).toFixed(2)) : 0,
  };
};

const getAcademicPerformance = async () => {
  const result = await pool.query(
    `SELECT c.course_id,
            c.title AS course_name,
            AVG(su.grade) AS average_grade,
            COUNT(su.submission_id) AS submissions_count,
            COUNT(en.student_id) AS enrolled_students,
            COUNT(a.assignment_id) AS assignments_count
     FROM courses c
     LEFT JOIN classes cl ON cl.course_id = c.course_id
     LEFT JOIN enrollments en ON en.class_id = cl.class_id
     LEFT JOIN assignments a ON a.class_id = cl.class_id
     LEFT JOIN submissions su ON su.assignment_id = a.assignment_id
     GROUP BY c.course_id, c.title
     ORDER BY c.title`
  );

  return result.rows.map((row) => {
    const enrolled = Number(row.enrolled_students || 0);
    const assignments = Number(row.assignments_count || 0);
    const expected = enrolled * assignments;
    const completionRate =
      expected > 0
        ? Number(((Number(row.submissions_count) / expected) * 100).toFixed(2))
        : 0;
    return {
      courseId: row.course_id,
      courseName: row.course_name,
      averageGrade: row.average_grade ? Number(row.average_grade) : 0,
      completionRate,
    };
  });
};

const getMonthlyAverageGrades = async () => {
  const result = await pool.query(
    `SELECT date_trunc('month', s.submitted_at) AS month,
            AVG(s.grade) AS average_grade
     FROM submissions s
     WHERE s.grade IS NOT NULL
       AND s.submitted_at >= (CURRENT_DATE - INTERVAL '6 months')
     GROUP BY date_trunc('month', s.submitted_at)
     ORDER BY month`
  );

  return result.rows.map((row) => ({
    month: row.month,
    averageGrade: row.average_grade ? Number(row.average_grade) : 0,
  }));
};

module.exports = {
  getOverviewStats,
  getAttendanceRate,
  getAcademicPerformance,
  getMonthlyAverageGrades,
};
