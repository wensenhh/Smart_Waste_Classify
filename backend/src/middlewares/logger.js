// 请求日志中间件
const logger = async (ctx, next) => {
  // 记录请求开始时间
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // 设置请求ID到上下文和响应头
  ctx.requestId = requestId;
  ctx.set('X-Request-Id', requestId);
  
  try {
    // 执行后续中间件
    await next();
  } catch (error) {
    // 如果发生错误，先记录，然后重新抛出让错误处理中间件处理
    logRequest(ctx, startTime, error);
    throw error;
  }
  
  // 记录请求完成日志
  logRequest(ctx, startTime);
};

/**
 * 生成请求唯一ID
 */
const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 记录请求日志
 */
const logRequest = (ctx, startTime, error = null) => {
  // 计算请求处理时间
  const responseTime = Date.now() - startTime;
  
  // 获取请求信息
  const { method, url, headers, body, query, params } = ctx.request;
  
  // 获取响应信息
  const { status, body: responseBody } = ctx.response;
  
  // 构建日志对象
  const logData = {
    requestId: ctx.requestId,
    timestamp: new Date().toISOString(),
    method,
    url,
    status,
    responseTime: `${responseTime}ms`,
    userAgent: headers['user-agent'],
    remoteIp: getClientIp(ctx),
    referer: headers.referer || '-',
    contentType: headers['content-type'] || '-',
    
    // 只在开发环境记录详细的请求体和响应体
    ...(process.env.NODE_ENV !== 'production' && {
      requestBody: sanitizeBody(body),
      requestQuery: query,
      requestParams: params,
      responseBody: sanitizeResponseBody(responseBody)
    })
  };
  
  // 如果有错误，添加错误信息
  if (error) {
    logData.error = {
      message: error.message,
      name: error.name,
      code: error.errorCode || 'UNKNOWN',
      // 开发环境下记录错误栈
      ...(process.env.NODE_ENV !== 'production' && {
        stack: error.stack
      })
    };
  }
  
  // 根据状态码选择日志级别
  if (status >= 500) {
    console.error('请求错误:', logData);
  } else if (status >= 400) {
    console.warn('请求警告:', logData);
  } else if (status >= 200) {
    // 可以根据需要决定是否在生产环境记录所有成功请求的日志
    if (process.env.NODE_ENV !== 'production' || responseTime > 1000) {
      console.info('请求成功:', logData);
    }
  }
};

/**
 * 获取客户端真实IP
 */
const getClientIp = (ctx) => {
  const headers = ctx.request.headers;
  
  // 检查是否有代理IP
  const forwardedFor = headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for可能包含多个IP，第一个是客户端真实IP
    return forwardedFor.split(',')[0].trim();
  }
  
  // 检查其他代理头
  const realIp = headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }
  
  // 返回连接IP
  return ctx.socket.remoteAddress;
};

/**
 * 清理请求体中的敏感信息
 */
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  
  // 过滤敏感字段
  const sensitiveFields = [
    'password', 
    'password_confirmation', 
    'token', 
    'credit_card', 
    'card_number',
    'cvv',
    'pin',
    'auth_code',
    'api_key',
    'secret_key'
  ];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = '******';
    }
  });
  
  return sanitized;
};

/**
 * 清理响应体，避免日志过大
 */
const sanitizeResponseBody = (body) => {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  // 如果是大型响应体，可以限制大小
  const maxSize = 1024 * 10; // 10KB
  const serializedBody = JSON.stringify(body);
  
  if (serializedBody.length > maxSize) {
    return {
      truncated: true,
      originalSize: serializedBody.length,
      message: 'Response body too large to log'
    };
  }
  
  return body;
};

/**
 * 性能监控日志
 */
const performanceLogger = async (ctx, next) => {
  // 只在开发环境或性能监控开启时启用
  if (process.env.NODE_ENV !== 'production' || process.env.PERFORMANCE_LOGGING === 'true') {
    const startTime = process.hrtime();
    
    await next();
    
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    
    // 记录耗时超过阈值的请求
    const threshold = parseInt(process.env.PERFORMANCE_THRESHOLD || '500');
    if (milliseconds > threshold) {
      console.warn('性能警告:', {
        requestId: ctx.requestId,
        url: ctx.request.url,
        method: ctx.request.method,
        duration: `${milliseconds.toFixed(2)}ms`
      });
    }
  } else {
    await next();
  }
};

module.exports = {
  logger,
  performanceLogger,
  generateRequestId,
  getClientIp
};