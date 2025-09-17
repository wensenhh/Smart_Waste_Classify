# 智能垃圾分类系统 API 文档

## 1. 概述

本文档详细描述智能垃圾分类系统的API接口，供开发人员集成和使用系统功能。所有API均采用RESTful设计风格，使用JSON格式进行数据交换。

### 1.1 基础URL

- **开发环境**: http://localhost:3000/api/v1
- **生产环境**: https://api.example.com/v1

### 1.2 版本控制

API版本通过URL路径进行控制，当前版本为v1。

### 1.3 认证方式

系统使用JWT（JSON Web Token）进行用户认证。用户登录成功后，系统会返回一个JWT令牌，后续请求需在请求头中添加该令牌。

```
Authorization: Bearer {token}
```

### 1.4 响应格式

所有API响应均采用统一的JSON格式：

```json
{
  "code": 200,          // 状态码，200表示成功
  "message": "Success", // 状态消息
  "data": {}
  // 响应数据，根据接口不同有所差异
}
```

### 1.5 错误处理

当请求失败时，系统会返回错误信息：

```json
{
  "code": 错误码,
  "message": "错误描述",
  "error": "详细错误信息（可选）"
}
```

常见错误码：
- 400: 请求参数错误
- 401: 未授权，需要登录
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 2. 健康检查接口

### 2.1 获取系统健康状态

**描述**: 检查系统是否正常运行

**请求**: 
- **方法**: GET
- **路径**: /health
- **认证**: 不需要

**响应**: 
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "status": "ok",
    "timestamp": "2023-10-15T08:30:00Z",
    "version": "1.0.0"
  }
}
```

## 3. 垃圾识别接口

### 3.1 上传图片识别垃圾

**描述**: 通过上传垃圾图片进行智能识别

**请求**: 
- **方法**: POST
- **路径**: /recognition/identify
- **认证**: 不需要
- **参数**: 
  - file: 垃圾图片文件（multipart/form-data）
  - save_record: 是否保存识别记录（可选，默认true）

**响应**: 
```json
{
  "code": 200,
  "message": "识别成功",
  "data": {
    "id": "record_123456",
    "garbage_name": "塑料瓶",
    "category_id": "recyclable",
    "category_name": "可回收物",
    "category_color": "蓝色",
    "confidence": 0.95,
    "suggestion": "请投放至蓝色可回收垃圾桶",
    "tips": "塑料瓶请尽量洗净压扁后投放",
    "image_url": "https://example.com/uploads/123456.jpg",
    "created_at": "2023-10-15T08:30:00Z"
  }
}
```

### 3.2 搜索垃圾信息

**描述**: 根据关键词搜索垃圾信息

**请求**: 
- **方法**: GET
- **路径**: /recognition/search
- **认证**: 不需要
- **参数**: 
  - keyword: 搜索关键词（必填）
  - page: 页码（可选，默认1）
  - limit: 每页数量（可选，默认10）

**响应**: 
```json
{
  "code": 200,
  "message": "搜索成功",
  "data": {
    "items": [
      {
        "id": "garbage_001",
        "name": "塑料瓶",
        "category_id": "recyclable",
        "category_name": "可回收物",
        "description": "常见的PET塑料瓶",
        "suggestion": "请投放至蓝色可回收垃圾桶"
      },
      // 更多搜索结果...
    ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

## 4. 垃圾类别接口

### 4.1 获取所有垃圾类别

**描述**: 获取系统支持的所有垃圾类别

**请求**: 
- **方法**: GET
- **路径**: /recognition/categories
- **认证**: 不需要

**响应**: 
```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": "recyclable",
      "name": "可回收物",
      "color": "蓝色",
      "description": "适宜回收利用和资源化利用的生活废弃物",
      "examples": ["废纸", "塑料", "玻璃", "金属", "织物"]
    },
    {
      "id": "kitchen",
      "name": "厨余垃圾",
      "color": "绿色",
      "description": "居民日常生活及食品加工、饮食服务、单位供餐等活动中产生的垃圾",
      "examples": ["剩菜剩饭", "果皮", "蛋壳", "茶叶渣", "骨骼内脏"]
    },
    {
      "id": "hazardous",
      "name": "有害垃圾",
      "color": "红色",
      "description": "对人体健康或者自然环境造成直接或者潜在危害的生活废弃物",
      "examples": ["废电池", "废荧光灯管", "废药品及其包装物", "废油漆和溶剂及其包装物"]
    },
    {
      "id": "other",
      "name": "其他垃圾",
      "color": "灰色",
      "description": "除可回收物、厨余垃圾、有害垃圾以外的其他生活废弃物",
      "examples": ["卫生纸", "餐巾纸", "烟蒂", "陶瓷碎片", "灰土"]
    }
  ]
}
```

### 4.2 获取单个垃圾类别详情

**描述**: 获取指定垃圾类别的详细信息

**请求**: 
- **方法**: GET
- **路径**: /recognition/categories/{categoryId}
- **认证**: 不需要
- **参数**: 
  - categoryId: 垃圾类别ID（recyclable, kitchen, hazardous, other）

**响应**: 
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "recyclable",
    "name": "可回收物",
    "color": "蓝色",
    "description": "适宜回收利用和资源化利用的生活废弃物",
    "examples": ["废纸", "塑料", "玻璃", "金属", "织物"],
    "handling_methods": "回收后进行分类处理，部分可再利用制作成新产品",
    "environmental_impact": "正确回收可减少资源浪费，降低环境污染"
  }
}
```

## 5. 用户识别历史接口

### 5.1 获取用户识别历史

**描述**: 获取当前用户的垃圾识别历史记录

**请求**: 
- **方法**: GET
- **路径**: /recognition/history
- **认证**: 需要
- **参数**: 
  - page: 页码（可选，默认1）
  - limit: 每页数量（可选，默认10）
  - category: 按垃圾类别筛选（可选）
  - start_date: 开始日期（可选，格式：YYYY-MM-DD）
  - end_date: 结束日期（可选，格式：YYYY-MM-DD）

**响应**: 
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "record_123456",
        "garbage_name": "塑料瓶",
        "category_id": "recyclable",
        "category_name": "可回收物",
        "category_color": "蓝色",
        "confidence": 0.95,
        "image_url": "https://example.com/uploads/123456.jpg",
        "created_at": "2023-10-15T08:30:00Z"
      },
      // 更多历史记录...
    ],
    "total": 156,
    "page": 1,
    "limit": 10,
    "pages": 16
  }
}
```

### 5.2 获取单条识别记录详情

**描述**: 获取指定识别记录的详细信息

**请求**: 
- **方法**: GET
- **路径**: /recognition/history/{recordId}
- **认证**: 需要
- **参数**: 
  - recordId: 识别记录ID

**响应**: 
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "record_123456",
    "garbage_name": "塑料瓶",
    "category_id": "recyclable",
    "category_name": "可回收物",
    "category_color": "蓝色",
    "confidence": 0.95,
    "suggestion": "请投放至蓝色可回收垃圾桶",
    "tips": "塑料瓶请尽量洗净压扁后投放",
    "image_url": "https://example.com/uploads/123456.jpg",
    "created_at": "2023-10-15T08:30:00Z"
  }
}
```

### 5.3 删除识别记录

**描述**: 删除指定的识别记录

**请求**: 
- **方法**: DELETE
- **路径**: /recognition/history/{recordId}
- **认证**: 需要
- **参数**: 
  - recordId: 识别记录ID

**响应**: 
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "id": "record_123456"
  }
}
```

