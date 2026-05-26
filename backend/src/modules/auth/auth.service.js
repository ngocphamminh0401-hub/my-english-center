const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { pool } = require('../../config/db');

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

const login = async ({ email, password }) => {
  const { rows } = await pool.query(
    `SELECT user_id, full_name, email, role, is_active, password_hash
     FROM users
     WHERE email = $1`,
    [email.toLowerCase().trim()]
  );

  const user = rows[0];
  if (!user || hashPassword(password) !== user.password_hash) {
    const err = new Error('Email hoặc mật khẩu không đúng.');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    err.status = 403;
    throw err;
  }

  const token = jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
};

const getProfile = async (userId) => {
  const { rows } = await pool.query(
    `SELECT user_id, full_name, email, role FROM users WHERE user_id = $1`,
    [userId]
  );
  return rows[0] || null;
};

module.exports = { login, getProfile };
