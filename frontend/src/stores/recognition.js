import { defineStore } from 'pinia';
import { wasteApi } from '../services/api';

// 垃圾识别状态管理store
export const useRecognitionStore = defineStore('recognition', {
  state: () => ({
    recognitionResult: null,
    recentRecognitions: [],
    loading: false,
    error: null,
    currentCity: '北京' // 默认城市
  }),

  getters: {
    // 获取识别结果
    getRecognitionResult: (state) => state.recognitionResult,
    // 获取最近识别记录
    getRecentRecognitions: (state) => state.recentRecognitions,
    // 获取当前城市
    getCurrentCity: (state) => state.currentCity
  },

  actions: {
    // 初始化识别记录
    initializeRecognitions() {
      const savedRecognitions = localStorage.getItem('recentRecognitions');
      if (savedRecognitions) {
        this.recentRecognitions = JSON.parse(savedRecognitions);
      } else {
        // 添加模拟数据，让页面不那么空
        const mockRecognitions = [
          {
            type: '可回收物',
            name: '塑料瓶',
            confidence: 0.95,
            suggestion: '请清洗后投入可回收物垃圾桶',
            category: 'PET塑料',
            imageUrl: 'https://picsum.photos/300/300?random=1',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30分钟前
          },
          {
            type: '厨余垃圾',
            name: '苹果核',
            confidence: 0.98,
            suggestion: '请投入厨余垃圾垃圾桶',
            category: '果皮果核',
            imageUrl: 'https://picsum.photos/300/300?random=2',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2小时前
          },
          {
            type: '有害垃圾',
            name: '电池',
            confidence: 0.92,
            suggestion: '请投入有害垃圾专用垃圾桶',
            category: '干电池',
            imageUrl: 'https://picsum.photos/300/300?random=3',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1天前
          },
          {
            type: '其他垃圾',
            name: '纸巾',
            confidence: 0.90,
            suggestion: '请投入其他垃圾垃圾桶',
            category: '纸类废弃物',
            imageUrl: 'https://picsum.photos/300/300?random=4',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
          }
        ];
        this.recentRecognitions = mockRecognitions;
        localStorage.setItem('recentRecognitions', JSON.stringify(this.recentRecognitions));
      }
      
      // 初始化当前城市
      const savedCity = localStorage.getItem('currentCity');
      if (savedCity) {
        this.currentCity = savedCity;
      }
    },

    // 设置当前城市
    setCurrentCity(city) {
      this.currentCity = city;
      localStorage.setItem('currentCity', city);
    },

    // 识别垃圾
    async recognizeWaste(file) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求
        // const formData = new FormData();
        // formData.append('image', file);
        // formData.append('city', this.currentCity);
        // const response = await wasteApi.recognizeWaste(formData);
        // this.recognitionResult = response;
        
        // 模拟识别结果数据
        const mockResults = [
          {
            type: '可回收物',
            name: '塑料瓶',
            confidence: 0.95,
            suggestion: '请清洗后投入可回收物垃圾桶',
            category: 'PET塑料',
            imageUrl: URL.createObjectURL(file) || 'https://picsum.photos/300/300?random=1'
          },
          {
            type: '厨余垃圾',
            name: '苹果核',
            confidence: 0.98,
            suggestion: '请投入厨余垃圾垃圾桶',
            category: '果皮果核',
            imageUrl: URL.createObjectURL(file) || 'https://picsum.photos/300/300?random=2'
          },
          {
            type: '有害垃圾',
            name: '电池',
            confidence: 0.92,
            suggestion: '请投入有害垃圾专用垃圾桶',
            category: '干电池',
            imageUrl: URL.createObjectURL(file) || 'https://picsum.photos/300/300?random=3'
          },
          {
            type: '其他垃圾',
            name: '纸巾',
            confidence: 0.90,
            suggestion: '请投入其他垃圾垃圾桶',
            category: '纸类废弃物',
            imageUrl: URL.createObjectURL(file) || 'https://picsum.photos/300/300?random=4'
          }
        ];
        
        // 随机选择一个模拟结果
        const randomIndex = Math.floor(Math.random() * mockResults.length);
        this.recognitionResult = mockResults[randomIndex];
        
        // 添加到最近识别记录
        this.addToRecentRecognitions(this.recognitionResult);
        
        return this.recognitionResult;
      } catch (error) {
        this.error = error.message || '识别失败，请重试';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 添加到最近识别记录
    addToRecentRecognitions(result) {
      // 添加时间戳
      const recognitionWithTimestamp = {
        ...result,
        timestamp: new Date().toISOString()
      };
      
      // 确保不超过10条记录
      this.recentRecognitions.unshift(recognitionWithTimestamp);
      if (this.recentRecognitions.length > 10) {
        this.recentRecognitions.pop();
      }
      
      // 保存到本地存储
      localStorage.setItem('recentRecognitions', JSON.stringify(this.recentRecognitions));
    },

    // 清空识别记录
    clearRecognitions() {
      this.recentRecognitions = [];
      localStorage.removeItem('recentRecognitions');
    },

    // 反馈识别结果
    async feedbackRecognition(resultId, isCorrect, comment) {
      try {
        // 模拟API请求
        // await wasteApi.feedbackRecognition(resultId, { isCorrect, comment });
        
        // 模拟成功
        return true;
      } catch (error) {
        console.error('反馈失败:', error);
        return false;
      }
    }
  }
});