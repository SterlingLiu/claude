const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { auth, admin } = require('../middleware/auth');
const { csrfProtection, csrfVerify, getCsrfToken } = require('../middleware/csrf');
const userCtrl = require('../controllers/userController');
const itemCtrl = require('../controllers/itemController');
const notifyCtrl = require('../controllers/notificationController');

// CSRF Token 获取接口
router.get('/csrf-token', csrfProtection, getCsrfToken);

// 用户相关接口
router.post('/register', csrfProtection, csrfVerify, userCtrl.register);
router.post('/login', csrfProtection, csrfVerify, userCtrl.login);
router.get('/user/info', auth, userCtrl.getInfo);
router.put('/user/info', auth, csrfProtection, csrfVerify, userCtrl.updateInfo);

// 失物相关接口
router.get('/lost', itemCtrl.listLost);
router.get('/lost/my', auth, itemCtrl.myLost);
router.get('/lost/:id', itemCtrl.getLost);
router.post('/lost', auth, upload.single('image'), csrfProtection, csrfVerify, itemCtrl.createLost);
router.delete('/lost/:id', auth, csrfProtection, csrfVerify, itemCtrl.deleteLost);

// 招领相关接口
router.get('/found', itemCtrl.listFound);
router.get('/found/my', auth, itemCtrl.myFound);
router.get('/found/:id', itemCtrl.getFound);
router.post('/found', auth, upload.single('image'), csrfProtection, csrfVerify, itemCtrl.createFound);
router.delete('/found/:id', auth, csrfProtection, csrfVerify, itemCtrl.deleteFound);

// 认领接口
router.post('/claim/:id', auth, csrfProtection, csrfVerify, itemCtrl.claim);

// 通知接口
router.get('/notifications', auth, notifyCtrl.list);
router.get('/notifications/unread', auth, notifyCtrl.unreadCount);
router.put('/notifications/:id/read', auth, csrfProtection, csrfVerify, notifyCtrl.markRead);

// 文件上传接口
router.post('/upload', auth, upload.single('image'), csrfProtection, csrfVerify, (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, msg: '请选择文件' });
  res.json({ code: 0, data: { url: '/uploads/' + req.file.filename } });
});

module.exports = router;
