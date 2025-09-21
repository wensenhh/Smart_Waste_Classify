<template>
  <div class="profile-container">
    <!-- 使用Header组件 -->
    <Header />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 用户信息卡片 -->
      <section class="user-info-card">
        <div class="user-avatar">
          <div class="avatar-icon">{{ avatarOptions[0] }}</div>
        </div>
        <div class="user-details">
          <h2>{{ userInfo.name }}</h2>
          <p class="user-email">{{ userInfo.email }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userStats.recognitionCount }}</div>
              <div class="stat-label">{{ $t('profile.recognitionCount') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.streakDays }}</div>
              <div class="stat-label">{{ $t('profile.streakDays') }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStats.points }}</div>
              <div class="stat-label">{{ $t('profile.points') }}</div>
            </div>
          </div>
        </div>
        <button 
          class="edit-profile-btn"
          @click="editProfile"
        >
          {{ $t('profile.editProfile') }}
        </button>
      </section>

      <!-- 成就展示 -->
      <section class="achievements">
        <div class="section-header">
          <h3>{{ $t('profile.achievements') }}</h3>
          <button class="view-all-btn">
            {{ $t('common.viewAll') }} →
          </button>
        </div>
        <div class="achievements-list">
          <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-date">{{ achievement.date }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 最近活动 -->
      <section class="recent-activities">
        <div class="section-header">
          <h3>{{ $t('profile.recentActivities') }}</h3>
        </div>
        <div class="activities-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-content">
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 设置选项 -->
      <section class="settings">
        <h3>{{ $t('profile.settings') }}</h3>
        <div class="settings-list">
          <div class="setting-item" @click="openLanguageSettings">
            <div class="setting-icon">🌐</div>
            <div class="setting-text">{{ $t('profile.language') }}</div>
            <div class="setting-arrow">→</div>
          </div>
          <div class="setting-item" @click="openNotificationSettings">
            <div class="setting-icon">🔔</div>
            <div class="setting-text">{{ $t('profile.notifications') }}</div>
            <div class="setting-arrow">→</div>
          </div>
          <div class="setting-item" @click="openPrivacySettings">
            <div class="setting-icon">🔒</div>
            <div class="setting-text">{{ $t('profile.privacy') }}</div>
            <div class="setting-arrow">→</div>
          </div>
          <div class="setting-item" @click="openHelpCenter">
            <div class="setting-icon">❓</div>
            <div class="setting-text">{{ $t('profile.helpCenter') }}</div>
            <div class="setting-arrow">→</div>
          </div>
          <div class="setting-item logout" @click="logout">
            <div class="setting-icon">🚪</div>
            <div class="setting-text">{{ $t('profile.logout') }}</div>
          </div>
        </div>
      </section>
    </main>

    <!-- 使用BottomNavBar组件 -->
    <BottomNavBar />

    <!-- 编辑资料弹窗 -->
    <div v-if="showEditProfileModal" class="modal-overlay" @click="closeEditProfileModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('profile.editProfile') }}</h3>
          <button class="modal-close-btn" @click="closeEditProfileModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ $t('profile.name') }}</label>
            <input type="text" v-model="editName" :placeholder="$t('profile.enterName')">
          </div>
          <div class="form-group">
            <label>{{ $t('profile.email') }}</label>
            <input type="email" v-model="editEmail" :placeholder="$t('profile.enterEmail')" disabled>
          </div>
          <div class="form-group">
            <label>{{ $t('profile.city') }}</label>
            <input type="text" v-model="editCity" :placeholder="$t('profile.enterCity')">
          </div>
          <div class="form-group">
            <label>{{ $t('profile.avatar') }}</label>
            <div class="avatar-selection">
              <div 
                v-for="avatar in avatarOptions"
                :key="avatar"
                class="avatar-option"
                :class="{ selected: editAvatar === avatar }"
                @click="selectAvatar(avatar)"
              >
                {{ avatar }}
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click="closeEditProfileModal">{{ $t('common.cancel') }}</button>
            <button class="save-btn" @click="saveProfileChanges">{{ $t('common.save') }}</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 语言设置弹窗 -->
    <div v-if="showLanguageModal" class="modal-overlay" @click="closeLanguageModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('profile.language') }}</h3>
          <button class="modal-close-btn" @click="closeLanguageModal">×</button>
        </div>
        <div class="modal-body">
          <div class="language-selection">
            <div 
              v-for="lang in i18nStore.getAvailableLocales"
              :key="lang.code"
              class="language-option"
              :class="{ selected: selectedLanguage === lang.code }"
              @click="selectedLanguage = lang.code"
            >
              <div class="language-code">{{ lang.code.toUpperCase() }}</div>
              <div class="language-name">{{ lang.name }}</div>
              <div v-if="selectedLanguage === lang.code" class="language-check">✓</div>
            </div>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click="closeLanguageModal">{{ $t('common.cancel') }}</button>
            <button class="save-btn" @click="saveLanguageSettings">{{ $t('common.save') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useI18nStore } from '../stores/i18n';
import { useI18n } from 'vue-i18n';
import BottomNavBar from '../components/BottomNavBar.vue';
import Header from '../components/Header.vue';
import popupManager from '../utils/popup.js';

// 设置路由和存储
// 手动触发热更新以应用成就名称翻译
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const i18nStore = useI18nStore();
const { t } = useI18n();

// 响应式状态
const showEditProfileModal = ref(false);

// 从store获取用户信息
const userInfo = ref(userStore.getUserInfo || {
  name: t('profile.defaultName'),
  email: 'eco.warrior@example.com',
  city: t('profile.defaultCity'),
  avatar: '👤'
});

// 用户统计数据
const userStats = ref({
  recognitionCount: 42,
  streakDays: 7,
  points: userStore.getPoints || 1280
});

// 成就列表
const achievements = ref(userStore.getAchievements || [
  {
    id: 1,
    name: t('profile.wasteSortingExpert'),
    icon: '🏅',
    date: '2025-06-15'
  },
  {
    id: 2,
    name: t('profile.continuousUsage'),
    icon: '🔥',
    date: '2025-06-14'
  },
  {
    id: 3,
    name: t('profile.knowledgeCompetitionWinner'),
    icon: '🎯',
    date: '2025-06-10'
  }
]);

// 最近活动
  const recentActivities = ref([
    {
      id: 1,
      icon: '🔍',
      text: t('profile.recognizedPlasticBottle'),
      time: `${t('profile.today')} 14:30`
    },
    {
      id: 2,
      icon: '📚',
      text: t('profile.learnedWasteKnowledge'),
      time: `${t('profile.yesterday')} 09:45`
    },
    {
      id: 3,
      icon: '🎮',
      text: t('profile.participatedDailyChallenge'),
      time: t('profile.daysAgo').replace('{days}', '2')
    },
    {
      id: 4,
      icon: '🏆',
      text: t('profile.earnedWasteSortingAchievement'),
      time: t('profile.daysAgo').replace('{days}', '3')
    }
  ]);

// 页面加载时获取用户资料
onMounted(async () => {
  // 初始化用户状态
  await userStore.initializeUser();
  // 获取最新的用户资料
  await fetchUserProfile();
});

// 获取用户资料
const fetchUserProfile = async () => {
  const success = await userStore.fetchUserProfile();
  if (success) {
    // 更新本地状态
    userInfo.value = userStore.getUserInfo;
    userStats.value.points = userStore.getPoints;
    
    // 获取成就数据并进行翻译处理
    const storeAchievements = userStore.getAchievements;
    if (storeAchievements && storeAchievements.length > 0) {
      // 对每个成就的名称进行翻译
      achievements.value = storeAchievements.map(achievement => {
        // 根据成就名称匹配对应的翻译键
        let translatedName = achievement.name;
        if (achievement.name === '垃圾分类新手') {
          translatedName = t('profile.wasteSortingExpert');
        } else if (achievement.name === '每日签到达人') {
          translatedName = t('profile.continuousUsage');
        } else if (achievement.name === '知识渊博') {
          translatedName = t('profile.knowledgeCompetitionWinner');
        }
        
        return {
          ...achievement,
          name: translatedName
        };
      });
    }
  }
};

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

// 头像选项
const avatarOptions = ['👤', '👩', '👨', '👧', '👦', '🌱', '♻️', '🌍'];

// 编辑表单数据
const editName = ref('');
const editEmail = ref('');
const editCity = ref('');
const editAvatar = ref('');

// 语言设置相关状态
const showLanguageModal = ref(false);
const selectedLanguage = ref(i18nStore.getLocale);

// 导航到指定路由
const navigateTo = (routeName) => {
  if (routeName !== route.name) {
    router.push({ name: routeName });
  }
};

// 编辑个人资料
const editProfile = () => {
  editName.value = userInfo.value.name;
  editEmail.value = userInfo.value.email;
  editCity.value = userInfo.value.city;
  editAvatar.value = userInfo.value.avatar;
  showEditProfileModal.value = true;
};

// 关闭编辑资料弹窗
const closeEditProfileModal = () => {
  showEditProfileModal.value = false;
};

// 选择头像
const selectAvatar = (avatar) => {
  editAvatar.value = avatar;
};

// 保存个人资料更改
const saveProfileChanges = () => {
  // 更新本地状态
  userInfo.value.name = editName.value;
  userInfo.value.city = editCity.value;
  userInfo.value.avatar = editAvatar.value;
  
  // 更新store中的用户信息
  userStore.updateUserInfo({
    name: editName.value,
    city: editCity.value,
    avatar: editAvatar.value
  });
  
  closeEditProfileModal();
  popupManager.success('个人资料已更新！');
};

// 打开语言设置
const openLanguageSettings = () => {
  selectedLanguage.value = i18nStore.getLocale;
  showLanguageModal.value = true;
};

// 关闭语言设置弹窗
const closeLanguageModal = () => {
  showLanguageModal.value = false;
};

// 保存语言设置
const saveLanguageSettings = () => {
  if (selectedLanguage.value !== i18nStore.getLocale) {
    i18nStore.setLocale(selectedLanguage.value);
    popupManager.success('语言设置已更新！');
  }
  closeLanguageModal();
};

// 打开通知设置
const openNotificationSettings = () => {
  console.log('Open notification settings');
};

// 打开隐私设置
const openPrivacySettings = () => {
  console.log('Open privacy settings');
};

// 打开帮助中心
const openHelpCenter = () => {
  console.log('Open help center');
};

// 退出登录
const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout();
    router.push({ name: 'Login' });
  }
};
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #64408b 0%, #1b5bc9 100%);
  color: white;
  padding-bottom: 80px;
}



