import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 基础URL，实际使用时根据后端API地址调整
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    
    // 统一处理响应数据
    const data = response.data;
    return data;
  },
  error => {
    // 隐藏加载指示器
    if (error.config && error.config.loading !== false) {
      // 这里可以隐藏全局加载状态
    }
    
    // 统一处理错误
    if (error.response) {
      // 服务器返回错误
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/';
          break;
        case 403:
          // 拒绝访问
          console.error('拒绝访问');
          break;
        case 404:
          // 请求不存在
          console.error('请求不存在');
          break;
        case 500:
          // 服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error(`请求失败: ${error.response.status}`);
      }
    } else if (error.request) {
      // 请求超时
      console.error('请求超时，请检查网络连接');
    } else {
      // 请求配置错误
      console.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

// API接口定义
export const wasteApi = {
  // 垃圾识别
  recognizeWaste: (data) => api.post('/recognition', data),
  // 获取分类知识
  getKnowledgeBase: (params) => api.get('/knowledge', { params }),
  // 获取分类列表
  getCategories: () => api.get('/categories'),
  // 获取用户积分
  getUserPoints: () => api.get('/user/points'),
  // 获取用户成就
  getUserAchievements: () => api.get('/user/achievements'),
  // 获取每日一题
  getDailyQuestion: () => api.get('/questions/daily'),
  // 获取闯关题目
  getChallengeQuestions: (level) => api.get(`/questions/challenge/${level}`),
  // 提交答案
  submitAnswer: (data) => api.post('/questions/submit', data),
  // 获取宣传教育内容
  getEducationContent: (type) => api.get(`/education/${type}`)
};

export default api;