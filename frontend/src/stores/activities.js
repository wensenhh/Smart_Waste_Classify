// 环保活动状态管理store
import { defineStore } from 'pinia';

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: [],
    filteredActivities: [],
    currentActivity: null,
    loading: false,
    error: null,
    registrationStatus: new Map(), // 存储用户报名的活动ID和状态
    currentFilter: 'all' // 默认显示所有活动
  }),

  getters: {
    // 获取所有活动
    getAllActivities: (state) => state.activities,
    // 获取筛选后的活动
    getFilteredActivities: (state) => state.filteredActivities,
    // 获取当前活动详情
    getCurrentActivity: (state) => state.currentActivity,
    // 获取活动分类列表
    getActivityCategories: (state) => {
      const categories = new Set(['all']);
      state.activities.forEach(activity => {
        categories.add(activity.category);
      });
      return Array.from(categories);
    },
    // 判断活动是否已报名
    isRegistered: (state) => (activityId) => {
      return state.registrationStatus.has(activityId);
    },
    // 获取活动报名状态
    getRegistrationStatus: (state) => (activityId) => {
      return state.registrationStatus.get(activityId) || null;
    }
  },

  actions: {
    // 初始化活动数据
    initializeActivities() {
      const savedActivities = localStorage.getItem('greenActivities');
      if (savedActivities) {
        this.activities = JSON.parse(savedActivities);
        this.filteredActivities = [...this.activities];
      } else {
        // 生成模拟活动数据
        this.generateMockActivities();
      }

      const savedRegistrations = localStorage.getItem('activityRegistrations');
      if (savedRegistrations) {
        const registrations = JSON.parse(savedRegistrations);
        registrations.forEach(item => {
          this.registrationStatus.set(item.activityId, item.status);
        });
      }
    },

    // 生成模拟活动数据
    generateMockActivities() {
      const mockOrganizers = [
        { id: 'org1', name: '绿色环保协会', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=org1' },
        { id: 'org2', name: '城市清洁行动队', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=org2' },
        { id: 'org3', name: '垃圾分类推广中心', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=org3' },
        { id: 'org4', name: '环保志愿者联盟', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=org4' }
      ];

      const mockActivities = [
        {
          id: 'act1',
          title: '社区垃圾分类宣传活动',
          description: '在社区内开展垃圾分类知识宣传，发放宣传册和环保袋，现场指导居民正确分类垃圾。',
          organizer: mockOrganizers[0],
          category: 'education',
          date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3天后
          location: '阳光社区活动中心',
          address: '城市中心区阳光路123号',
          startTime: '09:00',
          endTime: '11:30',
          imageUrl: 'https://picsum.photos/id/1015/800/400',
          participants: 42,
          maxParticipants: 100,
          contactInfo: '13800138000',
          requirement: '无需经验，热心环保即可',
          tags: ['垃圾分类', '社区活动', '知识宣传']
        },
        {
          id: 'act2',
          title: '公园清洁日',
          description: '组织志愿者清理公园内的垃圾，美化环境，宣传环保理念。活动结束后有环保知识小讲座。',
          organizer: mockOrganizers[1],
          category: 'cleanup',
          date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7天后
          location: '城市中央公园',
          address: '城市西区公园路45号',
          startTime: '08:30',
          endTime: '12:00',
          imageUrl: 'https://picsum.photos/id/1018/800/400',
          participants: 78,
          maxParticipants: 150,
          contactInfo: '13900139000',
          requirement: '穿着舒适的服装和运动鞋，自带水杯',
          tags: ['公园清洁', '志愿者活动', '环保教育']
        },
        {
          id: 'act3',
          title: '废旧物品回收利用工作坊',
          description: '教大家如何将废旧物品改造成实用的生活用品，变废为宝。材料自备或现场购买。',
          organizer: mockOrganizers[2],
          category: 'workshop',
          date: new Date(Date.now() + 86400000 * 10).toISOString(), // 10天后
          location: '创意文化中心',
          address: '城市东区文化街78号',
          startTime: '14:00',
          endTime: '16:30',
          imageUrl: 'https://picsum.photos/id/1025/800/400',
          participants: 25,
          maxParticipants: 50,
          contactInfo: '13700137000',
          requirement: '可带1-2件废旧物品，如塑料瓶、旧报纸等',
          tags: ['废物利用', '手工制作', '环保创意']
        },
        {
          id: 'act4',
          title: '环保电影放映会',
          description: '放映环保主题纪录片，映后开展讨论分享会，探讨环保问题和解决方案。',
          organizer: mockOrganizers[3],
          category: 'education',
          date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5天后
          location: '社区图书馆',
          address: '城市南区博学路32号',
          startTime: '19:00',
          endTime: '21:30',
          imageUrl: 'https://picsum.photos/id/1043/800/400',
          participants: 36,
          maxParticipants: 80,
          contactInfo: '13600136000',
          requirement: '无需特殊准备，带着开放的心态即可',
          tags: ['环保电影', '纪录片', '讨论会']
        },
        {
          id: 'act5',
          title: '植树造林活动',
          description: '在郊区参与植树活动，为城市增添绿色。活动提供树苗、工具和午餐。',
          organizer: mockOrganizers[0],
          category: 'greening',
          date: new Date(Date.now() + 86400000 * 14).toISOString(), // 14天后
          location: '城市郊区林场',
          address: '城市郊区绿化路100号',
          startTime: '07:30',
          endTime: '15:00',
          imageUrl: 'https://picsum.photos/id/1059/800/400',
          participants: 58,
          maxParticipants: 120,
          contactInfo: '13500135000',
          requirement: '穿着耐脏的衣物和鞋子，注意防晒',
          tags: ['植树', '绿化', '户外']
        },
        {
          id: 'act6',
          title: '环保主题摄影比赛',
          description: '以"绿色城市"为主题的摄影比赛，记录城市中的环保瞬间和绿色美景。',
          organizer: mockOrganizers[1],
          category: 'competition',
          date: new Date(Date.now() + 86400000 * 20).toISOString(), // 20天后截止
          location: '线上活动',
          address: '线上提交作品',
          startTime: '00:00',
          endTime: '23:59',
          imageUrl: 'https://picsum.photos/id/1069/800/400',
          participants: 124,
          maxParticipants: 不限,
          contactInfo: 'photocomp@green.org',
          requirement: '原创作品，内容积极向上，与环保主题相关',
          tags: ['摄影比赛', '环保主题', '线上活动']
        }
      ];

      this.activities = mockActivities;
      this.filteredActivities = [...this.activities];
      this.saveActivitiesToLocalStorage();
    },

    // 获取活动列表
    async fetchActivities() {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 从本地存储加载数据
        this.initializeActivities();
        
        return this.activities;
      } catch (error) {
        this.error = error.message || '获取活动列表失败';
        return [];
      } finally {
        this.loading = false;
      }
    },

    // 获取活动详情
    async fetchActivityDetail(activityId) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // 查找活动
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) {
          throw new Error('活动不存在');
        }
        
        this.currentActivity = activity;
        return activity;
      } catch (error) {
        this.error = error.message || '获取活动详情失败';
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 筛选活动
    filterActivities(category) {
      try {
        this.loading = true;
        this.currentFilter = category;
        
        if (category === 'all') {
          this.filteredActivities = [...this.activities];
        } else {
          this.filteredActivities = this.activities.filter(activity => activity.category === category);
        }
        
        return this.filteredActivities;
      } catch (error) {
        this.error = error.message || '筛选活动失败';
        return [];
      } finally {
        this.loading = false;
      }
    },

    // 报名参加活动
    async registerForActivity(activityId) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 查找活动
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) {
          throw new Error('活动不存在');
        }
        
        // 检查是否已达最大人数
        if (activity.maxParticipants !== '不限' && activity.participants >= activity.maxParticipants) {
          throw new Error('活动名额已满');
        }
        
        // 检查是否已报名
        if (this.registrationStatus.has(activityId)) {
          throw new Error('您已报名该活动');
        }
        
        // 更新活动参与人数
        if (activity.participants !== '不限') {
          activity.participants += 1;
        }
        
        // 更新报名状态
        this.registrationStatus.set(activityId, '已报名');
        
        // 保存数据
        this.saveActivitiesToLocalStorage();
        this.saveRegistrationsToLocalStorage();
        
        return true;
      } catch (error) {
        this.error = error.message || '报名活动失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 取消活动报名
    async cancelRegistration(activityId) {
      try {
        this.loading = true;
        this.error = null;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 检查是否已报名
        if (!this.registrationStatus.has(activityId)) {
          throw new Error('您尚未报名该活动');
        }
        
        // 更新活动参与人数
        const activity = this.activities.find(a => a.id === activityId);
        if (activity && activity.participants !== '不限') {
          activity.participants -= 1;
        }
        
        // 更新报名状态
        this.registrationStatus.delete(activityId);
        
        // 保存数据
        this.saveActivitiesToLocalStorage();
        this.saveRegistrationsToLocalStorage();
        
        return true;
      } catch (error) {
        this.error = error.message || '取消报名失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 保存活动数据到本地存储
    saveActivitiesToLocalStorage() {
      localStorage.setItem('greenActivities', JSON.stringify(this.activities));
    },

    // 保存报名状态到本地存储
    saveRegistrationsToLocalStorage() {
      const registrations = Array.from(this.registrationStatus.entries())
        .map(([activityId, status]) => ({ activityId, status }));
      localStorage.setItem('activityRegistrations', JSON.stringify(registrations));
    }
  }
});