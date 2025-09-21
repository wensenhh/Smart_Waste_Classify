<template>
  <div class="challenge-question-container">
    <!-- 使用Header组件的默认模式 -->
    <Header mode="default" defaultColor="#000" :title="$t('question.challengeTitle')" />
    <main class="challenge-main">
      <!-- 页面标题和关卡信息 -->
      <div class="challenge-header">
        <h1>{{ $t('question.challengeTitle') }}</h1>
        <div class="level-info">
          <span class="current-level">第 {{ currentLevel }} 关</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <span class="questions-info">{{ currentQuestionIndex }}/{{ questionsCount }} 题</span>
        </div>
      </div>

      <!-- 问题区域 -->
      <div v-if="currentQuestion" class="question-card">
        <div class="question-content">
          <h2>{{ $t('question.questionText') }}</h2>
          <p class="question-text">{{ currentQuestion.text }}</p>
        </div>

        <!-- 选项区域 -->
        <div class="options-container">
          <h3>{{ $t('question.options') }}</h3>
          <div class="options-list">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-item"
              :class="{
                'selected': selectedOption === index,
                'correct': isSubmitted && index === currentQuestion.answer,
                'incorrect': isSubmitted && selectedOption === index && index !== currentQuestion.answer
              }"
              @click="selectOption(index)"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
              <span v-if="isSubmitted" class="option-status">
                {{ index === currentQuestion.answer ? '✓' : selectedOption === index ? '✗' : '' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 解析区域 -->
        <div v-if="isSubmitted" class="explanation-section">
          <h3>{{ $t('question.explanation') }}</h3>
          <p class="explanation-text">{{ currentQuestion.explanation }}</p>
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
            v-else-if="!isLevelCompleted"
            class="next-button"
            @click="goToNextQuestion"
          >
            {{ $t('question.nextQuestion') }}
          </button>
          <button
            v-else-if="isLevelCompleted && hasNextLevel"
            class="next-level-button"
            @click="goToNextLevel"
          >
            下一关
          </button>
          <button
            v-else-if="isLevelCompleted && !hasNextLevel"
            class="finish-button"
            @click="finishChallenge"
          >
            完成挑战
          </button>
        </div>
      </div>

      <!-- 关卡完成提示 -->
      <div v-if="isLevelCompleted && !isSubmitted" class="level-completed-popup">
        <div class="popup-content">
          <div class="success-icon">🎉</div>
          <h2>关卡完成！</h2>
          <p>恭喜您完成了第 {{ currentLevel }} 关的挑战！</p>
          <p>得分：{{ currentLevelScore }} 分</p>
          <div class="popup-buttons">
            <button v-if="hasNextLevel" class="next-level-button" @click="goToNextLevel">
              下一关
            </button>
            <button v-else class="finish-button" @click="finishChallenge">
              完成挑战
            </button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载题目...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-state">
        <p class="error-message">无法加载题目，请稍后再试。</p>
        <button class="retry-button" @click="fetchChallengeQuestions">重试</button>
      </div>
    </main>
    <BottomNavBar />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useQuestionStore } from '../stores/question';
import { useUserStore } from '../stores/user';
import NavBar from '../components/NavBar.vue';
import BottomNavBar from '../components/BottomNavBar.vue';

export default {
  name: 'ChallengeQuestion',
  components: {
    NavBar,
    BottomNavBar
  },
  setup() {
    const questionStore = useQuestionStore();
    const userStore = useUserStore();
    
    const loading = ref(false);
    const currentLevel = ref(1);
    const questions = ref([]);
    const currentQuestionIndex = ref(0);
    const selectedOption = ref(null);
    const isSubmitted = ref(false);
    const isLevelCompleted = ref(false);
    const currentLevelScore = ref(0);
    const hasNextLevel = ref(true); // 假设最多有3关

    // 获取当前问题
    const currentQuestion = computed(() => {
      return questions.value[currentQuestionIndex.value];
    });

    // 获取问题总数
    const questionsCount = computed(() => {
      return questions.value.length;
    });

    // 计算进度百分比
    const progressPercentage = computed(() => {
      if (questionsCount.value === 0) return 0;
      return ((currentQuestionIndex.value + 1) / questionsCount.value) * 100;
    });

    // 获取关卡题目
    const fetchChallengeQuestions = async () => {
      try {
        loading.value = true;
        await questionStore.fetchChallengeQuestions(currentLevel.value);
        questions.value = questionStore.getChallengeQuestions;
        currentQuestionIndex.value = 0;
        selectedOption.value = null;
        isSubmitted.value = false;
        isLevelCompleted.value = false;
        currentLevelScore.value = 0;
      } catch (error) {
        console.error('获取关卡题目失败:', error);
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
        const isCorrect = selectedOption.value === currentQuestion.value.answer;
        await questionStore.submitAnswer(selectedOption.value, isCorrect);
        isSubmitted.value = true;
        
        // 更新分数
        if (isCorrect) {
          currentLevelScore.value += 10;
        }
      } catch (error) {
        console.error('提交答案失败:', error);
      }
    };

    // 下一题
    const goToNextQuestion = () => {
      if (currentQuestionIndex.value < questionsCount.value - 1) {
        currentQuestionIndex.value++;
        selectedOption.value = null;
        isSubmitted.value = false;
      } else {
        // 关卡完成
        isLevelCompleted.value = true;
        isSubmitted.value = false;
        
        // 更新用户积分
        userStore.addPoints(currentLevelScore.value);
      }
    };

    // 下一关
    const goToNextLevel = () => {
      if (currentLevel.value < 3) { // 假设最多有3关
        currentLevel.value++;
        fetchChallengeQuestions();
      }
    };

    // 完成挑战
    const finishChallenge = () => {
      // 可以跳转到成就页面或返回互动中心
      console.log('挑战完成');
    };

    // 组件挂载时获取题目
    onMounted(() => {
      fetchChallengeQuestions();
    });

    return {
      loading,
      currentLevel,
      questions,
      currentQuestionIndex,
      selectedOption,
      isSubmitted,
      isLevelCompleted,
      currentLevelScore,
      hasNextLevel,
      currentQuestion,
      questionsCount,
      progressPercentage,
      fetchChallengeQuestions,
      selectOption,
      submitAnswer,
      goToNextQuestion,
      goToNextLevel,
      finishChallenge
    };
  }
};
</script>

<style scoped>
.challenge-question-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 0 0 80px;
}

