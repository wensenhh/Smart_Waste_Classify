// 路由入口文件
const Router = require('@koa/router');

// 创建主路由器
const router = new Router({
  prefix: '/api/v1' // 设置路由前缀
});

/**
 * 加载所有路由模块
 */
function loadRoutes() {
  try {
    // 基础路由
    router.get('/', async (ctx) => {
      ctx.body = {
        code: 200,
        message: 'Success',
        data: {
          version: process.env.npm_package_version || '1.0.0',
          availableRoutes: [
            '/api/v1/health - Health check',
            '/api/v1/recognition - Waste recognition'
          ]
        }
      };
    });

    // 健康检查路由
    router.get('/health', async (ctx) => {
      ctx.body = {
        code: 200,
        message: 'Success',
        data: {
          status: 'OK',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
      };
    });

    // 导入并注册垃圾识别路由
    const recognitionRoutes = require('./recognitionRoutes');
    router.use('/recognition', recognitionRoutes.routes());

    // 其他路由模块可以在这里添加
    // const userRoutes = require('./userRoutes');
    // router.use('/users', userRoutes.routes());

    console.log('路由模块加载成功');
  } catch (error) {
    console.error('加载路由模块失败:', error.message);
    throw error;
  }
}

// 加载路由
loadRoutes();

/**
 * 导出路由器
 */
module.exports = router;