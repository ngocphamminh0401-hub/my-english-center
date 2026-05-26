const {
  courseSchema,
  courseUpdateSchema,
  classSchema,
  classUpdateSchema,
} = require('./admin.validation');
const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeachersForSelect,
  getBranches,
  getRooms,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
} = require('./admin.catalog.service');

const getCoursesHandler = async (req, res, next) => {
  try {
    const courses = await getCourses();
    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

const createCourseHandler = async (req, res, next) => {
  try {
    const { error, value } = courseSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const result = await createCourse(value);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateCourseHandler = async (req, res, next) => {
  try {
    const { error, value } = courseUpdateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const result = await updateCourse(req.params.course_id, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteCourseHandler = async (req, res, next) => {
  try {
    const result = await deleteCourse(req.params.course_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getBranchesHandler = async (req, res, next) => {
  try {
    const branches = await getBranches();
    res.json({ branches });
  } catch (error) {
    next(error);
  }
};

const getRoomsHandler = async (req, res, next) => {
  try {
    const rooms = await getRooms(req.query.branch_id);
    res.json({ rooms });
  } catch (error) {
    next(error);
  }
};

const getClassesHandler = async (req, res, next) => {
  try {
    const classes = await getClasses();
    res.json({ classes });
  } catch (error) {
    next(error);
  }
};

const createClassHandler = async (req, res, next) => {
  try {
    const { error, value } = classSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const result = await createClass(value);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateClassHandler = async (req, res, next) => {
  try {
    const { error, value } = classUpdateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    const result = await updateClass(req.params.class_id, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deleteClassHandler = async (req, res, next) => {
  try {
    const result = await deleteClass(req.params.class_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTeachersHandler = async (req, res, next) => {
  try {
    const teachers = await getTeachersForSelect();
    res.json({ teachers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoursesHandler,
  createCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  getBranchesHandler,
  getRoomsHandler,
  getTeachersHandler,
  getClassesHandler,
  createClassHandler,
  updateClassHandler,
  deleteClassHandler,
};
