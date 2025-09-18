-- 智能垃圾分类系统 - 识别记录测试数据
-- 用途：为 recognition_records 表添加测试数据用于开发和测试

-- 注意事项：
-- 1. 确保已创建 smart_waste_system 数据库
-- 2. 确保已创建 recognition_records 表和相关的 users、waste_items 表
-- 3. 本脚本使用的 user_id (user_001) 与 smart_waste_db.sql 中的测试数据匹配
-- 4. 本脚本使用的 waste_item_id (1, 2, 3, 5, 7) 与 smart_waste_db.sql 中的测试数据匹配

-- 使用方法：
-- 1. 登录MySQL: mysql -u [username] -p
-- 2. 选择数据库: USE smart_waste_system;
-- 3. 执行本脚本: SOURCE /path/to/test_data_recognition.sql;
-- 或直接在命令行执行: mysql -u [username] -p smart_waste_system < test_data_recognition.sql

-- 创建识别记录测试数据
INSERT INTO recognition_records (id, user_id, waste_item_id, recognition_type, confidence, city, image_url, recognized_at)
VALUES
-- 使用现有的用户ID和垃圾物品ID，创建多条不同类型的识别记录
('123e4567-e89b-12d3-a456-426614174000', 'user_001', 1, 'image_recognition', 0.95, '上海', 'https://example.com/images/plastic_bottle.jpg', NOW() - INTERVAL 1 DAY),
('123e4567-e89b-12d3-a456-426614174001', 'user_001', 3, 'image_recognition', 0.88, '北京', 'https://example.com/images/apple_core.jpg', NOW() - INTERVAL 2 DAY),
('123e4567-e89b-12d3-a456-426614174002', 'user_001', 5, 'image_recognition', 0.92, '广州', 'https://example.com/images/battery.jpg', NOW() - INTERVAL 3 DAY),
('123e4567-e89b-12d3-a456-426614174003', 'user_001', 7, 'image_recognition', 0.85, '深圳', 'https://example.com/images/tissue.jpg', NOW() - INTERVAL 4 DAY),
('123e4567-e89b-12d3-a456-426614174004', 'user_001', 2, 'image_recognition', 0.90, '杭州', 'https://example.com/images/newspaper.jpg', NOW() - INTERVAL 5 DAY);