<template>
  <!-- 底部导航栏 -->
  <nav class="bottom-nav">
    <div 
      v-for="item in navItems"
      :key="item.name"
      class="nav-item"
      :class="{ active: $route.name === item.route }"
      @click="navigateTo(item.route)"
    >
      <div class="nav-icon">{{ item.icon }}</div>
      <div class="nav-text">{{ $t(item.label) }}</div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  // 可以通过props自定义导航项，默认为空数组
  customNavItems: {
    type: Array,
    default: () => []
  }
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// 默认导航项
const defaultNavItems = [
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

// 如果提供了自定义导航项，则使用自定义的，否则使用默认的
const navItems = props.customNavItems.length > 0 ? props.customNavItems : defaultNavItems;

// 导航到指定路由
const navigateTo = (routeName) => {
  if (routeName !== route.name) {
    router.push({ name: routeName });
  }
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #42b983;
}

.nav-item.active {
  color: #42b983;
  font-weight: 500;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-text {
  font-size: 12px;
}
</style>