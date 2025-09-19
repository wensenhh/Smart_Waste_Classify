// 简单的测试脚本，用于验证Koa应用能否正常启动
const Koa = require('koa');
const Router = require('@koa/router');

// 创建测试应用
const app = new Koa();
const router = new Router();

// 添加测试路由
router.get('/', async (ctx) => {
  ctx.body = {
    message: '测试成功！Koa应用正常运行',
    timestamp: new Date().toISOString()
  };
});

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动测试服务器
const PORT = 3001; // 使用不同的端口避免冲突
const server = app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
  console.log('测试完成后按Ctrl+C停止服务器');
});

// 处理终止信号
process.on('SIGINT', () => {
  console.log('停止测试服务器...');
  server.close(() => {
    console.log('测试服务器已关闭');
    process.exit(0);
  });
});