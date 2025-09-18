// Jest 全局设置文件

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DB_HOST = '43.217.144.41';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'smart_waste';
process.env.DB_PASSWORD = 'injZ34rWYiZMm7xG';
process.env.DB_NAME = 'smart_waste';
process.env.UPLOAD_DIR = './uploads/test';
process.env.MAX_FILE_SIZE = '5242880';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX = '100';

// 全局导入Node.js内置模块
const fs = require('fs');
const path = require('path');

// 创建测试上传目录
const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 模拟文件上传
jest.mock('./src/utils/fileUpload', () => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR || './uploads/test');
  
  return {
    uploadFile: jest.fn(async (file, options = {}) => ({
      filename: 'test-file.jpg',
      path: path.resolve(uploadDir, 'test-file.jpg'),
      url: '/uploads/test/test-file.jpg',
      size: 1024,
      mimetype: 'image/jpeg',
    })),
    deleteFile: jest.fn(async (filename) => true),
    getFileInfo: jest.fn(async (filename) => ({
      filename: 'test-file.jpg',
      path: path.resolve(uploadDir, 'test-file.jpg'),
      size: 1024,
      mimetype: 'image/jpeg',
      createdAt: new Date(),
    })),
    cleanExpiredFiles: jest.fn(async () => 0),
  };
});

// 模拟数据库连接
jest.mock('./src/utils/db', () => {
  return {
    initPool: jest.fn(async () => {
      return {
        query: jest.fn(),
        execute: jest.fn(),
        close: jest.fn(),
      };
    }),
    testConnection: jest.fn(async () => true),
    query: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    del: jest.fn(),
    transaction: jest.fn(),
    closePool: jest.fn(async () => true),
    getPoolStatus: jest.fn(() => ({ status: 'initialized' }))
  };
});

// 全局异常处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// 扩展expect匹配器
expect.extend({
  toBeObject(received) {
    const pass = typeof received === 'object' && received !== null && !Array.isArray(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be an object`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be an object`,
        pass: false,
      };
    }
  },
  
  toHavePropertyWithValue(received, propertyPath, expectedValue) {
    const properties = propertyPath.split('.');
    let current = received;
    
    for (const prop of properties) {
      if (current === undefined || current === null || !(prop in current)) {
        return {
          message: () => `expected ${JSON.stringify(received)} to have property ${propertyPath}`,
          pass: false,
        };
      }
      current = current[prop];
    }
    
    const pass = current === expectedValue;
    return {
      message: () => `expected ${JSON.stringify(received)} property ${propertyPath} to be ${expectedValue}, but got ${current}`,
      pass: pass,
    };
  },
});

// 全局清理函数
afterAll(async () => {
  // 清理测试上传文件
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    for (const file of files) {
      fs.unlinkSync(path.resolve(uploadDir, file));
    }
  }
  
  // 重置所有mock
  jest.clearAllMocks();
});