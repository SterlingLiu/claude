const express = require('express');
const router = express.Router();
const { upload, saveUploadedFile } = require('../middleware/upload');
const { auth, admin } = require('../middleware/auth');
const userCtrl = require('../controllers/userController');
const itemCtrl = require('../controllers/itemController');
const notifyCtrl = require('../controllers/notificationController');

// 用户相关接口
router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.get('/user/info', auth, userCtrl.getInfo);
router.put('/user/info', auth, userCtrl.updateInfo);

// 失物相关接口
router.get('/lost', itemCtrl.listLost);
router.get('/my/lost', auth, itemCtrl.myLost);
router.get('/lost/:id', itemCtrl.getLost);
router.post('/lost', auth, upload.single('image'), saveUploadedFile, itemCtrl.createLost);
router.delete('/lost/:id', auth, itemCtrl.deleteLost);

// 招领相关接口
router.get('/found', itemCtrl.listFound);
router.get('/my/found', auth, itemCtrl.myFound);
router.get('/found/:id', itemCtrl.getFound);
router.post('/found', auth, upload.single('image'), saveUploadedFile, itemCtrl.createFound);
router.delete('/found/:id', auth, itemCtrl.deleteFound);

// 认领接口
router.post('/claim/:id', auth, itemCtrl.claim);

// 通知接口
router.get('/notifications', auth, notifyCtrl.list);
router.get('/notifications/unread', auth, notifyCtrl.unreadCount);
router.put('/notifications/:id/read', auth, notifyCtrl.markRead);
router.delete('/notifications/:id', auth, notifyCtrl.delete);

// 文件上传接口
router.post('/upload', auth, upload.single('image'), saveUploadedFile, (req, res) => {
  if (!req.file) return res.status(400).json({ code: 400, msg: '请选择文件' });
  res.json({ code: 0, data: { url: '/uploads/' + req.file.filename } });
});

module.exports = router;
