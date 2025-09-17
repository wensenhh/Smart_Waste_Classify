// 安全配置
const dotenv = require('dotenv');

dotenv.config();

const securityConfig = {
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // CSRF配置
  csrf: {
    enabled: process.env.CSRF_ENABLED === 'true' || true,
    cookie: {
      key: '_csrf',
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  },
  
  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },
  
  // 输入验证配置
  validation: {
    strict: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    skipNullProperties: false,
    skipUndefinedProperties: false
  },
  
  // 限流配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 每个IP每窗口最多100个请求
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      code: 429,
      message: '请求过于频繁，请稍后再试'
    }
  },
  
  // Helmet配置
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  },
  
  // 文件上传限制
  fileUpload: {
    limits: {
      fileSize: parseInt(process.env.FILE_UPLOAD_SIZE) || 10 * 1024 * 1024, // 10MB
      files: parseInt(process.env.FILE_UPLOAD_COUNT) || 5 // 最多5个文件
    },
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  
  // 密码策略
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH) || 32,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true' || true,
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true' || true,
    requireNumber: process.env.PASSWORD_REQUIRE_NUMBER === 'true' || true,
    requireSpecialChar: process.env.PASSWORD_REQUIRE_SPECIAL_CHAR === 'true' || true
  },
  
  // 敏感数据掩码配置
  mask: {
    phone: { start: 3, end: 4 },
    idCard: { start: 6, end: 4 },
    bankCard: { start: 4, end: 4 },
    email: { start: 2, end: 4 }
  }
};

module.exports = securityConfig;