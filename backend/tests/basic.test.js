// 基本功能测试
const request = require('supertest');
const app = require('../src/app');
const { closePool } = require('../src/utils/db');

// 测试用户数据
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test@123',
  nickname: '测试用户',
  phone: '13800138000'
};

let authToken = '';

describe('智能垃圾分类系统基本功能测试', () => {
  // 测试前的准备
  beforeAll(async () => {
    // 初始化数据库连接
    await db.initPool();
  });

  // 测试后的清理
  afterAll(async () => {
    // 关闭数据库连接池
    await closePool();
  });

  // 测试健康检查接口
  describe('GET /api/health', () => {
    it('应该返回200状态码和健康信息', async () => {
      const response = await request(app.callback()).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'ok');
    });
  });

  // 测试欢迎接口
  describe('GET /api/welcome', () => {
    it('应该返回200状态码和欢迎信息', async () => {
      const response = await request(app.callback()).get('/api/welcome');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('应该支持不同语言的欢迎信息', async () => {
      const response = await request(app.callback()).get('/api/welcome?lang=en');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  // 测试用户注册接口
  describe('POST /api/users/register', () => {
    it('应该成功注册新用户', async () => {
      const response = await request(app.callback())
        .post('/api/users/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).toHaveProperty('email', testUser.email);
    });

    it('应该拒绝重复用户名注册', async () => {
      const response = await request(app.callback())
        .post('/api/users/register')
        .send(testUser);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该拒绝无效的注册数据', async () => {
      const invalidUser = {
        ...testUser,
        password: 'short' // 密码太短
      };
      
      const response = await request(app.callback())
        .post('/api/users/register')
        .send(invalidUser);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  // 测试用户登录接口
  describe('POST /api/users/login', () => {
    it('应该成功登录并返回token', async () => {
      const response = await request(app.callback())
        .post('/api/users/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      
      // 保存token用于后续测试
      authToken = response.body.data.token;
    });

    it('应该拒绝无效的登录凭证', async () => {
      const response = await request(app.callback())
        .post('/api/users/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  // 测试需要身份验证的接口
  describe('GET /api/users/profile', () => {
    it('应该使用有效token获取用户资料', async () => {
      const response = await request(app.callback())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('username', testUser.username);
      expect(response.body.data).toHaveProperty('email', testUser.email);
    });

    it('应该拒绝没有token的请求', async () => {
      const response = await request(app.callback())
        .get('/api/users/profile');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('应该拒绝无效的token', async () => {
      const response = await request(app.callback())
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  // 测试垃圾识别相关接口
  describe('垃圾识别接口测试', () => {
    // 测试获取垃圾类别列表
    it('应该返回垃圾类别列表', async () => {
      const response = await request(app.callback())
        .get('/api/recognition/categories');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('object');
    });

    // 测试搜索垃圾信息
    it('应该返回垃圾搜索结果', async () => {
      const response = await request(app.callback())
        .get('/api/recognition/search?keyword=塑料');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    // 注意：垃圾识别接口需要上传文件，这里不进行完整测试
  });

  // 测试用户识别历史接口（需要登录）
  describe('GET /api/recognition/history', () => {
    it('应该返回用户的识别历史（空列表）', async () => {
      const response = await request(app.callback())
        .get('/api/recognition/history')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  // 测试用户识别统计接口（需要登录）
  describe('GET /api/recognition/stats/categories', () => {
    it('应该返回用户的垃圾类别统计', async () => {
      const response = await request(app.callback())
        .get('/api/recognition/stats/categories')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.data).toBe('object');
    });
  });
});