// 错误处理配置和工具函数

// 系统状态码映射表
export const STATUS_CODES = {
  // 成功状态码
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // 客户端错误状态码
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  TOO_MANY_REQUESTS: 429,
  
  // 服务器错误状态码
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  
  // 业务自定义状态码
  VALIDATION_ERROR: 1000,
  AUTH_FAILED: 1001,
  TOKEN_EXPIRED: 1002,
  PERMISSION_DENIED: 1003,
  DATA_NOT_FOUND: 1004,
  LIMIT_EXCEEDED: 1005,
  API_ERROR: 1006
};

// 错误信息映射表的键名（用于i18n）
export const ERROR_KEYS = {
  // HTTP状态码对应的错误键名
  [STATUS_CODES.BAD_REQUEST]: 'error.badRequest',
  [STATUS_CODES.UNAUTHORIZED]: 'error.unauthorized',
  [STATUS_CODES.FORBIDDEN]: 'error.forbidden',
  [STATUS_CODES.NOT_FOUND]: 'error.notFound',
  [STATUS_CODES.METHOD_NOT_ALLOWED]: 'error.methodNotAllowed',
  [STATUS_CODES.REQUEST_TIMEOUT]: 'error.requestTimeout',
  [STATUS_CODES.CONFLICT]: 'error.conflict',
  [STATUS_CODES.PAYLOAD_TOO_LARGE]: 'error.payloadTooLarge',
  [STATUS_CODES.UNSUPPORTED_MEDIA_TYPE]: 'error.unsupportedMediaType',
  [STATUS_CODES.TOO_MANY_REQUESTS]: 'error.tooManyRequests',
  [STATUS_CODES.INTERNAL_SERVER_ERROR]: 'error.internalServerError',
  [STATUS_CODES.NOT_IMPLEMENTED]: 'error.notImplemented',
  [STATUS_CODES.BAD_GATEWAY]: 'error.badGateway',
  [STATUS_CODES.SERVICE_UNAVAILABLE]: 'error.serviceUnavailable',
  [STATUS_CODES.GATEWAY_TIMEOUT]: 'error.gatewayTimeout',
  
  // 业务错误对应的错误键名
  [STATUS_CODES.VALIDATION_ERROR]: 'error.validationError',
  [STATUS_CODES.AUTH_FAILED]: 'error.authFailed',
  [STATUS_CODES.TOKEN_EXPIRED]: 'error.tokenExpired',
  [STATUS_CODES.PERMISSION_DENIED]: 'error.permissionDenied',
  [STATUS_CODES.DATA_NOT_FOUND]: 'error.dataNotFound',
  [STATUS_CODES.LIMIT_EXCEEDED]: 'error.limitExceeded',
  [STATUS_CODES.API_ERROR]: 'error.apiError'
};

// 通用错误处理器
export const handleError = (error) => {
  if (!error) {
    return { type: 'UNKNOWN_ERROR', message: '未知错误' };
  }
  
  // 处理HTTP错误
  if (error.response) {
    const { status, data } = error.response;
    const code = data?.code || status;
    
    // 如果error对象中包含i18n实例，则使用它来翻译错误消息
    const t = error.i18n?.t || ((key) => key);
    
    // 尝试从响应数据中获取消息，如果没有则使用翻译
    let message = data?.message;
    if (!message) {
      const errorKey = ERROR_KEYS[code] || ERROR_KEYS[status];
      message = errorKey ? t(errorKey) : `请求失败: ${status}`;
    }
    
    return { 
      type: 'HTTP_ERROR', 
      code, 
      status, 
      message, 
      details: data 
    };
  }
  
  // 处理请求超时或网络错误
  if (error.request) {
    const t = error.i18n?.t || ((key) => key);
    return {
      type: 'NETWORK_ERROR',
      code: STATUS_CODES.REQUEST_TIMEOUT,
      message: t('error.networkError')
    };
  }
  
  // 处理请求配置错误
  const t = error.i18n?.t || ((key) => key);
  return {
    type: 'CONFIG_ERROR',
    message: t('error.configError')
  };
};

// 导入全局弹窗管理器
import popupManager from '../utils/popup';

// 显示错误消息
export const showErrorMessage = (error) => {
  // 使用项目中已定义的全局提示框组件
  console.error('API Error:', error);
  
  if (error && error.message) {
    popupManager.error({
      message: error.message,
      duration: 3000,
      position: 'top-center'
    });
  } else {
    popupManager.error({
      message: '操作失败，请稍后再试',
      duration: 3000,
      position: 'top-center'
    });
  }
};

// 处理特定错误类型的工具函数
export const handleSpecificErrors = (error, options = {}) => {
  const { navigateToLogin = true, showMessage = true } = options;
  const errorInfo = handleError(error);
  
  switch (errorInfo.status || errorInfo.code) {
    case STATUS_CODES.UNAUTHORIZED:
    case STATUS_CODES.AUTH_FAILED:
    case STATUS_CODES.TOKEN_EXPIRED:
      // 未授权或认证失败
      localStorage.removeItem('token');
      
      // 先显示错误消息
      if (showMessage) {
        showErrorMessage(errorInfo);
      }
      
      // 延迟跳转到登录页，确保用户能看到错误提示
      if (navigateToLogin && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
      break;
      
    case STATUS_CODES.FORBIDDEN:
    case STATUS_CODES.PERMISSION_DENIED:
      // 权限不足，可以添加特定处理逻辑
      break;
      
    case STATUS_CODES.TOO_MANY_REQUESTS:
    case STATUS_CODES.LIMIT_EXCEEDED:
      // 请求频率过高，可以添加重试逻辑或提示用户
      break;
      
    // 其他错误类型可以在这里添加特定处理
  }
  
  // 只在非认证相关错误中显示消息（认证错误已经在case中处理过了）
  if (showMessage && ![
    STATUS_CODES.UNAUTHORIZED,
    STATUS_CODES.AUTH_FAILED,
    STATUS_CODES.TOKEN_EXPIRED
  ].includes(errorInfo.status || errorInfo.code)) {
    showErrorMessage(errorInfo);
  }
  
  return errorInfo;
};

// 默认导出
export default {
  STATUS_CODES,
  ERROR_KEYS,
  handleError,
  showErrorMessage,
  handleSpecificErrors
};