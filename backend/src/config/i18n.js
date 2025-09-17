// 国际化配置
const dotenv = require('dotenv');

dotenv.config();

const i18nConfig = {
  // 支持的语言
  locales: ['zh', 'en'],
  
  // 默认语言
  defaultLocale: process.env.DEFAULT_LOCALE || 'zh',
  
  // 语言文件目录
  directory: process.env.I18N_DIRECTORY || '../lang',
  
  // 语言文件扩展
  extension: '.json',
  
  // 自动检测语言
  autoDetect: process.env.I18N_AUTO_DETECT === 'true' || true,
  
  // 语言检测方式
  detection: {
    // 从查询参数中检测
    query: process.env.I18N_DETECT_QUERY === 'true' || true,
    queryParameter: 'lang',
    
    // 从Cookie中检测
    cookie: process.env.I18N_DETECT_COOKIE === 'true' || true,
    cookieName: 'lang',
    cookieMaxAge: 30 * 24 * 60 * 60 * 1000, // 30天
    
    // 从请求头中检测
    header: process.env.I18N_DETECT_HEADER === 'true' || true,
    headerField: 'accept-language',
    
    // 从请求路径中检测
    path: process.env.I18N_DETECT_PATH === 'true' || false,
    
    // 从域名中检测
    domain: process.env.I18N_DETECT_DOMAIN === 'true' || false
  },
  
  // 语言占位符格式
  placeholder: {
    prefix: '${',
    suffix: '}'
  },
  
  // 编码
  encoding: 'utf8',
  
  // 更新Files
  updateFiles: process.env.I18N_UPDATE_FILES === 'true' || false,
  
  // 同步Files
  syncFiles: process.env.I18N_SYNC_FILES === 'true' || false,
  
  // 日志级别
  logLevel: process.env.I18N_LOG_LEVEL || 'warn'
};

module.exports = i18nConfig;