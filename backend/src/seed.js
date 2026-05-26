require('dotenv').config();
const crypto = require('crypto');
const { pool } = require('./config/db');

const hash = (p) => crypto.createHash('sha256').update(p).digest('hex');

const USERS = [
  {
    username: 'admin',
    full_name: 'Nguyễn Quản Trị',
    email: 'admin@engcenter.vn',
    phone: '0901000001',
    role: 'manager',
    password: 'Admin@123',
  },
  {
    username: 'teacher01',
    full_name: 'Trần Thị Giáo Viên',
    email: 'teacher@engcenter.vn',
    phone: '0901000002',
    role: 'teacher',
    password: 'Teacher@123',
  },
  {
    username: 'student01',
    full_name: 'Lê Văn Học Viên',
    email: 'student@engcenter.vn',
    phone: '0901000003',
    role: 'student',
    password: 'Student@123',
  },
];

async function seed() {
  console.log('Seeding users...\n');
  for (const u of USERS) {
    try {
      await pool.query(
        `INSERT INTO users (username, full_name, email, phone, role, password_hash, is_active)
         VALUES ($1, $2, $3, $4, $5::user_role, $6, TRUE)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = EXCLUDED.password_hash,
           is_active = TRUE`,
        [u.username, u.full_name, u.email, u.phone, u.role, hash(u.password)]
      );
      console.log(`✓ ${u.role.padEnd(8)} | ${u.email.padEnd(28)} | ${u.password}`);
    } catch (e) {
      console.error(`✗ ${u.email}: ${e.message}`);
    }
  }
  console.log('\nDone.');
  await pool.end();
}

seed();
