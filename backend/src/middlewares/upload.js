// 文件上传中间件
const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs'); // 提前加载fs模块

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

// 存储配置 - 使用memoryStorage以便在控制器中直接访问file.buffer
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req, file, cb) => {
  try {
    console.log('文件过滤中:', { filename: file.originalname, mimetype: file.mimetype, size: file.size });
    validateFile(file);
    console.log('文件验证通过:', file.originalname);
    cb(null, true);
  } catch (error) {
    console.error('文件验证失败:', { filename: file.originalname, error: error.message });
    cb(new Error(error.message), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 5MB
    fieldNameSize: 100, // 字段名最大长度
    fieldSize: 1024 * 1024, // 非文件字段值最大长度
    fields: 5, // 非文件字段最大数量
    files: 1, // 文件最大数量
    parts: 10, // 最大部分数
    headerPairs: 200 // 头部键值对最大数量
  }
});

// 上传中间件
const uploadMiddleware = {
  single: (fieldName = 'file') => {
    // @koa/multer已经内部处理了Express风格到Koa风格的转换
    // 直接返回multer中间件即可
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
    // 在@koa/multer中，通过检查err.code来识别multer错误，而不是通过instanceof
    if (err && err.code && (err.code.startsWith('LIMIT_') || err.name === 'MulterError')) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        ctx.status = 413;
        ctx.body = {
          code: 413,
          message: '文件大小超过限制。请上传小于20MB的图片。'
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