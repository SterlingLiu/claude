const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { auth, admin } = require('../middleware/auth');

process.env.JWT_SECRET = 'test_jwt_secret';

const app = express();
app.use(express.json());

app.get('/api/protected', auth, (req, res) => {
  res.json({ code: 0, user: req.user });
});

app.get('/api/admin', auth, admin, (req, res) => {
  res.json({ code: 0, msg: '管理员访问成功' });
});

describe('认证中间件测试', () => {

  describe('auth 中间件', () => {

    it('应该拒绝没有 Authorization 头的请求', async () => {
      const res = await request(app).get('/api/protected');

      expect(res.status).toBe(401);
      expect(res.body.msg).toBe('请先登录');
    });

    it('应该拒绝空的 Authorization 头', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', '');

      expect(res.status).toBe(401);
    });

    it('应该拒绝不以 Bearer 开头的 Authorization 头', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Token abc123');

      expect(res.status).toBe(401);
    });

    it('应该拒绝无效的 JWT token', async () => {
      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
      expect(res.body.msg).toBe('无效的登录凭证');
    });

    it('应该拒绝过期的 JWT token', async () => {
      const expiredToken = jwt.sign(
        { id: 1, username: 'testuser' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.msg).toBe('登录已过期，请重新登录');
    });

    it('应该接受有效的 JWT token', async () => {
      const validToken = jwt.sign(
        { id: 1, username: 'testuser', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(1);
    });
  });

  describe('admin 中间件', () => {

    it('应该拒绝普通用户访问管理员接口', async () => {
      const userToken = jwt.sign(
        { id: 1, username: 'testuser', role: 0 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.msg).toBe('无权限，需要管理员权限');
    });

    it('应该允许管理员访问管理员接口', async () => {
      const adminToken = jwt.sign(
        { id: 1, username: 'admin', role: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('管理员访问成功');
    });
  });
});
