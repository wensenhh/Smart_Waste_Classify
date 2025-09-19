// 垃圾详情接口测试脚本
// 用于测试获取单个垃圾详情的API接口

const axios = require('axios');

// 配置测试参数
// const BASE_URL = 'https://node.hujingweb.xyz/api/v1'; // 用户使用的生产环境URL
const BASE_URL = 'http://localhost:3000/api/v1'; // 开发环境URL

// 测试函数：获取单个垃圾详情
async function testWasteItemDetail(wasteItemId, lang = 'zh') {
  try {
    const url = `${BASE_URL}/recognition/items/${wasteItemId}?lang=${lang}`;
    console.log(`\n测试获取单个垃圾详情 (ID: ${wasteItemId}, 语言: ${lang})`);
    console.log(`请求URL: ${url}`);
    
    const response = await axios.get(url);
    
    console.log('响应状态码:', response.status);
    console.log('响应数据结构:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      const wasteItem = response.data.data;
      console.log('垃圾详情信息:');
      console.log(`  名称: ${wasteItem.name}`);
      console.log(`  类别: ${wasteItem.category}`);
      console.log(`  描述: ${wasteItem.description}`);
      console.log(`  投放建议: ${wasteItem.suggestion}`);
      
      if (typeof wasteItem === 'object' && wasteItem !== null) {
        console.log('✓ 测试通过: 成功获取垃圾详情');
      } else {
        console.error('✗ 测试失败: 垃圾详情数据结构不正确，应返回对象');
      }
      return wasteItem;
    } else {
      console.error('✗ 测试失败: 未能获取垃圾详情');
      return null;
    }
  } catch (error) {
    console.log('响应状态码:', error.response?.status || '无响应');
    console.log('错误信息:', error.message);
    console.log('错误响应:', error.response?.data ? JSON.stringify(error.response.data, null, 2) : '无详细错误信息');
    
    if (error.response?.status === 404) {
      console.error('✗ 测试失败: 404 - 垃圾物品不存在');
      console.error('原因分析: 可能是wasteItemId不存在或者路径错误');
    }
    return null;
  }
}

// 运行所有测试
async function runTests() {
  console.log('\n===== 开始垃圾详情接口测试 =====');
  
  // 测试存在的垃圾物品
  console.log('\n测试1: 获取塑料瓶详情 (中文)');
  await testWasteItemDetail('plastic_bottle', 'zh');
  
  console.log('\n测试2: 获取塑料瓶详情 (英文)');
  await testWasteItemDetail('plastic_bottle', 'en');
  
  console.log('\n测试3: 获取电池详情 (中文)');
  await testWasteItemDetail('battery', 'zh');
  
  // 测试不存在的垃圾物品
  console.log('\n测试4: 获取不存在的垃圾物品详情');
  await testWasteItemDetail('non_existent_item');
  
  console.log('\n===== 垃圾详情接口测试结束 =====');
}

// 执行测试
runTests().catch(err => {
  console.error('测试运行失败:', err);
});

// 导出测试函数，便于单独调用
module.exports = {
  testWasteItemDetail,
  runTests
};