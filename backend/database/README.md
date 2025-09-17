# 智能垃圾分类系统 - 数据库设计说明

本目录包含智能垃圾分类系统的MySQL数据库设计文件和相关说明。

## 数据库结构概览

`smart_waste_db.sql` 文件包含了完整的数据库结构设计和测试数据，主要包括以下几个模块的表结构：

### 1. 用户模块
- `users`：存储用户基本信息
- `user_points`：记录用户积分变动
- `achievements`：定义系统中的成就
- `user_achievements`：记录用户获得的成就

### 2. 垃圾识别模块
- `waste_categories`：垃圾类别定义（如：可回收物、厨余垃圾等）
- `waste_items`：具体垃圾物品信息
- `recognition_records`：用户垃圾识别历史记录

### 3. 知识问答模块
- `questions`：问答题目信息
- `user_question_history`：用户答题历史

### 4. 社区分享模块
- `posts`：社区帖子内容
- `comments`：帖子评论
- `post_likes`：帖子点赞记录

### 5. 环保活动模块
- `activities`：环保活动信息
- `activity_registrations`：用户活动报名记录

## 数据表关系图

```mermaid
erdFontMinimal
erDiagram
    USERS ||--o{ RECOGNITION_RECORDS : has
    USERS ||--o{ USER_QUESTION_HISTORY : answers
    USERS ||--o{ POSTS : publishes
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ POST_LIKES : likes
    USERS ||--o{ ACTIVITY_REGISTRATIONS : registers_for
    USERS ||--o{ USER_POINTS : earns
    USERS ||--o{ USER_ACHIEVEMENTS : achieves
    
    WASTE_CATEGORIES ||--o{ WASTE_ITEMS : contains
    WASTE_ITEMS ||--o{ RECOGNITION_RECORDS : recognized_as
    
    QUESTIONS ||--o{ USER_QUESTION_HISTORY : answered
    
    POSTS ||--o{ COMMENTS : has
    POSTS ||--o{ POST_LIKES : has
    
    ACTIVITIES ||--o{ ACTIVITY_REGISTRATIONS : has
    
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : earned
```

## 如何导入数据库

### 方法一：使用MySQL命令行

1. 打开终端或命令提示符
2. 登录MySQL：
   ```
   mysql -u root -p
   ```
3. 输入密码后，创建数据库：
   ```sql
   CREATE DATABASE IF NOT EXISTS smart_waste_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. 退出MySQL命令行：
   ```
   exit
   ```
5. 导入SQL文件：
   ```
   mysql -u root -p smart_waste_system < database/smart_waste_db.sql
   ```

### 方法二：使用phpMyAdmin或其他MySQL管理工具

1. 登录管理工具
2. 创建名为 `smart_waste_system` 的数据库（字符集选择 utf8mb4，排序规则选择 utf8mb4_unicode_ci）
3. 选择创建好的数据库，点击导入功能
4. 选择 `smart_waste_db.sql` 文件，点击执行导入

## 测试数据说明

SQL文件中已包含部分测试数据，方便您进行开发和测试：

### 用户测试数据
- 共有3个测试用户
- 用户名分别为：张用户、王环保、李分类
- 手机号码分别为：13800138001、13800138002、13800138003
- 所有用户的默认密码均为：`123456`（已加密存储）

### 垃圾类别测试数据
- 已包含四种基本垃圾类型：可回收物、厨余垃圾、有害垃圾、其他垃圾
- 每种类型下有2个示例垃圾物品

### 问答测试数据
- 包含1道每日一题和1道闯关题目

### 社区帖子测试数据
- 包含2篇示例帖子
- 每篇帖子有1-2条评论

### 环保活动测试数据
- 包含2个即将举行的环保活动

## 数据库设计原则

1. **数据完整性**：通过外键约束确保数据关联的完整性
2. **可扩展性**：表结构设计考虑了未来功能扩展的需求
3. **性能优化**：对常用查询字段进行了索引设计
4. **安全性**：用户密码采用加密存储
5. **数据一致性**：使用事务和约束确保数据一致性

## 注意事项

1. 开发环境中使用的数据库连接配置应与实际生产环境分离
2. 定期备份数据库以防止数据丢失
3. 生产环境中应限制数据库用户的权限
4. 如需修改数据库结构，请先备份现有数据
5. 测试数据中的用户密码仅用于开发测试，生产环境中应要求用户设置强密码