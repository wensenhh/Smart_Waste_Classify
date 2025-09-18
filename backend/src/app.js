const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 导入中间件
const { errorHandler } = require('./middlewares/errorHandler');
const { logger } = require('./middlewares/logger');
const security = require('./middlewares/security'); // 导入安全中间件
const db = require('./utils/db');

// 创建Koa应用实例
const app = new Koa();

// 设置应用环境和代理配置
app.env = process.env.NODE_ENV || 'development';
app.proxy = process.env.TRUST_PROXY === 'true';

/**
 * 初始化应用
 */
async function initializeApp() {
  try {
    // 数据库连接测试
    await db.initPool();
    const isConnected = await db.testConnection();
    if (!isConnected) {
      throw new Error('数据库连接测试失败');
    }

    // 配置中间件
    configureMiddlewares();
    
    // 配置路由
    configureRoutes();
    
    // 配置404处理
    configure404Handler();

    return app;
  } catch (error) {
    console.error('应用初始化失败:', error.message);
    throw error;
  }
}

/**
 * 配置中间件
 */
function configureMiddlewares() {
  // 错误处理中间件（应该放在最前面）
  app.use(errorHandler);

  // 安全相关中间件
  app.use(security.helmet);
  app.use(security.cors);
  // 不将jwtAuth作为全局中间件，因为路由文件中已正确配置
  
  // 日志中间件
  app.use(logger);
  
  // 性能监控中间件
  // app.use(performanceMonitor);
  
  // 国际化中间件
  // app.use(i18n);
  
  // 请求解析中间件
  app.use(bodyParser({
    enableTypes: ['json', 'form'],
    formLimit: '10mb',
    jsonLimit: '10mb'
  }));

  // 限流中间件（暂时移除，等待修复配置）
  // app.use(security.rateLimiter);
  
  // 敏感数据掩码中间件
  app.use(security.maskSensitiveData);
}

/**
 * 配置路由
 */
function configureRoutes() {
  // 导入路由
  const routes = require('./routes');
  
  // 健康检查基础路由
  app.use(async (ctx, next) => {
    if (ctx.path === '/health') {
      ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      return;
    }
    await next();
  });

  // 欢迎接口
  app.use(async (ctx, next) => {
    if (ctx.path === '/') {
      ctx.body = {
        message: '欢迎使用智能垃圾分类系统API',
        version: '1.0.0',
        apiEndpoints: [
          '/api/v1/recognition',
          '/api/v1/health'
        ]
      };
      return;
    }
    await next();
  });
  
  // 注册API路由
  app.use(routes.routes());
  app.use(routes.allowedMethods());
}

/**
 * 配置404处理
 */
function configure404Handler() {
  // 404中间件（应该放在最后）
  app.use(async (ctx) => {
    ctx.status = 404;
    ctx.body = {
      code: 404,
      message: '请求的资源不存在'
    };
  });
}

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 初始化应用
    const app = await initializeApp();
    
    // 确保上传目录存在
    const UPLOAD_DIR = process.env.FILE_UPLOAD_DIR || './uploads';
    const fs = require('fs');
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      console.log(`上传目录创建成功: ${UPLOAD_DIR}`);
    }
    
    // 启动HTTP服务器
    const PORT = process.env.PORT || 3001; // 改为3001端口以解决端口被占用问题
    const httpServer = app.listen(PORT, () => {
      console.log(`智能垃圾分类系统后端服务运行在 http://localhost:${PORT}`);
      console.log(`当前环境: ${process.env.NODE_ENV}`);
    });
    
    // 优雅关闭处理
    process.on('SIGTERM', () => {
      console.log('收到SIGTERM信号，正在关闭服务器...');
      httpServer.close(() => {
        console.log('HTTP服务器已关闭');
        // 关闭数据库连接
        if (db.closePool) {
          db.closePool();
        }
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('收到SIGINT信号，正在关闭服务器...');
      httpServer.close(() => {
        console.log('HTTP服务器已关闭');
        // 关闭数据库连接
        if (db.closePool) {
          db.closePool();
        }
        process.exit(0);
      });
    });
    
    return { app, httpServer };
  } catch (error) {
    console.error('服务器启动失败:', error.message);
    process.exit(1);
  }
}

// 导出应用实例和启动函数
module.exports = {
  app,
  initializeApp,
  startServer
};

// 如果直接运行此文件，则启动服务器
if (require.main === module) {
  startServer();
}