### 5.4 批量删除识别记录

**描述**: 批量删除多个识别记录

**请求**: 
- **方法**: POST
- **路径**: /recognition/history/batch-delete
- **认证**: 需要
- **请求体**: 
```json
{
  "record_ids": ["record_123456", "record_123457", "record_123458"]
}
```

**响应**: 
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "deleted_count": 3
  }
}
```

## 6. 用户统计接口

### 6.1 获取用户垃圾分类统计

**描述**: 获取当前用户的垃圾分类统计数据

**请求**: 
- **方法**: GET
- **路径**: /recognition/stats
- **认证**: 需要
- **参数**: 
  - start_date: 开始日期（可选，格式：YYYY-MM-DD）
  - end_date: 结束日期（可选，格式：YYYY-MM-DD）

**响应**: 
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_records": 156,
    "by_category": [
      {
        "category_id": "recyclable",
        "category_name": "可回收物",
        "count": 65,
        "percentage": 41.67
      },
      {
        "category_id": "kitchen",
        "category_name": "厨余垃圾",
        "count": 48,
        "percentage": 30.77
      },
      {
        "category_id": "hazardous",
        "category_name": "有害垃圾",
        "count": 8,
        "percentage": 5.13
      },
      {
        "category_id": "other",
        "category_name": "其他垃圾",
        "count": 35,
        "percentage": 22.44
      }
    ],
    "daily_trend": [
      {
        "date": "2023-10-10",
        "count": 12
      },
      {
        "date": "2023-10-11",
        "count": 15
      },
      // 更多日期数据...
    ]
  }
}
```

## 7. 管理员接口

