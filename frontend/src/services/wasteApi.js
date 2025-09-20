import api from './api';

// 垃圾相关API接口定义，按功能模块分组
export const wasteApi = {
  // 用户相关API
  user: {
    // 用户登录
    login: (credentials) => api.post('/users/login', credentials),
    // 用户注册
    register: (params) => api.post('/users/register', params),
    // 用户登出
    logout: () => api.post('/users/logout'),
    // 用户忘记密码
    forgotPassword: (params) => api.post('/users/forgot-password', params),
    // 用户重置密码
    resetPassword: (params) => api.post('/users/reset-password', params),
    // 更改用户资料
    profile: (params) => api.put('/users/profile', params),
    // 用户修改密码
    changePassword: (params) => api.put('/users/password', params),
    // 上传用户头像
    uploadAvatar: (params) => api.post('/users/avatar', params),
    // 获取用户收藏
    getFavorites: () => api.get('/users/favorites'),
    // 添加收藏
    addFavorites: (itemId) => api.post(`/users/favorites/${itemId}`),
    // 移除收藏
    delFavorites: (itemId) => api.delete(`/users/favorites/${itemId}`),
    // 获取测验历史
    getHistoryQuiz: (params) => api.get('/users/history/quiz', { params }),
    // 获取用户积分
    getPoints: () => api.get('/users/points'),
    // 获取用户成就
    getAchievements: () => api.get('/users/achievements')
  },
  
  // 垃圾识别相关API
  recognition: {
    // 垃圾识别
    recognize: (data) => api.post('/recognition', data),
    // 搜索垃圾信息
    getRecognitionSearch: (params) => api.get('/recognition/search', { params }),
    // 获取垃圾类别列表
    getCategories: (params) => api.get('/recognition/categories', { params }),
    // 获取垃圾类别详情
    getCategoriesDetail: (slug) => api.get(`/recognition/categories/${slug}`),
    // 获取单个垃圾类别详情
    getCategoryDetail: (categoryId) => api.get(`/recognition/categories/${categoryId}`),
    // 垃圾识别
    recognitionIdentify: (params) => api.post('/recognition/identify', params),
    // 上传垃圾图片进行识别
    recognitionUploadImg: (params) => api.post('/recognition/upload', params),
    // 获取历史识别记录
    getIdentifyRecord: (params) => api.get('/recognition/history', { params }),
    // 删除识别记录
    delIdentifyRecord: (id) => api.delete(`/recognition/history/${id}`),
    // 批量删除识别记录
    delBatchIdentifyRecord: (params) => api.delete('/recognition/history/batch-delete', params),
    // 获取垃圾类别统计
    getStatsCategories: (params) => api.get('/recognition/stats/categories', { params }),
    // 获取用户垃圾类别统计
    getUserStats: (params) => api.get('/recognition/stats', { params }),
    // 获取所有用户的识别记录（管理员）
    getUserRecord: (params) => api.get('/recognition/admin/records', { params }),
    // 删除用户的识别记录（管理员）
    delUserIdentifyRecord: (userId, recordId) => api.delete(`/recognition/admin/users/${userId}/records/${recordId}`),
    // 获取系统统计数据（管理员）
    getStytemStats: () => api.get('/recognition/admin/system-stats'),
    // 反馈识别结果
    feedback: (resultId, feedbackData) => api.post(`/recognition/${resultId}/feedback`, feedbackData),
    
    // 根据ID获取识别记录详情
    getRecognitionById: (id) => api.get(`/recognition/history/${id}`)
  },
  
  // 知识相关API
  knowledge: {
    // 获取分类知识
    getBase: (params) => api.get('/knowledge', { params }),
    // 获取分类列表（根据API文档）
    getCategories: () => api.get('/recognition/categories'),
    // 获取单个垃圾类别详情
  getCategoryBySlug: (slug, keyword = '') => {
    const params = {};
    if (keyword) {
      params.keyword = keyword;
    }
    return api.get(`/recognition/categories/${slug}`, { params });
  },
    // 搜索垃圾信息（根据API文档）
    searchWasteItems: (params) => api.get('/recognition/search', { params }),
    // 获取单个垃圾详情（根据API文档）
    getWasteItemById: (wasteItemId) => api.get(`/recognition/items/${wasteItemId}`),
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
  getCategories: () => api.get('/recognition/categories'), // 更新为正确的API路径
  getUserPoints: () => api.get('/user/points'),
  getUserAchievements: () => api.get('/user/achievements'),
  getDailyQuestion: () => api.get('/questions/daily'),
  getChallengeQuestions: (level) => api.get(`/questions/challenge/${level}`),
  submitAnswer: (data) => api.post('/questions/submit', data),
  getEducationContent: (type) => api.get(`/education/${type}`),
  feedbackRecognition: (resultId, feedbackData) => api.post(`/recognition/${resultId}/feedback`, feedbackData),
  // 新增向后兼容的方法
  searchWasteItems: (params) => api.get('/recognition/search', { params }),
  getWasteItemById: (wasteItemId) => api.get(`/recognition/items/${wasteItemId}`),
  getCategoryBySlug: (slug, keyword = '') => {
    const params = {};
    if (keyword) {
      params.keyword = keyword;
    }
    return api.get(`/recognition/categories/${slug}`, { params });
  }
};

export default wasteApi;