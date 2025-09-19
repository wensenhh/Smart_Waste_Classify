import { defineStore } from 'pinia';
import { wasteApi } from '../services/wasteApi';
import errorHandler from '../services/errorHandler';

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
        
        // 准备FormData
        const formData = new FormData();
        formData.append('image', file);
        formData.append('saveHistory', true);
        
        // 调用API进行识别
        const response = await wasteApi.recognition.recognitionUploadImg(formData);
        
        // 处理API返回的数据，转换为应用使用的格式
        if (response && response.success && response.data) {
          const apiResult = response.data;
          // 处理imageUrl，确保它是完整的超链接形式
          let imageUrl = apiResult.imageUrl || URL.createObjectURL(file);
          
          // 检查是否已经是完整的URL，如果不是则组合成完整URL
          if (apiResult.imageUrl && !apiResult.imageUrl.startsWith('http://') && !apiResult.imageUrl.startsWith('https://')) {
            // 获取API基础URL
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
            // 确保URL格式正确（处理斜杠问题）
            const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
            const path = apiResult.imageUrl.startsWith('/') ? apiResult.imageUrl : `/${apiResult.imageUrl}`;
            imageUrl = `${baseUrl}${path}`;
          }
          
          this.recognitionResult = {
            type: apiResult.category_name,  // 与后端返回的category_name对应
            name: apiResult.waste_name,     // 与后端返回的waste_name对应
            confidence: apiResult.confidence,
            suggestion: apiResult.disposal_advice || apiResult.description, // 优先使用disposal_advice
            category: apiResult.category,
            imageUrl: imageUrl,
            tips: apiResult.environmental_tip || apiResult.tips || [], // 与后端返回的environmental_tip对应
            historyId: apiResult.id || apiResult.historyId, // 兼容id字段
            classificationReason: apiResult.classification_reason // 添加分类理由字段
          };
          
          // 添加到最近识别记录
          this.addToRecentRecognitions(this.recognitionResult);
          
          return this.recognitionResult;
        } else {
          throw new Error(response?.message || '识别失败，请重试');
        }
      } catch (error) {
        // 使用统一的错误处理器处理错误
        errorHandler.handleSpecificErrors(error);
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