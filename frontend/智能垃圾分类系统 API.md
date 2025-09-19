---
title: 智能垃圾分类系统 API
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 智能垃圾分类系统 API

智能垃圾分类系统的后端API文档，提供用户管理、垃圾识别等功能。

Base URLs:

# Authentication

- HTTP Authentication, scheme: bearer

# 已测试

## GET API根路径

GET /

获取系统版本和可用路由信息

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "version": "1.0.0",
    "availableRoutes": [
      "string"
    ]
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|false|none||none|
|» message|string|false|none||none|
|» data|object|false|none||none|
|»» version|string|false|none||none|
|»» availableRoutes|[string]|false|none||none|

## POST 用户登录

POST /users/login

用户登录获取访问令牌

> Body 请求参数

```yaml
phone: "13777777777"
password: "123456"

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|phone|query|string| 否 |none|
|password|query|string| 否 |none|
|Authorization|header|string| 否 |none|
|body|body|object| 否 |none|
|» phone|body|string| 否 |none|
|» password|body|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "username": "user123",
      "email": "user@example.com",
      "nickname": "用户昵称",
      "role": "user"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|登录成功|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|登录失败|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» data|object|false|none||none|
|»» token|string|false|none||none|
|»» user|object|false|none||none|
|»»» id|string|false|none||none|
|»»» username|string|false|none||none|
|»»» email|string|false|none||none|
|»»» nickname|string|false|none||none|
|»»» role|string|false|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» message|string|false|none||none|

## POST 用户注册

POST /users/register

创建新用户账号

> Body 请求参数

```yaml
phone: "13777777777"
password: "123456"
name: wensen

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|phone|query|string| 否 |none|
|password|query|string| 否 |none|
|name|query|string| 否 |none|
|Authorization|header|string| 否 |none|
|body|body|object| 否 |none|
|» phone|body|string| 否 |手机号|
|» password|body|string| 否 |密码|
|» name|body|string| 否 |昵称|

> 返回示例

> 201 Response

