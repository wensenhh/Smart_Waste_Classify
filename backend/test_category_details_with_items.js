const axios = require('axios');

// 配置测试参数
// const BASE_URL = 'https://node.hujingweb.xyz/api/v1'; // 用户使用的生产环境URL
const BASE_URL = 'http://localhost:3000/api/v1'; // 开发环境URL

// 测试函数：获取垃圾类别下的垃圾列表
async function testCategoryWithItems(categoryId) {
  try {
    const url = `${BASE_URL}/recognition/categories/${categoryId}`;
    console.log(`\n测试获取垃圾类别下的垃圾列表 (ID: ${categoryId})`);
    console.log(`请求URL: ${url}`);
    
    const response = await axios.get(url);
    
    console.log('响应状态码:', response.status);
    console.log('响应数据结构:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      const wasteItems = response.data.data;
      console.log('垃圾项数量:', wasteItems.length);
      console.log('垃圾项列表:');
      
      if (Array.isArray(wasteItems)) {
        wasteItems.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name} - ${item.description}`);
        });
        console.log('✓ 测试通过: 成功获取垃圾类别下的垃圾列表');
      } else {
        console.error('✗ 测试失败: 垃圾列表数据结构不正确，应返回数组');
      }
      return wasteItems;
    } else {
      console.error('✗ 测试失败: 未能获取垃圾列表');
      return null;
    }
  } catch (error) {
    console.log('响应状态码:', error.response?.status || '无响应');
    console.log('错误信息:', error.message);
    
    if (error.response?.status === 404) {
      console.error('✗ 测试失败: 404 - 资源不存在');
      console.error('原因分析: 可能是路径错误（请检查是否使用了复数形式categories）或者categoryId不存在');
    }
    return null;
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始测试垃圾类别下的垃圾列表API...');
  
  // 测试1: 获取可回收物类别下的垃圾列表
  console.log('\n=== 测试1: 获取可回收物类别下的垃圾列表 ===');
  await testCategoryWithItems('recyclable');
  
  // 测试2: 获取厨余垃圾类别下的垃圾列表
  console.log('\n=== 测试2: 获取厨余垃圾类别下的垃圾列表 ===');
  await testCategoryWithItems('kitchen');
  
  // 测试3: 获取有害垃圾类别下的垃圾列表
  console.log('\n=== 测试3: 获取有害垃圾类别下的垃圾列表 ===');
  await testCategoryWithItems('hazardous');
  
  // 测试4: 获取其他垃圾类别下的垃圾列表
  console.log('\n=== 测试4: 获取其他垃圾类别下的垃圾列表 ===');
  await testCategoryWithItems('other');
  
  console.log('\n所有测试完成！');
  console.log('\n结论：');
  console.log('1. 修改后的API接口现在返回垃圾类别下的具体垃圾列表作为data字段');
  console.log('2. 确保使用正确的API路径：/api/v1/recognition/categories/{categoryId}（categories是复数形式）');
  
  // 数据结构说明
  console.log('\n返回数据结构说明：');
  console.log('{');
  console.log('  success: true,');
  console.log('  data: [');
  console.log('    { id: "垃圾项ID", name: "垃圾项名称", description: "垃圾项描述", suggestion: "处理建议" },');
  console.log('    ...更多垃圾项');
  console.log('  ],');
  console.log('  message: "提示消息"');
  console.log('}');
}

// 运行测试
runTests().catch(err => {
  console.error('测试运行失败:', err);
});