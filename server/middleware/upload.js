const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 允许的文件扩展名
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// 允许的 MIME 类型
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// 文件存储配置
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // 获取文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();

    // 验证文件扩展名
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('不支持的文件格式，只允许 JPG/PNG/GIF/WebP'));
    }

    // 使用时间戳 + 随机数防止文件名冲突
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

// 文件过滤器 - 验证文件类型
const fileFilter = (req, file, cb) => {
  // 检查 MIME 类型
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error('只允许上传 JPG/PNG/GIF/WebP 格式的图片'));
  }

  // 检查文件扩展名
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('不支持的文件格式，只允许 JPG/PNG/GIF/WebP'));
  }

  cb(null, true);
};

// Multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 默认 5MB
    files: 1, // 每次最多上传 1 个文件
  },
});

module.exports = upload;
