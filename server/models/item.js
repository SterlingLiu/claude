const pool = require('../config/db');

// 允许更新的字段白名单
const LOST_ALLOWED = ['title', 'category', 'description', 'image_url', 'lost_place', 'lost_time', 'contact_info', 'status'];
const FOUND_ALLOWED = ['title', 'category', 'description', 'image_url', 'found_place', 'found_time', 'contact_info', 'status'];

// ===== 失物 (Lost) =====

async function listLost({ page = 1, size = 12, keyword, category }) {
  let sql = 'SELECT l.*, u.nickname FROM lost_items l JOIN users u ON l.user_id = u.id WHERE 1=1';
  const params = [];
  if (keyword) {
    sql += ' AND (l.title LIKE ? OR l.description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (category) {
    sql += ' AND l.category = ?';
    params.push(category);
  }
  sql += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(size), (Number(page) - 1) * Number(size));
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function countLost({ keyword, category }) {
  let sql = 'SELECT COUNT(*) AS total FROM lost_items WHERE 1=1';
  const params = [];
  if (keyword) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  const [rows] = await pool.query(sql, params);
  return rows[0].total;
}

async function findLostById(id) {
  const [rows] = await pool.query(
    'SELECT l.*, u.nickname FROM lost_items l JOIN users u ON l.user_id = u.id WHERE l.id = ?',
    [id]
  );
  return rows[0];
}

async function createLost({ user_id, title, category, description, image_url, lost_place, lost_time, contact_info }) {
  const [result] = await pool.query(
    'INSERT INTO lost_items (user_id, title, category, description, image_url, lost_place, lost_time, contact_info) VALUES (?,?,?,?,?,?,?,?)',
    [user_id, title, category, description, image_url, lost_place, lost_time, contact_info]
  );
  return result.insertId;
}

async function updateLost(id, user_id, fields) {
  const valid = {};
  for (const key of Object.keys(fields)) {
    if (LOST_ALLOWED.includes(key)) valid[key] = fields[key];
  }
  const keys = Object.keys(valid);
  if (!keys.length) return 0;
  const [result] = await pool.query(
    'UPDATE lost_items SET ' + keys.map(k => k + ' = ?').join(', ') + ' WHERE id = ? AND user_id = ?',
    [...Object.values(valid), id, user_id]
  );
  return result.affectedRows;
}

async function deleteLost(id, user_id) {
  const [result] = await pool.query('DELETE FROM lost_items WHERE id = ? AND user_id = ?', [id, user_id]);
  return result.affectedRows;
}

async function myLostItems(user_id) {
  const [rows] = await pool.query('SELECT * FROM lost_items WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
  return rows;
}

// ===== 招领 (Found) =====

async function listFound({ page = 1, size = 12, keyword, category }) {
  let sql = 'SELECT f.*, u.nickname FROM found_items f JOIN users u ON f.user_id = u.id WHERE 1=1';
  const params = [];
  if (keyword) {
    sql += ' AND (f.title LIKE ? OR f.description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (category) {
    sql += ' AND f.category = ?';
    params.push(category);
  }
  sql += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(size), (Number(page) - 1) * Number(size));
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function countFound({ keyword, category }) {
  let sql = 'SELECT COUNT(*) AS total FROM found_items WHERE 1=1';
  const params = [];
  if (keyword) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  const [rows] = await pool.query(sql, params);
  return rows[0].total;
}

async function findFoundById(id) {
  const [rows] = await pool.query(
    'SELECT f.*, u.nickname FROM found_items f JOIN users u ON f.user_id = u.id WHERE f.id = ?',
    [id]
  );
  return rows[0];
}

async function createFound({ user_id, title, category, description, image_url, found_place, found_time, contact_info }) {
  const [result] = await pool.query(
    'INSERT INTO found_items (user_id, title, category, description, image_url, found_place, found_time, contact_info) VALUES (?,?,?,?,?,?,?,?)',
    [user_id, title, category, description, image_url, found_place, found_time, contact_info]
  );
  return result.insertId;
}

async function deleteFound(id, user_id) {
  const [result] = await pool.query('DELETE FROM found_items WHERE id = ? AND user_id = ?', [id, user_id]);
  return result.affectedRows;
}

async function myFoundItems(user_id) {
  const [rows] = await pool.query('SELECT * FROM found_items WHERE user_id = ? ORDER BY created_at DESC', [user_id]);
  return rows;
}

// ===== 管理员专用 =====

async function listAllLost({ page = 1, size = 12 }) {
  const [rows] = await pool.query(
    'SELECT l.*, u.nickname FROM lost_items l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT ? OFFSET ?',
    [Number(size), (Number(page) - 1) * Number(size)]
  );
  return rows;
}

async function updateLostStatus(id, status) {
  await pool.query('UPDATE lost_items SET status = ? WHERE id = ?', [status, id]);
}

module.exports = {
  listLost, countLost, findLostById, createLost, updateLost, deleteLost, myLostItems,
  listFound, countFound, findFoundById, createFound, deleteFound, myFoundItems,
  listAllLost, updateLostStatus,
};
