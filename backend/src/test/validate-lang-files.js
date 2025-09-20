const fs = require('fs');
const path = require('path');

// 语言文件路径
const langDir = path.join(__dirname, '../../src/lang');
const langFiles = ['zh.json', 'en.json', 'ms.json'];

console.log('开始验证语言文件...');

// 验证每个语言文件
langFiles.forEach(file => {
  const filePath = path.join(langDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    console.log(`✓ ${file} 解析成功，包含 ${Object.keys(parsed).length} 个顶级模块`);
  } catch (error) {
    console.error(`✗ ${file} 解析失败:`, error.message);
    process.exit(1);
  }
});

console.log('所有语言文件验证通过！');