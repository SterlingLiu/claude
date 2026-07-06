// 测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = 3001;

// 模拟数据库连接
jest.mock('../config/db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn(() => Promise.resolve({ release: jest.fn() }))
  },
  testConnection: jest.fn(() => Promise.resolve())
}));
