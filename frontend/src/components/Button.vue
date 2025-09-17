<template>
  <button
    :class="['button', type, size, shape, { 'disabled': disabled, 'loading': loading, 'block': block, 'rounded': rounded }]"
    :disabled="disabled || loading"
    @click="handleClick"
    :style="styles"
  >
    <LoadingIndicator v-if="loading" type="small" />
    <span v-if="icon" class="button-icon">{{ icon }}</span>
    <span v-if="$slots.default" class="button-text"><slot></slot></span>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import LoadingIndicator from './LoadingIndicator.vue';

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'error', 'info', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'mini'].includes(value)
  },
  shape: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'round', 'circle'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  rounded: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: 'auto'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  }
});

const emit = defineEmits(['click']);

// 计算样式
const styles = computed(() => {
  const style = {};
  
  if (props.width !== 'auto') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  return style;
});

// 处理点击事件
const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  color: #333;
  outline: none;
}

/* 类型样式 */
.button.default {
  background-color: white;
  border-color: #d9d9d9;
  color: #333;
}

.button.default:hover:not(:disabled):not(.loading) {
  border-color: #4caf50;
  color: #4caf50;
}

.button.primary {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

.button.primary:hover:not(:disabled):not(.loading) {
  background-color: #45a049;
  border-color: #45a049;
}

.button.success {
  background-color: #8bc34a;
  border-color: #8bc34a;
  color: white;
}

.button.success:hover:not(:disabled):not(.loading) {
  background-color: #7cb342;
  border-color: #7cb342;
}

.button.warning {
  background-color: #ff9800;
  border-color: #ff9800;
  color: white;
}

.button.warning:hover:not(:disabled):not(.loading) {
  background-color: #e68900;
  border-color: #e68900;
}

.button.error {
  background-color: #f44336;
  border-color: #f44336;
  color: white;
}

.button.error:hover:not(:disabled):not(.loading) {
  background-color: #da190b;
  border-color: #da190b;
}

.button.info {
  background-color: #2196f3;
  border-color: #2196f3;
  color: white;
}

.button.info:hover:not(:disabled):not(.loading) {
  background-color: #0b7dda;
  border-color: #0b7dda;
}

.button.text {
  background-color: transparent;
  border-color: transparent;
  color: #4caf50;
}

.button.text:hover:not(:disabled):not(.loading) {
  background-color: rgba(76, 175, 80, 0.1);
}

/* 大小样式 */
.button.mini {
  padding: 4px 8px;
  font-size: 12px;
}

.button.small {
  padding: 6px 12px;
  font-size: 13px;
}

.button.medium {
  padding: 8px 16px;
  font-size: 14px;
}

.button.large {
  padding: 12px 24px;
  font-size: 16px;
}

/* 形状样式 */
.button.round {
  border-radius: 20px;
}

.button.circle {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  min-width: 32px;
}

.button.rounded {
  border-radius: 8px;
}

/* 禁用状态 */
.button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载状态 */
.button.loading {
  cursor: not-allowed;
  opacity: 0.8;
}

/* 块级按钮 */
.button.block {
  display: flex;
  width: 100%;
}

/* 按钮图标和文本 */
.button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.button-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button {
    font-size: 13px;
  }
  
  .button.mini {
    font-size: 11px;
  }
  
  .button.small {
    font-size: 12px;
  }
  
  .button.large {
    font-size: 15px;
  }
}
</style>