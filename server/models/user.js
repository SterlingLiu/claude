const pool = require('../config/db');

// 允许更新的字段白名单 - 防止越权修改敏感字段
const ALLOWED_UPDATE_FIELDS = ['nickname', 'phone', 'avatar'];

const user = {
  /**
   * 根据用户名查找用户（含密码，用于登录验证）
   */
  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  /**
   * 根据ID查找用户（不含密码）
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, nickname, phone, avatar, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  /**
   * 创建新用户
   */
  async create({ username, password, nickname }) {
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname) VALUES (?,?,?)',
      [username, password, nickname]
    );
    return result.insertId;
  },

  /**
   * 更新用户信息 - 仅允许更新白名单内的字段
   */
  async update(id, fields) {
    const valid = {};
    for (const key of Object.keys(fields)) {
      if (ALLOWED_UPDATE_FIELDS.includes(key)) {
        valid[key] = fields[key];
      }
    }
    const keys = Object.keys(valid);
    if (keys.length === 0) return;

    const sql = 'UPDATE users SET ' + keys.map(k => k + ' = ?').join(', ') + ' WHERE id = ?';
    await pool.query(sql, [...Object.values(valid), id]);
  },
};

module.exports = user;
