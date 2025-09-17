-- 智能垃圾分类系统数据库设计

-- 创建数据库
CREATE DATABASE IF NOT EXISTS smart_waste_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_waste_system;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY COMMENT '用户唯一ID',
    phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号码',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    name VARCHAR(100) NOT NULL COMMENT '用户姓名',
    avatar VARCHAR(255) COMMENT '头像URL',
    city VARCHAR(100) COMMENT '所在城市',
    join_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册日期',
    last_login DATETIME COMMENT '最后登录时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用'
) ENGINE=InnoDB COMMENT='用户信息表';

-- 2. 垃圾类别表
CREATE TABLE IF NOT EXISTS waste_categories (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '类别ID',
    name VARCHAR(100) NOT NULL COMMENT '类别名称（如：可回收物、厨余垃圾、有害垃圾、其他垃圾）',
    color VARCHAR(50) COMMENT '代表颜色',
    description TEXT COMMENT '类别描述',
    icon_url VARCHAR(255) COMMENT '图标URL'
) ENGINE=InnoDB COMMENT='垃圾类别表';

-- 3. 垃圾物品表
CREATE TABLE IF NOT EXISTS waste_items (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '物品ID',
    category_id INT NOT NULL COMMENT '所属类别ID',
    name VARCHAR(255) NOT NULL COMMENT '物品名称',
    sub_category VARCHAR(100) COMMENT '子分类（如：PET塑料、果皮果核）',
    description TEXT COMMENT '物品描述',
    suggestion TEXT COMMENT '投放建议',
    image_url VARCHAR(255) COMMENT '图片URL',
    FOREIGN KEY (category_id) REFERENCES waste_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='垃圾物品详细信息表';

-- 4. 识别记录表
CREATE TABLE IF NOT EXISTS recognition_records (
    id VARCHAR(36) PRIMARY KEY COMMENT '记录ID',
    user_id VARCHAR(36) COMMENT '用户ID（可为空，表示未登录用户）',
    waste_item_id INT COMMENT '识别出的垃圾物品ID',
    recognition_type VARCHAR(100) NOT NULL COMMENT '识别类型',
    confidence FLOAT NOT NULL COMMENT '识别置信度',
    city VARCHAR(100) NOT NULL COMMENT '识别时的城市',
    image_url VARCHAR(255) COMMENT '识别图片URL',
    recognized_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '识别时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (waste_item_id) REFERENCES waste_items(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='垃圾识别记录表';

-- 5. 问题表
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(36) PRIMARY KEY COMMENT '问题ID',
    type ENUM('daily', 'challenge') NOT NULL COMMENT '问题类型：每日一题、闯关题',
    level INT DEFAULT 1 COMMENT '难度等级（适用于闯关题）',
    question_text TEXT NOT NULL COMMENT '问题内容',
    options JSON NOT NULL COMMENT '选项（JSON数组）',
    correct_answer INT NOT NULL COMMENT '正确答案索引',
    explanation TEXT COMMENT '答案解释',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='问答题目表';

-- 6. 用户问题历史表
CREATE TABLE IF NOT EXISTS user_question_history (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    question_id VARCHAR(36) NOT NULL COMMENT '问题ID',
    user_answer INT NOT NULL COMMENT '用户答案索引',
    is_correct BOOLEAN NOT NULL COMMENT '是否正确',
    answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '回答时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='用户问题回答历史表';

-- 7. 帖子表
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY COMMENT '帖子ID',
    user_id VARCHAR(36) NOT NULL COMMENT '发布用户ID',
    title VARCHAR(255) NOT NULL COMMENT '帖子标题',
    content TEXT NOT NULL COMMENT '帖子内容',
    category VARCHAR(100) COMMENT '帖子分类',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    likes_count INT DEFAULT 0 COMMENT '点赞数',
    comments_count INT DEFAULT 0 COMMENT '评论数',
    views_count INT DEFAULT 0 COMMENT '浏览量',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='社区帖子表';

-- 8. 评论表
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY COMMENT '评论ID',
    post_id VARCHAR(36) NOT NULL COMMENT '所属帖子ID',
    user_id VARCHAR(36) NOT NULL COMMENT '评论用户ID',
    content TEXT NOT NULL COMMENT '评论内容',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='帖子评论表';

-- 9. 帖子点赞表
CREATE TABLE IF NOT EXISTS post_likes (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞记录ID',
    post_id VARCHAR(36) NOT NULL COMMENT '帖子ID',
    user_id VARCHAR(36) NOT NULL COMMENT '点赞用户ID',
    liked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='帖子点赞记录表';

-- 10. 活动表
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY COMMENT '活动ID',
    title VARCHAR(255) NOT NULL COMMENT '活动标题',
    description TEXT NOT NULL COMMENT '活动描述',
    organizer_id VARCHAR(36) NOT NULL COMMENT '组织者ID',
    organizer_name VARCHAR(100) NOT NULL COMMENT '组织者名称',
    category VARCHAR(100) COMMENT '活动分类',
    activity_date DATE NOT NULL COMMENT '活动日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    location VARCHAR(255) NOT NULL COMMENT '活动地点',
    address VARCHAR(255) NOT NULL COMMENT '详细地址',
    image_url VARCHAR(255) COMMENT '活动图片URL',
    participants_count INT DEFAULT 0 COMMENT '当前参与人数',
    max_participants INT NOT NULL COMMENT '最大参与人数',
    contact_info VARCHAR(100) COMMENT '联系方式',
    requirement TEXT COMMENT '参与要求',
    tags JSON COMMENT '活动标签（JSON数组）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB COMMENT='环保活动表';

-- 11. 活动报名表
CREATE TABLE IF NOT EXISTS activity_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '报名记录ID',
    activity_id VARCHAR(36) NOT NULL COMMENT '活动ID',
    user_id VARCHAR(36) NOT NULL COMMENT '报名用户ID',
    registration_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending' COMMENT '报名状态',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    UNIQUE KEY unique_registration (activity_id, user_id),
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='活动报名记录表';

-- 12. 用户积分表
CREATE TABLE IF NOT EXISTS user_points (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    points INT NOT NULL DEFAULT 0 COMMENT '积分数值',
    change_type VARCHAR(100) NOT NULL COMMENT '积分变动类型',
    change_reason TEXT COMMENT '积分变动原因',
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '变动时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='用户积分变动记录表';

-- 13. 成就表
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '成就ID',
    name VARCHAR(100) NOT NULL COMMENT '成就名称',
    description TEXT NOT NULL COMMENT '成就描述',
    icon_url VARCHAR(255) COMMENT '成就图标URL',
    condition TEXT NOT NULL COMMENT '达成条件'
) ENGINE=InnoDB COMMENT='成就定义表';

-- 14. 用户成就关联表
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    achievement_id INT NOT NULL COMMENT '成就ID',
    achieved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '达成时间',
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='用户成就记录表';

-- 插入测试数据

-- 插入垃圾类别测试数据
INSERT INTO waste_categories (name, color, description) VALUES
('可回收物', '#0052D9', '适宜回收和可循环利用的生活废弃物'),
('厨余垃圾', '#388E3C', '居民日常生活及食品加工、饮食服务、单位供餐等活动中产生的垃圾'),
('有害垃圾', '#D32F2F', '对人体健康或者自然环境造成直接或者潜在危害的生活废弃物'),
('其他垃圾', '#757575', '除可回收物、有害垃圾、厨余垃圾以外的其他生活废弃物');

-- 插入垃圾物品测试数据
INSERT INTO waste_items (category_id, name, sub_category, suggestion) VALUES
(1, '塑料瓶', 'PET塑料', '请清洗后投入可回收物垃圾桶'),
(1, '废报纸', '纸类', '请折叠整齐后投入可回收物垃圾桶'),
(2, '苹果核', '果皮果核', '请投入厨余垃圾垃圾桶'),
(2, '剩饭菜', '厨余', '请沥干水分后投入厨余垃圾垃圾桶'),
(3, '电池', '干电池', '请投入有害垃圾专用垃圾桶'),
(3, '过期药品', '药品', '请密封后投入有害垃圾专用垃圾桶'),
(4, '纸巾', '纸类废弃物', '请投入其他垃圾垃圾桶'),
(4, '一次性餐具', '餐具', '请投入其他垃圾垃圾桶');

-- 插入用户测试数据（密码统一为：123456，已加密）
INSERT INTO users (id, phone, password, name, avatar, city) VALUES
('user_001', '13800138001', '$2b$10$QJfI7oQ4w1X9Ff4qV5j6Y.R7e9u0SdGv5y3h0Df2g1k9a8s7d6f5', '张用户', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', '北京'),
('user_002', '13800138002', '$2b$10$QJfI7oQ4w1X9Ff4qV5j6Y.R7e9u0SdGv5y3h0Df2g1k9a8s7d6f5', '王环保', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', '上海'),
('user_003', '13800138003', '$2b$10$QJfI7oQ4w1X9Ff4qV5j6Y.R7e9u0SdGv5y3h0Df2g1k9a8s7d6f5', '李分类', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', '广州');

-- 插入问题测试数据
INSERT INTO questions (id, type, level, question_text, options, correct_answer, explanation) VALUES
('daily_20250101', 'daily', 1, '以下哪种垃圾属于可回收物？', '["香蕉皮", "塑料瓶", "废电池", "纸巾"]', 1, '塑料瓶属于可回收物，应投入蓝色垃圾桶。香蕉皮属于厨余垃圾，废电池属于有害垃圾，纸巾属于其他垃圾。'),
('challenge_1_1', 'challenge', 1, '以下哪种垃圾属于有害垃圾？', '["废报纸", "过期药品", "苹果核", "塑料盒"]', 1, '过期药品属于有害垃圾，应投入红色垃圾桶。废报纸和塑料盒属于可回收物，苹果核属于厨余垃圾。');

-- 插入帖子测试数据
INSERT INTO posts (id, user_id, title, content, category, likes_count, comments_count, views_count) VALUES
('post_001', 'user_001', '分享一个家庭垃圾分类的实用技巧', '我发现使用不同颜色的垃圾桶来区分不同类型的垃圾非常有效！蓝色放可回收物，绿色放厨余垃圾，红色放有害垃圾，灰色放其他垃圾。这样家庭成员都能轻松区分，再也不会搞错了！', 'tips', 42, 2, 356),
('post_002', 'user_002', '我用废弃塑料瓶做了一个小花盆', '大家看看我用废弃塑料瓶做的小花盆！只需要简单的剪裁和装饰，就能变废为宝。这样既环保又省钱，何乐而不为呢？', 'experience', 78, 1, 521);

-- 插入评论测试数据
INSERT INTO comments (id, post_id, user_id, content) VALUES
('comment_001', 'post_001', 'user_002', '这个方法真不错！我也要试试看。'),
('comment_002', 'post_001', 'user_003', '我们家也是这样做的，效果很好！'),
('comment_003', 'post_002', 'user_001', '太有创意了！能分享详细的制作过程吗？');

-- 插入活动测试数据
INSERT INTO activities (id, title, description, organizer_id, organizer_name, category, activity_date, start_time, end_time, location, address, max_participants, contact_info, tags) VALUES
('act_001', '社区垃圾分类宣传活动', '在社区内开展垃圾分类知识宣传，发放宣传册和环保袋，现场指导居民正确分类垃圾。', 'org_001', '绿色环保协会', 'education', '2025-01-10', '09:00:00', '11:30:00', '阳光社区活动中心', '城市中心区阳光路123号', 100, '13800138000', '["垃圾分类", "社区活动", "知识宣传"]'),
('act_002', '公园清洁日', '组织志愿者清理公园内的垃圾，美化环境，宣传环保理念。活动结束后有环保知识小讲座。', 'org_002', '城市清洁行动队', 'cleanup', '2025-01-15', '08:30:00', '12:00:00', '城市中央公园', '城市西区公园路45号', 50, '13800138001', '["环保活动", "志愿服务", "公园清洁"]');

-- 插入成就测试数据
INSERT INTO achievements (name, description, condition) VALUES
('分类新手', '完成首次垃圾识别', '完成1次垃圾识别'),
('知识达人', '回答正确10个问题', '回答正确10个问题'),
('环保先锋', '参加3次环保活动', '参加3次环保活动');