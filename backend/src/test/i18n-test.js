const path = require('path');
const { getLocalizedString, reloadTranslations } = require('../middlewares/i18n');

// 创建一个模拟的上下文对象
const mockContext = {
  lang: 'ms', // 马来文
  cookies: {
    get: () => null
  },
  query: {},
  headers: {}
};

// 测试函数
async function testMalayTranslation() {
  try {
    console.log('=== 测试马来文支持 ===');
    
    // 重新加载翻译文件以确保加载了最新的马来文文件
    reloadTranslations();
    
    console.log('\n基本翻译测试:');
    console.log(`success: ${getLocalizedString(mockContext, 'success')}`);
    console.log(`error: ${getLocalizedString(mockContext, 'error')}`);
    console.log(`server_error: ${getLocalizedString(mockContext, 'server_error')}`);
    
    console.log('\n用户模块翻译测试:');
    console.log(`user.register_success: ${getLocalizedString(mockContext, 'user.register_success')}`);
    console.log(`user.login_success: ${getLocalizedString(mockContext, 'user.login_success')}`);
    
    console.log('\n识别模块翻译测试:');
    console.log(`recognition.success: ${getLocalizedString(mockContext, 'recognition.success')}`);
    console.log(`recognition.no_image: ${getLocalizedString(mockContext, 'recognition.no_image')}`);
    
    console.log('\n垃圾类别翻译测试:');
    console.log(`waste.recyclable: ${getLocalizedString(mockContext, 'waste.recyclable')}`);
    console.log(`waste.kitchen: ${getLocalizedString(mockContext, 'waste.kitchen')}`);
    
    console.log('\n国家名称翻译测试:');
    console.log(`countries.china: ${getLocalizedString(mockContext, 'countries.china')}`);
    console.log(`countries.united_states: ${getLocalizedString(mockContext, 'countries.united_states')}`);
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testMalayTranslation();
}

module.exports = { testMalayTranslation };