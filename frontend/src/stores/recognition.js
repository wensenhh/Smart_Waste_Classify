import { defineStore } from 'pinia';
import { wasteApi } from '../services/wasteApi';
import errorHandler from '../services/errorHandler';
import popupManager from '../utils/popup.js';

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
    // 根据ID获取识别记录详情
    async fetchRecognitionById(id) {
      try {
        this.loading = true;
        this.error = null;
        
        // 调用API获取识别记录详情
        const response = await wasteApi.recognition.getRecognitionById(id);
        
        if (response && response.success && response.data) {
          const apiResult = response.data;
          
          // 处理imageUrl，确保它是完整的超链接形式
          let imageUrl = apiResult.imageUrl || '';
          
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
            type: apiResult.category_name || apiResult.type,  // 垃圾类型
            name: apiResult.waste_name || apiResult.name,     // 垃圾名称
            confidence: apiResult.confidence || 0,            // 识别置信度
            suggestion: apiResult.disposal_advice || apiResult.suggestion || '', // 处理建议
            category: apiResult.category || '',               // 垃圾类别
            imageUrl: imageUrl,                               // 图片URL
            tips: apiResult.related_knowledge || apiResult.environmental_tip || apiResult.tips || '无', // 相关知识，优先使用related_knowledge
            historyId: apiResult.id || apiResult.historyId,   // 历史记录ID
            classificationReason: apiResult.classification_reason // 分类理由
          };
          
          return this.recognitionResult;
        } else {
          throw new Error(response?.message || '获取识别记录失败');
        }
      } catch (error) {
        console.error('获取识别记录详情失败:', error);
        // 添加防御性检查，确保errorHandler存在且handleSpecificErrors是函数
        if (errorHandler && typeof errorHandler.handleSpecificErrors === 'function') {
          try {
            errorHandler.handleSpecificErrors(error);
          } catch (handlerError) {
            console.error('错误处理器执行失败:', handlerError);
          }
        } else {
          console.error('errorHandler或handleSpecificErrors方法不存在');
        }
        // 使用简单的错误消息显示方式
        popupManager.error('获取识别记录失败，请稍后再试');
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // 初始化识别记录
    async initializeRecognitions() {
      try {
        // 从API获取历史记录
        await this.fetchHistoryRecognitions();
      } catch (error) {
        console.error('获取历史记录失败:', error);
        // 如果API调用失败，尝试从localStorage读取
        const savedRecognitions = localStorage.getItem('recentRecognitions');
        if (savedRecognitions) {
          this.recentRecognitions = JSON.parse(savedRecognitions);
        } else {
          this.recentRecognitions = [];
        }
      }
      
      // 初始化当前城市
      const savedCity = localStorage.getItem('currentCity');
      if (savedCity) {
        this.currentCity = savedCity;
      }
    },
    
    // 从API获取历史识别记录
    async fetchHistoryRecognitions(page = 1, pageSize = 10, append = false) {
      try {
        this.loading = true;
        const response = await wasteApi.recognition.getIdentifyRecord({ page, pageSize });
        
        if (response && response.success && response.data) {
          const apiResults = response.data.list || response.data || [];
          
          // 转换API返回的数据格式
          const formattedResults = apiResults.map(item => ({
            type: item.category_name || item.type,  // 垃圾类型
            name: item.waste_name || item.name,     // 垃圾名称
            confidence: item.confidence || 0,       // 识别置信度
            suggestion: item.disposal_advice || item.suggestion || '', // 处理建议
            category: item.category || '',          // 垃圾类别
            imageUrl: this.getFullImageUrl(item.imageUrl), // 图片URL
            timestamp: item.created_at || item.timestamp, // 时间戳
            historyId: item.id || item.historyId,    // 历史记录ID
            tips: item.related_knowledge || item.environmental_tip || item.tips || '无' // 相关知识，优先使用related_knowledge
          }));
          
          // 根据是否是追加模式决定如何更新列表
          if (append) {
            this.recentRecognitions.push(...formattedResults);
          } else {
            this.recentRecognitions = formattedResults;
          }
          
          // 保存到本地存储
          localStorage.setItem('recentRecognitions', JSON.stringify(this.recentRecognitions));
          
          return {
            results: formattedResults,
            hasMore: formattedResults.length === pageSize, // 判断是否还有更多数据
            total: response.data.total || 0
          };
        } else {
          throw new Error(response?.message || '获取历史记录失败');
        }
      } catch (error) {
        console.error('获取历史记录失败:', error);
        errorHandler.handleSpecificErrors(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取完整的图片URL
    getFullImageUrl(imageUrl) {
      if (!imageUrl) return '';
      
      // 检查是否已经是完整的URL
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      
      // 组合成完整URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `${baseUrl}${path}`;
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