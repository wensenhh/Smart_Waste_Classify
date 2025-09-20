<template>
  <div class="knowledge-base-container">
    <!-- 顶部搜索栏 -->
    <Header 
      mode="search"
      :searchPlaceholder="$t('knowledge.searchPlaceholder')"
      :initialSearchQuery="searchQuery"
      @search="handleSearch"
    />

    <!-- 错误消息 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button class="retry-btn" @click="handleRetry">重试</button>
    </div>



    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 加载状态 -->
      <div v-if="loading && filteredKnowledgeItems.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>

      <!-- 分类标签 -->
      <section v-if="!loading || filteredKnowledgeItems.length > 0" class="category-tabs">
        <button 
          v-for="category in categories"
          :key="category.id"
          class="category-tab"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategoryHandler(category.id)"
        >
          {{ category.name }}
        </button>
      </section>

      <!-- 知识列表 -->
      <section v-if="!loading || filteredKnowledgeItems.length > 0" class="knowledge-list">
        <div 
          v-for="item in filteredKnowledgeItems"
          :key="item.id"
          class="knowledge-item"
          @click="viewKnowledgeDetail(item)"
        >
          <div class="item-header">
            <div class="item-title">{{ item.name }}</div>
            <div 
              class="item-type-badge"
              :class="getTypeClass(item.type || item.category?.name)"
            >
              {{ item.type || item.category?.name }}
            </div>
          </div>
          <div class="item-content">
            {{ truncateText(item.description, 80) }}
          </div>
          <div class="item-footer">
            <span class="item-source">来源：{{ item.source || '系统数据' }}</span>
            <span class="item-view-count">{{ item.viewCount || 0 }} 次浏览</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredKnowledgeItems.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <div class="empty-text">暂无相关知识</div>
          <div class="empty-hint">请尝试其他搜索关键词或分类</div>
        </div>
      </section>
    </main>
    
    <BottomNavBar />

    <!-- 知识详情弹窗 -->
    <div v-if="selectedKnowledgeItem" class="modal-overlay" @click="closeKnowledgeDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedKnowledgeItem.name }}</h3>
          <button class="modal-close-btn" @click="closeKnowledgeDetail" aria-label="关闭">
            <span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <div 
            class="detail-type-badge"
            :class="getTypeClass(selectedKnowledgeItem.type || selectedKnowledgeItem.category?.name)"
          >
            {{ selectedKnowledgeItem.type || selectedKnowledgeItem.category?.name }}
          </div>
          <div class="detail-description">
            {{ selectedKnowledgeItem.description }}
          </div>
          <div class="detail-content">
            <h4>处理方法</h4>
            <p>{{ selectedKnowledgeItem.treatment || selectedKnowledgeItem.suggestion || '暂无相关信息' }}</p>
          </div>
          <div class="detail-content">
            <h4>注意事项</h4>
            <p>{{ selectedKnowledgeItem.precautions || '暂无相关信息' }}</p>
          </div>
          <div class="detail-footer">
            <span class="detail-source">来源：{{ selectedKnowledgeItem.source || '系统数据' }}</span>
            <span class="detail-date">更新时间：{{ selectedKnowledgeItem.updateDate || '暂无' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import BottomNavBar from '../components/BottomNavBar.vue';
import Header from '../components/Header.vue';
import wasteApi from '../services/wasteApi';

const router = useRouter();
const route = useRoute();
const searchQuery = ref('');
const selectedCategory = ref('all');
const selectedKnowledgeItem = ref(null);
const loading = ref(false);
const error = ref('');

// 重试操作
const handleRetry = async () => {
  await fetchCategories();
  await fetchKnowledgeItems(selectedCategory.value, searchQuery.value);
};

// 分类列表
const categories = ref([
  { id: 'all', name: '全部' }
]);

// 知识库数据
const knowledgeItems = ref([]);
const filteredKnowledgeItems = ref([]);

// 从API获取分类列表
const fetchCategories = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await wasteApi.knowledge.getCategories();
    
    // 检查response.data是否存在并且是一个对象
    if (response.data && typeof response.data === 'object') {
      // 使用Object.values()获取对象的所有值，然后进行迭代
      Object.values(response.data).forEach(category => {
        // 确保category是有效的对象
        if (category && category.name) {
          categories.value.push({
            id: category.slug || category.id,
            name: category.name
          });
        }
      });
      console.log('Categories loaded:', categories.value);
      // 在分类列表加载完成后，自动使用第一个分类的ID请求垃圾类别详情接口
      if (categories.value.length > 0) {
        // 设置第一个分类为当前选中分类
        selectedCategory.value = categories.value[0].id;
        // 请求第一个分类的垃圾详情
        await fetchKnowledgeItems(selectedCategory.value);
      }
    }
  } catch (err) {
    error.value = '获取分类列表失败，请稍后重试';
    console.error('Failed to fetch categories:', err);
  } finally {
    loading.value = false;
  }
};

