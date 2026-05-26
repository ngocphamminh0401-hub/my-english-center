const crypto = require('crypto');
const { pool } = require('../../config/db');

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

const buildFilters = (filters) => {
  const conditions = [];
  const values = [];
  let index = 1;

  if (filters.role) {
    conditions.push(`role = $${index}::user_role`);
    values.push(filters.role);
    index += 1;
  }

  if (filters.search) {
    conditions.push(`(full_name ILIKE $${index} OR email ILIKE $${index})`);
    values.push(`%${filters.search}%`);
    index += 1;
  }

  if (filters.is_active !== undefined && filters.is_active !== null) {
    conditions.push(`is_active = $${index}`);
    values.push(filters.is_active === 'true' || filters.is_active === true);
    index += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, values, nextIndex: index };
};

const getUsers = async ({ page, limit, role, search, is_active }) => {
  const { whereClause, values } = buildFilters({ role, search, is_active });
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${whereClause}`,
    values
  );

  const dataResult = await pool.query(
    `SELECT user_id, full_name, email, role, is_active, created_at
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  return {
    total: Number(countResult.rows[0]?.total || 0),
    users: dataResult.rows,
  };
};

const createUser = async (payload) => {
  const passwordHash = hashPassword(payload.password);
  const username = payload.email.toLowerCase().trim();
  const result = await pool.query(
    `INSERT INTO users (username, full_name, email, role, password_hash, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)
     RETURNING user_id`,
    [username, payload.full_name, payload.email, payload.role, passwordHash]
  );
  return { userId: result.rows[0]?.user_id };
};

const updateUser = async (userId, payload) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (payload.full_name !== undefined) {
    fields.push(`full_name = $${index}`);
    values.push(payload.full_name);
    index += 1;
  }
  if (payload.email !== undefined) {
    fields.push(`email = $${index}`);
    values.push(payload.email);
    index += 1;
  }
  if (payload.role !== undefined) {
    fields.push(`role = $${index}::user_role`);
    values.push(payload.role);
    index += 1;
  }
  if (payload.password) {
    fields.push(`password_hash = $${index}`);
    values.push(hashPassword(payload.password));
    index += 1;
  }

  if (fields.length === 0) return { updated: 0 };

  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${index}`,
    [...values, userId]
  );
  return { updated: result.rowCount };
};

const deactivateUser = async (userId) => {
  const result = await pool.query(
    `UPDATE users SET is_active = FALSE WHERE user_id = $1`,
    [userId]
  );
  return { updated: result.rowCount };
};

module.exports = { getUsers, createUser, updateUser, deactivateUser };
