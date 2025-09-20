const fs = require('fs');
const path = require('path');

// 语言文件路径
const langDir = path.join(__dirname, '../../src/lang');
const langFiles = [
  { name: '中文', file: 'zh.json' },
  { name: '英文', file: 'en.json' },
  { name: '马来语', file: 'ms.json' }
];

// 要检查的关键翻译键
const keyToCheck = 'recognition.unknown_waste';

console.log('开始检查关键翻译键...');

// 检查每个语言文件中的关键翻译键
langFiles.forEach(lang => {
  const filePath = path.join(langDir, lang.file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    
    // 检查 recognition 模块是否存在
    if (!parsed.recognition) {
      console.error(`✗ ${lang.name}(${lang.file}) 中缺少 recognition 模块`);
      return;
    }
    
    // 检查 unknown_waste 键是否存在
    if ('unknown_waste' in parsed.recognition) {
      console.log(`✓ ${lang.name}(${lang.file}) 中的 ${keyToCheck} 翻译为: "${parsed.recognition.unknown_waste}"`);
    } else {
      console.error(`✗ ${lang.name}(${lang.file}) 中缺少 ${keyToCheck} 翻译键`);
    }
    
    // 检查主要模块是否都存在
    const mainModules = ['user', 'recognition', 'waste', 'post', 'activity'];
    let hasMissingModule = false;
    
    mainModules.forEach(module => {
      if (!parsed[module]) {
        console.error(`✗ ${lang.name}(${lang.file}) 中缺少 ${module} 模块`);
        hasMissingModule = true;
      }
    });
    
    if (!hasMissingModule) {
      console.log(`  ${lang.name} 所有主要模块都存在`);
    }
    
  } catch (error) {
    console.error(`✗ 读取 ${lang.name}(${lang.file}) 时出错:`, error.message);
  }
});

console.log('\n关键翻译键检查完成！');