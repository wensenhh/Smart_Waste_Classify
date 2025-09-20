<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content camera-modal" @click.stop>
      <h3 class="modal-title">{{ title || t('cameraCapture.title') }}</h3>
      
      <!-- Safari浏览器的特殊授权界面 - 仅在初始化失败时显示 -->
      <div v-if="isSafari && safariInitFailed" class="safari-authorization">
        <div class="safari-icon">🔒</div>
        <p class="safari-message">{{ t('cameraCapture.noAccess') }}</p>
        <p class="safari-submessage">{{ t('cameraCapture.authorizePrompt') }}</p>
        <div class="safari-guide">
          <p>{{ t('cameraCapture.step1') }}</p>
          <p>{{ t('cameraCapture.step2') }}</p>
        </div>
        <button class="authorize-btn" @click="requestCameraAuthorization">
          {{ t('cameraCapture.authorizeBtn') }}
        </button>
      </div>
      
      <!-- 正常的摄像头界面 -->
      <div v-else class="camera-container">
        <video 
          ref="cameraFeed" 
          autoplay 
          playsinline 
          muted
          style="object-fit: cover; width: 100%; height: 100%;"
        ></video>
        <canvas ref="cameraCanvas" style="display: none;"></canvas>
        <div class="camera-guide">
          <div class="guide-frame"></div>
        </div>
      </div>
      
      <!-- 控制按钮区域 -->
      <div v-if="!isSafari || cameraAuthorized" class="camera-controls">
        <button class="cancel-btn" @click="close">
            {{ cancelText || t('common.cancel') }}
          </button>
        <button class="capture-btn" @click="captureImage">
          <div class="capture-icon">📸</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import popupManager from '../utils/popup.js';

const { t } = useI18n();

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'capture']);

const cameraFeed = ref(null);
const cameraCanvas = ref(null);
let stream = null;
let isInitialized = false;

// 检测是否为Safari浏览器
const isSafari = computed(() => 
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
);

// 摄像头授权状态
const cameraAuthorized = ref(false);

// Safari浏览器下摄像头初始化失败状态
const safariInitFailed = ref(false);

// 主动请求Safari摄像头授权
const requestCameraAuthorization = async () => {
  try {
    console.log('开始主动请求摄像头授权...');
    
    // 检查navigator.mediaDevices和getUserMedia方法是否存在
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('浏览器不支持getUserMedia API');
        
        // 为Safari浏览器提供更友好的错误信息和替代方案
        if (isSafari.value) {
          popupManager.error(t('cameraCapture.safariNotSupported'));
        } else {
          popupManager.error(t('cameraCapture.browserNotSupported'));
        }
        return;
      }
    
    // 尝试获取摄像头访问权限
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });
    
    // 如果成功获取权限，设置授权状态并初始化摄像头
    if (stream) {
      cameraAuthorized.value = true;
      safariInitFailed.value = false;
      // 停止当前流，因为我们只是为了获取授权
      stream.getTracks().forEach(track => track.stop());
      stream = null;
      // 重新初始化摄像头，使用完整配置
      initializeCamera();
    }
  } catch (error) {
    console.error('授权请求失败:', error);
    if (error.name === 'NotAllowedError') {
        popupManager.error(t('cameraCapture.permissionDenied'));
      } else if (error.name === 'NotFoundError') {
        popupManager.error(t('cameraCapture.noCameraFound'));
      } else if (error.name === 'NotReadableError') {
        popupManager.error(t('cameraCapture.cameraInUse'));
      } else {
        // 提供更通用的错误信息，避免显示技术性错误
        popupManager.error(t('cameraCapture.cannotAccessCamera'));
      }
  }
};

