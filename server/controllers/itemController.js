const itemModel = require('../models/item');
const notificationModel = require('../models/notification');

// 允许的物品分类
const CATEGORIES = ['证件', '电子产品', '生活用品', '衣物', '钥匙', '书本', '其他'];

// 分页参数校验和规范化
function normalizePagination(query) {
  const pageNum = parseInt(query.page, 10);
  const sizeNum = parseInt(query.size, 10);

  // 验证并规范化页码和每页数量
  const page = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1;
  const size = Number.isInteger(sizeNum) && sizeNum > 0 ? Math.min(sizeNum, 50) : 12;

  return { page, size };
}

// ===== 失物 (Lost) =====

exports.listLost = async (req, res) => {
  try {
    const { page, size } = normalizePagination(req.query);
    const { keyword, category } = req.query;
    const [rows, total] = await Promise.all([
      itemModel.listLost({ page, size, keyword, category }),
      itemModel.countLost({ keyword, category }),
    ]);
    res.json({ code: 0, data: { list: rows, total, page, size } });
  } catch (err) {
    console.error('[失物列表]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

exports.getLost = async (req, res) => {
  try {
    const lost = await itemModel.findLostById(req.params.id);
    if (!lost) return res.status(404).json({ code: 404, msg: '物品不存在' });
    res.json({ code: 0, data: lost });
  } catch (err) {
    console.error('[失物详情]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

exports.createLost = async (req, res) => {
  try {
    const { title, category, description, lost_place, lost_time, contact_info } = req.body;

    // 必填字段验证
    if (!title || !category) {
      return res.status(400).json({ code: 400, msg: '物品名称和分类不能为空' });
    }
    if (title.length > 100) {
      return res.status(400).json({ code: 400, msg: '物品名称不能超过 100 个字符' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ code: 400, msg: '无效的物品分类' });
    }

    const image_url = req.file ? '/uploads/' + req.file.filename : null;

    // 安全处理时间字段
    let safeTime = null;
    if (lost_time) {
      const d = new Date(lost_time);
      if (!isNaN(d.getTime())) {
        safeTime = d.toISOString().slice(0, 19).replace('T', ' ');
      }
    }

    const id = await itemModel.createLost({
      user_id: req.user.id, title, category, description,
      image_url, lost_place, lost_time: safeTime, contact_info,
    });
    res.json({ code: 0, msg: '发布成功', data: { id } });
  } catch (err) {
    console.error('[发布失物]', err);
    res.status(500).json({ code: 500, msg: '发布失败' });
  }
};

exports.deleteLost = async (req, res) => {
  try {
    const affected = await itemModel.deleteLost(req.params.id, req.user.id);
    if (affected === 0) {
      return res.status(404).json({ code: 404, msg: '物品不存在或无权删除' });
    }
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('[删除失物]', err);
    res.status(500).json({ code: 500, msg: '删除失败' });
  }
};

exports.myLost = async (req, res) => {
  try {
    const rows = await itemModel.myLostItems(req.user.id);
    res.json({ code: 0, data: rows });
  } catch (err) {
    console.error('[我的失物]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

// ===== 招领 (Found) =====

exports.listFound = async (req, res) => {
  try {
    const { page, size } = normalizePagination(req.query);
    const { keyword, category } = req.query;
    const [rows, total] = await Promise.all([
      itemModel.listFound({ page, size, keyword, category }),
      itemModel.countFound({ keyword, category }),
    ]);
    res.json({ code: 0, data: { list: rows, total, page, size } });
  } catch (err) {
    console.error('[招领列表]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

exports.getFound = async (req, res) => {
  try {
    const found = await itemModel.findFoundById(req.params.id);
    if (!found) return res.status(404).json({ code: 404, msg: '物品不存在' });
    res.json({ code: 0, data: found });
  } catch (err) {
    console.error('[招领详情]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

exports.createFound = async (req, res) => {
  try {
    const { title, category, description, found_place, found_time, contact_info } = req.body;

    if (!title || !category) {
      return res.status(400).json({ code: 400, msg: '物品名称和分类不能为空' });
    }
    if (title.length > 100) {
      return res.status(400).json({ code: 400, msg: '物品名称不能超过 100 个字符' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ code: 400, msg: '无效的物品分类' });
    }

    const image_url = req.file ? '/uploads/' + req.file.filename : null;

    let safeTime = null;
    if (found_time) {
      const d = new Date(found_time);
      if (!isNaN(d.getTime())) {
        safeTime = d.toISOString().slice(0, 19).replace('T', ' ');
      }
    }

    const id = await itemModel.createFound({
      user_id: req.user.id, title, category, description,
      image_url, found_place, found_time: safeTime, contact_info,
    });
    res.json({ code: 0, msg: '发布成功', data: { id } });
  } catch (err) {
    console.error('[发布招领]', err);
    res.status(500).json({ code: 500, msg: '发布失败' });
  }
};

exports.deleteFound = async (req, res) => {
  try {
    const affected = await itemModel.deleteFound(req.params.id, req.user.id);
    if (affected === 0) {
      return res.status(404).json({ code: 404, msg: '物品不存在或无权删除' });
    }
    res.json({ code: 0, msg: '删除成功' });
  } catch (err) {
    console.error('[删除招领]', err);
    res.status(500).json({ code: 500, msg: '删除失败' });
  }
};

exports.myFound = async (req, res) => {
  try {
    const rows = await itemModel.myFoundItems(req.user.id);
    res.json({ code: 0, data: rows });
  } catch (err) {
    console.error('[我的招领]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

// ===== 认领 =====

exports.claim = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;

    // 验证 type 参数
    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json({ code: 400, msg: '请指定物品类型（lost 或 found）' });
    }

    const item = type === 'lost'
      ? await itemModel.findLostById(id)
      : await itemModel.findFoundById(id);

    if (!item) {
      return res.status(404).json({ code: 404, msg: '物品不存在' });
    }

    // 不能认领自己发布的物品
    if (Number(item.user_id) === Number(req.user.id)) {
      return res.status(400).json({ code: 400, msg: '不能认领自己发布的物品' });
    }

    // 检查物品状态
    if (item.status !== 0) {
      return res.status(400).json({ code: 400, msg: '该物品已被认领/找到' });
    }

    // 检查是否已经认领过
    const existingClaim = await notificationModel.findByItemAndUser(id, req.user.id, type);
    if (existingClaim) {
      return res.status(400).json({ code: 400, msg: '您已经认领过该物品，请等待发布者确认' });
    }

    // 创建认领通知
    await notificationModel.create({
      from_user_id: req.user.id,
      to_user_id: item.user_id,
      item_id: id,
      item_type: type,
      message: `有人想认领你发布的「${item.title}」，请查看详情`,
    });

    res.json({ code: 0, msg: '认领申请已发送' });
  } catch (err) {
    console.error('[认领]', err);
    res.status(500).json({ code: 500, msg: '操作失败' });
  }
};
