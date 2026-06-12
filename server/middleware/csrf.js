/**
 * CSRF 保护中间件
 * 防止跨站请求伪造攻击
 */

const crypto = require('crypto');

// 存储 CSRF Token（生产环境应使用 Redis）
const tokenStore = new Map();

// Token 过期时间（1小时）
const TOKEN_EXPIRY = 60 * 60 * 1000;

/**
 * 生成 CSRF Token
 * @returns {string} CSRF Token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 验证 CSRF Token
 * @param {string} token - 要验证的 token
 * @param {string} sessionId - 会话 ID
 * @returns {boolean} 是否有效
 */
function verifyToken(token, sessionId) {
  if (!token || !sessionId) {
    return false;
  }

  const storedData = tokenStore.get(sessionId);
  if (!storedData) {
    return false;
  }

  // 检查是否过期
  if (Date.now() - storedData.timestamp > TOKEN_EXPIRY) {
    tokenStore.delete(sessionId);
    return false;
  }

  // 验证 token
  return storedData.token === token;
}

/**
 * 清理过期的 token
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [sessionId, data] of tokenStore.entries()) {
    if (now - data.timestamp > TOKEN_EXPIRY) {
      tokenStore.delete(sessionId);
    }
  }
}

// 每小时清理一次过期 token
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

/**
 * CSRF 保护中间件
 * 为每个会话生成唯一的 CSRF Token
 */
function csrfProtection(req, res, next) {
  // 获取或生成会话 ID
  let sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

  if (!sessionId) {
    sessionId = crypto.randomBytes(16).toString('hex');
    res.setHeader('X-Session-Id', sessionId);
  }

  // 生成新的 CSRF Token
  const token = generateToken();

  // 存储 token
  tokenStore.set(sessionId, {
    token: token,
    timestamp: Date.now()
  });

  // 将 token 添加到响应头
  res.setHeader('X-CSRF-Token', token);

  // 将 token 添加到请求对象
  req.csrfToken = token;
  req.sessionId = sessionId;

  next();
}

/**
 * 验证 CSRF Token 中间件
 * 用于 POST、PUT、DELETE 等状态修改请求
 */
function csrfVerify(req, res, next) {
  // 只验证状态修改请求
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

  if (!verifyToken(token, sessionId)) {
    return res.status(403).json({
      code: 403,
      msg: 'CSRF Token 无效或已过期，请刷新页面重试'
    });
  }

  next();
}

/**
 * 获取 CSRF Token 的路由处理器
 */
function getCsrfToken(req, res) {
  res.json({
    code: 0,
    data: {
      token: req.csrfToken,
      sessionId: req.sessionId
    }
  });
}

module.exports = {
  csrfProtection,
  csrfVerify,
  getCsrfToken,
  generateToken,
  verifyToken
};
