# API错误处理机制文档

## 1. 概述

本文档详细介绍了智能垃圾分类系统的前端API错误处理机制，包括状态码定义、错误处理流程、使用方法和最佳实践。通过实施统一的错误处理机制，可以确保系统对各类接口响应进行合理且一致的处理，提升用户体验和系统稳定性。

## 2. 状态码列表

系统使用两种类型的状态码：HTTP标准状态码和业务自定义状态码。所有状态码在`src/services/errorHandler.js`文件中统一定义和管理。

### 2.1 HTTP标准状态码

| 状态码 | 常量名 | 描述 |
|-------|-------|------|
| 200 | SUCCESS | 请求成功 |
| 201 | CREATED | 资源创建成功 |
| 202 | ACCEPTED | 请求已接受，但尚未完成处理 |
| 204 | NO_CONTENT | 请求成功，但没有返回内容 |
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未授权，需要登录 |
| 403 | FORBIDDEN | 权限不足，拒绝访问 |
| 404 | NOT_FOUND | 请求的资源不存在 |
| 405 | METHOD_NOT_ALLOWED | 不支持的请求方法 |
| 408 | REQUEST_TIMEOUT | 请求超时 |
| 409 | CONFLICT | 请求发生冲突 |
| 413 | PAYLOAD_TOO_LARGE | 上传文件过大 |
| 415 | UNSUPPORTED_MEDIA_TYPE | 不支持的文件类型 |
| 429 | TOO_MANY_REQUESTS | 请求过于频繁 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误 |
| 501 | NOT_IMPLEMENTED | 功能尚未实现 |
| 502 | BAD_GATEWAY | 网关错误 |
| 503 | SERVICE_UNAVAILABLE | 服务器暂时不可用 |
| 504 | GATEWAY_TIMEOUT | 网关超时 |

### 2.2 业务自定义状态码

| 状态码 | 常量名 | 描述 |
|-------|-------|------|
| 1000 | VALIDATION_ERROR | 数据验证失败 |
| 1001 | AUTH_FAILED | 认证失败 |
| 1002 | TOKEN_EXPIRED | 令牌已过期 |
| 1003 | PERMISSION_DENIED | 权限不足 |
| 1004 | DATA_NOT_FOUND | 未找到相关数据 |
| 1005 | LIMIT_EXCEEDED | 超过限制 |
| 1006 | API_ERROR | 其他API错误 |

## 3. 错误处理流程

### 3.1 整体流程

1. **请求发送**：通过`wasteApi`对象调用API接口
2. **响应拦截**：在`axios`响应拦截器中检查响应状态
3. **错误检测**：
   - 检查HTTP状态码
   - 检查业务状态码(`data.code`)
4. **错误转换**：使用`handleError`函数将错误标准化
5. **错误处理**：使用`handleSpecificErrors`函数处理特定类型的错误
6. **用户反馈**：通过`showErrorMessage`函数显示错误信息

### 3.2 详细处理逻辑

1. **成功响应处理**：
   - HTTP状态码为2xx
   - 业务状态码为200
   - 直接返回响应数据

2. **业务逻辑错误处理**：
   - HTTP状态码为2xx但业务状态码不为200
   - 将响应转换为错误对象并拒绝Promise
   - 根据业务状态码执行特定的预处理操作

3. **HTTP错误处理**：
   - HTTP状态码为4xx或5xx
   - 使用统一的错误处理器转换错误信息
   - 对特定错误类型(如401未授权)进行特殊处理
   - 增强错误对象，添加标准化的错误信息

4. **网络错误处理**：
   - 请求未收到响应(网络问题、超时等)
   - 生成标准化的网络错误信息

5. **配置错误处理**：
   - 请求配置错误(如URL格式错误)
   - 生成标准化的配置错误信息

## 4. 核心组件

### 4.1 errorHandler.js

这是整个错误处理机制的核心文件，包含以下主要组件：

