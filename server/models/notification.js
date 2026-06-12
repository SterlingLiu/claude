const pool = require('../config/db');

const notification = {
  /**
   * 获取用户的通知列表
   */
  async list(to_user_id) {
    const [rows] = await pool.query(
      'SELECT n.*, u.nickname AS from_nickname FROM notifications n JOIN users u ON n.from_user_id = u.id WHERE n.to_user_id = ? ORDER BY n.created_at DESC',
      [to_user_id]
    );
    return rows;
  },

  /**
   * 获取用户未读通知数量
   */
  async unreadCount(to_user_id) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE to_user_id = ? AND is_read = 0',
      [to_user_id]
    );
    return rows[0].count;
  },

  /**
   * 创建新通知
   */
  async create({ from_user_id, to_user_id, item_id, item_type, message }) {
    const [result] = await pool.query(
      'INSERT INTO notifications (from_user_id, to_user_id, item_id, item_type, message) VALUES (?,?,?,?,?)',
      [from_user_id, to_user_id, item_id, item_type, message]
    );
    return result.insertId;
  },

  /**
   * 标记通知为已读
   */
  async markRead(id, to_user_id) {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND to_user_id = ?',
      [id, to_user_id]
    );
  },

  /**
   * 检查用户是否已经认领过某个物品
   * @param {number} itemId - 物品ID
   * @param {number} userId - 用户ID
   * @param {string} itemType - 物品类型（lost 或 found）
   * @returns {object|null} 如果已认领返回通知对象，否则返回 null
   */
  async findByItemAndUser(itemId, userId, itemType) {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE item_id = ? AND from_user_id = ? AND item_type = ?',
      [itemId, userId, itemType]
    );
    return rows[0] || null;
  },
};

module.exports = notification;
