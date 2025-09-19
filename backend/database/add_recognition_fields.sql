-- 为 recognition_records 表添加新字段的 SQL 语句

-- 添加垃圾名称字段（不指定位置，让数据库自动添加）
ALTER TABLE recognition_records 
ADD COLUMN waste_name VARCHAR(100) NULL;

-- 添加分类依据字段
ALTER TABLE recognition_records 
ADD COLUMN classification_reason TEXT NULL;

-- 添加处理方式字段
ALTER TABLE recognition_records 
ADD COLUMN disposal_method VARCHAR(50) NULL;

-- 添加 AI 模型字段
ALTER TABLE recognition_records 
ADD COLUMN ai_model VARCHAR(100) NULL;

-- 添加环保提示字段
ALTER TABLE recognition_records 
ADD COLUMN environmental_tip TEXT NULL;

-- 注意：如需为现有记录设置默认值，请先执行上面的 ALTER TABLE 语句添加字段，然后再执行下面的 UPDATE 语句
UPDATE recognition_records SET 
  waste_name = COALESCE(waste_name, '未知'),
  classification_reason = COALESCE(classification_reason, '无'),
  disposal_method = COALESCE(disposal_method, 'unknown'),
  ai_model = COALESCE(ai_model, 'unknown'),
  environmental_tip = COALESCE(environmental_tip, '无');