- **STATUS_CODES**：状态码映射表，定义了所有可能的HTTP状态码和业务自定义状态码
- **ERROR_MESSAGES**：错误信息映射表，为每种状态码提供默认的错误消息
- **handleError**：通用错误处理函数，将各种错误转换为标准化格式
- **showErrorMessage**：显示错误消息的函数(可集成到UI组件)
- **handleSpecificErrors**：处理特定错误类型的工具函数

### 4.2 api.js

负责创建和配置axios实例，包含请求拦截器和响应拦截器：

- **请求拦截器**：添加认证信息、显示加载指示器
- **响应拦截器**：检查响应状态、处理错误、隐藏加载指示器

### 4.3 wasteApi.js

定义了所有API接口，按功能模块进行分组：

- 用户相关API
- 垃圾识别相关API
- 知识相关API
- 问答相关API

## 5. 使用方法

### 5.1 基本使用

```javascript
import { wasteApi } from './services/wasteApi';
import errorHandler from './services/errorHandler';

try {
  const response = await wasteApi.recognition.recognitionUploadImg(formData);
  // 处理成功响应
} catch (error) {
  // 处理错误
  const errorInfo = errorHandler.handleSpecificErrors(error);
}
```

### 5.2 配置请求选项

```javascript
const response = await wasteApi.user.profile(params, {
  loading: true, // 显示加载指示器
  timeout: 15000, // 自定义超时时间
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

### 5.3 自定义错误处理选项

```javascript
try {
  // API调用
} catch (error) {
  const errorInfo = errorHandler.handleSpecificErrors(error, {
    navigateToLogin: true, // 未授权时是否跳转到登录页
    showMessage: true // 是否显示错误消息
  });
  
  // 根据错误类型执行不同的操作
  switch (errorInfo.status) {
    case errorHandler.STATUS_CODES.BAD_REQUEST:
      // 处理请求参数错误
      break;
    case errorHandler.STATUS_CODES.FORBIDDEN:
      // 处理权限不足错误
      break;
    // 其他错误类型
  }
}
```

### 5.4 使用重试机制

```javascript
import { fetchWithRetry } from './services/apiExample';

// 定义要重试的API调用函数
const apiCall = () => wasteApi.recognition.getStytemStats();

// 使用重试机制调用API
const response = await fetchWithRetry(apiCall, 3, 1000);
```

## 6. 最佳实践

1. **统一使用错误处理工具**：始终使用`errorHandler`中的工具函数处理API错误，避免在每个API调用处重复编写错误处理逻辑

2. **合理设置请求选项**：根据API的特性设置合适的超时时间、loading状态等

3. **实施重试机制**：对于网络不稳定或临时性的服务器错误，实现重试机制可以提高请求成功率

4. **提供友好的用户反馈**：根据错误类型提供具体、友好的错误消息，避免显示技术性错误信息给用户

5. **记录错误日志**：重要的API错误应该记录详细的日志，便于排查问题

6. **处理边缘情况**：考虑网络中断、请求超时、服务器不可用等边缘情况，并提供相应的处理策略

7. **避免过度重试**：重试次数和间隔时间应合理设置，避免对服务器造成额外负担

## 7. 示例代码

详细的使用示例可以参考`src/services/apiExample.js`文件，其中包含了多种常见场景下的错误处理实现，如：

- 基本的API调用与错误处理
- 使用Promise链式调用处理错误
- 批量操作时的错误处理
- 重试机制实现

## 8. 更新记录

| 版本 | 日期 | 描述 |
|------|------|------|
| 1.0.0 | 2023-10-15 | 初始版本，定义了基本的错误处理机制和状态码 |
| 1.1.0 | 2023-10-20 | 添加了业务自定义状态码和更精细的错误处理逻辑 |
| 1.2.0 | 2023-10-25 | 完善了重试机制和用户反馈策略 |