import { defineStore } from 'pinia';
import { wasteApi } from '../services/wasteApi';

// 用户状态管理store
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    isLoggedIn: false,
    points: 0,
    achievements: [],
    loading: false,
    error: null
  }),

  getters: {
    // 获取用户信息
    getUserInfo: (state) => state.userInfo,
    // 获取用户登录状态
    getIsLoggedIn: (state) => state.isLoggedIn,
    // 获取用户积分
    getPoints: (state) => state.points,
    // 获取用户成就
    getAchievements: (state) => state.achievements
  },

  actions: {
    // 初始化用户状态
    async initializeUser() {
      const savedUserInfo = localStorage.getItem('userInfo');
      if (savedUserInfo) {
        this.userInfo = JSON.parse(savedUserInfo);
        this.isLoggedIn = true;
        // 初始化时获取用户积分和成就
        await this.fetchUserPoints();
        await this.fetchUserAchievements();
      }
    },

    // 登录
    async login(credentials) {
      try {
        this.loading = true;
        this.error = null;
        
        // 登录请求
      const response = await wasteApi.user.login(credentials);
      
      this.userInfo = response.data;
      this.isLoggedIn = true;
      
      // 保存用户信息和token到本地存储
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
      
      // 从响应头或响应数据中获取token
      // 检查响应头中的Authorization字段
      if (response.headers && response.headers.authorization) {
        const token = response.headers.authorization.replace('Bearer ', '');
        localStorage.setItem('token', token);
      }
      // 如果token在响应数据中
      else if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
        
        // 登录成功后获取用户积分和成就
        await this.fetchUserPoints();
        await this.fetchUserAchievements();
        
        return true;
      } catch (error) {
        // 从错误对象中获取错误信息，这些信息已经在api.js的响应拦截器中处理过
        this.error = error.response?.data?.message || error.message || '登录失败';
        console.error('Login error:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 登出
    logout() {
      this.userInfo = null;
      this.isLoggedIn = false;
      this.points = 0;
      this.achievements = [];
      
      // 清除本地存储
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    },

    // 获取用户积分
    async fetchUserPoints() {
      try {
        // 模拟API请求
        // const response = await wasteApi.getUserPoints();
        // this.points = response.points;
        
        // 模拟数据
        this.points = Math.floor(Math.random() * 1000) + 500;
      } catch (error) {
        console.error('获取用户积分失败:', error);
      }
    },

    // 获取用户成就
    async fetchUserAchievements() {
      try {
        // 模拟API请求
        // const response = await wasteApi.getUserAchievements();
        // this.achievements = response.achievements;
        
        // 模拟数据
        this.achievements = [
          {
            id: 1,
            name: '垃圾分类新手',
            description: '完成首次垃圾分类识别',
            icon: '🎯',
            isCompleted: true,
            date: '2025-01-05'
          },
          {
            id: 2,
            name: '每日签到达人',
            description: '连续签到7天',
            icon: '🔥',
            isCompleted: true,
            date: '2025-01-15'
          },
          {
            id: 3,
            name: '知识渊博',
            description: '完成10道知识问答',
            icon: '📚',
            isCompleted: false,
            progress: 7
          }
        ];
      } catch (error) {
        console.error('获取用户成就失败:', error);
      }
    },

    // 获取用户资料
    async fetchUserProfile() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await wasteApi.user.getProfile();
        
        if (response.success && response.data) {
          this.userInfo = response.data;
          this.isLoggedIn = true;
          // 更新本地存储
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        }
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '获取用户资料失败';
        console.error('获取用户资料失败:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 更新用户信息
    updateUserInfo(info) {
      this.userInfo = { ...this.userInfo, ...info };
      // 更新本地存储
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    },

    // 增加用户积分
    addPoints(amount) {
      this.points += amount;
      // 可以在这里更新本地存储
    },

    // 注册
    async register(params) {
        try {
          this.loading = true;
          this.error = null;
          
          // 注册请求
          await wasteApi.user.register(params);
          
          return true;
        } catch (error) {
          // 从错误对象中获取错误信息，这些信息已经在api.js的响应拦截器中处理过
          this.error = error.response?.data?.message || error.message || '注册失败';
          return false;
        } finally {
          this.loading = false;
        }
      }
  }
});