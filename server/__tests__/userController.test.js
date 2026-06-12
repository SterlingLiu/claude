const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 模拟用户模型
const userModel = require('../models/user');
jest.mock('../models/user');

// 创建测试应用
const app = express();
app.use(express.json());

// 导入控制器
const userController = require('../controllers/userController');

// 设置路由
app.post('/api/register', userController.register);
app.post('/api/login', userController.login);
app.get('/api/user/info', (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'user' };
  next();
}, userController.getInfo);
app.put('/api/user/info', (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'user' };
  next();
}, userController.updateInfo);

describe('用户模块测试', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/register - 用户注册', () => {

    it('应该成功注册新用户', async () => {
      userModel.findByUsername.mockResolvedValue(null);
      userModel.create.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/register')
        .send({ username: 'newuser', password: 'password123', nickname: '新用户' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.msg).toBe('注册成功');
      expect(res.body.data.id).toBe(1);
    });

    it('应该拒绝空用户名', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: '', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('用户名和密码不能为空');
    });

    it('应该拒绝空密码', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'testuser', password: '' });

      expect(res.status).toBe(400);
    });

    it('应该拒绝无效的用户名格式', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'ab', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('用户名只能包含');
    });

    it('应该拒绝包含特殊字符的用户名', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'user@name!', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('应该拒绝过短的密码', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'validuser', password: '12345' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('密码长度需在 6-50 位之间');
    });

    it('应该拒绝过长的密码', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'validuser', password: 'a'.repeat(51) });

      expect(res.status).toBe(400);
    });

    it('应该拒绝过长的昵称', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'validuser', password: 'password123', nickname: 'a'.repeat(31) });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('昵称不能超过 30 个字符');
    });

    it('应该拒绝已存在的用户名', async () => {
      userModel.findByUsername.mockResolvedValue({ id: 1, username: 'existinguser' });

      const res = await request(app)
        .post('/api/register')
        .send({ username: 'existinguser', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('用户名已存在');
    });

    it('应该处理数据库错误', async () => {
      userModel.findByUsername.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).toBe(500);
      expect(res.body.msg).toBe('注册失败');
    });
  });

  describe('POST /api/login - 用户登录', () => {

    it('应该成功登录并返回token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      userModel.findByUsername.mockResolvedValue({
        id: 1, username: 'testuser', nickname: '测试用户', role: 'user', password: hashedPassword
      });

      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.msg).toBe('登录成功');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.id).toBe(1);
    });

    it('应该拒绝空用户名', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: '', password: 'password123' });

      expect(res.status).toBe(400);
    });

    it('应该拒绝空密码', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: '' });

      expect(res.status).toBe(400);
    });

    it('应该拒绝不存在的用户名', async () => {
      userModel.findByUsername.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/login')
        .send({ username: 'nonexistent', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('用户名或密码错误');
    });

    it('应该拒绝错误的密码', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      userModel.findByUsername.mockResolvedValue({
        id: 1, username: 'testuser', password: hashedPassword
      });

      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('用户名或密码错误');
    });

    it('应该处理数据库错误', async () => {
      userModel.findByUsername.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/user/info - 获取用户信息', () => {

    it('应该返回用户信息', async () => {
      userModel.findById.mockResolvedValue({
        id: 1, username: 'testuser', nickname: '测试用户', phone: '13800138000', role: 'user'
      });

      const res = await request(app).get('/api/user/info');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.username).toBe('testuser');
    });

    it('应该处理用户不存在', async () => {
      userModel.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/user/info');

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('用户不存在');
    });

    it('应该处理数据库错误', async () => {
      userModel.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/user/info');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/user/info - 更新用户信息', () => {

    it('应该成功更新昵称', async () => {
      userModel.update.mockResolvedValue();

      const res = await request(app)
        .put('/api/user/info')
        .send({ nickname: '新昵称' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('修改成功');
    });

    it('应该成功更新手机号', async () => {
      userModel.update.mockResolvedValue();

      const res = await request(app)
        .put('/api/user/info')
        .send({ phone: '13800138000' });

      expect(res.status).toBe(200);
    });

    it('应该拒绝空昵称', async () => {
      const res = await request(app)
        .put('/api/user/info')
        .send({ nickname: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('昵称不能为空');
    });

    it('应该拒绝过长的昵称', async () => {
      const res = await request(app)
        .put('/api/user/info')
        .send({ nickname: 'a'.repeat(31) });

      expect(res.status).toBe(400);
    });

    it('应该拒绝无效的手机号', async () => {
      const res = await request(app)
        .put('/api/user/info')
        .send({ phone: '12345678901' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('手机号格式不正确');
    });

    it('应该拒绝没有修改内容的请求', async () => {
      const res = await request(app)
        .put('/api/user/info')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('没有要修改的内容');
    });

    it('应该处理数据库错误', async () => {
      userModel.update.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/user/info')
        .send({ nickname: '新昵称' });

      expect(res.status).toBe(500);
    });
  });
});
