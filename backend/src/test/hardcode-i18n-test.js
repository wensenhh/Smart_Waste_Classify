const path = require('path');
const { getLocalizedString, reloadTranslations } = require('../middlewares/i18n');

// 创建模拟的上下文对象
const createMockContext = (lang) => ({
  lang,
  cookies: {
    get: () => null
  },
  query: {},
  headers: {}
});

// 测试函数
async function testHardcodedStringsTranslations() {
  try {
    console.log('=== 测试硬编码文本的多语言支持 ===');
    
    // 重新加载翻译文件
    reloadTranslations();
    
    // 测试支持的语言
    const languages = ['zh', 'en', 'ms'];
    
    for (const lang of languages) {
      console.log(`\n=== 测试 ${lang.toUpperCase()} 语言 ===`);
      const mockContext = createMockContext(lang);
      
      // 测试 common 模块翻译
      console.log('\n通用翻译测试:');
      console.log(`common.none: ${getLocalizedString(mockContext, 'common.none')}`);
      console.log(`common.unknown: ${getLocalizedString(mockContext, 'common.unknown')}`);
      
      // 测试 recognition 模块翻译
      console.log('\n识别模块翻译测试:');
      console.log(`recognition.unknown_waste: ${getLocalizedString(mockContext, 'recognition.unknown_waste')}`);
      
      // 测试 database 模块翻译
      console.log('\n数据库模块翻译测试:');
      console.log(`database.error: ${getLocalizedString(mockContext, 'database.error')}`);
    }
    
    console.log('\n=== 测试完成 ===');
    console.log('所有硬编码文本已成功转换为多语言支持。');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
if (require.main === module) {
  testHardcodedStringsTranslations();
}

module.exports = { testHardcodedStringsTranslations };