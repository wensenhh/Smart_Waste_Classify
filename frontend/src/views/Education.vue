<template>
  <div class="education-container">
    <!-- 使用Header组件 -->
    <Header mode="title" :title="$t('education.title')" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 学习路径选择 -->
      <section class="learning-paths">
        <h2>{{ $t('education.learningPathsTitle') }}</h2>
        <div class="paths-container">
          <div 
            v-for="path in learningPaths"
            :key="path.id"
            class="path-card"
            @click="navigateToPath(path.id)"
          >
            <div class="path-icon">{{ path.icon }}</div>
            <div class="path-info">
              <h3>{{ path.title }}</h3>
              <p>{{ path.description }}</p>
              <div class="path-progress">
                <div class="progress-text">{{ path.progress }}% {{ $t('education.completed') }}</div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill"
                    :style="{ width: path.progress + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门课程 -->
      <section class="popular-courses">
        <h2>{{ $t('education.popularCourses') }}</h2>
        <div class="courses-grid">
          <div 
            v-for="course in popularCourses"
            :key="course.id"
            class="course-card"
          >
            <div class="course-image">
              <div class="course-icon">{{ course.icon }}</div>
            </div>
            <div class="course-info">
              <h3>{{ course.title }}</h3>
              <p>{{ truncateText(course.description, 60) }}</p>
              <div class="course-stats">
                <span class="course-duration">{{ course.duration }}</span>
                <span class="course-level">{{ course.level }}</span>
              </div>
              <button 
                class="enroll-btn"
                @click="enrollCourse(course.id)"
              >
                {{ $t('education.enroll') }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 视频教程 -->
      <section class="video-tutorials">
        <h2>{{ $t('education.videoTutorials') }}</h2>
        <div class="videos-carousel">
          <div 
            v-for="video in videoTutorials"
            :key="video.id"
            class="video-card"
          >
            <div class="video-thumbnail">
              <div class="video-icon">{{ video.icon }}</div>
              <div class="video-duration">{{ video.duration }}</div>
            </div>
            <div class="video-info">
              <h3>{{ video.title }}</h3>
              <p>{{ video.views }} {{ $t('education.views') }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <BottomNavBar />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Header from '../components/Header.vue';
import BottomNavBar from '../components/BottomNavBar.vue';
import popupManager from '../utils/popup.js';

export default {
  name: 'Education',
  components: {
    Header,
    BottomNavBar
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

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

    // 学习路径
    const learningPaths = ref([
      {
        id: 1,
        icon: '🎓',
        title: t('education.learningPaths.beginner'),
        description: t('education.learningPaths.beginnerDesc'),
        progress: 75
      },
      {
        id: 2,
        icon: '🔬',
        title: t('education.learningPaths.recyclable'),
        description: t('education.learningPaths.recyclableDesc'),
        progress: 40
      },
      {
        id: 3,
        icon: '🌱',
        title: t('education.learningPaths.greenLiving'),
        description: t('education.learningPaths.greenLivingDesc'),
        progress: 20
      }
    ]);

    // 热门课程
    const popularCourses = ref([
      {
        id: 1,
        icon: '📊',
        title: t('education.courses.dataAnalysis'),
        description: t('education.courses.dataAnalysisDesc'),
        duration: t('education.courses.duration45'),
        level: t('education.courses.intermediate')
      },
      {
        id: 2,
        icon: '🔄',
        title: t('education.courses.plasticRecycling'),
        description: t('education.courses.plasticRecyclingDesc'),
        duration: t('education.courses.duration60'),
        level: t('education.courses.beginner')
      },
      {
        id: 3,
        icon: '🍃',
        title: t('education.courses.homeComposting'),
        description: t('education.courses.homeCompostingDesc'),
        duration: t('education.courses.duration30'),
        level: t('education.courses.introductory')
      }
    ]);

    // 视频教程
    const videoTutorials = ref([
      {
        id: 1,
        icon: '🎬',
        title: t('education.videos.householdSorting'),
        duration: '5:30',
        views: '2.5k'
      },
      {
        id: 2,
        icon: '🎨',
        title: t('education.videos.creativeRecycling'),
        duration: '8:45',
        views: '3.8k'
      },
      {
        id: 3,
        icon: '🛒',
        title: t('education.videos.greenProducts'),
        duration: '4:20',
        views: '1.9k'
      },
      {
        id: 4,
        icon: '🧒',
        title: t('education.videos.kidsEducation'),
        duration: '7:10',
        views: '5.2k'
      }
    ]);

    // 导航到指定路由
    const navigateTo = (routeName) => {
      if (routeName !== route.name) {
        router.push({ name: routeName });
      }
    };

    // 导航到学习路径
    const navigateToPath = (pathId) => {
      // 这里可以根据路径ID导航到具体的学习路径详情页
      console.log(`Navigate to learning path: ${pathId}`);
    };

    // 注册课程
    const enrollCourse = (courseId) => {
      // 这里可以实现课程注册逻辑
      console.log(`Enroll course: ${courseId}`);
      popupManager.success('课程注册成功！');
    };

    // 截断文本
    const truncateText = (text, length) => {
      if (text.length <= length) {
        return text;
      }
      return text.substring(0, length) + '...';
    };

    return {
      navItems,
      learningPaths,
      popularCourses,
      videoTutorials,
      navigateTo,
      navigateToPath,
      enrollCourse,
      truncateText,
      route
    };
  }
};
</script>

<style scoped>
.education-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #0099F7 0%, #F11712 100%);
  color: white;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.learning-paths {
  margin-bottom: 30px;
}

.learning-paths h2,
.popular-courses h2,
.video-tutorials h2 {
  margin: 0 0 20px 0;
  font-size: 22px;
  font-weight: bold;
}

.paths-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.path-card {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.path-card:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
}

.path-icon {
  font-size: 48px;
  margin-right: 20px;
}

.path-info {
  flex: 1;
}

.path-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.path-info p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.path-progress {
  width: 100%;
}

.progress-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 5px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.courses-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.course-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.course-card:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.course-image {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.course-icon {
  font-size: 64px;
}

.course-info {
  padding: 15px;
}

.course-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
}

.course-info p {
  margin: 0 0 10px 0;
  font-size: 14px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.8);
}

.course-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.enroll-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background-color: #4CAF50;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enroll-btn:hover {
  background-color: #45a049;
}

.videos-carousel {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.video-card {
  flex: 0 0 200px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.video-card:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.video-thumbnail {
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.05);
}

.video-icon {
  font-size: 48px;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 15px;
}

.video-info h3 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: bold;
}

.video-info p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
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
</style>