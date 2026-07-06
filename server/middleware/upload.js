const crypto = require('crypto');
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

// 文件魔数签名（用于验证文件真实类型）
const MAGIC_SIGNATURES = {
  'image/jpeg': { bytes: [0xFF, 0xD8, 0xFF], offset: 0, minLength: 3 },
  'image/png':  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0, minLength: 8 },
  'image/gif':  { bytes: [0x47, 0x49, 0x46, 0x38], offset: 0, minLength: 6 }, // GIF87a or GIF89a
  'image/webp': { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0, webpCheck: true }, // RIFF....WEBP
};

/**
 * 根据文件魔数验证真实文件类型
 * @param {Buffer} buffer - 文件内容缓冲区
 * @param {string} expectedMime - 预期的 MIME 类型
 * @returns {boolean}
 */
function verifyMagicBytes(buffer, expectedMime) {
  const sig = MAGIC_SIGNATURES[expectedMime];
  if (!sig) return false;

  if (buffer.length < sig.minLength) return false;

  if (sig.webpCheck) {
    return buffer.length >= 12
      && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46
      && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  }

  for (let i = 0; i < sig.bytes.length; i++) {
    if (buffer[sig.offset + i] !== sig.bytes[i]) return false;
  }
  return true;
}

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

// Multer 实例 - 使用内存存储以便验证文件魔数
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 1,
  },
});

/**
 * 将内存中的文件写入磁盘（魔数验证通过后调用）
 * @param {object} req - Express 请求对象
 * @param {object} res - Express 响应对象
 * @param {function} next - Express 中间件回调
 */
function saveUploadedFile(req, res, next) {
  if (!req.file) return next();

  // 验证文件魔数，防止文件类型伪装
  const mime = req.file.mimetype;
  if (!verifyMagicBytes(req.file.buffer, mime)) {
    return next(Object.assign(new Error('文件内容与声明格式不符，上传失败'), { status: 400 }));
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const filename = Date.now() + '-' + crypto.randomBytes(8).toString('hex') + ext;
  const filepath = path.join(uploadDir, filename);

  try {
    fs.writeFileSync(filepath, req.file.buffer);
    req.file.filename = filename;
    req.file.path = filepath;
  } catch (err) {
    next(Object.assign(new Error('文件保存失败，请稍后重试'), { status: 500 }));
    return;
  }

  next();
}

module.exports = { upload, saveUploadedFile };
