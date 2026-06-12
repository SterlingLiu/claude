const winston = require('winston');
const path = require('path');

// 日志目录
const logDir = path.join(__dirname, '../logs');

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 控制台格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level}] ${message} ${metaStr}`;
  })
);

// 创建 logger 实例
const isProduction = process.env.NODE_ENV === 'production';
const logger = winston.createLogger({
  // 生产环境使用warn级别，开发环境使用info级别
  level: process.env.LOG_LEVEL || (isProduction ? 'warn' : 'info'),
  format: logFormat,
  defaultMeta: { service: 'lostfound-api' },
  transports: [
    // 错误日志 - 只记录 error 级别
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 组合日志 - 生产环境只记录warn以上，开发环境记录所有
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      level: isProduction ? 'warn' : 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 非生产环境添加控制台输出
if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug',
  }));
}

// 创建请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // 响应完成后记录
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
    };

    // 根据状态码选择日志级别
    if (res.statusCode >= 500) {
      logger.error('请求失败', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('请求错误', logData);
    } else {
      logger.info('请求完成', logData);
    }
  });

  next();
};

// 导出
module.exports = {
  logger,
  requestLogger,
  // 便捷方法
  info: (msg, meta) => logger.info(msg, meta),
  warn: (msg, meta) => logger.warn(msg, meta),
  error: (msg, meta) => logger.error(msg, meta),
  debug: (msg, meta) => logger.debug(msg, meta),
};
