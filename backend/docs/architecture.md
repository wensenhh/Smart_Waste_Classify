# 智能垃圾分类系统架构文档

## 1. 系统概述

智能垃圾分类系统是一个基于计算机视觉和人工智能技术的垃圾识别与分类管理平台。该系统能够通过用户上传的垃圾图片，自动识别垃圾类型并提供分类指导，帮助用户正确进行垃圾分类。

### 1.1 系统目标
- 提供准确的垃圾识别功能
- 建立用户垃圾识别历史记录
- 提供垃圾分类知识和指导
- 支持用户管理和统计分析

### 1.2 核心功能
- 垃圾图片识别
- 用户账户管理
- 识别历史记录管理
- 垃圾分类知识查询
- 识别数据统计分析

## 2. 技术栈

### 2.1 后端技术
- **运行环境**: Node.js
- **Web框架**: Koa.js
- **数据库**: MySQL
- **认证**: JWT (JSON Web Token)
- **文件处理**: Multer、Sharp
- **API文档**: Swagger/OpenAPI
- **测试框架**: Jest、Supertest

### 2.2 前端技术
- **框架**: React.js (计划中)
- **状态管理**: Redux (计划中)
- **UI组件**: Ant Design (计划中)

### 2.3 AI技术
- **计算机视觉**: TensorFlow.js (计划中)
- **模型**: 预训练的图像识别模型 (计划中)

## 3. 系统架构

系统采用经典的三层架构设计，包括表现层、业务逻辑层和数据访问层。

### 3.1 整体架构图

```
mermaid
flowchart TD
    subgraph 客户端层
        A[Web浏览器] --> |HTTP请求| B[移动应用] --> |HTTP请求| C[第三方集成]
    end

    subgraph API网关层
        D[Express服务器] --> |路由分发| E[API控制器]
        E --> |认证授权| F[JWT中间件]
        E --> |请求验证| G[验证中间件]
        E --> |限流控制| H[限流中间件]
    end

    subgraph 业务逻辑层
        I[用户服务] --> |处理| J[垃圾识别服务]
        J --> |使用| K[文件上传服务]
        K --> |调用| L[数据统计服务]
    end

    subgraph 数据访问层
        M[MySQL数据库] --> |存储| N[文件存储系统]
    end

    A --> D
    B --> D
    C --> D
    E --> I
    E --> J
    I --> M
    J --> M
    J --> N
    L --> M
```

### 3.2 分层设计说明

#### 3.2.1 表现层 (API层)
- 提供RESTful API接口
- 处理HTTP请求和响应
- 负责认证、授权和请求验证

#### 3.2.2 业务逻辑层
- 实现核心业务逻辑
- 处理用户管理、垃圾识别、数据统计等功能
- 协调不同服务之间的交互

#### 3.2.3 数据访问层
- 负责数据的持久化存储
- 提供数据库操作接口
- 管理文件存储和访问

## 4. 目录结构

系统采用模块化的目录结构设计，遵循关注点分离原则，各模块之间职责明确，便于维护和扩展。

```
backend/
├── src/                    # 源代码目录
│   ├── app.js              # 应用入口文件
│   ├── server.js           # 服务器启动文件
│   ├── config/             # 配置文件目录
│   ├── controllers/        # 控制器目录
│   ├── middlewares/        # 中间件目录
│   ├── models/             # 数据模型目录
│   ├── routes/             # 路由配置目录
│   ├── services/           # 业务服务目录
│   ├── utils/              # 工具函数目录
│   └── validations/        # 数据验证目录
├── database/               # 数据库相关文件
│   ├── migrations/         # 数据库迁移文件
│   └── seeds/              # 数据库种子文件
├── lang/                   # 国际化语言文件
├── uploads/                # 上传文件存储目录
├── tests/                  # 测试文件目录
├── docs/                   # 项目文档目录
├── .env.example            # 环境变量示例文件
├── .gitignore              # Git忽略文件
├── package.json            # 项目依赖配置
├── swagger.json            # API文档配置
└── README.md               # 项目说明文档
```

### 4.1 核心模块说明

#### 4.1.1 用户模块 (User)
- 负责用户注册、登录、资料管理等功能
- 包含用户认证和权限控制
- 提供个人信息、头像、密码管理等API

#### 4.1.2 垃圾识别模块 (Recognition)
- 负责垃圾图片上传和识别
- 提供垃圾信息搜索功能
- 管理识别历史记录

#### 4.1.3 文件管理模块 (File Management)
- 负责文件上传、存储和访问
- 提供文件类型验证和大小限制
- 支持图片优化和处理

#### 4.1.4 统计分析模块 (Statistics)
- 提供垃圾识别数据统计
- 生成用户垃圾分类报告
- 支持按时间、类别等维度统计

## 5. 数据库设计

### 5.1 主要数据表

