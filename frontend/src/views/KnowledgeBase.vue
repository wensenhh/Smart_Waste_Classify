<template>
  <div class="knowledge-base-container">
    <!-- 顶部搜索栏 -->
    <Header 
      mode="search"
      :searchPlaceholder="$t('knowledge.searchPlaceholder')"
      :initialSearchQuery="searchQuery"
      @search="handleSearch"
      @search-input="handleSearch"
    />



    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 分类标签 -->
      <section class="category-tabs">
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
      <section class="knowledge-list">
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
              :class="getTypeClass(item.type)"
            >
              {{ item.type }}
            </div>
          </div>
          <div class="item-content">
            {{ truncateText(item.description, 80) }}
          </div>
          <div class="item-footer">
            <span class="item-source">来源：{{ item.source }}</span>
            <span class="item-view-count">{{ item.viewCount }} 次浏览</span>
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
            :class="getTypeClass(selectedKnowledgeItem.type)"
          >
            {{ selectedKnowledgeItem.type }}
          </div>
          <div class="detail-description">
            {{ selectedKnowledgeItem.description }}
          </div>
          <div class="detail-content">
            <h4>处理方法</h4>
            <p>{{ selectedKnowledgeItem.treatment }}</p>
          </div>
          <div class="detail-content">
            <h4>注意事项</h4>
            <p>{{ selectedKnowledgeItem.precautions }}</p>
          </div>
          <div class="detail-footer">
            <span class="detail-source">来源：{{ selectedKnowledgeItem.source }}</span>
            <span class="detail-date">更新时间：{{ selectedKnowledgeItem.updateDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import BottomNavBar from '../components/BottomNavBar.vue';
import Header from '../components/Header.vue';

export default {
  name: 'KnowledgeBase',
  components: {
    NavBar,
    BottomNavBar,
    Header
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const searchQuery = ref('');
    const selectedCategory = ref('all');
    const selectedKnowledgeItem = ref(null);

    // 分类列表
    const categories = [
      { id: 'all', name: '全部' },
      { id: 'recyclable', name: '可回收物' },
      { id: 'kitchen', name: '厨余垃圾' },
      { id: 'hazardous', name: '有害垃圾' },
      { id: 'other', name: '其他垃圾' }
    ];

    // 模拟知识库数据
    const knowledgeItems = ref([
      {
        id: 1,
        name: '塑料瓶',
        type: '可回收物',
        category: 'recyclable',
        description: '塑料瓶是日常生活常见的可回收物品，主要由PET塑料制成。回收后可以通过再加工制成新的塑料制品，减少资源浪费和环境污染。',
        treatment: '使用后请清洗干净，去除瓶盖和标签，投入蓝色可回收物垃圾桶。',
        precautions: '避免将污染严重的塑料瓶投入可回收垃圾桶，否则可能影响回收质量。',
        source: '环保部门',
        viewCount: 1250,
        updateDate: '2025-05-10'
      },
      {
        id: 2,
        name: '香蕉皮',
        type: '厨余垃圾',
        category: 'kitchen',
        description: '香蕉皮属于厨余垃圾，含有丰富的有机物，可以通过堆肥等方式进行资源化利用。',
        treatment: '投入绿色厨余垃圾垃圾桶，或用于家庭堆肥。',
        precautions: '如果香蕉皮已经发霉或腐烂，仍属于厨余垃圾，但建议尽快处理。',
        source: '环保部门',
        viewCount: 980,
        updateDate: '2025-04-25'
      },
      {
        id: 3,
        name: '废电池',
        type: '有害垃圾',
        category: 'hazardous',
        description: '废电池中含有汞、镉、铅等重金属，随意丢弃会对土壤和水源造成严重污染，应按照有害垃圾进行分类投放。',
        treatment: '投入红色有害垃圾专用垃圾桶，或送到专门的电池回收点。',
        precautions: '不要将废电池与其他垃圾混合，避免电池破损导致有害物质泄漏。',
        source: '环保部门',
        viewCount: 2300,
        updateDate: '2025-06-01'
      },
      {
        id: 4,
        name: '纸巾',
        type: '其他垃圾',
        category: 'other',
        description: '纸巾虽然由纸制成，但由于其吸水性强，回收价值低，且可能含有细菌和污染物，通常被归类为其他垃圾。',
        treatment: '投入灰色其他垃圾垃圾桶。',
        precautions: '不要将清洁后的纸巾误认为可回收物，目前大多数纸巾都属于其他垃圾。',
        source: '环保部门',
        viewCount: 1850,
        updateDate: '2025-05-20'
      },
      {
        id: 5,
        name: '旧报纸',
        type: '可回收物',
        category: 'recyclable',
        description: '旧报纸是优质的可回收资源，回收后可以制成再生纸，减少对树木的砍伐。',
        treatment: '整理平整，投入蓝色可回收物垃圾桶，或送到回收站。',
        precautions: '避免将油污或潮湿的报纸投入可回收垃圾桶，会影响回收质量。',
        source: '环保部门',
        viewCount: 1420,
        updateDate: '2025-05-05'
      },
      {
        id: 6,
        name: '剩饭菜',
        type: '厨余垃圾',
        category: 'kitchen',
        description: '剩饭菜属于典型的厨余垃圾，含有大量的有机物，可以通过生物处理转化为肥料或能源。',
        treatment: '沥干水分后投入绿色厨余垃圾垃圾桶，或使用家用厨余垃圾处理器。',
        precautions: '避免将骨头、贝壳等坚硬物体与剩饭菜混合，可能会损坏处理设备。',
        source: '环保部门',
        viewCount: 2100,
        updateDate: '2025-04-15'
      }
    ]);

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

    // 过滤后的知识列表
    const filteredKnowledgeItems = computed(() => {
      let filtered = knowledgeItems.value;
      
      // 根据分类过滤
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(item => item.category === selectedCategory.value);
      }
      
      // 根据搜索关键词过滤
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim().toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    });

    // 处理搜索
    const handleSearch = () => {
      // 搜索逻辑已在computed中处理
    };

    // 选择分类
    const selectCategoryHandler = (categoryId) => {
      selectedCategory.value = categoryId;
    };

    // 查看知识详情
    const viewKnowledgeDetail = (item) => {
      selectedKnowledgeItem.value = item;
      // 增加浏览次数
      item.viewCount++;
    };

    // 关闭知识详情
    const closeKnowledgeDetail = () => {
      selectedKnowledgeItem.value = null;
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
      if (text.length <= length) {
        return text;
      }
      return text.substring(0, length) + '...';
    };

    return {
      searchQuery,
      selectedCategory,
      selectedKnowledgeItem,
      categories,
      knowledgeItems,
      navItems,
      filteredKnowledgeItems,
      handleSearch,
      selectCategoryHandler,
      viewKnowledgeDetail,
      closeKnowledgeDetail,
      navigateTo,
      getTypeClass,
      truncateText,
      route
    };
  }
};
</script>

<style scoped>
.knowledge-base-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
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
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
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