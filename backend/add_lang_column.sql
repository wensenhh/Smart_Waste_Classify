-- 为waste_items表添加lang字段的SQL脚本
ALTER TABLE waste_items
ADD COLUMN lang VARCHAR(10) NOT NULL DEFAULT 'zh' COMMENT '语言代码，默认为中文(zh)';

-- 为现有记录设置默认语言为中文
UPDATE waste_items
SET lang = 'zh'
WHERE lang IS NULL;

-- 为lang字段添加索引，提高查询效率
CREATE INDEX idx_waste_items_lang ON waste_items (lang);

-- 确认字段添加成功
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_DEFAULT, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'waste_items'
AND COLUMN_NAME = 'lang';