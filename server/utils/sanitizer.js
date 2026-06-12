const DOMPurify = require('isomorphic-dompurify');

/**
 * 消毒 HTML 内容，防止 XSS 攻击
 * @param {string} input - 原始输入
 * @returns {string} 消毒后的内容
 */
function sanitizeHTML(input) {
  if (!input || typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // 不允许任何 HTML 标签
    ALLOWED_ATTR: [], // 不允许任何属性
  });
}

/**
 * 消毒对象中的所有字符串字段
 * @param {object} obj - 原始对象
 * @param {string[]} fields - 需要消毒的字段名数组（可选，默认所有字符串字段）
 * @returns {object} 消毒后的对象
 */
function sanitizeObject(obj, fields = null) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string') {
      // 如果指定了字段列表，只消毒指定字段
      if (fields === null || fields.includes(key)) {
        sanitized[key] = sanitizeHTML(sanitized[key]);
      }
    }
  }

  return sanitized;
}

/**
 * 创建消毒中间件
 * @param {string[]} fields - 需要消毒的字段名数组（可选）
 * @returns {Function} Express 中间件
 */
function sanitizeMiddleware(fields = null) {
  return (req, res, next) => {
    if (req.body) {
      req.body = sanitizeObject(req.body, fields);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query, fields);
    }
    if (req.params) {
      req.params = sanitizeObject(req.params, fields);
    }
    next();
  };
}

module.exports = {
  sanitizeHTML,
  sanitizeObject,
  sanitizeMiddleware,
};
