// 文件上传配置
const path = require('path');

/**
 * 文件上传配置
 * 定义文件上传的相关参数和限制
 */

// 上传目录配置 - 与app.js保持一致，使用环境变量或项目根目录下的uploads
const uploadDir = process.env.FILE_UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');

// 文件大小限制 (5MB)
const maxFileSize = 5 * 1024 * 1024;

// 允许的文件类型
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// 允许的文件扩展名
const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp'
];

// 图像优化配置
const imageOptimization = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: {
    jpeg: 80,
    png: 6,
    webp: 80
  },
  progressive: true
};

// 临时文件配置
const tempFile = {
  dir: path.join(__dirname, 'temp'),
  expiryTime: 24 * 60 * 60 * 1000 // 24小时
};

// 静态文件服务配置
const staticServe = {
  root: uploadDir,
  prefix: '/static/uploads',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30天缓存
};

// 多部分表单解析配置
const multipart = {
  fields: 10, // 最大字段数
  files: 5, // 最大文件数
  parts: 15 // 最大parts数
};

// 安全配置
const security = {
  // 防止路径遍历攻击
  preventPathTraversal: true,
  // 文件名清理规则
  sanitizeFilename: true,
  // 病毒扫描（实际项目中可能需要集成第三方病毒扫描服务）
  virusScan: false
};

// 文件存储策略
const storageStrategy = {
  type: 'local', // local, s3, gcs等
  // 本地存储配置
  local: {
    directory: uploadDir,
    createDirIfNotExists: true
  },
  // S3存储配置（示例，实际项目中需根据需要启用）
  s3: {
    enabled: false,
    bucket: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    endpoint: ''
  }
};

// 日志配置
const logging = {
  enabled: true,
  level: 'info',
  rotate: {
    size: '100m',
    days: 7
  }
};

// 缩略图配置
const thumbnails = {
  enabled: true,
  sizes: [
    { name: 'small', width: 100, height: 100 },
    { name: 'medium', width: 300, height: 300 },
    { name: 'large', width: 800, height: 800 }
  ],
  format: 'webp',
  quality: 80
};

// 清理配置
const cleanup = {
  enabled: true,
  interval: 'daily', // daily, weekly, monthly
  retainDays: 30, // 保留天数
  dryRun: false // 测试模式
};

module.exports = {
  uploadDir,
  maxFileSize,
  allowedMimeTypes,
  allowedExtensions,
  imageOptimization,
  tempFile,
  staticServe,
  multipart,
  security,
  storageStrategy,
  logging,
  thumbnails,
  cleanup
};