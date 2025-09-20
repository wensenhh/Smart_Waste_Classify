// 安全中间件
const jwt = require('jsonwebtoken');
const helmet = require('koa-helmet');
const cors = require('@koa/cors');
const RateLimit = require('koa-ratelimit');
const RedisStore = RateLimit.RedisStore;
const securityConfig = require('../config/security');

// 自定义错误类
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// 导出错误类
exports.UnauthorizedError = UnauthorizedError;
exports.ForbiddenError = ForbiddenError;

/**
 * JWT验证中间件 - Koa版本
 */
exports.jwtAuth = async (ctx, next) => {
  const { secret = securityConfig.jwt.secret } = securityConfig.jwt;
  // 从请求头、查询参数或Cookie中获取Token
  let token = ctx.headers.authorization;
  console.log('token1:', token?.slice(-10));
  if (!token) {
    token = ctx.query.token;
  }
  console.log('token2:', token?.slice(-10));
  if (!token && ctx.cookies && ctx.cookies.get('token')) {
    token = ctx.cookies.get('token');
  }
  console.log('token3:', token?.slice(-10));
  // 如果没有Token且不是公开路由，则返回未授权错误
  if (!token) {
    console.log('当前请求路径:', ctx.path);
    console.log('配置的公开路由:', securityConfig.publicRoutes);
    if (securityConfig.publicRoutes && securityConfig.publicRoutes.some(route => ctx.path === route)) {
      console.log('匹配到公开路由，允许访问');
      return await next();
    }
    console.log('未匹配到公开路由，需要验证');
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: '请提供有效的身份认证Token'
    };
    return;
  }
  console.log('token4:', token?.slice(-10));
  // 移除Bearer前缀
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }
  // 验证Token
  console.log('尝试验证的Token:', token.substring(0, 20) + '...'); // 只打印部分Token以保护安全
  console.log('使用的密钥长度:', secret.length);
  
  try {
    const decoded = jwt.verify(token, secret);
    console.log('Token验证成功，解码结果:', decoded);
    
    // 将解码后的用户信息存储在上下文对象中
    ctx.state.user = decoded;
    
    // 对于需要刷新Token的场景，可以在这里检查Token是否即将过期
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp - now < (securityConfig.jwt.refreshThreshold || 1800)) {
      // 生成新Token
      const newToken = jwt.sign({
        id: decoded.id,
        name: decoded.name,
        role: decoded.role
      }, secret, {
        expiresIn: securityConfig.jwt.expiresIn
      });
      
      // 设置新Token到响应头
      ctx.set('X-Token-Expired', 'true');
      ctx.set('X-New-Token', newToken);
      
      // 如果配置了Cookie，同时设置Cookie
      if (securityConfig.jwt.cookieEnabled) {
        // 解析expiresIn字符串为毫秒数
        let maxAge = 24 * 60 * 60 * 1000; // 默认24小时
        
        // 处理不同格式的过期时间设置
        if (typeof securityConfig.jwt.expiresIn === 'string') {
          if (securityConfig.jwt.expiresIn.endsWith('h')) {
            maxAge = parseInt(securityConfig.jwt.expiresIn) * 60 * 60 * 1000;
          } else if (securityConfig.jwt.expiresIn.endsWith('d')) {
            maxAge = parseInt(securityConfig.jwt.expiresIn) * 24 * 60 * 60 * 1000;
          } else if (securityConfig.jwt.expiresIn.endsWith('s')) {
            maxAge = parseInt(securityConfig.jwt.expiresIn) * 1000;
          }
        } else if (typeof securityConfig.jwt.expiresIn === 'number') {
          // 如果是数字，默认视为秒
          maxAge = securityConfig.jwt.expiresIn * 1000;
        }
        
        ctx.cookies.set('token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: securityConfig.jwt.cookieSameSite || 'lax',
          maxAge: maxAge
        });
      }
    }
    
    await next();
  } catch (error) {
    console.log('JWT验证错误:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '身份认证已过期，请重新登录'
      };
    } else if (error.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '无效的身份认证Token'
      };
    } else {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '身份认证失败'
      };
    }
  }
}
/**
 * 角色授权中间件 - Koa版本
 */
exports.authorize = (...requiredRoles) => {
  return async (ctx, next) => {
    // 检查用户是否已经通过JWT验证
    if (!ctx.state.user || !ctx.state.user.role) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: '需要先进行身份认证'
      };
      return;
    }
    
    // 检查用户角色是否符合要求
    const hasPermission = requiredRoles.some(role => 
      ctx.state.user.role === role || (typeof ctx.state.user.role === 'string' && ctx.state.user.role.includes(role))
    );
    
    if (!hasPermission) {
      ctx.status = 403;
      ctx.body = {
        code: 403,
        message: '权限不足，无法访问此资源'
      };
      return;
    }
    
    await next();
  };
}

