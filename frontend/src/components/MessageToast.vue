<template>
  <div v-if="show" :class="['message-toast', type, position]" :style="styles">
    <div class="toast-content">
      <span v-if="icon" class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
    <button v-if="closable" class="close-button" @click="close">×</button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3000
  },
  position: {
    type: String,
    default: 'top-right',
    validator: (value) => [
      'top-right', 'top-left', 'top-center',
      'bottom-right', 'bottom-left', 'bottom-center'
    ].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  show: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

let timer = null;

// 计算样式
const styles = computed(() => {
  const style = {};
  const positionMap = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
  };
  return { ...positionMap[props.position] };
});

// 自动关闭
const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
};

// 清除定时器
const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

// 关闭消息
const close = () => {
  clearTimer();
  emit('close');
};

// 监听show变化
onMounted(() => {
  if (props.show) {
    startTimer();
  }
});

onUnmounted(() => {
  clearTimer();
});

// 监听show属性变化
watch(() => props.show, (newShow) => {
  if (newShow) {
    startTimer();
  } else {
    clearTimer();
  }
});
</script>

<style scoped lang="scss">
// 导入全局变量
@import '../style.scss';

.message-toast {
  position: fixed;
  min-width: 300px;
  max-width: 400px;
  padding: 12px 20px;
  border-radius: $border-radius-medium;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideIn $transition-normal ease-out;
  transition: all $transition-normal;
  
  .toast-content {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .toast-icon {
      font-size: 18px;
    }
    
    .toast-message {
      font-size: $font-size-sm;
      color: $text-primary;
      line-height: 1.5;
    }
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: $text-disabled;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-full;
    transition: all $transition-normal;
    
    &:hover {
      background-color: $background-secondary;
      color: $text-secondary;
    }
  }
  
  // 类型样式
  &.info {
    background-color: #e3f2fd;
    border-left: 4px solid $info-color;
  }
  
  &.success {
    background-color: #e8f5e9;
    border-left: 4px solid $success-color;
  }
  
  &.warning {
    background-color: #fff3e0;
    border-left: 4px solid $warning-color;
  }
  
  &.error {
    background-color: #ffebee;
    border-left: 4px solid $error-color;
  }
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-toast {
    min-width: auto;
    width: 90%;
    max-width: 90%;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }
}
</style>