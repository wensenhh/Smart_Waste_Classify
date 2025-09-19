const fs = require('fs');
const path = require('path');
const db = require('./src/utils/db');

/**
 * 运行用户表字段迁移脚本
 * 用于执行add_user_country_phone_fields.sql文件中的SQL语句
 */
async function runUserFieldsMigration() {
  console.log('开始运行用户表字段迁移脚本...');
  
  try {
    // 读取SQL文件内容
    const sqlFilePath = path.join(__dirname, 'database', 'add_user_country_phone_fields.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ SQL文件不存在:', sqlFilePath);
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('SQL文件读取成功，开始处理SQL语句');
    
    // 初始化数据库连接池
    await db.initPool();
    
    // 直接执行整个SQL文件内容
    try {
      console.log('正在执行SQL语句...');
      await db.query(sqlContent);
      console.log('✅ SQL语句执行成功');
    } catch (sqlError) {
      console.error('❌ SQL语句执行失败:');
      console.error('错误信息:', sqlError.message);
      
      // 如果整体执行失败，尝试逐条执行
      if (sqlError.message) {
        console.log('尝试逐条执行SQL语句...');
        
        // 简单分割SQL语句（保留分号）
        const lines = sqlContent.split('\n');
        let currentStatement = '';
        let statementCount = 0;
        
        for (let line of lines) {
          // 跳过注释行
          if (line.trim().startsWith('--')) continue;
          
          currentStatement += line + '\n';
          
          // 如果包含分号，且不是在字符串内的分号，则执行语句
          if (line.includes(';')) {
            const trimmedStatement = currentStatement.trim();
            if (trimmedStatement) {
              statementCount++;
              try {
                console.log(`正在执行语句 ${statementCount}:`, trimmedStatement.substring(0, 50) + (trimmedStatement.length > 50 ? '...' : ''));
                await db.query(trimmedStatement);
                console.log(`✅ 语句 ${statementCount} 执行成功`);
              } catch (stmtError) {
                console.error(`❌ 语句 ${statementCount} 执行失败:`, stmtError.message);
              }
              currentStatement = '';
            }
          }
        }
      }
    }
    
    console.log('🎉 用户表字段迁移脚本执行完成！');
    
  } catch (error) {
    console.error('❌ 运行用户表字段迁移脚本时发生错误:', error.message);
    console.error('错误详情:', error);
  } finally {
    // 关闭连接池
    // 注意：确保db模块有closePool方法或者使用适当的方式关闭连接池
    if (db.closePool) {
      await db.closePool();
      console.log('数据库连接池已关闭');
    } else {
      console.log('未找到closePool方法');
    }
  }
}

// 执行迁移
if (require.main === module) {
  runUserFieldsMigration().then(() => {
    console.log('用户表字段迁移测试完成');
  });
} else {
  module.exports = runUserFieldsMigration;
}