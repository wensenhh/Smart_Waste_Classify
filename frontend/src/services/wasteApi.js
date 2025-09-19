import api from './api';

// 垃圾相关API接口定义，按功能模块分组
export const wasteApi = {
  // 用户相关API
  user: {
    // 用户登录
    login: (credentials) => api.post('/users/login', credentials),
    // 获取用户积分
    getPoints: () => api.get('/users/points'),
    // 获取用户成就
    getAchievements: () => api.get('/users/achievements')
  },
  
  // 垃圾识别相关API
  recognition: {
    // 垃圾识别
    recognize: (data) => api.post('/recognition', data),
    // 反馈识别结果
    feedback: (resultId, feedbackData) => api.post(`/recognition/${resultId}/feedback`, feedbackData)
  },
  
  // 知识相关API
  knowledge: {
    // 获取分类知识
    getBase: (params) => api.get('/knowledge', { params }),
    // 获取分类列表
    getCategories: () => api.get('/categories'),
    // 获取宣传教育内容
    getEducation: (type) => api.get(`/education/${type}`)
  },
  
  // 问答相关API
  question: {
    // 获取每日一题
    getDaily: () => api.get('/questions/daily'),
    // 获取闯关题目
    getChallenge: (level) => api.get(`/questions/challenge/${level}`),
    // 提交答案
    submitAnswer: (data) => api.post('/questions/submit', data)
  },
  
  // 为保持向后兼容性，保留原有直接方法
  recognizeWaste: (data) => api.post('/recognition', data),
  getKnowledgeBase: (params) => api.get('/knowledge', { params }),
  getCategories: () => api.get('/categories'),
  getUserPoints: () => api.get('/user/points'),
  getUserAchievements: () => api.get('/user/achievements'),
  getDailyQuestion: () => api.get('/questions/daily'),
  getChallengeQuestions: (level) => api.get(`/questions/challenge/${level}`),
  submitAnswer: (data) => api.post('/questions/submit', data),
  getEducationContent: (type) => api.get(`/education/${type}`),
  feedbackRecognition: (resultId, feedbackData) => api.post(`/recognition/${resultId}/feedback`, feedbackData)
};

export default wasteApi;