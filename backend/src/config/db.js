// 数据库配置
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_waste_system',
  port: process.env.DB_PORT || 3306,
  // 连接池配置
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  // 连接超时设置
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
  // 字符集设置
  charset: 'utf8mb4_unicode_ci',
  // 时区设置
  timezone: '+08:00',
  // 启用压缩
  enableCompression: process.env.DB_ENABLE_COMPRESSION === 'true',
  // 其他选项
  supportBigNumbers: true,
  bigNumberStrings: true
};

module.exports = dbConfig;