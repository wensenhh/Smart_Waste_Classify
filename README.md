# 智能垃圾分类系统 / Smart Waste Classification System

## 🌐 语言切换 / Language Switch

# 智能垃圾分类系统

基于 Vue 3 构建的智能垃圾分类系统，提供多模态垃圾识别、分类知识普及、互动激励等功能，致力于推动环保事业发展。

## 🚀 项目特性

### AI 核心识别模块
- **多模态快速识别**：支持图像、语音和文本三种方式查询垃圾分类
- **本地缓存优化**：高频垃圾特征本地缓存，弱网络环境下也能快速响应
- **动态数据库**：实时同步新增垃圾类型，自动更新识别规则
- **误分类自学习**：用户手动纠错后，模型在后台自动迭代优化

### 用户交互系统
- **一键操作入口**：首页快捷按钮直达核心功能，无需层级跳转
- **历史记录复用**：自动保存近期识别记录，方便快速查看和分享
- **场景化分类指南**：覆盖家庭厨房、外卖包装、节日垃圾等多种场景
- **区域标准适配**：自动匹配用户所在城市的垃圾分类标准

### 互动激励体系
- **积分 + 成就体系**：签到、识别、分享均可获得积分，解锁成就勋章
- **社交互动功能**：支持好友PK、社区交流、团队挑战等多种互动方式
- **排名激励机制**：周分类次数、准确率等多维度排名，激发用户参与热情
- **公益捐赠联动**：团队完成目标可解锁集体环保证书和公益捐赠

### 宣传教育功能
- **分层教育内容**：针对儿童、成人、专业人士提供不同深度的教育内容
- **互动学习活动**：每日答题、闯关挑战、虚拟实践等多种学习方式
- **科普知识传播**：内置短视频、知识卡片、专家直播等多种科普形式
- **社交裂变传播**：生成个性化分类报告卡，支持一键分享到各大社交平台

## 🛠 技术栈

- **前端框架**：Vue 3 + Vite
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP请求**：Axios
- **国际化支持**：Vue I18n
- **样式处理**：原生CSS（支持响应式设计）

## 📁 项目结构

```
src/
├── assets/           # 静态资源
├── components/       # 公共组件
│   ├── BottomNavBar.vue   # 底部导航栏
│   ├── Button.vue         # 按钮组件
│   ├── CameraCapture.vue  # 相机捕获组件
│   ├── Header.vue         # 头部组件
│   └── ...
├── i18n/             # 国际化配置
├── router/           # 路由配置
├── services/         # API服务
├── stores/           # Pinia状态管理
├── views/            # 页面视图
│   ├── Login.vue          # 登录页
│   ├── Register.vue       # 注册页
│   ├── Home.vue           # 首页
│   ├── RecognitionResult.vue  # 识别结果页
│   └── ...
├── App.vue           # 应用入口组件
├── main.js           # 程序入口
└── style.css         # 全局样式
```

