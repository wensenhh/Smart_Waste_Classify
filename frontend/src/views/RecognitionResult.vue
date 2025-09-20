<template>
  <div class="recognition-result-container">
    <!-- 使用Header组件的custom模式 -->
    <Header mode="custom">
      <div class="result-page-header">
        <button class="back-btn" @click="goBack">
          <span class="back-icon">←</span>
        </button>
        <h1 class="page-title">{{ $t('recognition.resultTitle') }}</h1>
        <div class="header-right"></div>
      </div>
    </Header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 识别结果卡片 -->
      <section class="result-card" v-if="recognitionStore.getRecognitionResult">
        <div class="result-image-container">
          <img 
            :src="recognitionStore.getRecognitionResult.imageUrl" 
            :alt="recognitionStore.getRecognitionResult.name"
            class="result-image"
          />
        </div>

        <div class="result-info">
          <h2 class="waste-name">{{ recognitionStore.getRecognitionResult.name }}</h2>
          <div class="waste-type">
            <span 
              class="type-badge"
              :class="getTypeClass(recognitionStore.getRecognitionResult.type)"
            >
              {{ recognitionStore.getRecognitionResult.type }}
            </span>
          </div>
          <div class="confidence-section">
            <span class="confidence-label">{{ $t('recognition.confidence') }}:</span>
            <div class="confidence-bar">
              <div 
                class="confidence-fill"
                :style="{ width: `${recognitionStore.getRecognitionResult.confidence * 100}%` }"
              ></div>
            </div>
            <span class="confidence-value">
              {{ Math.round(recognitionStore.getRecognitionResult.confidence * 100) }}%
            </span>
          </div>
          <div class="category-info">
            <span class="category-label">分类:</span>
            <span class="category-value">{{ recognitionStore.getRecognitionResult.category }}</span>
          </div>
        </div>
      </section>

      <!-- 处理建议区域 -->
      <section class="suggestion-section" v-if="recognitionStore.getRecognitionResult">
        <h3 class="section-title">{{ $t('recognition.suggestion') }}</h3>
        <div class="suggestion-content">
          {{ recognitionStore.getRecognitionResult.suggestion }}
        </div>
      </section>

      <!-- 相关知识区域 -->
      <section class="knowledge-section" v-if="recognitionStore.getRecognitionResult">
        <h3 class="section-title">相关知识</h3>
        <div class="knowledge-content">
          <div v-html="recognitionStore.getRecognitionResult.tips"></div>
        </div>
      </section>

      <!-- 操作按钮区域 -->
      <section class="action-buttons">
        <button 
          class="action-btn feedback-btn"
          @click="showFeedback = true"
          :disabled="recognitionStore.loading"
        >
          <span class="btn-icon">📝</span>
          <span>{{ $t('recognition.feedback') }}</span>
        </button>
        <button 
          class="action-btn share-btn"
          @click="shareResult"
          :disabled="recognitionStore.loading"
        >
          <span class="btn-icon">📤</span>
          <span>{{ $t('recognition.share') }}</span>
        </button>
        <button 
          class="action-btn back-home-btn"
          @click="goHome"
          :disabled="recognitionStore.loading"
        >
          <span class="btn-icon">🏠</span>
          <span>{{ $t('common.home') }}</span>
        </button>
      </section>
    </main>
    <BottomNavBar />

    <!-- 反馈弹窗 -->
    <div v-if="showFeedback" class="modal-overlay" @click="closeFeedback">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">{{ $t('recognition.feedback') }}</h3>
        <div class="feedback-options">
          <button 
            class="feedback-option correct"
            @click="submitFeedback(true)"
          >
            👍 识别正确
          </button>
          <button 
            class="feedback-option incorrect"
            @click="submitFeedback(false)"
          >
            👎 识别错误
          </button>
        </div>
        <div v-if="feedbackType !== null" class="comment-section">
          <textarea 
            v-model="feedbackComment"
            placeholder="请输入您的反馈意见（选填）"
            class="feedback-comment"
          ></textarea>
        </div>
        <div class="modal-actions">
          <button 
            class="modal-btn cancel-btn"
            @click="closeFeedback"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            v-if="feedbackType !== null"
            class="modal-btn submit-btn"
            @click="confirmFeedback"
            :disabled="recognitionStore.loading"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载指示器 -->
    <div v-if="recognitionStore.loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ $t('recognition.analyzing') }}</div>
    </div>

    <!-- 空状态 -->
    <div v-if="!recognitionStore.getRecognitionResult && !recognitionStore.loading" class="empty-state">
      <div class="empty-icon">📸</div>
      <div class="empty-text">暂无识别结果</div>
      <button class="empty-btn" @click="goHome">
        返回首页
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRecognitionStore } from '../stores/recognition';
import Header from '../components/Header.vue';
import BottomNavBar from '../components/BottomNavBar.vue';

