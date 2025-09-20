// 导入axios
import axios from 'axios';
import errorHandler from './errorHandler';
// 导入i18n store以获取当前语言设置
import { useI18nStore } from '../stores/i18n';
import { getActivePinia, createPinia } from 'pinia';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 使用环境变量配置的API基础URL
  timeout: 40000 // 请求超时时间，设置为40秒
});

// 存储当前语言的变量，以便快速访问
let currentLang = localStorage.getItem('appLocale') || 'en';

// 监听语言变更事件，实时更新当前语言
if (typeof document !== 'undefined') {
  document.addEventListener('localeChanged', (event) => {
    currentLang = event.detail;
    console.log('Language updated via event:', currentLang);
  });
}

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加语言参数到请求中
    try {
      // 首先使用我们维护的currentLang变量（通过事件监听实时更新）
      let lang = currentLang;
      
      // 尝试获取活动的pinia实例，以获取最新的语言设置
      try {
        const piniaInstance = getActivePinia() || createPinia();
        const i18nStore = useI18nStore(piniaInstance);
        if (i18nStore && i18nStore.getLocale) {
          // 验证从store获取的语言是否有效
          if (i18nStore.getLocale) {
            lang = i18nStore.getLocale;
            // 更新currentLang变量以保持同步
            currentLang = lang;
          }
        }
      } catch (error) {
        // 如果获取store失败，继续使用currentLang的值
        console.warn('Failed to get locale from store, using cached value:', error);
      }
      
      // 确保语言是后端支持的语言
      const supportedLangs = ['zh', 'en', 'ms'];
      if (!supportedLangs.includes(lang)) {
        lang = 'zh'; // 如果是不支持的语言，默认使用中文
      }
      
      console.log('Setting lang parameter to:', lang);
      // 将lang参数添加到查询参数中
      if (config.params) {
        config.params.lang = lang;
      } else {
        config.params = { lang };
      }
      
      // 同时添加到Cookie中，确保与后端检测顺序一致
      if (typeof document !== 'undefined') {
        document.cookie = `lang=${lang}; path=/; max-age=2592000`; // 30天有效期
      }
    } catch (error) {
      console.error('Error adding language parameter to request:', error);
    }
    
    // 显示加载指示器
    if (config.loading !== false) {
      // 这里可以触发全局加载状态
    }
    
    return config;
  },
  error => {
    // 隐藏加载指示器
    if (error.config && error.config.loading !== false) {
      // 这里可以隐藏全局加载状态
    }
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 隐藏加载指示器
    if (response.config && response.config.loading !== false) {
      // 这里可以隐藏全局加载状态
    }
    
    // 检查是否有新的token
    if (response.headers && response.headers['x-token-expired'] === 'true' && response.headers['x-new-token']) {
      const newToken = response.headers['x-new-token'];
      localStorage.setItem('token', newToken);
      console.log('Token refreshed successfully');
    }
    
    // 统一处理响应数据
    const data = response.data;
    
    // 检查业务状态码
    if (data.code && data.code !== errorHandler.STATUS_CODES.SUCCESS) {
      // 业务逻辑错误，转换为Promise.reject以便后续处理
      const error = new Error(data.message || '业务处理失败');
      error.response = {
        status: response.status,
        data: data
      };
      
      // 特定业务错误的前置处理
      if (data.code === errorHandler.STATUS_CODES.TOKEN_EXPIRED) {
        localStorage.removeItem('token');
      }
      
      return Promise.reject(error);
    }
    
    return data;
  },
  error => {
    // 隐藏加载指示器
    if (error.config && error.config.loading !== false) {
      // 这里可以隐藏全局加载状态
    }
    
    // 使用统一错误处理器处理错误
    const errorInfo = errorHandler.handleError(error);
    
    // 记录错误日志
    console.error('API Error:', errorInfo);
    
    // 对于特定错误类型进行预处理
      if (errorInfo.status === errorHandler.STATUS_CODES.UNAUTHORIZED || 
          errorInfo.code === errorHandler.STATUS_CODES.TOKEN_EXPIRED) {
        localStorage.removeItem('token');
        // 只有当当前页面不是登录页时才跳转
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          // 延迟跳转，确保错误信息能够被处理
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      }
    
    // 增强错误对象，添加标准化的错误信息
    error.errorInfo = errorInfo;
    
    return Promise.reject(error);
  }
);

// 从单独的文件导入API接口定义
import { wasteApi } from './wasteApi';

// 重新导出，保持向后兼容性
export { wasteApi };

export default api;