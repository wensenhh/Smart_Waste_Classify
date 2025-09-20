const fs = require('fs');
const path = require('path');

// 直接测试语言文件
async function directI18nTest() {
  try {
    console.log('=== 直接测试语言文件内容 ===');
    
    const langDir = path.join(__dirname, '..', 'lang');
    const languages = ['zh', 'en', 'ms'];
    
    // 直接读取和解析语言文件
    for (const lang of languages) {
      console.log(`\n=== 检查 ${lang.toUpperCase()} 语言文件 ===`);
      const filePath = path.join(langDir, `${lang}.json`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const langData = JSON.parse(content);
        
        console.log(`文件大小: ${content.length} 字节`);
        
        // 检查 recognition.unknown_waste 是否存在
        if (langData.recognition && langData.recognition.unknown_waste) {
          console.log(`recognition.unknown_waste: ${langData.recognition.unknown_waste}`);
        } else {
          console.log('recognition.unknown_waste 不存在');
          console.log('recognition 对象内容:', JSON.stringify(langData.recognition, null, 2));
        }
        
        // 检查 common.none 和 database.error
        if (langData.common && langData.common.none) {
          console.log(`common.none: ${langData.common.none}`);
        }
        if (langData.database && langData.database.error) {
          console.log(`database.error: ${langData.database.error}`);
        }
        
      } catch (error) {
        console.error(`读取 ${lang} 语言文件失败:`, error.message);
      }
    }
    
    // 尝试使用 i18n 中间件来验证
    console.log('\n=== 测试 i18n 中间件 ===');
    const { reloadTranslations, getAllTranslations, getLocalizedString } = require('../middlewares/i18n');
    
    reloadTranslations();
    const translations = getAllTranslations();
    
    // 查看加载的翻译数据结构
    console.log('\n加载的翻译数据结构:');
    for (const lang in translations) {
      console.log(`\n${lang} 语言 - 模块列表:`);
      console.log(Object.keys(translations[lang]).join(', '));
      
      // 查看 recognition 模块内容
      if (translations[lang].recognition) {
        console.log(`recognition 模块键列表:`, Object.keys(translations[lang].recognition).join(', '));
        console.log(`recognition.unknown_waste: ${translations[lang].recognition.unknown_waste || 'undefined'}`);
      }
    }
    
    // 创建模拟上下文并测试 getLocalizedString
    const createMockContext = (lang) => ({ lang });
    
    console.log('\n=== 使用 getLocalizedString 测试 ===');
    for (const lang of languages) {
      const mockContext = createMockContext(lang);
      console.log(`\n${lang.toUpperCase()} 语言:`);
      console.log(`common.none: ${getLocalizedString(mockContext, 'common.none')}`);
      console.log(`recognition.unknown_waste: ${getLocalizedString(mockContext, 'recognition.unknown_waste')}`);
      console.log(`database.error: ${getLocalizedString(mockContext, 'database.error')}`);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
directI18nTest();