#### 5.1.1 用户表 (users)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 5.1.2 垃圾识别记录表 (recognition_records)
```sql
CREATE TABLE recognition_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  waste_name VARCHAR(100) NOT NULL,
  category ENUM('recyclable', 'kitchen', 'hazardous', 'other') NOT NULL,
  confidence DECIMAL(5,2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  tips TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 5.1.3 垃圾信息表 (waste_information) - 计划中
```sql
CREATE TABLE waste_information (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('recyclable', 'kitchen', 'hazardous', 'other') NOT NULL,
  description TEXT NOT NULL,
  tips TEXT DEFAULT NULL,
  image_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 5.2 数据关系图

```
mermaid
erd
    User {
        int id PK
        string username
        string email
        string password
        string nickname
        string phone
        string avatar
        string role
        string status
        datetime created_at
        datetime updated_at
    }

    RecognitionRecord {
        int id PK
        int user_id FK
        string waste_name
        string category
        decimal confidence
        string image_url
        text description
        text tips
        datetime created_at
    }

    WasteInformation {
        int id PK
        string name
        string category
        text description
        text tips
        string image_url
        datetime created_at
        datetime updated_at
    }

    User ||--o{ RecognitionRecord : "has_many"
    RecognitionRecord }o--|| WasteInformation : "refers_to"
```

## 6. API设计

系统提供RESTful API，遵循HTTP协议规范，支持CRUD操作和业务逻辑处理。

### 6.1 API版本控制
- 采用URL路径版本控制，如 `/api/v1/users`
- 支持多版本共存，便于系统升级和兼容

### 6.2 认证与授权
- 使用JWT (JSON Web Token)进行用户认证
- 基于角色的访问控制 (RBAC)，支持普通用户和管理员角色
- 敏感API需要身份验证和权限检查

### 6.3 API响应格式
统一的JSON响应格式，包含以下字段：
```json
{
  "success": true/false,  // 操作是否成功
  "data": {},            // 返回的数据（可选）
  "message": "",         // 提示信息（可选）
  "errors": {},          // 错误信息（可选）
  "pagination": {}       // 分页信息（可选）
}
```

### 6.4 主要API端点

#### 6.4.1 用户相关API
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `POST /api/users/avatar` - 上传用户头像
- `PUT /api/users/password` - 修改密码

#### 6.4.2 垃圾识别相关API
- `POST /api/recognition/upload` - 上传垃圾图片进行识别
- `GET /api/recognition/search` - 搜索垃圾信息
- `GET /api/recognition/categories` - 获取垃圾类别列表
- `GET /api/recognition/history` - 获取用户识别历史
- `GET /api/recognition/history/:id` - 获取识别记录详情
- `DELETE /api/recognition/history/:id` - 删除识别记录
- `DELETE /api/recognition/history/batch-delete` - 批量删除识别记录
- `GET /api/recognition/stats/categories` - 获取垃圾类别统计

## 7. 安全设计

### 7.1 身份验证与授权
- 实施强密码策略，密码加密存储
- 使用JWT进行用户认证，设置合理的过期时间
- 基于角色的权限控制，限制敏感操作

### 7.2 数据安全
- 防止SQL注入攻击
- 防止XSS攻击
- 防止CSRF攻击
- 敏感数据加密存储

### 7.3 API安全
- 实现请求频率限制，防止暴力攻击
- 接口参数验证，防止非法数据提交
- 错误信息不泄露系统内部细节

## 8. 性能优化

### 8.1 数据库优化
- 合理设计索引，提高查询效率
- 使用连接池管理数据库连接
- 优化复杂查询语句

### 8.2 图片处理优化
- 图片压缩和优化，减少存储空间
- 支持不同尺寸的图片缩略图
- 异步处理图片上传和识别

### 8.3 缓存机制
- 计划引入Redis缓存热点数据
- 缓存垃圾类别和常见垃圾信息
- 缓存用户会话数据

## 9. 部署与运维

### 9.1 开发环境
- 使用Docker容器化部署
- 本地开发环境配置说明
- 开发服务器启动和调试指南

### 9.2 生产环境
- 部署架构设计
- 负载均衡配置
- 数据库备份策略
- 日志管理和监控

### 9.3 环境变量配置
- 数据库连接信息
- 认证密钥
- 文件存储路径
- API配置参数

## 10. 未来规划

### 10.1 功能扩展
- 垃圾识别模型优化和更新
- 多语言支持增强
- 垃圾分类小游戏功能
- 社区互动和排行榜功能

### 10.2 性能优化
- 引入机器学习模型自动更新
- 优化大并发下的系统性能
- 移动端离线识别功能

### 10.3 数据增值服务
- 垃圾分类数据分析和报告
- 城市垃圾分类情况统计
- 企业级垃圾分类解决方案

---

**文档版本**: 1.0.0
**更新时间**: 2023-10-15