<template>
  <div :class="['loading-container', type]">
    <div class="loading-spinner"></div>
    <div v-if="message" class="loading-message">{{ message }}</div>
  </div>
</template>

<script setup>

defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'small', 'large', 'inline'].includes(value)
  },
  message: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-container.inline {
  flex-direction: row;
  gap: 10px;
}

.loading-spinner {
  border: 3px solid rgba(76, 175, 80, 0.3);
  border-radius: 50%;
  border-top: 3px solid #4caf50;
  animation: spin 1s linear infinite;
}

/* 默认大小 */
.loading-spinner {
  width: 40px;
  height: 40px;
}

/* 小型加载指示器 */
.loading-container.small .loading-spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

/* 大型加载指示器 */
.loading-container.large .loading-spinner {
  width: 60px;
  height: 60px;
  border-width: 4px;
}

.loading-message {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

.loading-container.inline .loading-message {
  margin-top: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>