// 从API获取知识库数据
const fetchKnowledgeItems = async (categoryId = 'all', keyword = '') => {
  try {
    loading.value = true;
    error.value = '';
    
    // 统一调用接口，传递categoryId参数和keyword参数
    const response = await wasteApi.knowledge.getCategoryBySlug(categoryId, keyword.trim());
    // 直接使用response.data，因为后端返回的就是数组
    filteredKnowledgeItems.value = Array.isArray(response.data) ? response.data : [];
  
  } catch (err) {
    error.value = '获取知识库数据失败，请稍后重试';
    console.error('Failed to fetch knowledge items:', err);
    filteredKnowledgeItems.value = [];
  } finally {
    loading.value = false;
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

// 处理搜索
const handleSearch = async (searchValue) => {
  // 如果Header组件传递了搜索值，则使用该值；否则使用当前的searchQuery.value
  const keyword = searchValue !== undefined ? searchValue : searchQuery.value;
  await fetchKnowledgeItems(selectedCategory.value, keyword);
};

// 选择分类
const selectCategoryHandler = async (categoryId) => {
  selectedCategory.value = categoryId;
  await fetchKnowledgeItems(categoryId, searchQuery.value);
};

// 查看知识详情
const viewKnowledgeDetail = async (item) => {
  try {
    // 使用API获取完整的垃圾详情
    const response = await wasteApi.knowledge.getWasteItemById(item.id);
    selectedKnowledgeItem.value = response.data;
  } catch (err) {
    console.error('Failed to fetch waste item details:', err);
    // 如果API调用失败，使用传入的item数据作为备选
    selectedKnowledgeItem.value = item;
  }
};

// 关闭知识详情
const closeKnowledgeDetail = () => {
  selectedKnowledgeItem.value = null;
  console.log('closeKnowledgeDetail', selectedKnowledgeItem.value);
};

// 导航到指定路由
const navigateTo = (routeName) => {
  if (routeName !== route.name) {
    router.push({ name: routeName });
  }
};

// 获取类型样式类
const getTypeClass = (type) => {
  const typeMap = {
    '可回收物': 'recyclable',
    '厨余垃圾': 'kitchen',
    '有害垃圾': 'hazardous',
    '其他垃圾': 'other'
  };
  return typeMap[type] || 'other';
};

// 截断文本
const truncateText = (text, length) => {
  if (!text) return '';
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length) + '...';
};

// 初始化数据
onMounted(async () => {
  // 只获取分类数据，不自动加载垃圾信息
  await fetchCategories();
});
</script>

<style scoped>
.knowledge-base-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

/* 错误消息样式 */
.error-message {
  background-color: rgba(244, 67, 54, 0.2);
  color: white;
  padding: 12px 20px;
  margin: 0 20px;
  border-radius: 8px;
  border: 1px solid rgba(244, 67, 54, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.retry-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-1px);
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.main-content {
  flex: 1;
  padding: 20px;
  padding-bottom: 80px;
  overflow-y: auto;
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.category-tab {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab.active {
  background-color: white;
  color: #667eea;
  font-weight: bold;
}

.category-tab:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.3);
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.knowledge-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.knowledge-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.item-title {
  font-size: 18px;
  font-weight: bold;
  flex: 1;
  margin-right: 10px;
}

.item-type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
}

.item-content {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-text {
  font-size: 20px;
  margin-bottom: 10px;
  opacity: 0.8;
}

.empty-hint {
  font-size: 14px;
  opacity: 0.6;
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
  z-index: 1001; /* 确保按钮在最上层 */
  position: relative; /* 为z-index生效 */
  outline: none; /* 移除默认轮廓 */
}

.modal-close-btn:hover,
.modal-close-btn:focus {
  background-color: #f5f5f5;
  color: #333;
}

.modal-close-btn:active {
  transform: scale(0.95); /* 添加点击效果 */
}

.modal-close-btn span {
  pointer-events: none; /* 确保点击span也触发按钮事件 */
}

.modal-body {
  padding: 20px;
}

.detail-type-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
}

.detail-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content h4 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.detail-content p {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #999;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 类型标签样式 */
.item-type-badge.recyclable,
.detail-type-badge.recyclable {
  background-color: #4CAF50;
  color: white;
}

.item-type-badge.kitchen,
.detail-type-badge.kitchen {
  background-color: #FFC107;
  color: white;
}

.item-type-badge.hazardous,
.detail-type-badge.hazardous {
  background-color: #F44336;
  color: white;
}

.item-type-badge.other,
.detail-type-badge.other {
  background-color: #9E9E9E;
  color: white;
}
</style>