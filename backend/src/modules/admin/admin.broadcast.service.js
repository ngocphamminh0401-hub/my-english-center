const { pool } = require('../../config/db');

/**
 * Creates a system-wide announcement (class_id = NULL).
 * targetType ('all' | 'teachers' | 'students') is returned in the response
 * so the caller can route push notifications accordingly.
 * The announcements table schema: announcement_id, class_id, author_id, title, content, created_at
 */
const createBroadcast = async ({ senderId, title, content }) => {
  const result = await pool.query(
    `INSERT INTO announcements (class_id, author_id, title, content)
     VALUES (NULL, $1, $2, $3)
     RETURNING announcement_id, created_at`,
    [senderId, title, content]
  );

  return result.rows[0];
};

module.exports = { createBroadcast };
