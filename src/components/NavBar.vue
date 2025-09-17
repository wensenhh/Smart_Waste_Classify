<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- 左侧Logo和标题 -->
      <div class="navbar-brand">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 6V22" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 6H4" stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="brand-title">{{ $t('app.title') }}</h1>
      </div>
      
      <!-- 中间导航链接 - 桌面版 -->
      <ul class="navbar-links" v-if="!isMobile">
        <li class="nav-item">
          <router-link :to="{ name: 'Home' }" :class="{ active: $route.name === 'Home' }" class="nav-link">
            {{ $t('common.home') }}
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'KnowledgeBase' }" :class="{ active: $route.name === 'KnowledgeBase' }" class="nav-link">
            {{ $t('common.knowledgeBase') }}
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'InteractionCenter' }" :class="{ active: $route.name === 'InteractionCenter' }" class="nav-link">
            {{ $t('common.interactionCenter') }}
          </router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{ name: 'Education' }" :class="{ active: $route.name === 'Education' }" class="nav-link">
            {{ $t('common.education') }}
          </router-link>
        </li>
      </ul>
      
      <!-- 右侧操作区 -->
      <div class="navbar-actions">
        <!-- 语言切换 -->
        <div class="language-switcher">
          <button 
            v-for="(lang, index) in availableLanguages" 
            :key="lang.code"
            @click="switchLanguage(lang.code)"
            :class="['language-btn', { active: currentLanguage === lang.code }]"
          >
            {{ lang.name }}
          </button>
        </div>
        
        <!-- 用户信息/登录按钮 -->
        <div class="user-menu">
          <template v-if="user.isLoggedIn">
            <div class="user-avatar" @click="toggleUserMenu">
              <img :src="user.avatar || defaultAvatar" alt="User Avatar">
              <span class="user-name">{{ user.username }}</span>
            </div>
            <!-- 用户下拉菜单 -->
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link :to="{ name: 'Profile' }" class="dropdown-item" @click="toggleUserMenu">
                {{ $t('common.profile') }}
              </router-link>
              <button class="dropdown-item" @click="handleLogout">
                {{ $t('profile.logout') }}
              </button>
            </div>
          </template>
          <template v-else>
            <router-link :to="{ name: 'Login' }" class="btn-secondary">
              登录
            </router-link>
          </template>
        </div>
        
        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" v-if="isMobile">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 移动端下拉菜单 -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <ul class="mobile-links">
        <li class="mobile-item">
          <router-link :to="{ name: 'Home' }" :class="{ active: $route.name === 'Home' }" class="mobile-link" @click="toggleMobileMenu">
            {{ $t('common.home') }}
          </router-link>
        </li>
        <li class="mobile-item">
          <router-link :to="{ name: 'KnowledgeBase' }" :class="{ active: $route.name === 'KnowledgeBase' }" class="mobile-link" @click="toggleMobileMenu">
            {{ $t('common.knowledgeBase') }}
          </router-link>
        </li>
        <li class="mobile-item">
          <router-link :to="{ name: 'InteractionCenter' }" :class="{ active: $route.name === 'InteractionCenter' }" class="mobile-link" @click="toggleMobileMenu">
            {{ $t('common.interactionCenter') }}
          </router-link>
        </li>
        <li class="mobile-item">
          <router-link :to="{ name: 'Education' }" :class="{ active: $route.name === 'Education' }" class="mobile-link" @click="toggleMobileMenu">
            {{ $t('common.education') }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import router from '../router'

export default {
  name: 'NavBar',
  setup() {
    const userStore = useUserStore()
    const { locale, t } = useI18n()
    
    // 响应式状态
    const isMobile = ref(false)
    const showMobileMenu = ref(false)
    const showUserMenu = ref(false)
    const currentLanguage = ref(locale.value)
    
    // 默认头像
    const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDBDQUY1IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnMyLjQ4IDEwIDYgMTAgNi0xMCA2LTEwLTIuNDgtMTAtNi0xMFoiIGZpbGw9Im5vbmUiPgogICAgPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iMiIgZmlsbD0id2hpdGUiPgogICAgPC9yZWN0PgogIDwvcGF0aD4KICA8dGV4dCB4PSIxMiIgeT0iMTkiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgc3Ryb2tlPSIjMjEyMTIxIj5Vc2VyPC90ZXh0Pgo8L3N2Zz4='
    
    // 可用语言
    const availableLanguages = [
      { code: 'zh', name: '中' },
      { code: 'en', name: 'EN' },
      { code: 'ms', name: 'MS' }
    ]
    
    // 计算属性
    const user = computed(() => ({
      isLoggedIn: userStore.isLoggedIn,
      username: userStore.username,
      avatar: userStore.avatar
    }))
    
    // 检测窗口大小
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768
      if (window.innerWidth >= 768) {
        showMobileMenu.value = false
      }
    }
    
    // 切换语言
    const switchLanguage = (langCode) => {
      locale.value = langCode
      currentLanguage.value = langCode
      localStorage.setItem('preferredLanguage', langCode)
    }
    
    // 切换移动端菜单
    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value
    }
    
    // 切换用户菜单
    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
    }
    
    // 处理登出
    const handleLogout = async () => {
      await userStore.logout()
      showUserMenu.value = false
      router.push({ name: 'Login' })
    }
    
    // 点击外部关闭菜单
    const handleClickOutside = (event) => {
      const navbar = document.querySelector('.navbar')
      if (!navbar.contains(event.target)) {
        showUserMenu.value = false
        showMobileMenu.value = false
      }
    }
    
    // 生命周期钩子
    onMounted(() => {
      handleResize()
      window.addEventListener('resize', handleResize)
      document.addEventListener('click', handleClickOutside)
      
      // 从本地存储恢复语言设置
      const savedLang = localStorage.getItem('preferredLanguage')
      if (savedLang) {
        switchLanguage(savedLang)
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('click', handleClickOutside)
    })
    
    return {
      user,
      isMobile,
      showMobileMenu,
      showUserMenu,
      currentLanguage,
      availableLanguages,
      defaultAvatar,
      switchLanguage,
      toggleMobileMenu,
      toggleUserMenu,
      handleLogout,
      t
    }
  }
}
</script>

