const axios = require('axios');

// 配置测试参数
// const BASE_URL = 'https://node.hujingweb.xyz/api/v1'; // 用户使用的生产环境URL（当前不可访问）
const BASE_URL = 'http://localhost:3000/api/v1'; // 开发环境URL（本地运行时使用）

// 测试函数：获取垃圾类别详情
async function testGetCategoryDetail(categoryId) {
  try {
    // 正确的路径：使用复数形式 categories
    const url = `${BASE_URL}/recognition/categories/${categoryId}`;
    console.log(`\n测试获取垃圾类别详情 (ID: ${categoryId})`);
    console.log(`请求URL: ${url}`);
    
    const response = await axios.get(url);
    
    console.log('响应状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('✓ 测试通过: 成功获取垃圾类别详情');
      return response.data;
    } else {
      console.error('✗ 测试失败: 未能获取垃圾类别详情');
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

// 测试错误路径 - 使用单数形式category
async function testWrongPath() {
  try {
    // 错误的路径：使用单数形式 category
    const wrongUrl = `${BASE_URL}/recognition/category/recyclable`;
    console.log(`\n测试错误路径 - 使用单数形式category`);
    console.log(`错误URL: ${wrongUrl}`);
    
    const response = await axios.get(wrongUrl);
    console.log('响应状态码:', response.status);
  } catch (error) {
    console.log('响应状态码:', error.response?.status || '无响应');
    console.log('错误信息:', error.message);
    console.log('这是预期的404错误，因为路径中的category应该是复数形式categories');
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始测试垃圾类别API...');
  
  // 测试1: 获取可回收物类别详情（使用正确的复数形式路径）
  console.log('\n=== 测试1: 获取可回收物类别详情（正确路径）===');
  await testGetCategoryDetail('recyclable');
  
  // 测试2: 获取厨余垃圾类别详情
  console.log('\n=== 测试2: 获取厨余垃圾类别详情 ===');
  await testGetCategoryDetail('kitchen');
  
  // 测试3: 获取有害垃圾类别详情
  console.log('\n=== 测试3: 获取有害垃圾类别详情 ===');
  await testGetCategoryDetail('hazardous');
  
  // 测试4: 获取其他垃圾类别详情
  console.log('\n=== 测试4: 获取其他垃圾类别详情 ===');
  await testGetCategoryDetail('other');
  
  // 测试5: 使用错误的路径（单数形式category）
  console.log('\n=== 测试5: 使用错误的路径（单数形式category）===');
  await testWrongPath();
  
  console.log('\n所有测试完成！');
  console.log('\n重要发现和结论：');
  console.log('1. 问题根本原因：API请求路径使用了单数形式 `category`，而正确的路径应该是复数形式 `categories`');
  console.log('2. 正确的API路径格式为：/api/v1/recognition/categories/{categoryId}');
  console.log('3. 可用的categoryId值：recyclable（可回收物）、kitchen（厨余垃圾）、hazardous（有害垃圾）、other（其他垃圾）');
  console.log('4. 在Postman或其他API测试工具中，请确保使用正确的复数形式路径');
  console.log('\n使用说明：');
  console.log('- 当本地开发服务器运行时，使用 http://localhost:3000/api/v1 作为基础URL');
  console.log('- 确保API服务正在运行，否则会返回连接错误');
  console.log('- 检查请求路径中的复数形式是否正确，这是导致404错误的主要原因');
}

// 运行测试
runTests().catch(err => {
  console.error('测试运行失败:', err);
});