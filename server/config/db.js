const mysql = require('mysql2/promise');

// 数据库连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'lostfound',

  // 连接池配置
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
  queueLimit: 0,

  // 连接超时配置
  connectTimeout: 10000, // 10秒连接超时
  acquireTimeout: 10000, // 10秒获取连接超时

  // 保持连接活跃
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // 字符集配置
  charset: 'utf8mb4',

  // 时区配置
  timezone: '+08:00',
});

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    console.log('✅ 数据库连接成功');
    connection.release();
  })
  .catch(err => {
    console.error('❌ 数据库连接失败:', err.message);
    // 不要在这里抛出错误，让应用继续启动
  });

module.exports = pool;
