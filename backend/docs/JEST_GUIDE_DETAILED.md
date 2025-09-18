# Jest 框架使用指南

## 什么是 Jest

Jest 是一个由 Facebook 开发的 JavaScript 测试框架，专注于简化测试过程并提高开发效率。它特别适合 React 应用测试，但也可以用于任何 JavaScript 项目，包括我们的 Node.js 后端项目。Jest 的主要特点包括：

- **零配置**：开箱即用，无需复杂的配置
- **快照测试**：可以捕获组件的渲染输出并进行比较
- **内置断言库**：提供丰富的断言方法
- **模拟功能**：轻松模拟函数、模块和定时器
- **代码覆盖率**：内置代码覆盖率报告生成
- **并行测试**：自动并行执行测试，提高速度

## 项目中的 Jest 配置

在我们的项目中，Jest 主要通过两个文件进行配置：

### 1. jest.config.js

```javascript
module.exports = {
  testEnvironment: 'node', // 测试环境设置为 Node.js
  testMatch: ['**/__tests__/**/*.(js|jsx|ts|tsx)', '**/*.(spec|test).(js|jsx|ts|tsx)'], // 测试文件匹配模式
  testPathIgnorePatterns: ['/node_modules/', '/dist/', 'src/test.js'], // 忽略的测试路径
  collectCoverage: true, // 开启代码覆盖率收集
  coverageDirectory: 'coverage', // 覆盖率报告目录
  transform: {
    '^.+\.(js|jsx)$': 'babel-jest' // 使用 babel-jest 进行代码转换
  },
  setupFilesAfterEnv: ['./jest.setup.js'], // 测试环境设置文件
  testTimeout: 30000 // 测试超时时间（毫秒）
};
```

### 2. jest.setup.js

这个文件在每个测试文件执行前运行，用于设置测试环境：

```javascript
// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.DB_HOST = '43.217.144.41';
process.env.DB_USER = 'smart_waste';
process.env.DB_PASSWORD = 'injZ34rWYiZMm7xG';
process.env.DB_NAME = 'smart_waste';
process.env.FILE_UPLOAD_DIR = './test-uploads';

// 全局导入
const fs = require('fs');
const path = require('path');

// 确保测试上传目录存在
const UPLOAD_DIR = process.env.FILE_UPLOAD_DIR || './test-uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 模拟文件上传
jest.mock('../src/utils/fileUpload', () => ({
  uploadFile: jest.fn().mockImplementation(async (file) => ({
    filename: file.name,
    path: path.join(UPLOAD_DIR, file.name),
    size: file.size
  })),
  deleteFile: jest.fn().mockResolvedValue(true)
}));

// 模拟数据库连接
jest.mock('../src/utils/db', () => ({
  initPool: jest.fn().mockResolvedValue(true),
  closePool: jest.fn().mockResolvedValue(true),
  query: jest.fn().mockImplementation((sql, params) => {
    // 可以根据需要模拟不同的查询结果
    return Promise.resolve({ rows: [] });
  })
}));

// 全局异常处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的 Promise 拒绝:', error);
});

// 扩展 expect 匹配器
expect.extend({
  toContainObject(received, argument) {
    const pass = this.equals(received, 
      expect.arrayContaining([
        expect.objectContaining(argument)
      ])
    );
    
    if (pass) {
      return { message: () => `通过`, pass: true };
    } else {
      return { 
        message: () => `期望数组包含匹配的对象，但没有找到`, 
        pass: false 
      };
    }
  }
});
```

## 如何在项目中使用 Jest

### 1. 安装依赖

首先确保已经安装了所有必要的依赖：

```bash
npm install
```

我们的项目中已经包含了以下测试相关的依赖：
- jest (^29.7.0)：测试框架
- supertest (^6.3.3)：HTTP 测试工具

### 2. 运行测试

项目中提供了两个 npm 脚本用于运行测试：

- **运行所有测试**：
  ```bash
  npm test
  ```

- **运行测试并生成覆盖率报告**：
  ```bash
  npm test:coverage
  ```

- **运行特定的测试文件**：
  ```bash
  npm test -- filename.test.js
  ```

### 3. 编写测试用例

测试文件通常放在 `tests` 目录下，文件名以 `.test.js` 或 `.spec.js` 结尾。

下面是一个简单的测试用例示例：

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('API 测试', () => {
  it('应该返回 200 状态码和健康信息', async () => {
    const response = await request(app.callback()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

### 4. 使用 Mock

在测试中，我们经常需要模拟外部依赖，以确保测试的独立性和可靠性。Jest 提供了强大的 mock 功能：

```javascript
// 模拟一个模块
jest.mock('../src/services/userService', () => ({
  getUserById: jest.fn().mockResolvedValue({
    id: 1,
    username: 'testuser'
  })
}));

// 模拟一个函数
const mockFunction = jest.fn().mockReturnValue('mocked result');
```

## 当前项目中的测试问题分析

在尝试运行项目中的测试时，我们遇到了以下问题：

### 1. 内存泄漏问题

测试运行时出现 "Your test suite is leaking memory" 错误。这可能是由于以下原因：

- 异步操作未完成
- 定时器未正确模拟
- 全局作用域的引用未清理
- 数据库连接未正确关闭

### 2. 中间件错误

尝试启动完整服务器时出现 "middleware must be a function!" 错误，这可能是由于某些中间件配置不正确。

### 3. 解决方案

我们创建了一个极简的测试文件 `simple.test.js`，它不依赖于项目的实际代码和数据库连接，并且成功通过了测试。这表明 Jest 框架本身是正常工作的，问题出在项目代码与测试环境的交互中。

要解决这些问题，建议采取以下步骤：

1. **简化测试**：不启动完整的服务器，只测试必要的功能
2. **正确模拟依赖**：确保所有外部依赖都被正确模拟
3. **清理资源**：在测试结束后正确清理所有资源，包括数据库连接、文件句柄等
4. **检查中间件**：确保所有中间件配置正确，并且符合 Koa 的要求

## 测试最佳实践

1. **测试单个功能**：每个测试用例只测试一个功能点
2. **使用描述性的测试名称**：测试名称应该清晰地描述测试的目的
3. **模拟外部依赖**：避免测试依赖于外部系统，如数据库、API 等
4. **清理资源**：在测试结束后清理所有创建的资源
5. **编写有意义的断言**：断言应该明确地验证预期结果
6. **保持测试独立**：每个测试用例应该可以独立运行，不依赖于其他测试的状态

## 下一步建议

1. 修复 `basic.test.js` 中的资源清理问题
2. 检查并修复中间件配置
3. 为关键功能编写更多的单元测试
4. 定期运行测试以确保代码质量

通过遵循这些指南和最佳实践，您将能够有效地使用 Jest 框架来测试我们的 Node.js 后端项目，确保代码质量和稳定性。