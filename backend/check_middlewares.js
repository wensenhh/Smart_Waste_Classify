// 检查中间件是否是函数的测试脚本
const security = require('./src/middlewares/security');
const errorHandler = require('./src/middlewares/errorHandler');
const logger = require('./src/middlewares/logger');
const uploadMiddleware = require('./src/middlewares/upload').uploadMiddleware;

console.log('=== 中间件类型检查 ===');

// 检查 security 中间件
console.log('\n--- Security Middlewares ---');
Object.keys(security).forEach(key => {
  if (key !== 'UnauthorizedError' && key !== 'ForbiddenError') {
    console.log(`${key}: ${typeof security[key]}${typeof security[key] !== 'function' ? ' ❌ NOT A FUNCTION!' : ''}`);
  }
});

// 检查其他中间件
console.log('\n--- Other Middlewares ---');
console.log(`errorHandler: ${typeof errorHandler}${typeof errorHandler !== 'function' ? ' ❌ NOT A FUNCTION!' : ''}`);
console.log(`logger: ${typeof logger}${typeof logger !== 'function' ? ' ❌ NOT A FUNCTION!' : ''}`);

// 检查上传中间件
console.log('\n--- Upload Middleware ---');
Object.keys(uploadMiddleware).forEach(key => {
  console.log(`uploadMiddleware.${key}: ${typeof uploadMiddleware[key]}${typeof uploadMiddleware[key] !== 'function' ? ' ❌ NOT A FUNCTION!' : ''}`);
});

console.log('\n=== 检查完成 ===');