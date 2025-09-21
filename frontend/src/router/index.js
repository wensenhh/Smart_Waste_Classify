import { createRouter, createWebHistory } from 'vue-router';

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {    path: '/recognition-result/:id?',    name: 'RecognitionResult',    component: () => import('../views/RecognitionResult.vue'),    meta: {      title: '识别结果',      requiresAuth: false    }  },
  {
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: () => import('../views/KnowledgeBase.vue'),
    meta: {
      title: '分类知识库',
      requiresAuth: false
    }
  },
  {
    path: '/interaction-center',
    name: 'InteractionCenter',
    component: () => import('../views/InteractionCenter.vue'),
    meta: {
      title: '互动中心',
      requiresAuth: false
    }
  },
  {
    path: '/education',
    name: 'Education',
    component: () => import('../views/Education.vue'),
    meta: {
      title: '宣传教育',
      requiresAuth: false
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: false
    }
  },
  {
    path: '/daily-question',
    name: 'DailyQuestion',
    component: () => import('../views/DailyQuestion.vue'),
    meta: {
      title: '每日一答',
      requiresAuth: false
    }
  },
  {
    path: '/challenge-question',
    name: 'ChallengeQuestion',
    component: () => import('../views/ChallengeQuestion.vue'),
    meta: {
      title: '闯关答题',
      requiresAuth: false
    }
  },
  {
    path: '/community-share',
    name: 'CommunityShare',
    component: () => import('../views/CommunityShare.vue'),
    meta: {
      title: '社区分享',
      requiresAuth: false
    }
  },
  {    path: '/green-activities',    name: 'GreenActivities',    component: () => import('../views/GreenActivities.vue'),    meta: {
      title: '环保活动',
      requiresAuth: false
    }
  },
  {
    path: '/map-view',
    name: 'MapView',
    component: () => import('../views/MapView.vue'),
    meta: {
      title: '垃圾点位地图',
      requiresAuth: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '智能垃圾分类系统';
  
  // 处理路由前置逻辑
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录
    const isLoggedIn = localStorage.getItem('userInfo') !== null;
    if (isLoggedIn) {
      next();
    } else {
      // 重定向到登录页
      next('/login');
    }
  } else {
    next();
  }
});

export default router;