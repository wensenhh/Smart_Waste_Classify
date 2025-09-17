import { defineStore } from 'pinia';
import { wasteApi } from '../services/api';

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
        
        // 模拟登录请求
        // const response = await wasteApi.login(credentials);
        // 由于是模拟环境，使用假数据
        const mockUser = {
          id: 'user_001',
          name: '张用户',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
          phone: credentials.phone,
          city: '北京',
          joinDate: '2025-01-01'
        };
        
        this.userInfo = mockUser;
        this.isLoggedIn = true;
        
        // 保存用户信息到本地存储
        localStorage.setItem('userInfo', JSON.stringify(mockUser));
        
        // 登录成功后获取用户积分和成就
        await this.fetchUserPoints();
        await this.fetchUserAchievements();
        
        return true;
      } catch (error) {
        this.error = error.message || '登录失败';
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
    }
  }
});