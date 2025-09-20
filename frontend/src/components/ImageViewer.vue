<template>
  <div v-if="show" class="image-viewer-overlay" @click="close">
    <div class="image-viewer-content" @click.stop>
      <button class="close-btn" @click="close">
        <span class="close-icon">×</span>
      </button>
      
      <div class="image-container">
        <img 
          :src="imageUrl" 
          :alt="altText || '放大图片'"
          class="full-image"
          ref="imageRef"
          @load="handleImageLoad"
          @error="handleImageError"
        />
        <!-- 加载指示器 -->
        <div v-if="loading" class="image-loading">
          <div class="loading-spinner"></div>
        </div>
        <!-- 错误提示 -->
        <div v-if="error" class="image-error">
          <span class="error-icon">❌</span>
          <span class="error-text">无法加载图片</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  altText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const imageRef = ref(null);
const loading = ref(true);
const error = ref(false);

// 监听show属性变化
watch(() => props.show, (newShow) => {
  if (newShow) {
    // 当显示时重置状态
    loading.value = true;
    error.value = false;
    // 防止图片加载完成前就显示错误状态
    setTimeout(() => {
      if (loading.value && !error.value) {
        error.value = true;
      }
    }, 5000); // 5秒超时
  }
});

// 处理图片加载完成
const handleImageLoad = () => {
  loading.value = false;
  error.value = false;
};

// 处理图片加载错误
const handleImageError = () => {
  loading.value = false;
  error.value = true;
};

// 关闭查看器
const close = () => {
  emit('close');
};

// 点击图片查看器外部区域关闭
const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    close();
  }
};
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
  animation: fadeIn 0.3s ease-out;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
  cursor: default;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.image-container {
  position: relative;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.full-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: zoomIn 0.3s ease-out;
}

.image-loading {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

.image-error {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 16px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .image-viewer-content {
    max-width: 95%;
    max-height: 95vh;
  }
  
  .close-btn {
    top: -30px;
    right: 0;
    font-size: 24px;
    width: 30px;
    height: 30px;
  }
}
</style>