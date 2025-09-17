// 文件上传中间件
const multer = require('@koa/multer');
const path = require('path');

// 文件验证函数
function validateFile(file) {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('不支持的文件类型。请上传JPEG、PNG、GIF或WebP格式的图片。');
  }

  // 检查文件大小（5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('文件大小超过限制。请上传小于5MB的图片。');
  }

  return true;
}

// 存储配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 确保上传目录存在
    const fs = require('fs');
    const uploadDir = process.env.FILE_UPLOAD_DIR || './uploads';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  try {
    validateFile(file);
    cb(null, true);
  } catch (error) {
    cb(new Error(error.message), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 上传中间件
const uploadMiddleware = {
  single: (fieldName = 'file') => {
    return upload.single(fieldName);
  },
  array: (fieldName = 'files', maxCount = 5) => {
    return upload.array(fieldName, maxCount);
  },
  fields: (fields) => {
    return upload.fields(fields);
  }
};

// 错误处理中间件 - Koa版本
const uploadErrorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        ctx.status = 413;
        ctx.body = {
          code: 413,
          message: '文件大小超过限制。请上传小于5MB的图片。'
        };
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '文件数量超过限制。'
        };
      } else {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '文件上传错误: ' + err.message
        };
      }
    } else if (err) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: err.message || '文件上传失败'
      };
    }
  }
};

// 验证已上传的文件
function validateUploadedFile(file) {
  try {
    validateFile(file);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// 验证多个已上传的文件
function validateUploadedFiles(files) {
  const results = [];
  
  if (!files || files.length === 0) {
    return { valid: false, error: '没有上传文件' };
  }
  
  for (const file of files) {
    const result = validateUploadedFile(file);
    results.push({
      filename: file.originalname,
      ...result
    });
    
    if (!result.valid) {
      return { valid: false, results };
    }
  }
  
  return { valid: true, results };
}

// 导出文件上传中间件
module.exports = {
  upload,
  validateFile,
  validateUploadedFile,
  validateUploadedFiles,
  uploadMiddleware,
  uploadErrorHandler
};