.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.user-info-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 30px;
    backdrop-filter: blur(10px);
    position: relative;
  }

.user-avatar {
    margin-bottom: 15px;
  }

.avatar-icon {
  font-size: 80px;
}

.user-details {
    text-align: center;
    margin-bottom: 15px;
    width: 100%;
  }

.user-details h2 {
  margin: 0 0 5px 0;
  font-size: 24px;
  font-weight: bold;
}

.user-email {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.user-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.edit-profile-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.edit-profile-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
}

.view-all-btn {
  background: none;
  border: none;
  color: #ffd700;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.achievements {
  margin-bottom: 30px;
}

.achievements-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
  /* 隐藏横向滚动条但保持滚动功能 */
  -ms-overflow-style: none;  /* IE 和 Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Chrome、Safari 和 Opera */
.achievements-list::-webkit-scrollbar {
  display: none;
}

.achievement-item {
  flex: 0 0 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  backdrop-filter: blur(10px);
}

.achievement-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.achievement-info {
  text-align: center;
}

.achievement-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.achievement-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.recent-activities {
  margin-bottom: 30px;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  backdrop-filter: blur(10px);
}

.activity-icon {
  font-size: 24px;
  margin-right: 15px;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.settings {
  margin-bottom: 20px;
}

.settings h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: bold;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-item {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.setting-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.setting-icon {
  font-size: 20px;
  margin-right: 15px;
}

.setting-text {
  flex: 1;
  font-size: 14px;
}

.setting-arrow {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.setting-item.logout {
  background-color: rgba(255, 0, 0, 0.1);
}

.setting-item.logout:hover {
  background-color: rgba(255, 0, 0, 0.2);
}

/* 为主要内容区域添加底部边距，避免被固定的导航栏遮挡 */
.main-content {
  padding-bottom: 80px;
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
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  color: #999;
}

.avatar-selection {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.avatar-option {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  border: 2px solid #ddd;
  transition: all 0.3s ease;
}

.avatar-option.selected {
  border-color: #6a11cb;
  background-color: #f0e6ff;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.cancel-btn,
.save-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.save-btn {
  background-color: #6a11cb;
  color: white;
}

.save-btn:hover {
  background-color: #5a0db0;
}
/* 语言选择弹窗样式 */
.language-selection {
  margin: 20px 0;
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-option:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.language-option.selected {
  background-color: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.language-code {
  font-weight: bold;
  margin-right: 10px;
}

.language-name {
  flex: 1;
}

.language-check {
  font-size: 20px;
  color: #4CAF50;
}
</style>