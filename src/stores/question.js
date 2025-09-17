import { defineStore } from 'pinia';
import { wasteApi } from '../services/api';

// 知识问答状态管理store
export const useQuestionStore = defineStore('question', {
  state: () => ({
    dailyQuestion: null,
    challengeQuestions: [],
    currentQuestion: null,
    currentChallengeLevel: 1,
    loading: false,
    error: null,
    questionHistory: []
  }),

  getters: {
    // 获取每日一题
    getDailyQuestion: (state) => state.dailyQuestion,
    // 获取当前问题
    getCurrentQuestion: (state) => state.currentQuestion,
    // 获取挑战题目
    getChallengeQuestions: (state) => state.challengeQuestions,
    // 获取当前挑战等级
    getCurrentChallengeLevel: (state) => state.currentChallengeLevel
  },

  actions: {
    // 初始化问答状态
    initializeQuestions() {
      const savedQuestionHistory = localStorage.getItem('questionHistory');
      if (savedQuestionHistory) {
        this.questionHistory = JSON.parse(savedQuestionHistory);
      }
      
      const savedChallengeLevel = localStorage.getItem('challengeLevel');
      if (savedChallengeLevel) {
        this.currentChallengeLevel = parseInt(savedChallengeLevel);
      }
    },

    // 获取每日一题
    async fetchDailyQuestion() {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求
        // const response = await wasteApi.getDailyQuestion();
        // this.dailyQuestion = response;
        // this.currentQuestion = response;
        
        // 模拟每日一题数据
        const mockDailyQuestion = {
          id: 'daily_' + new Date().toISOString().split('T')[0],
          type: 'daily',
          question: '以下哪种垃圾属于可回收物？',
          options: [
            '香蕉皮',
            '塑料瓶',
            '废电池',
            '纸巾'
          ],
          correctAnswer: 1,
          explanation: '塑料瓶属于可回收物，应投入蓝色垃圾桶。香蕉皮属于厨余垃圾，废电池属于有害垃圾，纸巾属于其他垃圾。'
        };
        
        this.dailyQuestion = mockDailyQuestion;
        this.currentQuestion = mockDailyQuestion;
        
        return mockDailyQuestion;
      } catch (error) {
        this.error = error.message || '获取每日一题失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 获取挑战题目
    async fetchChallengeQuestions(level) {
      try {
        this.loading = true;
        this.error = null;
        
        const targetLevel = level || this.currentChallengeLevel;
        
        // 模拟API请求
        // const response = await wasteApi.getChallengeQuestions(targetLevel);
        // this.challengeQuestions = response.questions;
        // this.currentQuestion = response.questions[0];
        
        // 模拟挑战题目数据
        const mockChallengeQuestions = [
          {
            id: `challenge_${targetLevel}_1`,
            type: 'challenge',
            level: targetLevel,
            question: '以下哪种垃圾属于有害垃圾？',
            options: [
              '废报纸',
              '过期药品',
              '蔬菜叶子',
              '陶瓷碎片'
            ],
            correctAnswer: 1,
            explanation: '过期药品含有有害成分，属于有害垃圾，应投入红色垃圾桶。'
          },
          {
            id: `challenge_${targetLevel}_2`,
            type: 'challenge',
            level: targetLevel,
            question: '以下哪种垃圾属于厨余垃圾？',
            options: [
              '鱼骨头',
              '塑料袋',
              '玻璃碎片',
              '烟头'
            ],
            correctAnswer: 0,
            explanation: '鱼骨头属于厨余垃圾，应投入绿色垃圾桶。'
          },
          {
            id: `challenge_${targetLevel}_3`,
            type: 'challenge',
            level: targetLevel,
            question: '以下哪种垃圾属于其他垃圾？',
            options: [
              '铝罐',
              '剩饭菜',
              '快递纸箱',
              '一次性筷子'
            ],
            correctAnswer: 3,
            explanation: '一次性筷子属于其他垃圾，应投入灰色垃圾桶。'
          }
        ];
        
        this.challengeQuestions = mockChallengeQuestions;
        this.currentQuestion = mockChallengeQuestions[0];
        
        return mockChallengeQuestions;
      } catch (error) {
        this.error = error.message || '获取挑战题目失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 提交答案
    async submitAnswer(questionId, selectedAnswer) {
      try {
        this.loading = true;
        this.error = null;
        
        // 查找问题
        let question;
        if (this.dailyQuestion && this.dailyQuestion.id === questionId) {
          question = this.dailyQuestion;
        } else {
          question = this.challengeQuestions.find(q => q.id === questionId);
        }
        
        if (!question) {
          throw new Error('问题不存在');
        }
        
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        // 模拟API请求
        // await wasteApi.submitAnswer({
        //   questionId,
        //   selectedAnswer,
        //   isCorrect
        // });
        
        // 记录答题历史
        const answerRecord = {
          questionId,
          question: question.question,
          selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timestamp: new Date().toISOString(),
          type: question.type
        };
        
        this.questionHistory.unshift(answerRecord);
        
        // 保存到本地存储
        localStorage.setItem('questionHistory', JSON.stringify(this.questionHistory));
        
        // 如果是挑战模式，并且答对了，更新到下一题
        if (question.type === 'challenge' && isCorrect) {
          const currentIndex = this.challengeQuestions.findIndex(q => q.id === questionId);
          if (currentIndex < this.challengeQuestions.length - 1) {
            this.currentQuestion = this.challengeQuestions[currentIndex + 1];
          } else {
            // 挑战完成，升级到下一关
            this.currentChallengeLevel++;
            localStorage.setItem('challengeLevel', this.currentChallengeLevel.toString());
          }
        }
        
        return {
          isCorrect,
          explanation: question.explanation
        };
      } catch (error) {
        this.error = error.message || '提交答案失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 切换到指定问题
    setCurrentQuestion(questionId) {
      const question = this.challengeQuestions.find(q => q.id === questionId);
      if (question) {
        this.currentQuestion = question;
      }
    },

    // 获取答题历史
    getAnswerHistory() {
      return this.questionHistory;
    },

    // 清空答题历史
    clearAnswerHistory() {
      this.questionHistory = [];
      localStorage.removeItem('questionHistory');
    }
  }
});