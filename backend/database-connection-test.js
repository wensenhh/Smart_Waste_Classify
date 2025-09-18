// 数据库连接测试脚本
const db = require('./src/utils/db');

/**
 * 测试数据库连接
 */
async function testDatabaseConnection() {
  console.log('开始测试数据库连接...');
  
  try {
    // 初始化数据库连接池
    await db.initPool();
    
    // 测试连接
    const isConnected = await db.testConnection();
    
    if (isConnected) {
      console.log('✅ 数据库连接成功!');
      
      // 尝试查询数据库版本信息
      try {
        const result = await db.query('SELECT VERSION() AS version');
        console.log(`数据库版本: ${result[0].version}`);
      } catch (queryError) {
        console.log('✓ 数据库连接成功，但查询版本信息失败:', queryError.message);
      }
    } else {
      console.log('❌ 数据库连接失败!');
    }
    
  } catch (error) {
    console.error('❌ 数据库连接测试发生错误:', error.message);
    console.error('错误详情:', error);
  } finally {
    // 关闭连接池
    await db.closePool();
    console.log('数据库连接池已关闭');
  }
}

// 执行测试
if (require.main === module) {
  testDatabaseConnection().then(() => {
    console.log('测试完成');
  });
} else {
  module.exports = testDatabaseConnection;
}