### 7.1 获取所有用户识别记录（管理员专用）

**描述**: 获取系统中所有用户的垃圾识别记录

**请求**: 
- **方法**: GET
- **路径**: /admin/records
- **认证**: 需要（管理员权限）
- **参数**: 
  - page: 页码（可选，默认1）
  - limit: 每页数量（可选，默认20）
  - user_id: 按用户ID筛选（可选）
  - category: 按垃圾类别筛选（可选）
  - start_date: 开始日期（可选，格式：YYYY-MM-DD）
  - end_date: 结束日期（可选，格式：YYYY-MM-DD）

**响应**: 
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": "record_123456",
        "user_id": "user_789012",
        "username": "张三",
        "garbage_name": "塑料瓶",
        "category_id": "recyclable",
        "category_name": "可回收物",
        "image_url": "https://example.com/uploads/123456.jpg",
        "created_at": "2023-10-15T08:30:00Z"
      },
      // 更多记录...
    ],
    "total": 12568,
    "page": 1,
    "limit": 20,
    "pages": 629
  }
}
```

### 7.2 删除用户识别记录（管理员专用）

**描述**: 删除指定用户的识别记录

**请求**: 
- **方法**: DELETE
- **路径**: /admin/users/{userId}/records/{recordId}
- **认证**: 需要（管理员权限）
- **参数**: 
  - userId: 用户ID
  - recordId: 识别记录ID

**响应**: 
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "user_id": "user_789012",
    "record_id": "record_123456"
  }
}
```

### 7.3 获取系统统计数据（管理员专用）

**描述**: 获取系统的整体统计数据

**请求**: 
- **方法**: GET
- **路径**: /admin/system-stats
- **认证**: 需要（管理员权限）
- **参数**: 
  - start_date: 开始日期（可选，格式：YYYY-MM-DD）
  - end_date: 结束日期（可选，格式：YYYY-MM-DD）

**响应**: 
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "total_users": 1586,
    "active_users": 843,
    "total_records": 12568,
    "daily_new_records": 456,
    "by_category": [
      {
        "category_id": "recyclable",
        "category_name": "可回收物",
        "count": 5234,
        "percentage": 41.65
      },
      // 更多类别统计...
    ],
    "top_garbage_types": [
      {
        "name": "塑料瓶",
        "count": 1234
      },
      // 更多垃圾类型统计...
    ]
  }
}
```

## 8. API使用示例

### 8.1 使用JavaScript调用垃圾识别API

```javascript
// 使用Fetch API上传图片进行垃圾识别
const identifyGarbage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('save_record', 'true');
    
    const response = await fetch('https://api.example.com/v1/recognition/identify', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.code === 200) {
      console.log('识别成功:', data.data);
      return data.data;
    } else {
      console.error('识别失败:', data.message);
    }
  } catch (error) {
    console.error('请求错误:', error);
  }
};

// 使用示例
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    identifyGarbage(file)
      .then(result => {
        // 处理识别结果
        displayResult(result);
      });
  }
});
```

### 8.2 使用Python调用用户历史记录API

```python
import requests

def get_user_history(token, page=1, limit=10):
    url = f"https://api.example.com/v1/recognition/history?page={page}&limit={limit}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response_data = response.json()
        
        if response_data.get('code') == 200:
            print(f"获取成功，共 {response_data['data']['total']} 条记录")
            return response_data['data']
        else:
            print(f"获取失败: {response_data.get('message')}")
    except Exception as e:
        print(f"请求异常: {str(e)}")

# 使用示例
token = "your_jwt_token_here"
history_data = get_user_history(token, page=1, limit=20)

if history_data:
    # 处理历史记录数据
    for record in history_data['items']:
        print(f"时间: {record['created_at']}, 垃圾: {record['garbage_name']}, 类别: {record['category_name']}")
```

## 9. 最佳实践

### 9.1 请求频率限制

为保证系统稳定性，API设置了请求频率限制：
- 普通用户：每分钟最多100次请求
- 管理员：每分钟最多200次请求

超过限制后，系统会返回429状态码（Too Many Requests）。

### 9.2 错误处理建议

1. 实现请求超时机制，建议设置为30秒
2. 对返回的状态码进行检查，处理各种可能的错误情况
3. 实现重试机制，对临时性错误可以尝试重新请求
4. 记录API调用日志，便于排查问题

### 9.3 安全性建议

1. 保护JWT令牌，不要在客户端明文存储
2. 使用HTTPS协议进行所有API通信
3. 不要在URL中传递敏感信息
4. 定期更换JWT令牌

---

**文档版本**: 1.0.0
**更新时间**: 2023-10-15