## 🚀 快速开始

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
# 或
npm i
```

### 开发模式运行

```bash
npm run dev
```

服务将在 http://localhost:5173 启动，支持热重载。

### 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录中，可用于部署到生产环境。

### 预览生产构建

```bash
npm run preview
```

## 🌐 国际化支持

项目支持多语言切换，目前已配置中文、英文等语言。用户可以通过页面右上角的语言切换按钮切换界面语言。

语言配置文件位于 `src/i18n/index.js`，新增语言或修改翻译内容可在此文件中进行。

## 🔐 用户认证

系统提供完整的用户注册和登录功能，支持通过用户名和密码进行身份验证。用户认证状态通过 Pinia 进行管理，确保用户在不同页面间的会话一致性。

- **登录页**：`/login`
- **注册页**：`/register`

## 📊 核心功能模块

### 1. 垃圾识别模块
通过拍照、语音或文字输入，快速识别垃圾类型并提供分类指导。支持多种识别方式，识别结果包含详细的分类说明和处理建议。

### 2. 知识科普模块
提供全面的垃圾分类知识库，支持按类别、按场景查询垃圾信息。包含图文、视频等多种形式的科普内容，适合不同年龄段用户学习。

### 3. 互动中心
集成积分任务、好友PK、社区交流、答题闯关等多种互动功能，提升用户参与度和粘性。用户可通过完成任务获得积分，兑换虚拟奖励或参与公益活动。

### 4. 个人中心
展示用户的分类数据统计、积分成就等信息，提供个性化设置和反馈入口。用户可查看自己的分类报告、修改个人资料、设置通知偏好等。

## 📝 项目文档

项目文档位于 `docs/` 目录下，包含需求分析、架构设计、任务拆分等文档，详细描述了项目的开发过程和技术实现。

- **需求对齐文档**：`docs/smart_waste_system/ALIGNMENT_smart_waste_system.md`
- **共识文档**：`docs/smart_waste_system/CONSENSUS_smart_waste_system.md`
- **设计文档**：`docs/smart_waste_system/DESIGN_smart_waste_system.md`
- **任务拆分文档**：`docs/smart_waste_system/TASK_smart_waste_system.md`

## 👥 开发者指南

### 代码规范
- 组件命名：使用 PascalCase（如 `LoginForm.vue`）
- 变量命名：使用 camelCase（如 `userName`）
- 常量命名：使用 UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- 代码缩进：2 个空格
- 注释风格：使用 JSDoc 注释函数和重要变量

### 开发流程
1. 克隆项目代码
2. 安装依赖 `npm install`
3. 启动开发服务器 `npm run dev`
4. 编写代码并进行本地测试
5. 提交代码前运行 `npm run build` 确保构建通过

## 📄 License

本项目采用 MIT License 开源。

## 💡 致谢

感谢所有参与项目开发和测试的团队成员，以及为项目提供宝贵意见和建议的用户。

# Smart Waste Classification System

A Vue 3-based smart waste classification system providing multi-modal waste recognition, classification knowledge popularization, interactive incentives, and other features to promote environmental protection.

## 🚀 Project Features

### AI Core Recognition Module
- **Multi-modal Fast Recognition**: Supports image, voice, and text queries for waste classification
- **Local Cache Optimization**: Caches high-frequency waste features locally for quick response in weak network environments
- **Dynamic Database**: Real-time synchronization of new waste types and automatic update of recognition rules
- **Self-learning for Misclassification**: After manual correction by users, the model automatically iterates and optimizes in the background

### User Interaction System
- **One-click Operation Entry**: Shortcut buttons on the homepage directly access core functions without hierarchical navigation
- **History Record Reuse**: Automatically saves recent recognition records for quick viewing and sharing
- **Scenario-based Classification Guide**: Covers various scenarios such as home kitchen, takeaway packaging, holiday waste, etc.
- **Regional Standard Adaptation**: Automatically matches the waste classification standards of the user's city

### Interactive Incentive System
- **Points + Achievement System**: Points can be earned through check-in, recognition, and sharing to unlock achievement badges
- **Social Interaction Functions**: Supports friend PK, community exchange, team challenges, and other interactive methods
- **Ranking Incentive Mechanism**: Multi-dimensional rankings for weekly classification times, accuracy, etc., to stimulate user participation enthusiasm
- **Public Welfare Donation Linkage**: Teams that achieve goals can unlock collective environmental certificates and public welfare donations

### Publicity and Education Features
- **Layered Educational Content**: Provides educational content of different depths for children, adults, and professionals
- **Interactive Learning Activities**: Various learning methods such as daily quizzes, challenge answering, virtual practice, etc.
- **Science Popularization Knowledge Dissemination**: Built-in short videos, knowledge cards, expert live broadcasts, and other popular science forms
- **Social Fission Communication**: Generate personalized classification report cards that support one-click sharing to major social platforms

## 🛠 Technology Stack

- **Frontend Framework**: Vue 3 + Vite
- **State Management**: Pinia
- **Routing Management**: Vue Router
- **HTTP Requests**: Axios
- **Internationalization Support**: Vue I18n
- **Style Processing**: Native CSS (responsive design support)

## 📁 Project Structure

```
src/
├── assets/           # Static resources
├── components/       # Common components
│   ├── BottomNavBar.vue   # Bottom navigation bar
│   ├── Button.vue         # Button component
│   ├── CameraCapture.vue  # Camera capture component
│   ├── Header.vue         # Header component
│   └── ...
├── i18n/             # Internationalization configuration
├── router/           # Routing configuration
├── services/         # API services
├── stores/           # Pinia state management
├── views/            # Page views
│   ├── Login.vue          # Login page
│   ├── Register.vue       # Register page
│   ├── Home.vue           # Home page
│   ├── RecognitionResult.vue  # Recognition result page
│   └── ...
├── App.vue           # Application entry component
├── main.js           # Program entry
└── style.css         # Global style
```

## 🚀 Quick Start

### Environment Requirements
- Node.js >= 14.0.0
- npm >= 6.0.0 or yarn >= 1.22.0

### Install Dependencies

```bash
npm install
# or
npm i
```

### Run in Development Mode

```bash
npm run dev
```

The service will start at http://localhost:5173 with hot reloading support.

### Build Production Version

```bash
npm run build
```

The build artifacts will be generated in the `dist` directory, which can be used for deployment to production environments.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Internationalization Support

The project supports multi-language switching, and currently has Chinese, English and other languages configured. Users can switch interface languages through the language switch button in the upper right corner of the page.

Language configuration files are located in `src/i18n/index.js`. Adding new languages or modifying translation content can be done in this file.

## 🔐 User Authentication

The system provides complete user registration and login functions, supporting identity authentication through username and password. User authentication status is managed through Pinia to ensure session consistency between different pages.

- **Login Page**: `/login`
- **Register Page**: `/register`

## 📊 Core Function Modules

### 1. Waste Recognition Module
Quickly recognizes waste types and provides classification guidance through photo taking, voice, or text input. Supports multiple recognition methods, and recognition results include detailed classification instructions and processing recommendations.

### 2. Knowledge Popularization Module
Provides a comprehensive waste classification knowledge base, supporting querying waste information by category and scenario. Contains various forms of popular science content such as graphics, videos, etc., suitable for users of different ages to learn.

### 3. Interaction Center
Integrates multiple interactive functions such as point tasks, friend PK, community exchanges, and answering challenges to improve user participation and stickiness. Users can earn points by completing tasks, exchange virtual rewards, or participate in public welfare activities.

### 4. Personal Center
Displays users' classification data statistics, points achievements, and other information, and provides personalized settings and feedback entrances. Users can view their classification reports, modify personal information, set notification preferences, etc.

## 📝 Project Documents

Project documents are located in the `docs/` directory, including requirements analysis, architecture design, task splitting, and other documents that describe the project's development process and technical implementation in detail.

- **Requirements Alignment Document**: `docs/smart_waste_system/ALIGNMENT_smart_waste_system.md`
- **Consensus Document**: `docs/smart_waste_system/CONSENSUS_smart_waste_system.md`
- **Design Document**: `docs/smart_waste_system/DESIGN_smart_waste_system.md`
- **Task Splitting Document**: `docs/smart_waste_system/TASK_smart_waste_system.md`

## 👥 Developer Guide

### Code Specifications
- Component Naming: Use PascalCase (e.g., `LoginForm.vue`)
- Variable Naming: Use camelCase (e.g., `userName`)
- Constant Naming: Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Code Indentation: 2 spaces
- Comment Style: Use JSDoc to comment functions and important variables

### Development Process
1. Clone the project code
2. Install dependencies `npm install`
3. Start the development server `npm run dev`
4. Write code and conduct local tests
5. Run `npm run build` to ensure the build passes before submitting code

## 📄 License

This project is open-sourced under the MIT License.

## 💡 Acknowledgments

Thanks to all team members who participated in project development and testing, as well as users who provided valuable opinions and suggestions for the project.

