const request = require('supertest');
const express = require('express');

// 模拟模型
const itemModel = require('../models/item');
jest.mock('../models/item');
const notificationModel = require('../models/notification');
jest.mock('../models/notification');

const app = express();
app.use(express.json());

const itemController = require('../controllers/itemController');

// 模拟认证中间件
const mockAuth = (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'user' };
  next();
};

// 设置路由（注意顺序：/my 在 /:id 之前）
app.get('/api/lost', itemController.listLost);
app.get('/api/lost/my', mockAuth, itemController.myLost);
app.get('/api/lost/:id', itemController.getLost);
app.post('/api/lost', mockAuth, itemController.createLost);
app.delete('/api/lost/:id', mockAuth, itemController.deleteLost);

app.get('/api/found', itemController.listFound);
app.get('/api/found/my', mockAuth, itemController.myFound);
app.get('/api/found/:id', itemController.getFound);
app.post('/api/found', mockAuth, itemController.createFound);
app.delete('/api/found/:id', mockAuth, itemController.deleteFound);

app.post('/api/claim/:id', mockAuth, itemController.claim);

describe('物品模块测试', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===== 失物接口 =====

  describe('GET /api/lost - 获取失物列表', () => {

    it('应该返回失物列表', async () => {
      itemModel.listLost.mockResolvedValue([
        { id: 1, title: '丢失钱包', category: '证件' }
      ]);
      itemModel.countLost.mockResolvedValue(1);

      const res = await request(app).get('/api/lost');

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });

    it('应该支持分页查询', async () => {
      itemModel.listLost.mockResolvedValue([]);
      itemModel.countLost.mockResolvedValue(0);

      await request(app).get('/api/lost').query({ page: 2, size: 10 });

      expect(itemModel.listLost).toHaveBeenCalledWith({
        page: 2, size: 10, keyword: undefined, category: undefined
      });
    });

    it('应该限制分页大小不超过50', async () => {
      itemModel.listLost.mockResolvedValue([]);
      itemModel.countLost.mockResolvedValue(0);

      await request(app).get('/api/lost').query({ size: 100 });

      expect(itemModel.listLost).toHaveBeenCalledWith({
        page: 1, size: 50, keyword: undefined, category: undefined
      });
    });

    it('应该支持关键词搜索', async () => {
      itemModel.listLost.mockResolvedValue([]);
      itemModel.countLost.mockResolvedValue(0);

      await request(app).get('/api/lost').query({ keyword: '钱包' });

      expect(itemModel.listLost).toHaveBeenCalledWith({
        page: 1, size: 12, keyword: '钱包', category: undefined
      });
    });

    it('应该处理数据库错误', async () => {
      itemModel.listLost.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/lost');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/lost/:id - 获取失物详情', () => {

    it('应该返回失物详情', async () => {
      itemModel.findLostById.mockResolvedValue({ id: 1, title: '丢失钱包' });

      const res = await request(app).get('/api/lost/1');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('应该处理物品不存在', async () => {
      itemModel.findLostById.mockResolvedValue(null);

      const res = await request(app).get('/api/lost/999');

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('物品不存在');
    });
  });

  describe('POST /api/lost - 发布失物', () => {

    it('应该成功发布失物', async () => {
      itemModel.createLost.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/lost')
        .send({ title: '丢失钱包', category: '证件', description: '黑色皮质钱包' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('发布成功');
    });

    it('应该拒绝空标题', async () => {
      const res = await request(app)
        .post('/api/lost')
        .send({ title: '', category: '证件' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('物品名称和分类不能为空');
    });

    it('应该拒绝空分类', async () => {
      const res = await request(app)
        .post('/api/lost')
        .send({ title: '丢失钱包', category: '' });

      expect(res.status).toBe(400);
    });

    it('应该拒绝过长的标题', async () => {
      const res = await request(app)
        .post('/api/lost')
        .send({ title: 'a'.repeat(101), category: '证件' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('物品名称不能超过 100 个字符');
    });

    it('应该拒绝无效的分类', async () => {
      const res = await request(app)
        .post('/api/lost')
        .send({ title: '丢失钱包', category: '无效分类' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('无效的物品分类');
    });
  });

  describe('DELETE /api/lost/:id - 删除失物', () => {

    it('应该成功删除失物', async () => {
      itemModel.findLostById.mockResolvedValue({ id: 1, image_url: '/uploads/test.jpg' });
      itemModel.deleteLost.mockResolvedValue(1);

      const res = await request(app).delete('/api/lost/1');

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('删除成功');
    });

    it('应该处理物品不存在或无权删除', async () => {
      itemModel.findLostById.mockResolvedValue(null);
      itemModel.deleteLost.mockResolvedValue(0);

      const res = await request(app).delete('/api/lost/999');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/lost/my - 获取我的失物', () => {

    it('应该返回用户的失物列表', async () => {
      itemModel.myLostItems.mockResolvedValue([
        { id: 1, title: '丢失钱包', user_id: 1 }
      ]);

      const res = await request(app).get('/api/lost/my');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ===== 招领接口 =====

  describe('招领接口', () => {

    it('GET /api/found 应该返回招领列表', async () => {
      itemModel.listFound.mockResolvedValue([{ id: 1, title: '捡到钱包' }]);
      itemModel.countFound.mockResolvedValue(1);

      const res = await request(app).get('/api/found');

      expect(res.status).toBe(200);
      expect(res.body.data.list).toHaveLength(1);
    });

    it('POST /api/found 应该成功发布招领', async () => {
      itemModel.createFound.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/found')
        .send({ title: '捡到钱包', category: '证件' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('发布成功');
    });

    it('DELETE /api/found/:id 应该成功删除招领', async () => {
      itemModel.findFoundById.mockResolvedValue({ id: 1, image_url: '/uploads/test.jpg' });
      itemModel.deleteFound.mockResolvedValue(1);

      const res = await request(app).delete('/api/found/1');

      expect(res.status).toBe(200);
    });

    it('GET /api/found/my 应该返回用户的招领列表', async () => {
      itemModel.myFoundItems.mockResolvedValue([{ id: 1, title: '捡到钱包' }]);

      const res = await request(app).get('/api/found/my');

      expect(res.status).toBe(200);
    });
  });

  // ===== 认领接口 =====

  describe('POST /api/claim/:id - 认领物品', () => {

    it('应该成功发送认领申请（失物）', async () => {
      itemModel.findLostById.mockResolvedValue({
        id: 1, title: '丢失钱包', user_id: 2, status: 0
      });
      notificationModel.findByItemAndUser.mockResolvedValue(null);
      notificationModel.create.mockResolvedValue(1);

      const res = await request(app)
        .post('/api/claim/1')
        .send({ type: 'lost' });

      expect(res.status).toBe(200);
      expect(res.body.msg).toBe('认领申请已发送');
    });

    it('应该拒绝无效的物品类型', async () => {
      const res = await request(app)
        .post('/api/claim/1')
        .send({ type: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('请指定物品类型（lost 或 found）');
    });

    it('应该拒绝认领不存在的物品', async () => {
      itemModel.findLostById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/claim/999')
        .send({ type: 'lost' });

      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('物品不存在');
    });

    it('应该拒绝认领自己发布的物品', async () => {
      itemModel.findLostById.mockResolvedValue({
        id: 1, title: '丢失钱包', user_id: 1, status: 0
      });

      const res = await request(app)
        .post('/api/claim/1')
        .send({ type: 'lost' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('不能认领自己发布的物品');
    });

    it('应该拒绝认领已认领的物品', async () => {
      itemModel.findLostById.mockResolvedValue({
        id: 1, title: '丢失钱包', user_id: 2, status: 1
      });

      const res = await request(app)
        .post('/api/claim/1')
        .send({ type: 'lost' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe('该物品已被认领/找到');
    });

    it('应该拒绝重复认领', async () => {
      itemModel.findLostById.mockResolvedValue({
        id: 1, title: '丢失钱包', user_id: 2, status: 0
      });
      notificationModel.findByItemAndUser.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/claim/1')
        .send({ type: 'lost' });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain('已经认领过');
    });
  });
});
