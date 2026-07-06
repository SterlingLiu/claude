const notificationModel = require('../models/notification');

exports.list = async (req, res) => {
  try {
    const rows = await notificationModel.list(req.user.id);
    res.json({ code: 0, data: rows });
  } catch (err) {
    console.error('[通知列表]', err);
    res.status(500).json({ code: 500, msg: '获取通知失败' });
  }
};

exports.unreadCount = async (req, res) => {
  try {
    const count = await notificationModel.unreadCount(req.user.id);
    res.json({ code: 0, data: { count } });
  } catch (err) {
    console.error('[未读通知数]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

exports.markRead = async (req, res) => {
  try {
    await notificationModel.markRead(req.params.id, req.user.id);
    res.json({ code: 0, msg: '已标记' });
  } catch (err) {
    console.error('[标记已读]', err);
    res.status(500).json({ code: 500, msg: '操作失败' });
  }
};

exports.delete = async (req, res) => {
  try {
    const affected = await notificationModel.delete(req.params.id, req.user.id);
    if (affected === 0) {
      return res.status(404).json({ code: 404, msg: '通知不存在或无权删除' });
    }
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('[删除通知]', err);
    res.status(500).json({ code: 500, msg: '操作失败' });
  }
};
