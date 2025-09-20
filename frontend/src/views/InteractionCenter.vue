<template>
  <div class="interaction-center-container">
    <!-- 使用Header组件 -->
    <Header mode="title" :title="$t('interaction.title')" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 功能卡片区域 -->
      <section class="feature-cards">
        <!-- 每日一题卡片 -->
        <div 
          class="feature-card daily-question"
          @click="navigateTo('DailyQuestion')"
        >
          <div class="card-icon">🎯</div>
          <div class="card-content">
            <h3>{{ $t('interaction.dailyQuestion') }}</h3>
            <p>{{ $t('interaction.dailyQuestionDesc') }}</p>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <!-- 垃圾挑战卡片 -->
        <div 
          class="feature-card waste-challenge"
          @click="navigateTo('ChallengeQuestion')"
        >
          <div class="card-icon">🏆</div>
          <div class="card-content">
            <h3>{{ $t('interaction.wasteChallenge') }}</h3>
            <p>{{ $t('interaction.wasteChallengeDesc') }}</p>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <!-- 社区分享卡片 -->
        <div 
          class="feature-card community-share"
          @click="navigateTo('CommunityShare')"
        >
          <div class="card-icon">👥</div>
          <div class="card-content">
            <h3>{{ $t('interaction.communityShare') }}</h3>
            <p>{{ $t('interaction.communityShareDesc') }}</p>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <!-- 环保活动卡片 -->
        <div 
          class="feature-card green-activities"
          @click="navigateTo('GreenActivities')"
        >
          <div class="card-icon">🌱</div>
          <div class="card-content">
            <h3>{{ $t('interaction.greenActivities') }}</h3>
            <p>{{ $t('interaction.greenActivitiesDesc') }}</p>
          </div>
          <div class="card-arrow">→</div>
        </div>
      </section>

      <!-- 用户成就区域 -->
      <section class="achievements-section">
        <div class="section-header">
          <h2>{{ $t('interaction.yourAchievements') }}</h2>
          <button class="view-all-btn" @click="viewAllAchievements">
            {{ $t('common.viewAll') }} →
          </button>
        </div>
        <div class="achievements-list">
          <div v-for="achievement in recentAchievements" :key="achievement.id" class="achievement-item">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <div class="achievement-name">{{ $t('interaction.achievements.' + achievement.key) }}</div>
              <div class="achievement-date">{{ achievement.date }}</div>
            </div>
            <div class="achievement-progress" v-if="achievement.progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: achievement.progress + '%' }"
                ></div>
              </div>
              <div class="progress-text">{{ achievement.progress }}%</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门话题区域 -->
      <section class="hot-topics-section">
        <div class="section-header">
          <h2>{{ $t('interaction.hotTopics') }}</h2>
        </div>
        <div class="topics-list">
          <div v-for="topic in hotTopics" :key="topic.id" class="topic-item">
            <div class="topic-rank">{{ topic.rank }}</div>
            <div class="topic-content">
              <div class="topic-title">{{ $t('interaction.topics.' + topic.key) }}</div>
              <div class="topic-stats">
                <span class="topic-views">{{ topic.views }} {{ $t('interaction.views') }}</span>
                <span class="topic-comments">{{ topic.comments }} {{ $t('interaction.comments') }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <BottomNavBar />

    <!-- 成就详情弹窗 -->
    <div v-if="showAchievementsModal" class="modal-overlay" @click="closeAchievementsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('interaction.allAchievements') }}</h3>
          <button class="modal-close-btn" @click="closeAchievementsModal">×</button>
        </div>
        <div class="modal-body">
          <div class="all-achievements-list">
            <div v-for="achievement in allAchievements" :key="achievement.id" class="achievement-item">
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-info">
                <div class="achievement-name">{{ $t('interaction.achievements.' + achievement.key) }}</div>
                <div class="achievement-description">{{ $t('interaction.achievementDescriptions.' + achievement.key) }}</div>
                <div class="achievement-status" :class="{ completed: achievement.completed }">
                  {{ achievement.completed ? $t('interaction.completed') : $t('interaction.notCompleted') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import BottomNavBar from '../components/BottomNavBar.vue';
import Header from '../components/Header.vue';

const router = useRouter();
const route = useRoute();
const showAchievementsModal = ref(false);

// 导航项
const navItems = [
  {
    name: 'home',
    route: 'Home',
    icon: '🏠',
    label: 'common.home'
  },
  {
    name: 'knowledge',
    route: 'KnowledgeBase',
    icon: '📚',
    label: 'common.knowledgeBase'
  },
  {
    name: 'interaction',
    route: 'InteractionCenter',
    icon: '🎮',
    label: 'common.interactionCenter'
  },
  {
    name: 'education',
    route: 'Education',
    icon: '📝',
    label: 'common.education'
  },
  {
    name: 'profile',
    route: 'Profile',
    icon: '👤',
    label: 'common.profile'
  }
];

// 最近成就
const recentAchievements = ref([
  {
    id: 1,
    key: 'wasteSortingMaster',
    icon: '🏅',
    date: '2025-06-15',
    progress: 85
  },
  {
    id: 2,
    key: 'environmentalGuardian',
    icon: '🌱',
    date: '2025-06-10',
    progress: 60
  },
  {
    id: 3,
    key: 'knowledgeChampion',
    icon: '🎯',
    date: '2025-06-05',
    progress: 100
  }
]);

// 所有成就
const allAchievements = ref([
  {
    id: 1,
    key: 'wasteSortingMaster',
    icon: '🏅',
    description: '正确分类垃圾100次',
    completed: false
  },
  {
    id: 2,
    key: 'environmentalGuardian',
    icon: '🌱',
    description: '连续使用app7天',
    completed: true
  },
  {
    id: 3,
    key: 'knowledgeChampion',
    icon: '🎯',
    description: '参与知识竞赛并获得满分',
    completed: true
  },
  {
    id: 4,
    key: 'communityActivist',
    icon: '👥',
    description: '在社区分享10篇环保文章',
    completed: false
  },
  {
    id: 5,
    key: 'wasteRecognitionExpert',
    icon: '🔍',
    description: '识别50种不同类型的垃圾',
    completed: false
  }
]);

// 热门话题
const hotTopics = ref([
  {
    id: 1,
    rank: 1,
    key: 'reduceHouseholdWaste',
    views: 1250,
    comments: 152
  },
  {
    id: 2,
    rank: 2,
    key: 'malaysiaPolicy',
    views: 1020,
    comments: 98
  },
  {
    id: 3,
    rank: 3,
    key: 'compostingTips',
    views: 890,
    comments: 76
  },
  {
    id: 4,
    rank: 4,
    key: 'plasticAlternatives',
    views: 750,
    comments: 65
  },
  {
    id: 5,
    rank: 5,
    key: 'recyclingDIY',
    views: 680,
    comments: 112
  }
]);

// 导航到指定路由
const navigateTo = (routeName) => {
  if (routeName !== route.name) {
    router.push({ name: routeName });
  }
};

// 查看所有成就
const viewAllAchievements = () => {
  showAchievementsModal.value = true;
};

// 关闭成就详情弹窗
const closeAchievementsModal = () => {
  showAchievementsModal.value = false;
};</script>

<style scoped>
.interaction-center-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  padding-bottom: 80px;
  overflow-y: auto;
}

.feature-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.feature-card {
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.card-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.card-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.card-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

.card-arrow {
  margin-top: auto;
  text-align: right;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
}

.daily-question {
  border-left: 4px solid #FFD700;
}

.waste-challenge {
  border-left: 4px solid #FF6B6B;
}

.community-share {
  border-left: 4px solid #4ECDC4;
}

.green-activities {
  border-left: 4px solid #8BC34A;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
}

.view-all-btn {
  background: none;
  border: none;
  color: #FFD700;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.achievement-item {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  backdrop-filter: blur(10px);
}

.achievement-icon {
  font-size: 36px;
  margin-right: 15px;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.achievement-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.achievement-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 80px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: bold;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.topic-item {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.topic-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.topic-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #FFD700;
  color: #1e3c72;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  margin-right: 15px;
}

.topic-content {
  flex: 1;
}

.topic-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.topic-stats {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.nav-icon {
  font-size: 24px;
}

.nav-text {
  font-size: 12px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  color: #333;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.all-achievements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.achievement-status {
  font-size: 14px;
  font-weight: bold;
}

.achievement-status.completed {
  color: #4CAF50;
}

.achievement-status:not(.completed) {
  color: #FF6B6B;
}
</style>