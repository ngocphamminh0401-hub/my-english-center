const {
  userCreateSchema,
  userUpdateSchema,
} = require('./admin.validation');
const {
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
} = require('./admin.users.service');

const getUsersHandler = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const role = req.query.role;
    const search = req.query.search;
    const status = req.query.status;

    const data = await getUsers({
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 10 : limit,
      role,
      search,
      status,
    });

    res.json({
      ...data,
      page: Number.isNaN(page) ? 1 : page,
      limit: Number.isNaN(limit) ? 10 : limit,
    });
  } catch (error) {
    next(error);
  }
};

const createUserHandler = async (req, res, next) => {
  try {
    const { error, value } = userCreateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const result = await createUser(value);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserHandler = async (req, res, next) => {
  try {
    const { error, value } = userUpdateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const result = await updateUser(req.params.user_id, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const deactivateUserHandler = async (req, res, next) => {
  try {
    const result = await deactivateUser(req.params.user_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsersHandler,
  createUserHandler,
  updateUserHandler,
  deactivateUserHandler,
};
