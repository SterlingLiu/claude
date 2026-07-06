const request = require('supertest');
const express = require('express');

const notificationModel = require('../models/notification');
jest.mock('../models/notification');

const app = express();
app.use(express.json());

const notificationController = require('../controllers/notificationController');

const mockAuth = (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'user' };
  next();
};

app.get('/api/notifications', mockAuth, notificationController.list);
app.get('/api/notifications/unread', mockAuth, notificationController.unreadCount);
app.put('/api/notifications/:id/read', mockAuth, notificationController.markRead);
app.delete('/api/notifications/:id', mockAuth, notificationController.delete);

describe('通知模块测试', () => {

  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/notifications', () => {
    it('应该返回通知列表', async () => {
      notificationModel.list.mockResolvedValue([
        { id: 1, message: '有人认领', from_nickname: '用户2', is_read: 0 }
      ]);

      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveLength(1);
    });

    it('应该返回空列表', async () => {
      notificationModel.list.mockResolvedValue([]);

      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('应该处理数据库错误', async () => {
      notificationModel.list.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/notifications');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/notifications/unread', () => {
    it('应该返回未读通知数', async () => {
      notificationModel.unreadCount.mockResolvedValue(5);

      const res = await request(app).get('/api/notifications/unread');

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBe(5);
    });

    it('应该返回0当没有未读通知', async () => {
      notificationModel.unreadCount.mockResolvedValue(0);

      const res = await request(app).get('/api/notifications/unread');

      expect(res.body.data.count).toBe(0);
    });

    it('应该处理数据库错误', async () => {
      notificationModel.unreadCount.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/notifications/unread');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('应该标记通知为已读', async () => {
      notificationModel.markRead.mockResolvedValue();

      const res = await request(app).put('/api/notifications/1/read');

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('已标记');
      expect(notificationModel.markRead).toHaveBeenCalledWith('1', 1);
    });

    it('应该处理数据库错误', async () => {
      notificationModel.markRead.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/notifications/1/read');

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('应该成功删除通知', async () => {
      notificationModel.delete.mockResolvedValue(1);

      const res = await request(app).delete('/api/notifications/1');

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('删除成功');
      expect(notificationModel.delete).toHaveBeenCalledWith('1', 1);
    });

    it('应该拒绝删除不存在的通知', async () => {
      notificationModel.delete.mockResolvedValue(0);

      const res = await request(app).delete('/api/notifications/999');

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('通知不存在或无权删除');
    });

    it('应该处理数据库错误', async () => {
      notificationModel.delete.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/notifications/1');

      expect(res.status).toBe(500);
    });
  });
});
