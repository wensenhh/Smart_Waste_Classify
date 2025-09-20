<template>
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

    <!-- 自定义模式 -->
    <template v-else>
      <slot></slot>
    </template>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  // 模式：title | search | custom
  mode: {
    type: String,
    default: 'title',
    validator: (value) => ['title', 'search', 'custom'].includes(value)
  },
  // 标题文本
  title: {
    type: String,
    default: ''
  },
  // Logo路径
  logo: {
    type: String,
    default: '/vite.svg'
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
  }
});

const emit = defineEmits(['search', 'search-input']);

const searchQuery = ref(props.initialSearchQuery);

// 处理搜索
const handleSearch = () => {
  emit('search', searchQuery.value);
};
</script>

<style scoped>
.header {
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
</style>