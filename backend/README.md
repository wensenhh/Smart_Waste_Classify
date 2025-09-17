# 智能垃圾分类系统（后端）

## 项目简介

智能垃圾分类系统是一个基于人工智能技术的垃圾分类辅助工具，旨在帮助用户正确识别和分类垃圾，提高垃圾分类的准确性和效率。本仓库包含系统的后端实现，提供RESTful API接口供前端调用。

## 技术栈

- **编程语言**: Node.js
- **Web框架**: Koa.js
- **数据库**: MySQL
- **身份认证**: JWT (JSON Web Token)
- **文件上传**: Multer
- **数据验证**: Joi
- **测试框架**: Jest + Supertest
- **API文档**: Swagger
- **环境配置**: dotenv

## 目录结构

```
backend/
├── database/           # 数据库相关配置和模型
├── docs/               # 项目文档
├── lang/               # 国际化语言文件
├── src/                # 源代码目录
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器，处理请求逻辑
│   ├── middlewares/    # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由定义
│   ├── services/       # 业务逻辑服务
│   ├── utils/          # 工具函数
│   └── app.js          # Express应用入口
├── tests/              # 测试文件
├── .env.example        # 环境变量示例
├── .gitignore          # Git忽略文件配置
├── jest.config.js      # Jest配置文件
├── jest.setup.js       # Jest测试环境设置
├── package.json        # 项目依赖配置
├── server.js           # 服务器入口文件
└── swagger.json        # API文档配置
```

## 快速开始

### 1. 环境要求

- Node.js 14.x 或更高版本
- MongoDB 4.x 或更高版本

### 2. 安装依赖

```bash
# 克隆仓库
git clone https://github.com/yourusername/garbage-classification-system.git

# 进入项目目录
cd garbage-classification-system/backend

# 安装依赖
npm install
```

### 3. 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`，然后根据你的环境修改配置：

```bash
cp .env.example .env
```

在 `.env` 文件中配置以下内容：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGO_URI=mongodb://localhost:27017/garbage_classification

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880 # 5MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# 日志配置
LOG_LEVEL=info
```

### 4. 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm run start
```

服务器启动后，可通过 `http://localhost:3000` 访问API。

## API文档

项目使用Swagger生成API文档，启动服务器后，可通过以下地址访问：

```
http://localhost:3000/api-docs
```

文档包含所有API的详细说明，包括请求参数、响应格式、示例等。

## 测试

项目使用Jest和Supertest进行测试，运行以下命令执行测试：

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

测试文件位于 `tests/` 目录下，包含单元测试和集成测试。

## 核心功能

### 1. 垃圾识别
- 通过上传图片自动识别垃圾类型
- 提供垃圾所属类别、处理建议等信息
- 支持关键词搜索垃圾信息

### 2. 垃圾类别管理
- 提供可回收物、厨余垃圾、有害垃圾和其他垃圾四个类别
- 每个类别包含详细描述、示例物品等信息

### 3. 识别历史记录
- 保存用户的垃圾识别历史
- 支持查看、筛选和删除历史记录
- 提供个人垃圾分类统计数据

### 4. 用户管理
- 用户注册、登录和身份认证
- 个人资料管理

### 5. 管理员功能
- 用户管理（查看、编辑、禁用用户）
- 识别记录管理（查看、删除所有记录）
- 系统统计数据查看

## 中间件

项目包含以下核心中间件：

1. **身份验证中间件**: 验证用户身份
2. **文件上传中间件**: 处理图片上传和验证
3. **请求验证中间件**: 验证请求参数的有效性
4. **错误处理中间件**: 统一处理系统错误
5. **日志中间件**: 记录API请求和响应日志

## 安全措施

1. 使用JWT进行身份认证，避免会话劫持
2. 密码加密存储，不明文保存
3. 限制文件上传大小和类型，防止恶意文件上传
4. 输入数据验证和清洗，防止SQL注入和XSS攻击
5. 配置CORS策略，限制跨域请求

## 部署

### Docker部署

项目支持Docker部署，可通过以下步骤进行：

1. 创建 `Dockerfile` 和 `docker-compose.yml` 文件
2. 配置Docker环境变量
3. 运行 `docker-compose up -d` 启动服务

### 传统部署

1. 在目标服务器上安装Node.js和MongoDB
2. 克隆项目代码
3. 安装依赖并配置环境变量
4. 使用PM2等进程管理工具启动服务
5. 配置Nginx作为反向代理

## 贡献指南

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 代码规范

- 使用ESLint和Prettier保持代码风格一致
- 函数和变量命名采用驼峰命名法
- 类名采用大驼峰命名法
- 为关键函数和复杂逻辑添加注释
- 确保每个功能都有对应的测试用例

## 常见问题

### 1. 图片上传失败
- 检查文件大小是否超过限制
- 确认文件类型是否在允许的范围内
- 检查上传目录权限是否正确

### 2. 识别结果不准确
- 确保图片清晰，垃圾主体突出
- 避免光线过暗或过亮的环境拍摄
- 对于混合垃圾，建议分开拍摄识别

### 3. 数据库连接失败
- 检查MongoDB服务是否正常运行
- 确认连接字符串配置是否正确
- 检查防火墙设置是否允许连接

## 联系与支持

如有任何问题或建议，请联系：

- 邮箱: support@example.com
- GitHub Issues: https://github.com/yourusername/garbage-classification-system/issues

## License

MIT License

---

**版本**: 1.0.0
**最后更新**: 2023-10-15