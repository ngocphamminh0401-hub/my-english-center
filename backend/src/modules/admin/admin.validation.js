const Joi = require('joi');

const userCreateSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('student', 'teacher', 'manager').required(),
  password: Joi.string().min(6).required(),
});

const userUpdateSchema = Joi.object({
  full_name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid('student', 'teacher', 'manager'),
  password: Joi.string().min(6),
}).min(1);

const courseSchema = Joi.object({
  title: Joi.string().min(2).max(120).required(),
  description: Joi.string().allow('', null),
  max_sessions: Joi.number().integer().min(1).max(30).required(),
});

const courseUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(120),
  description: Joi.string().allow('', null),
  max_sessions: Joi.number().integer().min(1).max(30),
}).min(1);

const classSchema = Joi.object({
  class_name: Joi.string().min(2).max(120).required(),
  course_id: Joi.any().required(),
  branch_id: Joi.any().required(),
  teacher_id: Joi.any().required(),
  room_id: Joi.any().allow(null),
  max_students: Joi.number().integer().min(1).required(),
  start_date: Joi.date().allow(null),
  end_date: Joi.date().allow(null),
});

const classUpdateSchema = Joi.object({
  class_name: Joi.string().min(2).max(120),
  course_id: Joi.any(),
  branch_id: Joi.any(),
  teacher_id: Joi.any(),
  room_id: Joi.any().allow(null),
  max_students: Joi.number().integer().min(1),
  start_date: Joi.date().allow(null),
  end_date: Joi.date().allow(null),
}).min(1);

const enrollmentSchema = Joi.object({
  class_id: Joi.any().required(),
  student_id: Joi.any().required(),
});

module.exports = {
  userCreateSchema,
  userUpdateSchema,
  courseSchema,
  courseUpdateSchema,
  classSchema,
  classUpdateSchema,
  enrollmentSchema,
};
