<template>
  <div class="green-activities-container">
    <!-- 使用Header组件的默认模式 -->
    <Header mode="default" :title="$t('activities.title')" defaultColor="#000"/>
    <main class="activities-main">
      <!-- 页面标题 -->
      <div class="activities-header">
        <h1>{{ $t('activities.title') }}</h1>
        <p class="activities-subtitle">{{ $t('activities.subtitle') }}</p>
      </div>

      <!-- 活动分类标签 -->
      <div class="activities-filter">
        <div
          v-for="category in activityCategories"
          :key="category.value"
          class="filter-tag"
          :class="{ active: selectedCategory === category.value }"
          @click="selectCategory(category.value)"
        >
          {{ category.label }}
        </div>
      </div>

      <!-- 活动列表 -->
      <div class="activities-list-section">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="filteredActivities.length === 0" class="empty-state">
          <p>{{ $t('activities.noActivities') }}</p>
          <img src="https://picsum.photos/id/1059/400/300" alt="No Activities" class="empty-image" />
        </div>
        <div v-else class="activities-grid">
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="activity-card"
            @click="showActivityDetail(activity.id)"
          >
            <div class="activity-image-container">
              <img :src="activity.imageUrl" alt="{{ activity.title }}" class="activity-image" />
              <div class="activity-date-badge">{{ formatDate(activity.date) }}</div>
            </div>
            <div class="activity-content">
              <div class="activity-category-badge">{{ getCategoryName(activity.category) }}</div>
              <h3 class="activity-title">{{ activity.title }}</h3>
              <p class="activity-location">📍 {{ activity.location }}</p>
              <div class="activity-participants">
                <div class="participants-avatars">
                  <img
                    v-for="(participant, index) in activity.participants"
                    :key="index"
                    :src="participant.avatar"
                    alt="Participant"
                    class="participant-avatar"
                    :style="{ zIndex: activity.participants.length - index }"
                  />
                  <span v-if="activity.participants.length > 4" class="more-participants">
                    +{{ activity.participants.length - 4 }}
                  </span>
                </div>
                <span class="participants-count">{{ activity.participants.length }} {{ $t('activities.participants') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <BottomNavBar />
    <Footer />

    <!-- 活动详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeActivityDetail">
      <div class="activity-detail-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ currentActivity?.title }}</h2>
          <button class="modal-close-btn" @click="closeActivityDetail">
            <span>×</span>
          </button>
        </div>
        <div v-if="currentActivity" class="modal-body">
          <img :src="currentActivity.imageUrl" alt="{{ currentActivity.title }}" class="detail-image" />

          <div class="detail-info">
            <div class="info-row">
              <span class="info-label">{{ $t('activities.date') }}</span>
              <span class="info-value">{{ formatFullDate(currentActivity.date) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('activities.time') }}</span>
              <span class="info-value">{{ currentActivity.time }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('activities.location') }}</span>
              <span class="info-value">{{ currentActivity.location }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('activities.organizer') }}</span>
              <span class="info-value">{{ currentActivity.organizer.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ $t('activities.category') }}</span>
              <span class="info-value">{{ getCategoryName(currentActivity.category) }}</span>
            </div>
          </div>

          <div class="detail-description">
            <h3>{{ $t('activities.description') }}</h3>
            <p>{{ currentActivity.description }}</p>
          </div>

          <div class="detail-participants">
            <h3>{{ $t('activities.participantsList') }} ({{ currentActivity.participants.length }})</h3>
            <div class="participants-list">
              <div v-for="(participant, index) in currentActivity.participants" :key="index" class="participant-item">
                <img :src="participant.avatar" alt="{{ participant.name }}" class="list-avatar" />
                <span class="participant-name">{{ participant.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            class="join-activity-btn"
            :disabled="isUserJoined"
            @click="joinActivity"
          >
            {{ isUserJoined ? $t('activities.joined') : $t('activities.joinNow') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useActivitiesStore } from '../stores/activities';
import { useI18n } from 'vue-i18n';
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
import BottomNavBar from '../components/BottomNavBar.vue';

defineOptions({
  name: 'GreenActivities'
});

const activitiesStore = useActivitiesStore();
const { t } = useI18n();

const loading = ref(false);
const activities = ref([]);
const selectedCategory = ref('all');
const showDetailModal = ref(false);
const currentActivity = ref(null);
const isUserJoined = ref(false);

// 活动分类
const activityCategories = [
  { value: 'all', label: '全部活动' },
  { value: 'cleanup', label: '清洁活动' },
  { value: 'planting', label: '植树活动' },
  { value: 'workshop', label: '环保讲座' },
  { value: 'recycle', label: '回收活动' }
];

// 根据分类筛选活动
const filteredActivities = computed(() => {
  if (selectedCategory.value === 'all') {
    return activities.value;
  }
  return activities.value.filter(activity => activity.category === selectedCategory.value);
});

// 获取活动列表
const fetchActivities = async () => {
  try {
    loading.value = true;
    await activitiesStore.fetchActivities();
    activities.value = activitiesStore.getActivities;
  } catch (error) {
    console.error('获取活动失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择活动分类
const selectCategory = (category) => {
  selectedCategory.value = category;
};

// 显示活动详情
const showActivityDetail = (activityId) => {
  const activity = activities.value.find(item => item.id === activityId);
  if (activity) {
    currentActivity.value = activity;
    // 检查用户是否已参加
    isUserJoined.value = activity.participants.some(p => p.id === 'current_user');
    showDetailModal.value = true;
  }
};

// 关闭活动详情
const closeActivityDetail = () => {
  showDetailModal.value = false;
  currentActivity.value = null;
};

// 参加活动
const joinActivity = async () => {
  if (!currentActivity.value) return;

  try {
    await activitiesStore.joinActivity(currentActivity.value.id);
    isUserJoined.value = true;
    // 更新本地活动数据
    const index = activities.value.findIndex(item => item.id === currentActivity.value.id);
    if (index !== -1) {
      activities.value[index].participants.push({
        id: 'current_user',
        name: '当前用户',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser'
      });
    }
  } catch (error) {
    console.error('参加活动失败:', error);
  }
};

// 获取分类名称
const getCategoryName = (categoryValue) => {
  const category = activityCategories.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

// 格式化日期（仅显示月日）
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 格式化完整日期
const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 组件挂载时获取活动列表
onMounted(() => {
  activitiesStore.initializeActivities();
  fetchActivities();
});
</script>

<style scoped>
.green-activities-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-secondary);
  padding: 60px 0 80px;
}

.activities-main {
  flex: 1;
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.activities-header {
  text-align: center;
  margin-bottom: 30px;
}

.activities-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
  color: var(--primary-text-color);
}

.activities-subtitle {
  font-size: 16px;
  color: var(--secondary-text-color);
}

/* 分类标签样式 */
.activities-filter {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 30px;
}

.filter-tag {
  padding: 8px 16px;
  background-color: white;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.filter-tag.active {
  background-color: var(--primary-color);
  color: white;
}

/* 活动列表样式 */
.activities-list-section {
  margin-bottom: 40px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.activity-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.activity-image-container {
  position: relative;
  height: 180px;
}

.activity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-date-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: var(--primary-color);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
}

.activity-content {
  padding: 16px;
}

.activity-category-badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: rgba(78, 205, 196, 0.1);
  color: var(--primary-color);
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.activity-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: var(--primary-text-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-location {
  font-size: 14px;
  color: var(--secondary-text-color);
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-participants {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.participants-avatars {
  display: flex;
  position: relative;
  margin-right: 8px;
}

.participant-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
}

.participants-avatars img:not(:first-child) {
  margin-left: -8px;
}

.more-participants {
  position: absolute;
  right: -10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #eee;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: var(--secondary-text-color);
}

.participants-count {
  font-size: 14px;
  color: var(--secondary-text-color);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-text-color);
}

.empty-image {
  width: 200px;
  margin-top: 20px;
  opacity: 0.7;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 活动详情弹窗 */
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

.activity-detail-modal {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--primary-text-color);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--secondary-text-color);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 20px;
}

.detail-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 20px;
}

.detail-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 14px;
  color: var(--secondary-text-color);
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--primary-text-color);
}

.detail-description h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--primary-text-color);
}

.detail-description p {
  font-size: 16px;
  line-height: 1.8;
  color: var(--secondary-text-color);
  margin-bottom: 30px;
}

.detail-participants h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: var(--primary-text-color);
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.participant-item {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  padding: 8px 15px;
  border-radius: 20px;
}

.list-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.participant-name {
  font-size: 14px;
  color: var(--primary-text-color);
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.join-activity-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.join-activity-btn:hover:not(:disabled) {
  background-color: var(--primary-color-hover);
}

.join-activity-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .activities-main {
    padding: var(--spacing-md);
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-image-container {
    height: 150px;
  }
  
  .detail-image {
    height: 200px;
  }
  
  .detail-info {
    grid-template-columns: 1fr;
  }
}
</style>