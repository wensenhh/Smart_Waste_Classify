// API请求使用示例 - 展示如何使用新的异常处理机制

import { wasteApi } from './wasteApi';
import errorHandler from './errorHandler';

// 示例1：基本的API调用与错误处理
export const recognizeGarbage = async (imageFile) => {
  try {
    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('save_record', 'true');
    
    // 调用API，添加loading配置
    const response = await wasteApi.recognition.recognitionUploadImg(formData, {
      loading: true, // 显示加载指示器
      responseType: 'json'
    });
    
    // 请求成功，处理响应数据
    console.log('识别成功:', response);
    return response;
  } catch (error) {
    // 使用统一的错误处理工具处理错误
    const errorInfo = errorHandler.handleSpecificErrors(error, {
      navigateToLogin: true, // 未授权时是否跳转到登录页
      showMessage: true // 是否显示错误消息
    });
    
    // 可以在这里根据错误类型进行特定处理
    switch (errorInfo.status || errorInfo.code) {
      case errorHandler.STATUS_CODES.BAD_REQUEST:
        console.error('请求参数错误:', errorInfo.details);
        break;
        
      case errorHandler.STATUS_CODES.PAYLOAD_TOO_LARGE:
        console.error('文件过大，请尝试较小的文件');
        break;
        
      case errorHandler.STATUS_CODES.UNSUPPORTED_MEDIA_TYPE:
        console.error('不支持的文件类型');
        break;
    }
    
    // 重新抛出错误，以便上层组件也能处理
    throw error;
  }
};

// 示例2：使用Promise链式调用处理错误
export const getUserProfile = () => {
  return wasteApi.user.profile()
    .then(response => {
      // 处理成功响应
      console.log('获取用户资料成功:', response);
      return response;
    })
    .catch(error => {
      // 自定义错误处理逻辑
      const errorInfo = errorHandler.handleError(error);
      
      if (errorInfo.status === errorHandler.STATUS_CODES.UNAUTHORIZED) {
        console.log('用户未登录，使用默认资料');
        // 返回默认资料而不是抛出错误
        return { nickname: '游客', avatar: '' };
      }
      
      // 其他错误情况下抛出错误
      throw error;
    });
};

// 示例3：批量操作时的错误处理
export const batchDeleteRecords = async (recordIds) => {
  try {
    // 添加请求取消令牌
    const source = window.axios.CancelToken.source();
    
    const response = await wasteApi.recognition.delBatchIdentifyRecord({
      data: { record_ids: recordIds },
      cancelToken: source.token,
      timeout: 30000 // 延长超时时间
    });
    
    console.log('批量删除成功:', response);
    return response;
  } catch (error) {
    // 检查是否是用户取消的请求
    if (window.axios.isCancel(error)) {
      console.log('请求已取消');
      return { canceled: true };
    }
    
    // 处理其他错误
    const errorInfo = errorHandler.handleSpecificErrors(error, {
      showMessage: true
    });
    
    // 可以根据不同的错误类型提供不同的用户反馈
    let userMessage = errorInfo.message;
    
    if (errorInfo.status === errorHandler.STATUS_CODES.TOO_MANY_REQUESTS) {
      userMessage = '操作过于频繁，请稍后再试';
    }
    
    // 这里可以调用项目中的通知组件显示错误消息
    if (typeof window !== 'undefined' && window.$notification) {
      window.$notification.error({
        title: '操作失败',
        message: userMessage
      });
    }
    
    throw error;
  }
};

// 示例4：重试机制实现
export const fetchWithRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      const errorInfo = errorHandler.handleError(error);
      
      // 只对特定类型的错误进行重试
      const shouldRetry = errorInfo.status === errorHandler.STATUS_CODES.SERVICE_UNAVAILABLE ||
                        errorInfo.status === errorHandler.STATUS_CODES.GATEWAY_TIMEOUT ||
                        errorInfo.type === 'NETWORK_ERROR';
      
      if (!shouldRetry || retries === maxRetries - 1) {
        throw error;
      }
      
      retries++;
      console.log(`请求失败，${delay}ms后尝试第${retries}次重试...`);
      
      // 等待指定的延迟时间后重试
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 指数退避策略
      delay *= 2;
    }
  }
};

// 使用重试机制的示例
export const getSystemStatsWithRetry = () => {
  return fetchWithRetry(() => wasteApi.recognition.getStytemStats(), 3, 1000)
    .then(response => {
      console.log('获取系统统计数据成功:', response);
      return response;
    })
    .catch(error => {
      console.error('多次尝试后仍无法获取系统统计数据:', error);
      errorHandler.showErrorMessage(errorHandler.handleError(error));
      throw error;
    });
};

// 默认导出所有示例函数
export default {
  recognizeGarbage,
  getUserProfile,
  batchDeleteRecords,
  fetchWithRetry,
  getSystemStatsWithRetry
};