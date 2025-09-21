<template>
  <div class="daily-question-container">
    <!-- 使用Header组件的默认模式 -->
    <Header mode="default" :title="$t('question.questionTitle')" defaultColor="#000"/>
    <main class="question-main">
      <!-- 页面标题 -->
      <div class="question-header">
        <h1>{{ $t('question.questionTitle') }}</h1>
        <p class="question-date">{{ formattedDate }}</p>
      </div>

      <!-- 问题区域 -->
      <div v-if="question" class="question-card">
        <div class="question-content">
          <h2>{{ $t('question.questionText') }}</h2>
          <p class="question-text">{{ question.text }}</p>
        </div>

        <!-- 选项区域 -->
        <div class="options-container">
          <h3>{{ $t('question.options') }}</h3>
          <div class="options-list">
            <div
              v-for="(option, index) in question.options"
              :key="index"
              class="option-item"
              :class="{
                'selected': selectedOption === index,
                'correct': isSubmitted && index === question.answer,
                'incorrect': isSubmitted && selectedOption === index && index !== question.answer
              }"
              @click="selectOption(index)"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
              <span v-if="isSubmitted" class="option-status">
                {{ index === question.answer ? '✓' : selectedOption === index ? '✗' : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 解析区域 -->
        <div v-if="isSubmitted" class="explanation-section">
          <h3>{{ $t('question.explanation') }}</h3>
          <p class="explanation-text">{{ question.explanation }}</p>
        </div>

        <!-- 按钮区域 -->
        <div class="action-buttons">
          <button
            v-if="!isSubmitted"
            class="submit-button"
            :disabled="selectedOption === null"
            @click="submitAnswer"
          >
            {{ $t('question.submit') }}
          </button>
          <button
            v-else
            class="next-button"
            @click="getNextQuestion"
          >
            {{ $t('question.nextQuestion') }}
          </button>
          <button
            v-if="isSubmitted"
            class="similar-button"
            @click="viewSimilarQuestions"
          >
            {{ $t('question.viewSimilarQuestions') }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载问题...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <p class="error-message">无法加载问题，请稍后再试。</p>
        <button class="retry-button" @click="fetchQuestion">重试</button>
      </div>
    </main>
    <BottomNavBar />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useQuestionStore } from '../stores/question';
import NavBar from '../components/NavBar.vue';
import BottomNavBar from '../components/BottomNavBar.vue';

export default {
  name: 'DailyQuestion',
  components: {
    NavBar,
    BottomNavBar
  },
  setup() {
    const questionStore = useQuestionStore();
    const loading = ref(false);
    const selectedOption = ref(null);
    const isSubmitted = ref(false);
    const question = ref(null);

    // 获取格式化的日期
    const formattedDate = computed(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    // 获取问题
    const fetchQuestion = async () => {
      try {
        loading.value = true;
        await questionStore.fetchDailyQuestion();
        question.value = questionStore.getDailyQuestion;
        selectedOption.value = null;
        isSubmitted.value = false;
      } catch (error) {
        console.error('获取问题失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 选择选项
    const selectOption = (index) => {
      if (!isSubmitted.value) {
        selectedOption.value = index;
      }
    };

    // 提交答案
    const submitAnswer = async () => {
      if (selectedOption.value === null) return;
      
      try {
        const isCorrect = selectedOption.value === question.value.answer;
        await questionStore.submitAnswer(selectedOption.value, isCorrect);
        isSubmitted.value = true;
      } catch (error) {
        console.error('提交答案失败:', error);
      }
    };

    // 获取下一题
    const getNextQuestion = () => {
      fetchQuestion();
    };

    // 查看同类题
    const viewSimilarQuestions = () => {
      // 这里可以跳转到同类题页面或显示相关推荐
      console.log('查看同类题');
    };

    // 组件挂载时获取问题
    onMounted(() => {
      fetchQuestion();
    });

    return {
      question,
      loading,
      selectedOption,
      isSubmitted,
      formattedDate,
      fetchQuestion,
      selectOption,
      submitAnswer,
      getNextQuestion,
      viewSimilarQuestions
    };
  }
};
</script>

<style scoped>
.daily-question-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-secondary);
  padding: 60px 0 80px;
}

.question-main {
  flex: 1;
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.question-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: var(--border-radius-large);
  color: var(--text-light);
  margin-top: var(--spacing-lg);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.question-header h1 {
  font-size: 28px;
  color: var(--text-light);
  margin-bottom: var(--spacing-sm);
}

.question-date {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.question-card {
  background: var(--background-card);
  border-radius: var(--border-radius-large);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 16px var(--shadow-color);
  max-width: 800px;
  margin: var(--spacing-lg) auto;
  border: 1px solid var(--border-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.question-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px var(--shadow-color);
}

.question-content {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--primary-lighter);
}

.question-content h2 {
  font-size: 18px;
  color: var(--primary-dark);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  display: inline-block;
  background-color: var(--primary-lighter);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-small);
}

.question-text {
  font-size: 20px;
  color: var(--text-primary);
  line-height: 1.6;
  padding: var(--spacing-md) 0;
}

.options-container {
  margin-bottom: var(--spacing-xl);
}

.options-container h3 {
  font-size: 18px;
  color: var(--primary-dark);
  margin-bottom: var(--spacing-lg);
  font-weight: 600;
  display: inline-block;
  background-color: var(--primary-lighter);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-small);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.option-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--background-card);
  position: relative;
  overflow: hidden;
}

.option-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--primary-light);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.option-item:hover {
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.option-item:hover::before {
  transform: scaleY(1);
}

.option-item.selected {
  background-color: var(--primary-lighter);
  border-color: var(--primary-color);
}

.option-item.selected::before {
  transform: scaleY(1);
}

.option-item.correct {
  background-color: var(--primary-lighter);
  border-color: var(--success-color);
  color: var(--text-primary);
}

.option-item.correct::before {
  background-color: var(--success-color);
  transform: scaleY(1);
}

.option-item.incorrect {
  background-color: rgba(244, 67, 54, 0.1);
  border-color: var(--error-color);
  color: var(--text-primary);
}

.option-item.incorrect::before {
  background-color: var(--error-color);
  transform: scaleY(1);
}

.option-letter {
  font-weight: bold;
  margin-right: var(--spacing-md);
  color: var(--primary-color);
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(76, 175, 80, 0.1);
  border-radius: 50%;
}

.option-text {
  flex: 1;
  font-size: 16px;
  color: var(--text-primary);
}

.option-status {
  font-size: 20px;
  font-weight: bold;
  width: 24px;
  text-align: center;
}

.option-item.correct .option-status {
  color: var(--success-color);
}

.option-item.incorrect .option-status {
  color: var(--error-color);
}

.explanation-section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: var(--primary-lighter);
  border-radius: var(--border-radius-medium);
  border-left: 4px solid var(--primary-color);
}

.explanation-section h3 {
  font-size: 18px;
  color: var(--primary-dark);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.explanation-text {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.submit-button,
.next-button,
.similar-button,
.retry-button {
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--border-radius-medium);
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.submit-button {
  background-color: var(--primary-color);
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.submit-button:disabled {
  background-color: var(--text-disabled);
  cursor: not-allowed;
  transform: none;
}

.next-button {
  background-color: var(--info-color);
  color: white;
}

.next-button:hover {
  background-color: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.similar-button {
  background-color: var(--warning-color);
  color: white;
}

.similar-button:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) var(--spacing-lg);
  text-align: center;
  background-color: var(--background-card);
  border-radius: var(--border-radius-large);
  box-shadow: 0 4px 16px var(--shadow-color);
  max-width: 500px;
  margin: var(--spacing-xl) auto;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-lg);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.retry-button {
  background-color: var(--primary-color);
  color: white;
}

.retry-button:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .question-main {
    padding: 15px;
  }
  
  .question-header h1 {
    font-size: 24px;
  }
  
  .question-card {
    padding: 20px;
  }
  
  .question-text {
    font-size: 18px;
  }
  
  .option-item {
    padding: 12px 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>