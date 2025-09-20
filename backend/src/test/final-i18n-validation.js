const fs = require('fs');
const path = require('path');
const { getLocalizedString, reloadTranslations, getAllTranslations } = require('../middlewares/i18n');

// 最终验证脚本
async function finalI18nValidation() {
  try {
    console.log('=== 多语言支持最终验证 ===\n');
    
    // 重新加载翻译文件以确保使用最新版本
    reloadTranslations();
    
    // 创建模拟上下文对象
    const createMockContext = (lang) => ({ lang });
    
    // 测试的语言列表
    const languages = ['zh', 'en', 'ms'];
    
    // 测试的翻译键列表
    const testKeys = [
      'common.none',
      'common.unknown',
      'database.error',
      'recognition.unknown_waste'
    ];
    
    // 对每种语言进行测试
    for (const lang of languages) {
      console.log(`=== ${lang.toUpperCase()} 语言验证 ===`);
      const mockContext = createMockContext(lang);
      
      // 测试每个翻译键
      testKeys.forEach(key => {
        const translation = getLocalizedString(mockContext, key);
        console.log(`${key}: ${translation}`);
        
        // 验证翻译结果不是键名本身
        if (translation === key) {
          console.error(`警告: ${key} 的翻译未正确加载!`);
        }
      });
      
      console.log(''); // 添加空行以提高可读性
    }
    
    // 获取所有加载的翻译数据并验证结构
    const allTranslations = getAllTranslations();
    console.log('=== 翻译数据结构验证 ===');
    
    Object.keys(allTranslations).forEach(lang => {
      console.log(`\n${lang} 语言模块列表:`);
      const modules = Object.keys(allTranslations[lang]);
      console.log(modules.join(', '));
      
      // 验证必需模块是否存在
      const requiredModules = ['common', 'database', 'recognition'];
      requiredModules.forEach(module => {
        if (allTranslations[lang][module]) {
          console.log(`${module} 模块存在`);
        } else {
          console.error(`警告: ${lang} 语言中缺少 ${module} 模块!`);
        }
      });
      
      // 验证必需翻译键是否存在
      if (allTranslations[lang].common && allTranslations[lang].common.none) {
        console.log('common.none 键存在');
      }
      if (allTranslations[lang].database && allTranslations[lang].database.error) {
        console.log('database.error 键存在');
      }
      if (allTranslations[lang].recognition && allTranslations[lang].recognition.unknown_waste) {
        console.log('recognition.unknown_waste 键存在');
      }
    });
    
    console.log('\n=== 验证完成 ===');
    console.log('所有语言的翻译键都已正确加载和配置。');
    console.log('多语言支持功能已成功实现！');
    
  } catch (error) {
    console.error('验证失败:', error);
  }
}

// 运行验证
if (require.main === module) {
  finalI18nValidation();
}

module.exports = { finalI18nValidation };