```json
{
  "success": true,
  "message": "user.register_success",
  "data": {
    "userId": "user_17581870429221ym17n4el",
    "phone": "13800138000",
    "name": "测试用户",
    "role": "user"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|注册成功|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|注册失败|Inline|

### 返回数据结构

状态码 **201**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» message|string|false|none||none|
|» data|object|false|none||none|
|»» userId|string|false|none||none|
|»» phone|string|false|none||none|
|»» name|string|false|none||none|
|»» role|string|false|none||none|

状态码 **400**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» message|string|false|none||none|
|» errors|object|false|none||none|

## GET 获取识别历史记录

GET /recognition/history

获取当前登录用户的垃圾识别历史记录

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|page|query|integer| 否 |页码|
|limit|query|integer| 否 |每页数量|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "records": [
      {
        "id": "5f8d0d55b54764421b7156cf",
        "wasteName": "塑料瓶",
        "category": "recyclable",
        "categoryName": "可回收物",
        "imageUrl": "https://example.com/uploads/plastic-bottle.jpg",
        "createdAt": "2020-10-22T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|成功获取识别历史|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|未授权|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|false|none||none|
|» message|string|false|none||none|
|» data|object|false|none||none|
|»» records|[object]|false|none||none|
|»»» id|string|false|none||none|
|»»» wasteName|string|false|none||none|
|»»» category|string|false|none||none|
|»»» categoryName|string|false|none||none|
|»»» imageUrl|string|false|none||none|
|»»» createdAt|string(date-time)|false|none||none|
|»» pagination|object|false|none||none|
|»»» page|integer|false|none||none|
|»»» limit|integer|false|none||none|
|»»» total|integer|false|none||none|
|»»» pages|integer|false|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|false|none||none|
|» message|string|false|none||none|

## GET 获取识别记录详情

GET /recognition/history/123e4567-e89b-12d3-a456-426614174000

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|

> 返回示例

> 404 Response

```json
{
  "code": 0,
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### 返回数据结构

状态码 **404**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|true|none||none|
|» message|string|true|none||none|

## GET 健康检查

GET /health

检查服务器是否正常运行

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "status": "OK",
    "timestamp": "2019-08-24T14:15:22Z",
    "environment": "development"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|服务器正常运行|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|false|none||none|
|» message|string|false|none||none|
|» data|object|false|none||none|
|»» status|string|false|none||none|
|»» timestamp|string(date-time)|false|none||none|
|»» environment|string|false|none||none|

## GET 获取用户资料

GET /users/profile

获取当前登录用户的个人资料

> Body 请求参数

```yaml
{}

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "user123",
    "email": "user@example.com",
    "nickname": "用户昵称",
    "phone": "13800138000",
    "avatar": "/uploads/avatars/user123.jpg",
    "role": "user",
    "createdAt": "2019-08-24T14:15:22Z",
    "updatedAt": "2019-08-24T14:15:22Z"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|用户资料|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|未授权|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» data|object|false|none||none|
|»» id|string|false|none||none|
|»» username|string|false|none||none|
|»» email|string|false|none||none|
|»» nickname|string|false|none||none|
|»» phone|string|false|none||none|
|»» avatar|string|false|none||none|
|»» role|string|false|none||none|
|»» createdAt|string(date-time)|false|none||none|
|»» updatedAt|string(date-time)|false|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» message|string|false|none||none|

## GET 获取垃圾类别列表

GET /recognition/categories

获取所有垃圾类别信息

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|lang|query|string| 否 |语言偏好|
|Authorization|header|string| 否 |none|

#### 枚举值

|属性|值|
|---|---|
|lang|zh|
|lang|en|
|lang|ja|
|lang|ko|

> 返回示例

> 200 Response

```json
{
  "success": true,
  "data": {
    "recyclable": {
      "id": "recyclable",
      "name": "可回收物",
      "color": "blue",
      "description": "可回收物包括纸类、塑料、金属、玻璃、织物等"
    },
    "kitchen": {
      "id": "kitchen",
      "name": "厨余垃圾",
      "color": "green",
      "description": "厨余垃圾包括剩菜剩饭、果皮、骨头等"
    },
    "hazardous": {
      "id": "hazardous",
      "name": "有害垃圾",
      "color": "red",
      "description": "有害垃圾包括废电池、废灯管、废药品、废油漆等"
    },
    "other": {
      "id": "other",
      "name": "其他垃圾",
      "color": "black",
      "description": "其他垃圾包括砖瓦陶瓷、渣土、卫生间废纸等"
    }
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|垃圾类别列表|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» data|object|false|none||none|
|»» recyclable|object|false|none||none|
|»»» id|string|false|none||none|
|»»» name|string|false|none||none|
|»»» color|string|false|none||none|
|»»» description|string|false|none||none|
|»» kitchen|object|false|none||none|
|»»» id|string|false|none||none|
|»»» name|string|false|none||none|
|»»» color|string|false|none||none|
|»»» description|string|false|none||none|
|»» hazardous|object|false|none||none|
|»»» id|string|false|none||none|
|»»» name|string|false|none||none|
|»»» color|string|false|none||none|
|»»» description|string|false|none||none|
|»» other|object|false|none||none|
|»»» id|string|false|none||none|
|»»» name|string|false|none||none|
|»»» color|string|false|none||none|
|»»» description|string|false|none||none|

## GET 获取垃圾类别详情

GET /recognition/categories/{slug}

获取指定垃圾类别的详细信息

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|slug|path|string| 是 |垃圾类别标识|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "60a1b2c3d4e5f6a7b8c9d0e3",
    "name": "可回收物",
    "slug": "recyclable",
    "color": "#0052CC",
    "description": "可回收物是指适宜回收和可循环再利用的废弃物。",
    "icon": "https://example.com/icons/recyclable.png",
    "tips": "可回收物应保持清洁干燥，避免污染。"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|获取成功|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|类别不存在|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|false|none||none|
|» message|string|false|none||none|
|» data|object|false|none||none|
|»» id|string|false|none||none|
|»» name|string|false|none||none|
|»» slug|string|false|none||none|
|»» color|string|false|none||none|
|»» description|string|false|none||none|
|»» icon|string|false|none||none|
|»» tips|string|false|none||none|

状态码 **404**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code|integer|false|none||none|
|» message|string|false|none||none|

## GET 搜索垃圾信息

GET /recognition/search

根据关键词搜索垃圾信息

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|keyword|query|string| 是 |搜索关键词|
|page|query|integer| 否 |页码|
|limit|query|integer| 否 |每页数量|
|lang|query|string| 否 |语言偏好|
|Authorization|header|string| 否 |none|

#### 枚举值

|属性|值|
|---|---|
|lang|zh|
|lang|en|
|lang|ja|
|lang|ko|

> 返回示例

> 200 Response

```json
{
  "success": true,
  "data": [
    {
      "id": "plastic-bottle",
      "name": "塑料瓶",
      "category": "recyclable",
      "categoryName": "可回收物",
      "description": "塑料瓶属于可回收物，请投入蓝色垃圾桶",
      "tips": [
        "请将瓶内液体倒净",
        "拧下瓶盖分开投放"
      ],
      "imageUrl": "/images/waste/plastic-bottle.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|搜索结果|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|搜索失败|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» data|[object]|false|none||none|
|»» id|string|false|none||none|
|»» name|string|false|none||none|
|»» category|string|false|none||none|
|»» categoryName|string|false|none||none|
|»» description|string|false|none||none|
|»» tips|[string]|false|none||none|
|»» imageUrl|string|false|none||none|
|» pagination|object|false|none||none|
|»» page|integer|false|none||none|
|»» limit|integer|false|none||none|
|»» total|integer|false|none||none|
|»» pages|integer|false|none||none|

状态码 **400**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» message|string|false|none||none|

## GET 获取单个垃圾详情

GET /recognition/items/{wasteItemId}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|wasteItemId|path|string| 是 |垃圾ID|
|Authorization|header|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "category": "string",
    "categoryName": "string",
    "categoryIcon": "string",
    "categoryColor": "string",
    "description": "string",
    "suggestion": "string"
  },
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|true|none||none|
|» data|object|true|none||none|
|»» id|string|true|none||none|
|»» name|string|true|none||none|
|»» category|string|true|none||none|
|»» categoryName|string|true|none||none|
|»» categoryIcon|string|true|none||none|
|»» categoryColor|string|true|none||none|
|»» description|string|true|none||none|
|»» suggestion|string|true|none||none|
|» message|string|true|none||none|

## POST 上传垃圾图片进行识别

POST /recognition/upload

上传垃圾图片并获取识别结果

> Body 请求参数

```yaml
image: file:///Users/wensen/Downloads/20250919122246_124_493.jpg
saveHistory: true

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|Authorization|header|string| 否 |none|
|body|body|object| 否 |none|
|» image|body|string(binary)| 是 |垃圾图片文件|
|» saveHistory|body|boolean| 否 |是否保存识别历史|

> 返回示例

> 200 Response

```json
{
  "success": true,
  "data": {
    "category": "recyclable",
    "categoryName": "可回收物",
    "categoryColor": "blue",
    "confidence": 0.95,
    "wasteName": "塑料瓶",
    "description": "塑料瓶属于可回收物，请投入蓝色垃圾桶",
    "tips": [
      "请将瓶内液体倒净",
      "拧下瓶盖分开投放"
    ],
    "imageUrl": "/uploads/recognition/2023/10/15/plastic-bottle-12345.jpg",
    "historyId": "abc123"
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|识别成功|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|识别失败|Inline|
|401|[Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1)|未授权|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» data|object|false|none||none|
|»» category|string|false|none||none|
|»» categoryName|string|false|none||none|
|»» categoryColor|string|false|none||none|
|»» confidence|number|false|none||none|
|»» wasteName|string|false|none||none|
|»» description|string|false|none||none|
|»» tips|[string]|false|none||none|
|»» imageUrl|string|false|none||none|
|»» historyId|string|false|none||none|

状态码 **400**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» message|string|false|none||none|

状态码 **401**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» success|boolean|false|none||none|
|» message|string|false|none||none|

# 数据模型

