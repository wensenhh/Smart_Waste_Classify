# API 接口说明文档

## 概述

本文件记录了智能垃圾分类系统前端的 API 接口结构和使用说明。API 接口已按功能模块进行分组，便于管理和扩展。

## 文件结构

- `api.js`: 包含 axios 实例配置和拦截器，负责基础请求设置
- `wasteApi.js`: 包含所有业务 API 接口定义，已按功能模块分组

## API 接口结构

### 1. 基础 API 实例

```javascript
// 从 api.js 导入基础 axios 实例
import api from './api';

// 使用示例
const response = await api.get('/some-endpoint');
```

### 2. 业务 API 接口（wasteApi）

业务 API 接口已按功能模块进行分组，同时保留了原有直接方法调用以保持向后兼容性。

#### 2.1 用户相关 API (wasteApi.user)

```javascript
// 用户登录
wasteApi.user.login(credentials);

// 获取用户积分
wasteApi.user.getPoints();

// 获取用户成就
wasteApi.user.getAchievements();
```

#### 2.2 垃圾识别相关 API (wasteApi.recognition)

```javascript
// 垃圾识别
wasteApi.recognition.recognize(data);

// 反馈识别结果
wasteApi.recognition.feedback(resultId, feedbackData);
```

#### 2.3 知识相关 API (wasteApi.knowledge)

```javascript
// 获取分类知识
wasteApi.knowledge.getBase(params);

// 获取分类列表
wasteApi.knowledge.getCategories();

// 获取宣传教育内容
wasteApi.knowledge.getEducation(type);
```

#### 2.4 问答相关 API (wasteApi.question)

```javascript
// 获取每日一题
wasteApi.question.getDaily();

// 获取闯关题目
wasteApi.question.getChallenge(level);

// 提交答案
wasteApi.question.submitAnswer(data);
```

## 向后兼容性说明

为确保现有代码能够正常工作，我们保留了原有直接方法调用：

```javascript
// 原有直接方法调用仍然有效
wasteApi.recognizeWaste(data);
wasteApi.getKnowledgeBase(params);
wasteApi.getCategories();
wasteApi.getUserPoints();
wasteApi.getUserAchievements();
wasteApi.getDailyQuestion();
wasteApi.getChallengeQuestions(level);
wasteApi.submitAnswer(data);
wasteApi.getEducationContent(type);
wasteApi.feedbackRecognition(resultId, feedbackData);
```

## 新增接口

本次重构新增了以下接口：

- `wasteApi.login(credentials)`: 用户登录接口
- `wasteApi.feedbackRecognition(resultId, feedbackData)`: 反馈识别结果接口

## 最佳实践

1. 新代码建议使用按功能模块分组的 API 接口调用方式
2. 对于已有代码，可以继续使用原有直接方法调用
3. 保持 API 接口命名的一致性和可读性
4. 在添加新的 API 接口时，请同时在相应的功能模块分组中添加

## 注意事项

1. 所有 API 请求都通过 axios 实例进行，会自动应用请求和响应拦截器
2. 请求拦截器中会自动添加 token 认证信息
3. 响应拦截器中会统一处理错误和响应数据
4. 具体的错误处理逻辑可查看 `api.js` 中的响应拦截器实现