/**
 * 安全头部中间件 (Helmet) - Koa版本
 */
exports.helmet = helmet({
  // 配置内容安全策略
  contentSecurityPolicy: securityConfig.helmet.contentSecurityPolicy,
  // 配置X-Frame-Options
  frameguard: securityConfig.helmet.frameguard,
  // 配置X-Content-Type-Options
  noSniff: securityConfig.helmet.noSniff,
  // 配置X-XSS-Protection
  xssFilter: securityConfig.helmet.xssFilter,
  // 配置Referrer-Policy
  referrerPolicy: securityConfig.helmet.referrerPolicy,
  // 配置Expect-CT
  expectCt: securityConfig.helmet.expectCt,
  // 配置DNS预取控制
  dnsPrefetchControl: securityConfig.helmet.dnsPrefetchControl,
  // 配置IE 8+ X-Download-Options
  ieNoOpen: securityConfig.helmet.ieNoOpen,
  // 配置 Strict-Transport-Security
  hsts: securityConfig.helmet.hsts
});

/**
 * CORS中间件 - Koa版本
 */
exports.cors = cors({
  origin: securityConfig.cors.origin === '*' ? '*' : securityConfig.cors.origin.split(','),
  methods: securityConfig.cors.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: securityConfig.cors.credentials !== undefined ? securityConfig.cors.credentials : true,
  allowHeaders: securityConfig.cors.allowHeaders || ['Content-Type', 'Authorization'],
  exposeHeaders: securityConfig.cors.exposeHeaders || []
});

/**
 * 限流中间件 - Koa版本
 */
// 创建一个简单的内存存储实现，适配测试环境
exports.rateLimiter = RateLimit({
  // 配置存储
  store: {
    // 内存存储实现
    _rateLimiters: new Map(),
    get: function (key) {
      return this._rateLimiters.get(key);
    },
    set: function (key, value, duration) {
      this._rateLimiters.set(key, value);
      setTimeout(() => {
        this._rateLimiters.delete(key);
      }, duration);
    }
  },
  // 配置时间窗口（毫秒）
  duration: securityConfig.rateLimit.windowMs || 15 * 60 * 1000,
  // 最大请求数
  max: securityConfig.rateLimit.max || 100,
  // 生成key的函数
  key: (ctx) => {
    // 使用客户端IP作为限流key
    const ip = ctx.ip || ctx.request.ip;
    // 可以结合路径进行更细粒度的限流
    return `${ip}:${ctx.path}`;
  },
  // 超出限制时的响应
  errorMessage: securityConfig.rateLimit.message || {
    code: 429,
    message: '请求过于频繁，请稍后再试'
  },
  // 白名单
  whitelist: securityConfig.rateLimit.whitelist || []
});

/**
 * 输入验证中间件 - 已迁移至 validation.js
 * 保留此引用以保持向后兼容性
 */
const { validateRequest } = require('./validation');
exports.validateRequest = validateRequest;

/**
 * 敏感数据掩码中间件 - Koa版本
 */
exports.maskSensitiveData = async (ctx, next) => {
  await next();
  
  // 检查响应体是否包含需要掩码的数据
  if (ctx.body && typeof ctx.body === 'object') {
    try {
      const sensitiveFields = securityConfig.sensitiveDataFields || [];
      
      // 递归处理对象
      const maskData = (obj) => {
        if (!obj || typeof obj !== 'object') {
          return obj;
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => maskData(item));
        }
        
        const masked = { ...obj };
        
        Object.keys(masked).forEach(key => {
          if (sensitiveFields.includes(key.toLowerCase())) {
            masked[key] = '******';
          } else if (typeof masked[key] === 'object') {
            masked[key] = maskData(masked[key]);
          }
        });
        
        return masked;
      };
      
      // 应用掩码
      ctx.body = maskData(ctx.body);
    } catch (e) {
      // 如果处理失败，不影响原始响应
      console.error('敏感数据掩码处理失败:', e.message);
    }
  }
};

/**
 * CSRF保护中间件简化版 - Koa版本
 */
exports.csrfProtection = async (ctx, next) => {
  // Koa应用通常使用csrf包来处理CSRF保护
  // 这里提供一个简化版本，实际项目中应考虑使用专门的CSRF保护包
  
  // 对于非GET请求，检查CSRF令牌
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(ctx.method)) {
    // 从请求头或请求体获取CSRF令牌
    const csrfToken = ctx.headers['x-csrf-token'] || ctx.request.body?._csrf;
    
    // 在实际应用中，这里应该验证令牌
    // 由于简化版本，我们只记录日志
    if (securityConfig.csrf && securityConfig.csrf.enabled) {
      console.log('CSRF protection enabled, but validation skipped in simplified middleware');
    }
  }
  
  await next();
};