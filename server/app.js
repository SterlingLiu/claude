require('dotenv').config();

// 启动前校验关键环境变量
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('❌ 启动失败: JWT_SECRET 必须设置且长度至少 16 个字符');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { logger, requestLogger } = require('./utils/logger');
const { sanitizeMiddleware } = require('./utils/sanitizer');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ============ Middleware Configuration ============

// Rate limiting - prevent brute force and DDoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: { code: 429, msg: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per IP
  message: { code: 429, msg: '登录尝试次数过多，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limit
app.use('/api/', apiLimiter);

// Request logging
app.use(requestLogger);

// CORS - 必须在 body parsing 之前
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Input sanitization - prevent XSS（必须在 body 解析之后）
app.use(sanitizeMiddleware(['title', 'description', 'nickname', 'contact_info', 'message']));

// Static files - upload directory
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
}
app.use('/uploads', express.static(uploadDir, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ============ Routes ============
app.use('/api', (req, res, next) => {
  if (req.path === '/login' || req.path === '/register') {
    return authLimiter(req, res, next);
  }
  next();
}, routes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ code: 0, msg: 'ok', timestamp: new Date().toISOString() });
});

// ============ Error Handling ============

// 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在' });
});

// Global error handler
app.use((err, req, res, _next) => {
  // 文件上传错误
  if (err.message && err.message.includes('只允许上传')) {
    return res.status(400).json({ code: 400, msg: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ code: 400, msg: '文件大小不能超过 5MB' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ code: 400, msg: '只能上传 1 个文件' });
  }

  // 请求体过大错误
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      code: 413,
      msg: '请求体过大，最大支持 1MB'
    });
  }

  // JSON 解析错误
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      code: 400,
      msg: '请求格式错误，请检查 JSON 格式'
    });
  }

  logger.error('服务器错误', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    code: statusCode,
    msg: isProduction ? '服务器内部错误' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// 先验证数据库连接，连接成功后再启动服务器
const { testConnection } = require('./config/db');
testConnection()
  .then(() => {
    // ============ Start Server ============
    const server = app.listen(PORT, () => {
      logger.info('服务已启动', {
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        url: 'http://localhost:' + PORT,
      });
    });

    // 优雅关闭 - 处理 SIGTERM 和 SIGINT 信号
    function gracefulShutdown(signal) {
      logger.info(`收到 ${signal} 信号，正在优雅关闭...`);

      server.close(() => {
        logger.info('HTTP 服务器已关闭');
      });

      // 关闭数据库连接池
      const { pool } = require('./config/db');
      pool.end()
        .then(() => {
          logger.info('数据库连接池已关闭');
          process.exit(0);
        })
        .catch(err => {
          logger.error('关闭数据库连接池时出错', { error: err.message });
          process.exit(1);
        });

      // 强制退出超时（30秒）
      setTimeout(() => {
        logger.error('优雅关闭超时，强制退出');
        process.exit(1);
      }, 30000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch(err => {
    console.error('❌ 应用启动中止:', err.message);
    process.exit(1);
  });
