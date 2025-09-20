const fs = require('fs');
const path = require('path');

// 简单的测试脚本，直接读取和解析语言文件
async function simpleI18nTest() {
  try {
    console.log('=== 简单测试语言文件内容 ===');
    
    const langDir = path.join(__dirname, '..', 'lang');
    const languages = ['zh', 'en', 'ms'];
    
    // 直接读取和解析语言文件
    for (const lang of languages) {
      console.log(`\n=== 检查 ${lang.toUpperCase()} 语言文件 ===`);
      const filePath = path.join(langDir, `${lang}.json`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 尝试解析JSON
        try {
          const langData = JSON.parse(content);
          console.log('JSON解析成功');
          
          // 检查 recognition.unknown_waste 是否存在
          if (langData.recognition && langData.recognition.unknown_waste) {
            console.log(`recognition.unknown_waste: ${langData.recognition.unknown_waste}`);
          } else {
            console.log('recognition.unknown_waste 不存在');
            if (langData.recognition) {
              console.log('recognition 模块键列表:', Object.keys(langData.recognition).join(', '));
            }
          }
          
        } catch (jsonError) {
          console.error('JSON解析失败:', jsonError.message);
          
          // 搜索文件中的 unknown_waste
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('unknown_waste')) {
              console.log(`在第 ${i+1} 行找到 unknown_waste: ${lines[i].trim()}`);
            }
          }
        }
        
      } catch (error) {
        console.error(`读取 ${lang} 语言文件失败:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
simpleI18nTest();