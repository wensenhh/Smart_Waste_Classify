<template>
  <div style="width: 100%;">
  <header class="header">
    <!-- 标题模式 -->
    <template v-if="mode === 'title'">
      <div class="title-section">
        <img v-if="logo" :src="logo" alt="Logo" class="logo" />
        <h1 class="app-title">{{ title || $t('app.title') }}</h1>
      </div>
      <div class="header-actions">
        <slot name="actions"></slot>
      </div>
    </template>

    <!-- 搜索模式 -->
    <template v-else-if="mode === 'search'">
      <div class="search-container">
        <input 
          type="text"
          v-model="searchQuery"
          :placeholder="searchPlaceholder || $t('common.searchPlaceholder')"
          class="search-input"
          @input="$emit('search-input', $event)"
          @keyup.enter="handleSearch"
        />
        <button 
          class="search-btn"
          @click="handleSearch"
          :disabled="loading"
        >
          {{ loading ? $t('common.searching') : $t('common.search') }}
        </button>
      </div>
    </template>

    <!-- 默认header 左侧返回，中间标题名称 -->
    <template v-else-if="mode === 'default'">
      <div class="result-page-header">
        <button class="back-btn" @click="goBack">
          <span class="back-icon" :style="{'color': defaultColor}">←</span>
        </button>
        <h1 class="page-title" :style="{'color': defaultColor}">{{ title }}</h1>
        <div class="header-right"></div>
      </div>
    </template>

    <!-- 自定义模式 -->
    <template v-else>
      <slot></slot>
    </template>
  </header>
  <div style="height: 60px;"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const props = defineProps({
  // 模式：title | search | custom
  mode: {
    type: String,
    default: 'title',
    validator: (value) => ['title', 'search', 'default'].includes(value)
  },
  // 标题文本
  title: {
    type: String,
    default: ''
  },
  // Logo路径
  logo: {
    type: String,
    default: '/logo.svg'
  },
  // 搜索占位符
  searchPlaceholder: {
    type: String,
    default: ''
  },
  // 初始搜索值
  initialSearchQuery: {
    type: String,
    default: ''
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 默认模式的字体颜色
  defaultColor: {
    type: String,
    default: '#fff'
  },
  // 默认模式的标题背景色
  defaultBacColor: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(['search', 'search-input']);

const searchQuery = ref(props.initialSearchQuery);

// 处理搜索
const handleSearch = () => {
  emit('search', searchQuery.value);
};

// 返回上一页
const goBack = () => {
  if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
    window.history.back();
  } else {
    // 如果没有历史记录，导航到首页
    if (typeof router !== 'undefined') {
      router.push({ name: 'Home' });
    }
  }
};

</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  padding: 5px;
}

.app-title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-container {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 600px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  outline: none;
  max-width: 70%;
}

.search-input::placeholder {
  color: #999;
}

.search-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: bold;
  background-color: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 30%;
}

.search-btn:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-1px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 修复Header组件的字体高度居中问题 */
.result-page-header {
  width: 100%;
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: flex-start; /* 从左侧开始布局 */
  box-sizing: border-box;
}

/* 设置固定宽度给返回按钮 */
.back-btn {
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; /* 固定宽度 */
  height: 40px;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

/* 让标题居中显示 */
.page-title {
  margin: 0;
  flex: 1; /* 占据剩余空间 */
  text-align: center; /* 文本内容居中 */
  font-size: 18px; /* 与app-title保持一致的字体大小 */
  font-weight: bold;
}

/* 右侧占位元素，确保标题真正居中 */
.header-right {
  width: 40px; /* 与返回按钮相同的宽度 */
  flex-shrink: 0; /* 防止被压缩 */
}
</style>