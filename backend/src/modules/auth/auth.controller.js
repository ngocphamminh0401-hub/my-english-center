const { login, getProfile } = require('./auth.service');

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc.' });
    }
    const result = await login({ email, password });
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

const getMeHandler = async (req, res, next) => {
  try {
    const user = await getProfile(req.user.user_id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginHandler, getMeHandler };
