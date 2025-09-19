// 国际化中间件
const fs = require('fs');
const path = require('path');
const i18nConfig = require('../config/i18n');

// 缓存语言文件内容
let translations = {};

/**
 * 加载语言文件
 */
const loadTranslations = () => {
  try {
    const langDir = path.join(__dirname, '..', 'lang');
    
    // 确保语言目录存在
    if (!fs.existsSync(langDir)) {
      console.warn('语言文件目录不存在:', langDir);
      return;
    }
    
    // 读取所有语言文件
    const files = fs.readdirSync(langDir);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const langCode = file.split('.')[0];
        const filePath = path.join(langDir, file);
        
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          translations[langCode] = JSON.parse(content);
          console.log(`加载语言文件成功: ${langCode}`);
        } catch (error) {
          console.error(`加载语言文件失败: ${file}`, error.message);
        }
      }
    });
  } catch (error) {
    console.error('加载语言文件时发生错误:', error.message);
  }
};

/**
 * 初始化国际化中间件
 */
const initializeI18n = () => {
  // 加载语言文件
  loadTranslations();
};

/**
 * 获取用户请求的语言
 */
const getRequestLanguage = (ctx) => {
  let lang = null;
  
  // 1. 从查询参数中获取
  if (i18nConfig.detection.query && ctx.query && ctx.query[i18nConfig.detection.queryParameter]) {
    lang = ctx.query[i18nConfig.detection.queryParameter];
  }
  
  // 2. 从Cookie中获取
  if (!lang && i18nConfig.detection.cookie) {
    lang = ctx.cookies.get(i18nConfig.detection.cookieName);
  }
  
  // 3. 从请求头中获取
  if (!lang && i18nConfig.detection.header) {
    const acceptLanguage = ctx.headers['accept-language'];
    if (acceptLanguage) {
      // 解析Accept-Language头，获取首选语言
      const languages = acceptLanguage.split(',')
        .map(lang => lang.trim().split(';')[0])
        .map(lang => lang.split('-')[0]); // 只取主要语言代码
      
      // 查找支持的语言
      for (const l of languages) {
        if (i18nConfig.locales.includes(l)) {
          lang = l;
          break;
        }
      }
    }
  }
  
  // 4. 默认语言
  if (!lang || !i18nConfig.locales.includes(lang)) {
    lang = i18nConfig.defaultLocale;
  }
  
  return lang;
};

/**
 * 翻译函数
 */
const translate = (key, lang, replacements = {}) => {
  // 确保语言存在
  if (!translations[lang]) {
    lang = i18nConfig.defaultLocale;
  }
  
  // 获取翻译文本
  let text = getNestedValue(translations[lang], key);
  
  // 如果没有找到翻译，返回键名本身
  if (text === undefined) {
    return key;
  }
  
  // 替换占位符
  if (typeof text === 'string' && Object.keys(replacements).length > 0) {
    Object.keys(replacements).forEach(replaceKey => {
      const regex = new RegExp(`\{\{${replaceKey}\}\}`, 'g');
      text = text.replace(regex, replacements[replaceKey]);
    });
  }
  
  return text;
};

/**
 * 获取嵌套对象的值
 */
const getNestedValue = (obj, path) => {
  if (!path || typeof path !== 'string') {
    return undefined;
  }
  
  const keys = path.split('.');
  let value = obj;
  
  for (const key of keys) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return undefined;
    }
    value = value[key];
  }
  
  return value;
};

/**
 * 国际化中间件
 */
const i18nMiddleware = async (ctx, next) => {
  // 获取用户语言
  const lang = getRequestLanguage(ctx);
  
  // 设置语言到上下文
  ctx.lang = lang;
  
  // 添加翻译函数到上下文
  ctx.i18n = {
    t: (key, replacements = {}) => translate(key, lang, replacements),
    getLanguage: () => lang,
    getSupportedLanguages: () => i18nConfig.locales
  };
  
  // 设置响应头
  ctx.set('Content-Language', lang);
  
  await next();
};

/**
 * 热重载语言文件
 */
const reloadTranslations = () => {
  console.log('重新加载语言文件...');
  translations = {};
  loadTranslations();
};

/**
 * 获取所有翻译
 */
const getAllTranslations = () => {
  return { ...translations };
};

/**
 * 添加或更新翻译
 */
const updateTranslation = (lang, key, value) => {
  if (!translations[lang]) {
    translations[lang] = {};
  }
  
  const keys = key.split('.');
  let obj = translations[lang];
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!obj[k] || typeof obj[k] !== 'object') {
      obj[k] = {};
    }
    obj = obj[k];
  }
  
  obj[keys[keys.length - 1]] = value;
};

/**
 * 导出翻译数据到文件
 */
const exportTranslations = async (lang) => {
  if (!translations[lang]) {
    throw new Error(`语言 ${lang} 不存在`);
  }
  
  const langDir = path.join(__dirname, '..', 'lang');
  const filePath = path.join(langDir, `${lang}.json`);
  
  try {
    // 确保目录存在
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // 写入文件
    await fs.promises.writeFile(filePath, JSON.stringify(translations[lang], null, 2), 'utf-8');
    console.log(`翻译数据已导出到: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`导出翻译数据失败:`, error.message);
    return false;
  }
};

/**
 * 获取本地化字符串
 * @param {Object} ctx - Koa上下文对象
 * @param {string} key - 翻译键
 * @param {Object} replacements - 替换占位符的对象
 * @returns {string} 本地化字符串
 */
const getLocalizedString = (ctx, key, replacements = {}) => {
  // 从上下文获取语言
  const lang = ctx.lang || i18nConfig.defaultLanguage;
  return translate(key, lang, replacements);
};

// 初始化国际化
initializeI18n();

module.exports = {
  i18nMiddleware,
  translate,
  getRequestLanguage,
  reloadTranslations,
  getAllTranslations,
  updateTranslation,
  exportTranslations,
  getLocalizedString // 添加导出
};