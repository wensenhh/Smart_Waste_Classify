<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div 
      :class="['modal-container', size, position]" 
      :style="styles"
      @click.stop
      ref="modalRef"
    >
      <!-- 模态框头部 -->
      <div v-if="title || showHeader" class="modal-header">
        <h3 v-if="title" class="modal-title">{{ title }}</h3>
        <button 
          v-if="closable"
          class="close-button"
          @click="close"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <!-- 模态框内容 -->
      <div class="modal-body">
        <slot></slot>
      </div>

      <!-- 模态框底部 -->
      <div v-if="showFooter" class="modal-footer">
        <slot name="footer">
          <button v-if="showCancelButton" class="modal-button cancel" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button v-if="showConfirmButton" class="modal-button confirm" @click="handleConfirm" :disabled="confirmLoading">
            {{ confirmText }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

defineOptions({
  name: 'Modal'
});

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  closable: {
    type: Boolean,
    default: true
  },
  maskClosable: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  confirmLoading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'fullscreen'].includes(value)
  },
  position: {
    type: String,
    default: 'center',
    validator: (value) => ['top', 'center', 'bottom'].includes(value)
  },
  width: {
    type: [String, Number],
    default: 'auto'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  zIndex: {
    type: Number,
    default: 1000
  }
});

const emit = defineEmits(['close', 'cancel', 'confirm', 'update:visible']);

const modalRef = ref(null);
let lastFocusedElement = null;

// 计算样式
const styles = computed(() => {
  const style = {};
  
  if (props.width !== 'auto') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  if (props.zIndex) {
    style.zIndex = props.zIndex;
  }
  
  return style;
});

// 关闭模态框
const close = () => {
  emit('close');
  emit('update:visible', false);
  restoreFocus();
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
  close();
};

// 处理确认
const handleConfirm = () => {
  emit('confirm');
};

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.maskClosable) {
    close();
  }
};

// 保存焦点
const saveFocus = () => {
  lastFocusedElement = document.activeElement;
};

// 恢复焦点
const restoreFocus = () => {
  if (lastFocusedElement && lastFocusedElement.focus) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
};

// 处理键盘事件
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.closable) {
    close();
  }
};

onMounted(() => {
  if (props.visible) {
    saveFocus();
  }
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// 监听visible变化，处理焦点
if (import.meta.env.DEV) {
  // 开发环境下监听，防止在生产环境中不必要的性能开销
  watch(() => props.visible, (newVisible) => {
    if (newVisible) {
      saveFocus();
    } else {
      restoreFocus();
    }
  });
}
</script>

<style scoped lang="scss">
// 导入全局变量
@use '../style.scss' as s;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn s.$transition-normal ease;
}

.modal-container {
  background: white;
  border-radius: s.$border-radius-medium;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideIn s.$transition-normal ease;
  
  // 大小样式
  &.small {
    width: 400px;
  }
  
  &.medium {
    width: 600px;
  }
  
  &.large {
    width: 900px;
  }
  
  &.fullscreen {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  // 位置样式
  &.top {
    align-self: flex-start;
    margin-top: 50px;
  }
  
  &.bottom {
    align-self: flex-end;
    margin-bottom: 50px;
  }
}

// 模态框头部
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: s.$spacing-md s.$spacing-lg;
  border-bottom: 1px solid s.$border-color;
  
  .modal-title {
    font-size: s.$font-size-md;
    font-weight: 600;
    color: s.$text-primary;
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: s.$text-disabled;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: s.$border-radius-full;
    transition: all s.$transition-normal;
    
    &:hover {
      background-color: s.$background-secondary;
      color: s.$text-secondary;
    }
  }
}

// 模态框内容
.modal-body {
  flex: 1;
  padding: s.$spacing-lg;
  overflow-y: auto;
}

// 模态框底部
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: s.$spacing-md s.$spacing-lg;
  border-top: 1px solid s.$border-color;
  
  .modal-button {
    padding: 8px 16px;
    border: 1px solid s.$border-color;
    border-radius: s.$border-radius-small;
    font-size: s.$font-size-sm;
    font-weight: 500;
    cursor: pointer;
    transition: all s.$transition-normal;
    
    &.cancel {
      background-color: white;
      color: s.$text-primary;
      
      &:hover:not(:disabled) {
        border-color: s.$primary-color;
        color: s.$primary-color;
      }
    }
    
    &.confirm {
      background-color: s.$primary-color;
      border-color: s.$primary-color;
      color: white;
      
      &:hover:not(:disabled) {
        background-color: s.$primary-dark;
        border-color: s.$primary-dark;
      }
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

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
  .modal-container {
    max-width: 95%;
    margin: 20px;
    
    &.small,
    &.medium,
    &.large {
      width: 100%;
    }
  }
  
  .modal-header,
  .modal-footer {
    padding: 12px 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>