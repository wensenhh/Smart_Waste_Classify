// 错误处理中间件
const { getLocalizedString } = require('./i18n');

const errorHandler = async (ctx, next) => {  try {
    await next();
  } catch (error) {
    // 记录错误日志
    console.error('请求处理错误:', {
      url: ctx.request.url,
      method: ctx.request.method,
      headers: ctx.request.headers,
      body: ctx.request.body,
      error: error.message,
      stack: error.stack
    });
    
    // 设置默认错误状态和消息
    let status = 500;
    let message = getLocalizedString(ctx, 'server_error');
    let errorCode = 'SERVER_ERROR';
    let data = null;
    
    // 根据错误类型设置不同的状态码和消息
    // 检查错误消息是否为翻译键，如果是则进行翻译
    const translateMessage = (key) => {
      if (typeof key === 'string' && (key.includes('.') || ['success', 'error', 'server_error', 'validation_error', 'unauthorized', 'forbidden', 'not_found', 'request_too_frequent'].includes(key))) {
        return getLocalizedString(ctx, key);
      }
      return key;
    };

    if (error.name === 'ValidationError') {
      status = 400;
      message = translateMessage(error.message || 'validation_error');
      errorCode = 'VALIDATION_ERROR';
      data = error.details || error.data;
    } else if (error.name === 'UnauthorizedError') {
      status = 401;
      message = translateMessage(error.message || 'unauthorized');
      errorCode = 'UNAUTHORIZED';
    } else if (error.name === 'ForbiddenError') {
      status = 403;
      message = translateMessage(error.message || 'forbidden');
      errorCode = 'FORBIDDEN';
    } else if (error.name === 'NotFoundError') {
      status = 404;
      message = translateMessage(error.message || 'not_found');
      errorCode = 'NOT_FOUND';
    } else if (error.name === 'TooManyRequestsError') {
      status = 429;
      message = translateMessage(error.message || 'request_too_frequent');
      errorCode = 'TOO_MANY_REQUESTS';
    } else if (error.name === 'DatabaseError') {
      status = 500;
      message = translateMessage(error.message || 'database.error');
      errorCode = 'DATABASE_ERROR';
    } else if (error.name === 'BadRequestError') {
      status = 400;
      message = translateMessage(error.message || 'validation_error');
      errorCode = 'BAD_REQUEST';
    } else if (error.status) {
      // 如果错误对象中已包含状态码
      status = error.status;
      message = translateMessage(error.message || 'server_error');
      errorCode = error.errorCode || 'SERVER_ERROR';
    }
    
    // 设置响应状态码
    ctx.status = status;
    
    // 设置错误响应体
    ctx.body = {
      success: false,
      message: message,
      errorCode: errorCode,
      data: data,
      timestamp: new Date().toISOString(),
      path: ctx.request.url,
      // 生产环境不返回错误栈信息
      ...(process.env.NODE_ENV !== 'production' && {
        stack: error.stack
      })
    };
    
    // 设置响应头
    ctx.set('Content-Type', 'application/json');
    
    // 如果是生产环境且是500错误，可以在这里发送通知或记录到监控系统
    if (status === 500 && process.env.NODE_ENV === 'production') {
      // 这里可以集成错误监控系统，如Sentry、Bugsnag等
      // sentry.captureException(error);
      console.error('生产环境发生500错误，建议检查日志');
    }
  }
};

// 自定义错误类
class AppError extends Error {
  constructor(message, status, errorCode, data) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errorCode = errorCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'validation_error', details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'unauthorized') {
    super(message, 401, 'UNAUTHORIZED', null);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'forbidden') {
    super(message, 403, 'FORBIDDEN', null);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'not_found') {
    super(message, 404, 'NOT_FOUND', null);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'request_too_frequent') {
    super(message, 429, 'TOO_MANY_REQUESTS', null);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'database.error', error = null) {
    super(message, 500, 'DATABASE_ERROR', error);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'validation_error') {
    super(message, 400, 'BAD_REQUEST', null);
  }
}

module.exports = {
  errorHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  DatabaseError,
  BadRequestError
};