<style scoped>
/* 导航栏基础样式 */
.navbar {
  background-color: var(--background-primary);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
}

/* Logo和标题 */
.navbar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--primary-color);
  margin: 0;
}

/* 导航链接 - 桌面版 */
.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  list-style: none;
}

.nav-item {
  position: relative;
}

.nav-link {
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  font-weight: 500;
  padding: var(--spacing-sm) 0;
  position: relative;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.active {
  color: var(--primary-color);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  border-radius: 1px;
}

/* 导航操作区 */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

/* 语言切换器 */
.language-switcher {
  display: flex;
  background-color: var(--background-secondary);
  border-radius: var(--border-radius-medium);
  padding: 2px;
}

.language-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  border-radius: var(--border-radius-small);
  transition: all var(--transition-fast);
}

.language-btn:hover {
  background-color: var(--primary-transparent);
}

.language-btn.active {
  background-color: var(--primary-color);
  color: var(--text-light);
}

/* 用户菜单 */
.user-menu {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-medium);
  transition: background-color var(--transition-fast);
}

.user-avatar:hover {
  background-color: var(--background-secondary);
}

.user-avatar img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: var(--background-primary);
  border-radius: var(--border-radius-medium);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xs) 0;
  min-width: 150px;
  margin-top: var(--spacing-xs);
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--background-secondary);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  padding: var(--spacing-xs);
  cursor: pointer;
}

/* 移动端下拉菜单 */
.mobile-menu {
  background-color: var(--background-primary);
  box-shadow: var(--shadow-md);
}

.mobile-links {
  list-style: none;
  padding: var(--spacing-md) 0;
}

.mobile-item {
  border-bottom: 1px solid var(--border-color);
}

.mobile-item:last-child {
  border-bottom: none;
}

.mobile-link {
  display: block;
  padding: var(--spacing-md) var(--spacing-xl);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.mobile-link:hover {
  background-color: var(--background-secondary);
  color: var(--primary-color);
}

.mobile-link.active {
  background-color: var(--primary-transparent);
  color: var(--primary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: var(--spacing-md);
  }
  
  .navbar-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .language-switcher {
    display: none;
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: var(--font-size-md);
  }
  
  .navbar-actions {
    gap: var(--spacing-sm);
  }
}
</style>