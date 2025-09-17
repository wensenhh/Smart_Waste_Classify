<template>
  <div :class="['card', type, size, { 'shadow': shadow, 'border': border, 'hoverable': hoverable }]" :style="styles">
    <slot name="header"></slot>
    <slot name="content"></slot>
    <slot name="footer"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'error'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  shadow: {
    type: Boolean,
    default: true
  },
  border: {
    type: Boolean,
    default: false
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  width: {
    type: [String, Number],
    default: 'auto'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  background: {
    type: String,
    default: ''
  }
});

// 计算样式
const styles = computed(() => {
  const style = {};
  
  if (props.width !== 'auto') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  if (props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }
  
  if (props.background) {
    style.backgroundColor = props.background;
  }
  
  return style;
});
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* 类型样式 */
.card.default {
  background-color: white;
}

.card.primary {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.card.success {
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.card.warning {
  background-color: #fff3e0;
  border-left: 4px solid #ff9800;
}

.card.error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
}

/* 大小样式 */
.card.small {
  padding: 12px 16px;
}

.card.medium {
  padding: 20px;
}

.card.large {
  padding: 24px 32px;
}

/* 阴影样式 */
.card.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 边框样式 */
.card.border {
  border: 1px solid #e0e0e0;
}

/* 悬停效果 */
.card.hoverable {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    border-radius: 6px;
  }
  
  .card.small {
    padding: 10px 14px;
  }
  
  .card.medium {
    padding: 16px;
  }
  
  .card.large {
    padding: 20px 24px;
  }
}
</style>