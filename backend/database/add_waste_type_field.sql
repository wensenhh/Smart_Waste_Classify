-- 为 recognition_records 表添加 waste_type 字段的 SQL 语句

-- 添加 waste_type 字段用于保存外部接口返回的 category 值
ALTER TABLE recognition_records 
ADD COLUMN waste_type VARCHAR(50) NULL;

-- 注意：如需为现有记录设置默认值，请先执行上面的 ALTER TABLE 语句添加字段，然后再执行下面的 UPDATE 语句
UPDATE recognition_records SET 
  waste_type = 'unknown';