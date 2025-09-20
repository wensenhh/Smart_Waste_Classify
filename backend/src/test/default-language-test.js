const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
const envPath = path.resolve(__dirname, '../../.env');
const envExamplePath = path.resolve(__dirname, '../../.env.example');

// 尝试加载.env文件，如果不存在则加载.env.example
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log('.env文件不存在，使用.env.example');
  dotenv.config({ path: envExamplePath });
}

// 导入i18n配置
const i18nConfig = require('../config/i18n');

// 测试函数
function testDefaultLanguageConfig() {
  console.log('=== 测试默认语言配置 ===');
  
  console.log('环境变量配置:');
  console.log(`DEFAULT_LANGUAGE: ${process.env.DEFAULT_LANGUAGE}`);
  console.log(`SUPPORTED_LANGUAGES: ${process.env.SUPPORTED_LANGUAGES}`);
  
  console.log('\ni18n配置:');
  console.log(`默认语言: ${i18nConfig.defaultLocale}`);
  console.log(`支持的语言: ${i18nConfig.locales.join(', ')}`);
  
  // 验证配置是否正确
  const isDefaultLanguageCorrect = i18nConfig.defaultLocale === (process.env.DEFAULT_LANGUAGE || 'zh');
  const areSupportedLanguagesCorrect = 
    (process.env.SUPPORTED_LANGUAGES && 
     JSON.stringify(i18nConfig.locales) === JSON.stringify(process.env.SUPPORTED_LANGUAGES.split(','))) ||
    (!process.env.SUPPORTED_LANGUAGES && 
     JSON.stringify(i18nConfig.locales) === JSON.stringify(['zh', 'en', 'ms']));
  
  console.log('\n验证结果:');
  console.log(`默认语言配置正确: ${isDefaultLanguageCorrect ? '✓' : '✗'}`);
  console.log(`支持的语言配置正确: ${areSupportedLanguagesCorrect ? '✓' : '✗'}`);
  
  if (isDefaultLanguageCorrect && areSupportedLanguagesCorrect) {
    console.log('\n🎉 测试通过！默认语言参数已成功配置为公共参数。');
  } else {
    console.log('\n❌ 测试失败！默认语言参数配置有问题。');
  }
}

// 运行测试
if (require.main === module) {
  testDefaultLanguageConfig();
}

module.exports = { testDefaultLanguageConfig };