.challenge-main {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.challenge-header {
  text-align: center;
  margin-bottom: 30px;
}

.challenge-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
}

.level-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 15px;
}

.current-level {
  font-size: 18px;
  font-weight: 600;
  color: #4caf50;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.questions-info {
  font-size: 16px;
  color: #666;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
}

.question-content {
  margin-bottom: 25px;
}

.question-content h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.question-text {
  font-size: 20px;
  color: #333;
  line-height: 1.6;
}

.options-container {
  margin-bottom: 25px;
}

.options-container h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.option-item:hover {
  border-color: #4caf50;
  background-color: #f8fff8;
}

.option-item.selected {
  border-color: #4caf50;
  background-color: #f8fff8;
}

.option-item.correct {
  border-color: #4caf50;
  background-color: #e8f5e9;
}

.option-item.incorrect {
  border-color: #f44336;
  background-color: #ffebee;
}

.option-letter {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  margin-right: 15px;
  font-weight: bold;
}

.option-text {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.option-status {
  font-size: 20px;
  font-weight: bold;
}

.explanation-section {
  margin-bottom: 25px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
}

.explanation-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.explanation-text {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.submit-button,
.next-button,
.next-level-button,
.finish-button,
.retry-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button {
  background-color: #4caf50;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.next-button {
  background-color: #2196f3;
  color: white;
}

.next-button:hover {
  background-color: #0b7dda;
}

.next-level-button {
  background-color: #ff9800;
  color: white;
}

.next-level-button:hover {
  background-color: #e68900;
}

.finish-button {
  background-color: #9c27b0;
  color: white;
}

.finish-button:hover {
  background-color: #7b1fa2;
}

.retry-button {
  background-color: #f44336;
  color: white;
}

.retry-button:hover {
  background-color: #da190b;
}

.level-completed-popup {
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

.popup-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.success-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.popup-content h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.popup-content p {
  font-size: 16px;
  color: #666;
  margin-bottom: 5px;
}

.popup-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.error-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .challenge-main {
    padding: 15px;
  }
  
  .challenge-header h1 {
    font-size: 24px;
  }
  
  .level-info {
    flex-direction: column;
    gap: 10px;
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
  
  .action-buttons,
  .popup-buttons {
    flex-direction: column;
  }
}
</style>