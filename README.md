# 智能垃圾分类系统 - 前后端分离项目

## 项目结构

本项目已按照前后端分离架构进行重构，分离后的目录结构如下：

```
hackathon/
├── frontend/          # 前端项目目录
│   ├── index.html     # 前端入口HTML文件
│   ├── package.json   # 前端项目依赖配置
│   ├── package-lock.json # 前端依赖版本锁定
│   ├── public/        # 静态资源目录
│   ├── src/           # 前端源代码
│   ├── vite.config.js # Vite构建配置
│   └── .gitignore     # 前端Git忽略文件
├── backend/           # 后端项目目录
│   ├── server.js      # 后端服务器入口文件
│   ├── package.json   # 后端项目依赖配置
│   ├── database/      # 数据库设计和SQL文件
│   └── .gitignore     # 后端Git忽略文件
└── README.md          # 项目说明文档
```

## 前端项目说明

前端项目使用 Vue 3 和 Vite 构建，包含智能垃圾分类系统的用户界面，主要功能包括：
- 用户登录注册
- 垃圾识别
- 分类知识库
- 互动中心
- 宣传教育
- 个人中心
- 每日一答和闯关答题
- 社区分享

### 运行前端项目

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端服务器默认运行在 http://localhost:5173/

## 后端项目说明

后端项目使用 Node.js 和 Express 构建，为前端提供API接口和数据服务，主要功能包括：
- 用户认证
- 垃圾识别接口
- 知识库数据管理
- 互动内容管理
- MySQL数据库连接和操作

### 运行后端项目

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
npm install
```

3. 修改数据库配置（在server.js文件中）：
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root', // 修改为你的MySQL用户名
  password: '', // 修改为你的MySQL密码
  database: 'smart_waste_db'
};
```

4. 启动后端服务器：
```bash
npm start
```

或者使用nodemon进行开发模式运行：
```bash
npm run dev
```

后端服务器默认运行在 http://localhost:3001/

## 数据库配置

数据库相关文件位于 `backend/database/` 目录下：
- `smart_waste_db.sql`: 包含完整的数据库表结构和测试数据
- `README.md`: 数据库设计说明文档

在运行后端服务前，请确保已在MySQL中导入数据库：

```bash
mysql -u root -p < backend/database/smart_waste_db.sql
```

## 技术栈说明

### 前端技术栈
- Vue 3
- Vite
- Pinia (状态管理)
- Vue Router (路由管理)
- Axios (HTTP客户端)

### 后端技术栈
- Node.js
- Express.js
- MySQL (使用mysql2库连接)

## 开发注意事项

1. 前后端分离后，前端通过API接口与后端进行通信
2. 请确保在修改数据库配置后再启动后端服务
3. 前端请求的API地址需要根据后端实际运行地址进行调整
4. 开发环境下，前端默认端口为5173，后端默认端口为3001

## License

MIT

