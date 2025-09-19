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
        
        // 登录请求
        const response = await wasteApi.user.login(credentials);
        
        this.userInfo = response.data;
        this.isLoggedIn = true;
        
        // 保存用户信息到本地存储
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        
        // 登录成功后获取用户积分和成就
        await this.fetchUserPoints();
        await this.fetchUserAchievements();
        
        return true;
      } catch (error) {
        // 更细致地处理错误信息，提供更友好的错误提示
        if (error.response) {
          // 服务器返回了错误响应
          if (error.response.status === 401) {
            // 用户名或密码错误
            this.error = '用户名或密码错误，请重新输入';
          } else if (error.response.status === 404) {
            // 用户不存在
            this.error = '该账号不存在，请先注册';
          } else if (error.response.status === 403) {
            // 账号被禁用
            this.error = '您的账号已被禁用，请联系管理员';
          } else if (error.response.status >= 500) {
            // 服务器内部错误
            this.error = '服务器暂时无法处理您的请求，请稍后再试';
          } else if (error.response.data && error.response.data.message) {
            // 其他错误，使用服务器返回的消息
            // 根据错误消息关键词进行更友好的转换
            const message = error.response.data.message;
            if (message.includes('password')) {
              this.error = '密码格式不正确或不符合安全要求';
            } else if (message.includes('username')) {
              this.error = '用户名格式不正确';
            } else if (message.includes('user.login_failed')) {
              this.error = '登录失败，用户名或密码错误';
            } else if (message.includes('validation')) {
              this.error = '请填写完整的登录信息';
            } else {
              this.error = message;
            }
          } else {
            this.error = `登录失败，请稍后再试`;
          }
        } else if (error.request) {
          // 请求发出但没有收到响应
          this.error = '网络连接异常，请检查您的网络设置';
        } else {
          // 其他错误
          this.error = '登录过程中发生错误，请稍后再试';
        }
        
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