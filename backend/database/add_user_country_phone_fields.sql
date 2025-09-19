-- 为用户表添加区号、国家和注册IP字段
ALTER TABLE users
ADD COLUMN phone_code VARCHAR(10) COMMENT '手机号码区号（如：+86）',
ADD COLUMN country VARCHAR(100) COMMENT '注册时的国家',
ADD COLUMN registration_ip VARCHAR(50) COMMENT '注册时的IP地址';

-- 更新现有记录的默认值
UPDATE users
SET phone_code = '+86', 
    country = 'China'
WHERE phone_code IS NULL;

-- 添加索引以提高查询性能
ALTER TABLE users
ADD INDEX idx_phone_code (phone_code),
ADD INDEX idx_country (country);