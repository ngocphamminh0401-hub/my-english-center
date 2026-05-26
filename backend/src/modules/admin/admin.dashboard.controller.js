const {
  getOverviewStats,
  getAttendanceRate,
  getAcademicPerformance,
  getMonthlyAverageGrades,
} = require('./admin.dashboard.service');

const getDashboardAnalyticsHandler = async (req, res, next) => {
  try {
    const [overview, attendanceRate, academicPerformance, gradeTrends] =
      await Promise.all([
        getOverviewStats(),
        getAttendanceRate(),
        getAcademicPerformance(),
        getMonthlyAverageGrades(),
      ]);

    res.json({
      overview,
      attendanceRate,
      academicPerformance,
      gradeTrends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardAnalyticsHandler };
