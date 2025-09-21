// 为waste_items表添加lang字段的JavaScript脚本
const { query } = require('./src/utils/db');

/**
 * 执行添加lang字段的SQL操作
 */
async function addLangColumn() {
  try {
    console.log('开始为waste_items表添加lang字段...');
    
    // 添加lang字段
    await query(`
      ALTER TABLE waste_items
      ADD COLUMN lang VARCHAR(10) NOT NULL DEFAULT 'zh' COMMENT '语言代码，默认为中文(zh)'
    `);
    
    console.log('成功添加lang字段');
    
    // 为现有记录设置默认语言为中文（虽然有默认值，但为确保所有记录都有值）
    await query(`
      UPDATE waste_items
      SET lang = 'zh'
      WHERE lang IS NULL
    `);
    
    console.log('成功设置现有记录的语言为中文');
    
    // 为lang字段添加索引，提高查询效率
    await query(`
      CREATE INDEX idx_waste_items_lang ON waste_items (lang)
    `);
    
    console.log('成功为lang字段添加索引');
    
    // 验证字段添加是否成功
    const columns = await query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_DEFAULT, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'waste_items'
      AND COLUMN_NAME = 'lang'
    `);
    
    if (columns.length > 0) {
      console.log('lang字段添加验证成功:', columns[0]);
    } else {
      console.log('lang字段验证失败，未找到该字段');
    }
    
    console.log('所有操作完成');
  } catch (error) {
    console.error('执行添加lang字段操作失败:', error);
    // 如果表已经有lang字段，不应该中断程序
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('注意：lang字段已经存在，无需重复添加');
    }
  }
}

// 执行脚本
addLangColumn().then(() => {
  console.log('脚本执行完毕');
  process.exit(0);
}).catch(error => {
  console.error('脚本执行出错:', error);
  process.exit(1);
});