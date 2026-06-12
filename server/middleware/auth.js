const jwt = require('jsonwebtoken');

/**
 * 用户认证中间件 - 验证 JWT token
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  // 检查 Authorization 头是否存在
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, msg: '请先登录' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ code: 401, msg: '请先登录' });
  }

  // 验证 token
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? '登录已过期，请重新登录' : '无效的登录凭证';
    return res.status(401).json({ code: 401, msg });
  }
}

/**
 * 管理员权限中间件 - 需要先经过 auth 中间件
 */
function admin(req, res, next) {
  if (!req.user || req.user.role !== 1) {
    return res.status(403).json({ code: 403, msg: '无权限，需要管理员权限' });
  }
  next();
}

module.exports = { auth, admin };