// 初始化摄像头
const initializeCamera = async () => {
  if (!props.show || isInitialized) return;
  
  console.log('开始初始化摄像头...');
  
  try {
    // 检查浏览器兼容性 - 针对Safari进行特殊处理
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // 为Safari浏览器提供更友好的错误信息
        if (isSafari.value) {
          console.log('Safari浏览器检测到mediaDevices API不可用，显示授权引导');
          safariInitFailed.value = true;
          return;
        } else {
          popupManager.error('您的浏览器不支持摄像头功能，推荐使用Chrome或Safari浏览器');
          emit('close');
          return;
        }
      }
    
    // 优先使用后置摄像头，但添加兼容性回退方案
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // 针对Safari优化的属性
        facingMode: { ideal: 'environment' },
        // 确保在Safari上有更好的兼容性
        frameRate: { ideal: 30, max: 60 }
      },
      audio: false
    };
    
    try {
      // 尝试使用后置摄像头
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('成功获取摄像头');
    } catch (err) {
      console.warn('无法获取指定摄像头，尝试使用默认配置:', err);
      // 针对Safari的简化回退方案
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        console.log('成功获取默认摄像头');
      } catch (fallbackErr) {
        console.error('获取默认摄像头也失败:', fallbackErr);
        throw fallbackErr;
      }
    }
    
    // 检查video元素是否存在
    if (!cameraFeed.value) {
      console.error('视频元素未找到');
      emit('close');
      return;
    }
    
    // 设置视频流
    cameraFeed.value.srcObject = stream;
    
    // 添加loadedmetadata事件监听，确保视频尺寸正确设置
    cameraFeed.value.addEventListener('loadedmetadata', () => {
      console.log('Camera video dimensions:', 
        cameraFeed.value.videoWidth, 
        cameraFeed.value.videoHeight);
      // 针对Safari的额外处理
      if (isSafari.value) {
        // 在Safari中，有时需要手动触发播放
        cameraFeed.value.play().catch(err => {
          console.warn('Safari自动播放失败，需要用户交互:', err);
        });
      }
    });
    
    // 添加视频播放失败的事件监听
    cameraFeed.value.addEventListener('error', (err) => {
      console.error('视频播放错误:', err);
      // 针对Safari特定错误的处理
      if (isSafari.value) {
        console.error('Safari特定视频错误');
      }
    });
    
    isInitialized = true;
    safariInitFailed.value = false; // 初始化成功，重置失败状态
    cameraAuthorized.value = true; // 设置为已授权状态
    console.log('摄像头初始化成功');
  } catch (error) {
    console.error('获取摄像头失败:', error);
    
    // 针对Safari的特定错误处理
    if (isSafari.value) {
      // Safari浏览器的特定提示
      if (error.name === 'NotAllowedError') {
        console.log('Safari摄像头权限被拒绝，显示授权引导');
        safariInitFailed.value = true;
        // 不关闭模态框，让用户可以看到授权引导界面
      } else {
        console.log('Safari初始化失败，错误类型:', error.name);
        safariInitFailed.value = true; // 显示授权引导界面，让用户可以尝试主动授权
      }
    } else {
      // 其他浏览器的错误提示
      if (error.name === 'NotAllowedError') {
        popupManager.error('请允许应用访问您的摄像头');
      } else if (error.name === 'NotFoundError') {
        popupManager.error('未找到可用的摄像头设备');
      } else if (error.name === 'NotReadableError') {
        popupManager.error('摄像头被其他应用占用，请关闭其他应用后重试');
      } else {
        popupManager.error('初始化摄像头失败: ' + error.message);
      }
      emit('close');
    }
  }
};

// 拍照
const captureImage = async () => {
  if (!cameraFeed.value || !cameraCanvas.value || !stream) return;
  
  // 设置canvas尺寸
  const canvas = cameraCanvas.value;
  const video = cameraFeed.value;
  
  // 确保视频有有效的尺寸
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    console.error('视频尺寸无效，无法拍照');
    return;
  }
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // 在canvas上绘制当前视频帧
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // 将canvas转换为blob
  canvas.toBlob(async (blob) => {
    if (blob) {
      // 创建一个临时文件对象
      const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
      
      // 触发捕获事件，传递捕获的图片文件
      emit('capture', file);
    }
  }, 'image/jpeg', 0.8);
};

// 关闭摄像头
const close = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (cameraFeed.value) {
    cameraFeed.value.srcObject = null;
  }
  isInitialized = false;
  emit('close');
};

// 监听show属性变化
onMounted(() => {
  // 如果初始show为true，则初始化摄像头
  if (props.show) {
    initializeCamera();
  }
});

// 组件卸载时关闭摄像头
onUnmounted(() => {
  close();
});

// 监听show属性变化
watch(
  () => props.show,
  (newShow, oldShow) => {
    if (newShow && !oldShow && !isInitialized) {
      initializeCamera();
    } else if (!newShow && oldShow && stream) {
      close();
    }
  }
);
</script>

<style scoped>
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

.camera-modal {
  width: 90%;
  max-width: 500px;
  padding: 0;
  overflow: hidden;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  padding: 15px;
  text-align: center;
  color: #333;
}

/* Safari浏览器授权界面样式 */
.safari-authorization {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  background-color: #f8f9fa;
  min-height: 50vh;
}

.safari-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.safari-message {
      font-size: 18px;
      color: #333;
      margin: 20px 0 10px 0;
      text-align: center;
      font-weight: 500;
    }
    
    .safari-submessage {
      font-size: 14px;
      color: #666;
      margin: 0 0 20px 0;
      text-align: center;
    }
    
    .safari-guide {
      background: rgba(255, 255, 255, 0.8);
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }

.safari-guide p {
  margin: 10px 0;
  font-size: 16px;
  color: #555;
}

.authorize-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  min-width: 200px;
}

.authorize-btn:hover {
  background-color: #45a049;
}

.authorize-btn:active {
  transform: scale(0.98);
}

.camera-container {
  position: relative;
  width: 100%;
  height: 50vh;
  background-color: #000;
}

/* 确保视频流不会溢出容器 */
.camera-container video {
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.camera-guide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.guide-frame {
  width: 80%;
  height: 60%;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  position: relative;
}

.guide-frame::before {
  content: '请将垃圾放入框内';
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

.camera-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: white;
  position: relative;
  z-index: 10;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.capture-btn {
  width: 40px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background-color: white;
  border: 3px solid #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.capture-btn:active {
  transform: scale(0.95);
}

.capture-icon {
  font-size: 24px;
}
</style>