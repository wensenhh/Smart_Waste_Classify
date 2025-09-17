<template>
  <div class="home-container">
    <!-- 顶部标题区域 -->
    <Header mode="title" :title="$t('home.title')">
      <template #actions>
        <button 
          class="header-btn"
          @click="openCitySelector"
        >
          {{ recognitionStore.getCurrentCity }}
        </button>
      </template>
    </Header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 识别操作区域 -->
      <section class="recognition-section">
        <button 
          class="primary-btn scan-btn"
          @click="startScan"
          :disabled="recognitionStore.loading"
        >
          <div class="btn-icon">📸</div>
          <span>{{ $t('home.scanButton') }}</span>
        </button>
        <button 
          class="primary-btn upload-btn"
          @click="uploadImage"
          :disabled="recognitionStore.loading"
        >
          <div class="btn-icon">📤</div>
          <span>{{ $t('home.uploadButton') }}</span>
        </button>
        <input 
          type="file" 
          ref="fileInput"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />
      </section>

      <!-- 摄像头捕获组件 -->
      <CameraCapture
        :show="cameraCaptureVisible"
        :title="$t('home.scanButton')"
        :cancelText="$t('common.cancel')"
        @close="handleCameraClose"
        @capture="handleCameraCapture"
      />
      

      <!-- 最近识别记录区域 -->
      <section class="recent-section">
        <h2 class="section-title">{{ $t('home.recentActivity') }}</h2>
        <div class="recent-list">
          <div v-if="recognitionStore.getRecentRecognitions.length === 0" class="no-record">
            {{ $t('home.noRecord') }}
          </div>
          <div 
            v-for="(item, index) in recognitionStore.getRecentRecognitions"
            :key="index"
            class="recent-item"
            @click="viewRecognitionResult(item)"
          >
            <div class="item-image" :style="{ backgroundImage: `url(${item.imageUrl})` }"></div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-type">{{ item.type }}</div>
              <div class="item-time">{{ formatTime(item.timestamp) }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 使用底部导航栏公共组件 -->
    <BottomNavBar />

    <!-- 城市选择弹窗 -->
    <div v-if="citySelectorVisible" class="modal-overlay" @click="closeCitySelector">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">选择城市</h3>
        <div class="city-list">
          <div 
            v-for="city in cities"
            :key="city"
            class="city-item"
            :class="{ selected: city === recognitionStore.getCurrentCity }"
            @click="selectCity(city)"
          >
            {{ city }}
          </div>
        </div>
        <button class="close-btn" @click="closeCitySelector">
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="recognitionStore.loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">{{ $t('recognition.analyzing') }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRecognitionStore } from '../stores/recognition';
import Header from '../components/Header.vue';
import BottomNavBar from '../components/BottomNavBar.vue';
import CameraCapture from '../components/CameraCapture.vue';

const router = useRouter();
const route = useRoute();
const recognitionStore = useRecognitionStore();
const fileInput = ref(null);
const citySelectorVisible = ref(false);
const cameraCaptureVisible = ref(false);

// 支持的城市列表
const cities = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉', '西安'
];

// 初始化
onMounted(() => {
  recognitionStore.initializeRecognitions();
});

// 开始拍照识别
const startScan = async () => {
  try {
    // 显示摄像头捕获组件
    cameraCaptureVisible.value = true;
  } catch (error) {
    console.error('启动摄像头失败:', error);
    // 如果失败，回退到上传图片
    uploadImage();
  }
};

// 上传图片识别
const uploadImage = () => {
  fileInput.value?.click();
};

// 处理文件选择
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const result = await recognitionStore.recognizeWaste(file);
    if (result) {
      router.push({ name: 'RecognitionResult' });
    }
    // 清空input，以便可以重复选择同一文件
    event.target.value = '';
  }
};

// 查看识别结果
const viewRecognitionResult = (item) => {
  // 设置当前识别结果
  recognitionStore.recognitionResult = item;
  router.push({ name: 'RecognitionResult' });
};

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString();
  }
};

// 打开城市选择器
const openCitySelector = () => {
  citySelectorVisible.value = true;
};

// 关闭城市选择器
const closeCitySelector = () => {
  citySelectorVisible.value = false;
};

// 摄像头捕获处理函数
const handleCameraCapture = async (file) => {
  // 调用识别接口
  const result = await recognitionStore.recognizeWaste(file);
  if (result) {
    router.push({ name: 'RecognitionResult' });
  }
  
  // 关闭摄像头弹窗
  cameraCaptureVisible.value = false;
};

const handleCameraClose = () => {
  cameraCaptureVisible.value = false;
};

// 选择城市
const selectCity = (city) => {
  recognitionStore.setCurrentCity(city);
  closeCitySelector();
};</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Header按钮样式 */
:deep(.header-btn) {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.header-btn:hover) {
  background-color: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.recognition-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.primary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #667eea;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.primary-btn:active {
  transform: translateY(0);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 24px;
}

.recent-section {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recent-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.item-type {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 5px;
}

.item-time {
  font-size: 12px;
  opacity: 0.6;
}

.no-record {
  text-align: center;
  padding: 40px;
  opacity: 0.6;
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
  padding: 20px;
  width: 80%;
  max-width: 400px;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.city-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.city-item {
  padding: 10px;
  text-align: center;
  border-radius: 8px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.city-item.selected {
  background-color: #667eea;
  color: white;
}

.close-btn {
  width: 100%;
  padding: 12px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #764ba2;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: white;
  font-size: 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>