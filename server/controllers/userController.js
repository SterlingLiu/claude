const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');

// 用户名/密码格式验证
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const PHONE_RE = /^1[3-9]\d{9}$/;

exports.register = async (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    // 输入验证
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '用户名和密码不能为空' });
    }
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ code: 400, msg: '用户名只能包含字母、数字、下划线，长度 3-20' });
    }
    if (password.length < 6 || password.length > 50) {
      return res.status(400).json({ code: 400, msg: '密码长度需在 6-50 位之间' });
    }
    if (nickname && nickname.length > 30) {
      return res.status(400).json({ code: 400, msg: '昵称不能超过 30 个字符' });
    }

    // 检查用户名是否已存在
    const exist = await userModel.findByUsername(username);
    if (exist) {
      return res.status(400).json({ code: 400, msg: '用户名已存在' });
    }

    // 加密密码并创建用户
    const hash = await bcrypt.hash(password, 10);
    const id = await userModel.create({ username, password: hash, nickname: nickname || username });
    res.json({ code: 0, msg: '注册成功', data: { id } });
  } catch (err) {
    console.error('[注册]', err);
    res.status(500).json({ code: 500, msg: '注册失败' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '用户名和密码不能为空' });
    }

    // 查找用户
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.status(400).json({ code: 400, msg: '用户名或密码错误' });
    }

    // 验证密码
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ code: 400, msg: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role },
      },
    });
  } catch (err) {
    console.error('[登录]', err);
    res.status(500).json({ code: 500, msg: '登录失败' });
  }
};

exports.getInfo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, msg: '用户不存在' });
    }
    res.json({ code: 0, data: user });
  } catch (err) {
    console.error('[获取用户信息]', err);
    res.status(500).json({ code: 500, msg: '获取失败' });
  }
};

exports.updateInfo = async (req, res) => {
  try {
    const { nickname, phone } = req.body;
    const fields = {};

    if (nickname !== undefined) {
      // 添加空字符串验证
      if (nickname.trim() === '') {
        return res.status(400).json({ code: 400, msg: '昵称不能为空' });
      }
      if (nickname.length > 30) {
        return res.status(400).json({ code: 400, msg: '昵称不能超过 30 个字符' });
      }
      fields.nickname = nickname.trim();
    }
    if (phone !== undefined) {
      if (phone && !PHONE_RE.test(phone)) {
        return res.status(400).json({ code: 400, msg: '手机号格式不正确' });
      }
      fields.phone = phone;
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ code: 400, msg: '没有要修改的内容' });
    }

    await userModel.update(req.user.id, fields);
    res.json({ code: 0, msg: '修改成功' });
  } catch (err) {
    console.error('[更新用户信息]', err);
    res.status(500).json({ code: 500, msg: '修改失败' });
  }
};
