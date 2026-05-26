const { enrollmentSchema } = require('./admin.validation');
const {
  getEnrollmentsByClass,
  addEnrollment,
  removeEnrollment,
} = require('./admin.enrollments.service');

const getEnrollmentsHandler = async (req, res, next) => {
  try {
    const classId = req.query.class_id;
    if (!classId) {
      return res.status(400).json({ message: 'class_id is required' });
    }
    const result = await getEnrollmentsByClass(classId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addEnrollmentHandler = async (req, res, next) => {
  try {
    const { error, value } = enrollmentSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const result = await addEnrollment(value.class_id, value.student_id);
    res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const removeEnrollmentHandler = async (req, res, next) => {
  try {
    const { error, value } = enrollmentSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const result = await removeEnrollment(value.class_id, value.student_id);
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getEnrollmentsHandler,
  addEnrollmentHandler,
  removeEnrollmentHandler,
};