import popupManager from '../utils/popup.js'

export default {
  name: 'RecognitionResult',
  components: {
    Header,
    BottomNavBar
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const recognitionStore = useRecognitionStore();
    const showFeedback = ref(false);
    const feedbackType = ref(null); // null, true(正确), false(错误)
    const feedbackComment = ref('');
    
    // 页面加载时检查路由参数并获取识别记录
    onMounted(async () => {
      const { id } = route.params;
      if (id) {
        try {
          await recognitionStore.fetchRecognitionById(id);
        } catch (error) {
          console.error('获取识别记录失败:', error);
          popupManager.error('获取识别记录失败，请返回首页重试');
        }
      }
    });

    // 返回上一页
    const goBack = () => {
      router.back();
    };

    // 返回首页
    const goHome = () => {
      router.push({ name: 'Home' });
    };

    // 获取垃圾类型的样式类
    const getTypeClass = (type) => {
      const typeMap = {
        '可回收物': 'recyclable',
        '厨余垃圾': 'kitchen',
        '有害垃圾': 'hazardous',
        '其他垃圾': 'other'
      };
      return typeMap[type] || 'other';
    };

    // 分享结果
    const shareResult = () => {
      // 实际项目中可以调用系统分享API
      popupManager.success('分享功能已触发');
    };

    // 提交反馈类型
    const submitFeedback = (isCorrect) => {
      feedbackType.value = isCorrect;
    };

    // 确认反馈
    const confirmFeedback = async () => {
      const result = await recognitionStore.feedbackRecognition(
        'mock_result_id', // 实际项目中使用真实的结果ID
        feedbackType.value,
        feedbackComment.value
      );
      
      if (result) {
        popupManager.success('感谢您的反馈！');
        closeFeedback();
      } else {
        popupManager.error('反馈提交失败，请重试');
      }
    };

    // 关闭反馈弹窗
    const closeFeedback = () => {
      showFeedback.value = false;
      feedbackType.value = null;
      feedbackComment.value = '';
    };

    return {
      recognitionStore,
      showFeedback,
      feedbackType,
      feedbackComment,
      goBack,
      goHome,
      getTypeClass,
      shareResult,
      submitFeedback,
      confirmFeedback,
      closeFeedback
    };
  }
};
</script>

<style scoped>
.recognition-result-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding-bottom: 80px;
}

.result-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-right {
  width: 40px;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.result-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.result-image-container {
  width: 100%;
  height: 200px;
  margin-bottom: 20px;
  border-radius: 15px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.waste-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.waste-type {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.type-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

.type-badge.recyclable {
  background-color: #4CAF50;
}

.type-badge.kitchen {
  background-color: #FFC107;
}

.type-badge.hazardous {
  background-color: #F44336;
}

.type-badge.other {
  background-color: #9E9E9E;
}

.confidence-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.confidence-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.confidence-bar {
  flex: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.confidence-value {
  font-size: 14px;
  font-weight: bold;
  min-width: 40px;
  text-align: right;
}

.category-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.category-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.category-value {
  font-size: 16px;
  font-weight: 500;
}

.suggestion-section,
.knowledge-section {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.suggestion-content,
.knowledge-content {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  color: #333;
  border-radius: 16px;
  padding: 20px;
  width: 80%;
  max-width: 400px;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.feedback-options {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.feedback-option {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feedback-option.correct {
  background-color: #4CAF50;
  color: white;
}

.feedback-option.incorrect {
  background-color: #F44336;
  color: white;
}

.feedback-comment {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.submit-btn {
  background-color: #667eea;
  color: white;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.submit-btn:hover {
  background-color: #764ba2;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: white;
  font-size: 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 修复Header组件的字体高度居中问题 */
.result-page-header {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 水平分布元素 */
  padding: 10px;
  min-height: 56px; /* 最小高度保证足够空间 */
  box-sizing: border-box;
}

.page-title {
  margin: 0;
}

/* 确保返回按钮也垂直居中 */
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-text {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.8;
}

.empty-btn {
  padding: 12px 30px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>