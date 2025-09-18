const request = require('supertest');
const Koa = require('koa');

// 创建一个极简的Koa应用进行测试
const simpleApp = new Koa();

simpleApp.use(async (ctx) => {
  if (ctx.path === '/api/test') {
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: 'Test endpoint works'
    };
  } else {
    ctx.status = 404;
    ctx.body = {
      success: false,
      message: 'Not found'
    };
  }
});

describe('简化的测试套件', () => {
  it('应该能够处理基本的HTTP请求', async () => {
    const response = await request(simpleApp.callback()).get('/api/test');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});