<template>
  <div :class="['input-wrapper', { 'disabled': disabled, 'focused': isFocused }]" :style="styles">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <div class="input-content">
      <span v-if="prefixIcon" class="input-icon prefix">{{ prefixIcon }}</span>
      <input
        :id="id"
        v-model="localValue"
        :type="showPassword ? 'text' : type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :step="step"
        :min="min"
        :max="max"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keyup.enter="$emit('enter')"
        class="input"
      />
      <span v-if="suffixIcon && !showPasswordToggle" class="input-icon suffix">{{ suffixIcon }}</span>
      <button
        v-if="type === 'password' && showPasswordToggle"
        type="button"
        class="password-toggle"
        @click="togglePasswordVisibility"
        :disabled="disabled"
      >
        {{ showPassword ? '👁️' : '👁️‍🗨️' }}
      </button>
    </div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-if="helpText && !errorMessage" class="help-text">{{ helpText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'password', 'number', 'email', 'tel', 'url', 'search'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number,
    default: null
  },
  minlength: {
    type: Number,
    default: null
  },
  step: {
    type: Number,
    default: null
  },
  min: {
    type: Number,
    default: null
  },
  max: {
    type: Number,
    default: null
  },
  id: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  prefixIcon: {
    type: String,
    default: ''
  },
  suffixIcon: {
    type: String,
    default: ''
  },
  showPasswordToggle: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  width: {
    type: [String, Number],
    default: 'auto'
  }
});

const emit = defineEmits(['update:modelValue', 'input', 'enter']);

const localValue = ref(props.modelValue);
const isFocused = ref(false);
const showPassword = ref(false);

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
});

// 计算样式
const styles = computed(() => {
  const style = {};
  
  if (props.width !== 'auto') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  
  return style;
});

// 处理输入变化
const handleInput = (event) => {
  const value = event.target.value;
  localValue.value = value;
  emit('update:modelValue', value);
  emit('input', event);
};

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input-content {
  display: flex;
  align-items: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0 12px;
  background-color: white;
  transition: all 0.3s ease;
}

.input-wrapper.focused .input-content {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.input-wrapper.disabled .input-content {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.input-icon {
  font-size: 16px;
  color: #999;
  user-select: none;
}

.input-icon.prefix {
  margin-right: 8px;
}

.input-icon.suffix {
  margin-left: 8px;
}

.input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
  background-color: transparent;
}

.input::placeholder {
  color: #999;
}

.input:disabled {
  cursor: not-allowed;
  background-color: transparent;
}

.input:read-only {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.password-toggle {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  margin-left: 8px;
}

.password-toggle:hover:not(:disabled) {
  color: #666;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.error-message {
  font-size: 12px;
  color: #f44336;
}

.help-text {
  font-size: 12px;
  color: #666;
}

/* 大小样式 */
.input-wrapper.small .input-content {
  padding: 0 10px;
}

.input-wrapper.small .input {
  padding: 6px 0;
  font-size: 13px;
}

.input-wrapper.medium .input-content {
  padding: 0 12px;
}

.input-wrapper.medium .input {
  padding: 8px 0;
  font-size: 14px;
}

.input-wrapper.large .input-content {
  padding: 0 16px;
}

.input-wrapper.large .input {
  padding: 12px 0;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-wrapper {
    width: 100%;
  }
}
</style>