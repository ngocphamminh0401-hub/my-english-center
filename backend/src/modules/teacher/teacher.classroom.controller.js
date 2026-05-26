const {
  getTeacherClass,
  getClassStudents,
  getScheduleAttendance,
  saveAttendance,
  createClassAnnouncement,
  getClassAnnouncements,
} = require('./teacher.classroom.service');

const allowedStatuses = new Set(['present', 'absent', 'late']);

const getClassStudentsHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { class_id: classId } = req.params;

    const { classInfo, students } = await getClassStudents(teacherId, classId);
    if (!classInfo) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ class: classInfo, students });
  } catch (error) {
    next(error);
  }
};

const getAttendanceHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { class_id: classId, schedule_id: scheduleId } = req.params;

    const classInfo = await getTeacherClass(teacherId, classId);
    if (!classInfo) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const scheduleAttendance = await getScheduleAttendance(
      teacherId,
      classId,
      scheduleId
    );

    if (!scheduleAttendance.schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(scheduleAttendance);
  } catch (error) {
    next(error);
  }
};

const saveAttendanceHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { class_id: classId, schedule_id: scheduleId } = req.params;
    const payload = Array.isArray(req.body) ? req.body : req.body?.attendance;

    if (!Array.isArray(payload) || payload.length === 0) {
      return res.status(400).json({ message: 'Attendance payload is required' });
    }

    const classInfo = await getTeacherClass(teacherId, classId);
    if (!classInfo) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const invalidItem = payload.find(
      (item) =>
        !item.student_id ||
        !allowedStatuses.has(item.status)
    );
    if (invalidItem) {
      return res.status(400).json({ message: 'Invalid attendance status' });
    }

    const result = await saveAttendance(
      teacherId,
      classId,
      scheduleId,
      payload
    );

    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const createAnnouncementHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { class_id: classId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const result = await createClassAnnouncement(teacherId, classId, {
      title,
      content,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const getAnnouncementsHandler = async (req, res, next) => {
  try {
    const teacherId = req.user.user_id;
    const { class_id: classId } = req.params;
    const announcements = await getClassAnnouncements(teacherId, classId);
    res.json({ announcements });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getClassStudentsHandler,
  getAttendanceHandler,
  saveAttendanceHandler,
  createAnnouncementHandler,
  getAnnouncementsHandler,
};
