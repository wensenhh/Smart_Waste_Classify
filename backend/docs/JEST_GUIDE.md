# Jest测试框架指南

## 什么是Jest？

Jest是一个由Facebook开发的JavaScript测试框架，它提供了一个完整的测试解决方案，包括测试运行器、断言库、mock功能和覆盖率报告等。在本项目中，Jest被用于后端API的单元测试和集成测试。

## 项目中的Jest配置

### 主要配置文件

1. **jest.config.js** - 核心配置文件，定义了测试环境、文件匹配模式等
2. **jest.setup.js** - 测试前的设置脚本，用于配置环境变量和模拟功能
3. **package.json** - 定义了测试相关的npm脚本命令

### 配置详情

#### jest.config.js

```javascript
module.exports = {
  // 测试环境
  testEnvironment: 'node',
  // 测试文件匹配模式
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  // 忽略的目录
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // 模块名称映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 测试运行器配置
  runner: 'jest-runner',
  // 覆盖率报告配置
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.d.ts', '!src/**/index.js', '!src/**/config/**', '!src/**/utils/db.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  // 转换配置
  transform: {
    '^.+\.jsx?$': 'babel-jest',
  },
  // 转换忽略
  transformIgnorePatterns: ['/node_modules/', '\.pnp\.[^\/]+$'],
  // 全局设置
  setupFilesAfterEnv: ['./jest.setup.js'],
  // 测试超时设置
  testTimeout: 30000,
  // 检测内存泄漏
  detectLeaks: true,
  // 缓存配置
  cacheDirectory: '.jest-cache',
};
```

#### jest.setup.js

该文件主要完成以下工作：
- 设置测试环境变量（NODE_ENV=test）
- 配置测试用的数据库连接参数
- 创建测试上传目录
- 模拟文件上传功能
- 模拟数据库连接池
- 设置全局异常处理
- 扩展Jest的expect匹配器

## 如何使用Jest

### 安装依赖

```bash
# 安装所有依赖（包括测试依赖）
npm install
```

### 运行测试

项目中定义了以下测试相关的npm脚本：

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 编写测试用例

#### 测试文件结构

测试文件通常放在`tests/`目录下，遵循`*.test.js`的命名规范。

#### 测试用例示例

以下是`tests/basic.test.js`中的一个测试用例示例：

```javascript
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
```

#### 测试前的准备和测试后的清理

Jest提供了`beforeAll`、`afterAll`、`beforeEach`和`afterEach`等钩子函数，可以在测试前进行准备工作，测试后进行清理工作：

```javascript
describe('智能垃圾分类系统基本功能测试', () => {
  // 测试前的准备
  beforeAll(async () => {
    // 确保应用已经启动
    if (!app.server || !app.server.listening) {
      await new Promise((resolve) => {
        app.server = app.listen(0, 'localhost', resolve);
      });
    }
  });

  // 测试后的清理
  afterAll(async () => {
    // 关闭数据库连接池
    await closePool();
    // 关闭服务器
    if (app.server && app.server.listening) {
      await new Promise((resolve) => {
        app.server.close(resolve);
      });
    }
  });
});
```

#### 使用supertest测试API接口

本项目使用`supertest`库来测试API接口：

```javascript
const request = require('supertest');
const app = require('../src/app');

// 测试用户注册接口
describe('POST /api/users/register', () => {
  it('应该成功注册新用户', async () => {
    const response = await request(app.callback())
      .post('/api/users/register')
      .send(testUser);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

### Mock功能

Jest提供了强大的Mock功能，可以模拟函数、模块等，本项目中主要用于模拟数据库连接和文件上传功能：

```javascript
// 模拟数据库连接
jest.mock('./src/utils/db', () => {
  const { createPool } = jest.requireActual('mysql2/promise');
  const pool = {
    query: jest.fn(),
    execute: jest.fn(),
    close: jest.fn(),
  };
  
  return {
    createPool: jest.fn(() => pool),
    pool: pool,
    closePool: jest.fn(async () => true),
  };
});
```

### 查看测试覆盖率

运行`npm run test:coverage`命令后，Jest会生成测试覆盖率报告，报告保存在`coverage/`目录下。

## 最佳实践

1. **测试用例独立性**：每个测试用例应该是独立的，不依赖于其他测试用例的执行结果
2. **测试边界条件**：除了正常情况外，还应该测试边界条件和异常情况
3. **合理使用Mock**：对于外部依赖（如数据库、第三方API），合理使用Mock来隔离测试
4. **保持测试代码简洁**：测试代码应该简洁明了，便于理解和维护
5. **定期运行测试**：在开发过程中定期运行测试，确保代码质量

## 常见问题及解决方案

1. **测试超时**
   - 检查测试代码中是否有耗时较长的操作
   - 可以在`jest.config.js`中调整`testTimeout`的值

2. **Mock不生效**
   - 确保Mock的路径正确
   - 检查Mock的实现是否符合预期

3. **数据库连接问题**
   - 测试环境中使用的是模拟的数据库连接，不需要实际的数据库
   - 如果需要连接实际数据库进行集成测试，可以修改`jest.setup.js`中的配置

## 总结

Jest是一个功能强大、易于使用的JavaScript测试框架，本项目使用Jest结合supertest来测试API接口。通过合理配置和编写测试用例，可以提高代码质量，减少bug的产生，确保系统的稳定性和可靠性。