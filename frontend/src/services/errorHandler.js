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

// 错误信息映射表
export const ERROR_MESSAGES = {
  // HTTP状态码对应的错误信息
  [STATUS_CODES.BAD_REQUEST]: '请求参数错误，请检查您的输入',
  [STATUS_CODES.UNAUTHORIZED]: '登录状态已失效，请重新登录',
  [STATUS_CODES.FORBIDDEN]: '您没有权限执行此操作',
  [STATUS_CODES.NOT_FOUND]: '请求的资源不存在',
  [STATUS_CODES.METHOD_NOT_ALLOWED]: '不支持的请求方法',
  [STATUS_CODES.REQUEST_TIMEOUT]: '请求超时，请稍后再试',
  [STATUS_CODES.CONFLICT]: '请求发生冲突，请稍后再试',
  [STATUS_CODES.PAYLOAD_TOO_LARGE]: '上传文件过大，请尝试较小的文件',
  [STATUS_CODES.UNSUPPORTED_MEDIA_TYPE]: '不支持的文件类型',
  [STATUS_CODES.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后再试',
  [STATUS_CODES.INTERNAL_SERVER_ERROR]: '服务器内部错误，请稍后再试',
  [STATUS_CODES.NOT_IMPLEMENTED]: '功能尚未实现',
  [STATUS_CODES.BAD_GATEWAY]: '网关错误，请稍后再试',
  [STATUS_CODES.SERVICE_UNAVAILABLE]: '服务器暂时不可用，请稍后再试',
  [STATUS_CODES.GATEWAY_TIMEOUT]: '网关超时，请稍后再试',
  
  // 业务错误对应的错误信息
  [STATUS_CODES.VALIDATION_ERROR]: '数据验证失败',
  [STATUS_CODES.AUTH_FAILED]: '认证失败',
  [STATUS_CODES.TOKEN_EXPIRED]: '令牌已过期，请重新登录',
  [STATUS_CODES.PERMISSION_DENIED]: '权限不足',
  [STATUS_CODES.DATA_NOT_FOUND]: '未找到相关数据',
  [STATUS_CODES.LIMIT_EXCEEDED]: '超过限制',
  [STATUS_CODES.API_ERROR]: 'API错误'
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
    const message = data?.message || ERROR_MESSAGES[code] || ERROR_MESSAGES[status] || `请求失败: ${status}`;
    
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
    return {
      type: 'NETWORK_ERROR',
      code: STATUS_CODES.REQUEST_TIMEOUT,
      message: '网络连接失败，请检查您的网络设置'
    };
  }
  
  // 处理请求配置错误
  return {
    type: 'CONFIG_ERROR',
    message: '请求配置错误'
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
  ERROR_MESSAGES,
  handleError,
  showErrorMessage,
  handleSpecificErrors
};