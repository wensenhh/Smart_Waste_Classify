<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decorations">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 注册表单卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h1>{{ $t('register.title') }}</h1>
        <p>{{ $t('register.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="login-form">
        <!-- 用户名输入 -->
        <div class="form-group">
          <label for="username">{{ $t('register.username') }}</label>
          <input
            type="text"
            id="username"
            v-model="username"
            :placeholder="$t('register.enterUsername')"
            required
            class="form-input"
          />
          <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
        </div>

        <!-- 邮箱输入 -->
        <div class="form-group">
          <label for="email">{{ $t('register.email') }}</label>
          <input
            type="email"
            id="email"
            v-model="email"
            :placeholder="$t('register.enterEmail')"
            required
            class="form-input"
          />
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <label for="password">{{ $t('register.password') }}</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              :placeholder="$t('register.enterPassword')"
              required
              class="form-input password-input"
            />
            <button 
              type="button" 
              class="toggle-password-btn"
              @click="togglePassword"
            >
              {{ showPassword ? '👁️‍🗨️' : '👁️' }}
            </button>
          </div>
          <div v-if="showPasswordTooltip" class="password-tooltip">
            {{ $t('register.passwordTooltip') }}
          </div>
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>

        <!-- 确认密码输入 -->
        <div class="form-group">
          <label for="confirmPassword">{{ $t('register.confirmPassword') }}</label>
          <div class="password-input-container">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              :placeholder="$t('register.enterConfirmPassword')"
              required
              class="form-input password-input"
            />
            <button 
              type="button" 
              class="toggle-password-btn"
              @click="toggleConfirmPassword"
            >
              {{ showConfirmPassword ? '👁️‍🗨️' : '👁️' }}
            </button>
          </div>
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>
        </div>

        <!-- 协议同意 -->
        <div class="agreement-container">
          <label class="agreement-label">
            <input type="checkbox" v-model="agreeTerms" class="agreement-checkbox" />
            <span class="agreement-text">{{ $t('register.agreeTerms', {
              terms: $t('register.terms'),
              privacy: $t('register.privacy')
            }) }}</span>
          </label>
          <div v-if="errors.agreeTerms" class="error-message">{{ errors.agreeTerms }}</div>
        </div>

        <!-- 注册按钮 -->
        <button 
          type="submit" 
          class="login-btn"
          :disabled="isRegistering"
        >
          <span v-if="isRegistering" class="loading-spinner"></span>
          {{ isRegistering ? $t('register.registering') : $t('register.register') }}
        </button>

        <!-- 登录提示 -->
        <div class="register-container">
          <span>{{ $t('register.haveAccount') }}</span>
          <button 
            type="button" 
            class="register-btn"
            @click="navigateToLogin"
          >
            {{ $t('register.login') }}
          </button>
        </div>
      </form>

      <!-- 分隔线 -->
      <div class="divider">
        <span>{{ $t('register.or') }}</span>
      </div>

      <!-- 第三方注册选项 -->
      <div class="social-login">
        <button 
          type="button" 
          class="social-btn google-btn"
          @click="registerWithGoogle"
        >
          <span class="social-icon">G</span>
          {{ $t('register.registerWithGoogle') }}
        </button>
        <button 
          type="button" 
          class="social-btn facebook-btn"
          @click="registerWithFacebook"
        >
          <span class="social-icon">f</span>
          {{ $t('register.registerWithFacebook') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'Register'
});

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

// 表单数据
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreeTerms = ref(false);

// 状态控制
const isRegistering = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showPasswordTooltip = ref(false);
const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: ''
});

// 表单验证
const validateForm = () => {
  let isValid = true;
  
  // 重置错误信息
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // 验证用户名
  if (!username.value.trim()) {
    errors.username = t('register.usernameRequired');
    isValid = false;
  } else if (username.value.length < 3) {
    errors.username = t('register.usernameMinLength');
    isValid = false;
  }
  
  // 验证邮箱
  if (!email.value.trim()) {
    errors.email = t('register.emailRequired');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = t('register.emailInvalid');
    isValid = false;
  }
  
  // 验证密码
  if (!password.value) {
    errors.password = t('register.passwordRequired');
    isValid = false;
  } else if (password.value.length < 6) {
    errors.password = t('register.passwordMinLength');
    isValid = false;
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password.value)) {
    errors.password = t('register.passwordComplexity');
    isValid = false;
  }
  
  // 验证确认密码
  if (!confirmPassword.value) {
    errors.confirmPassword = t('register.confirmPasswordRequired');
    isValid = false;
  } else if (confirmPassword.value !== password.value) {
    errors.confirmPassword = t('register.passwordsNotMatch');
    isValid = false;
  }
  
  // 验证协议同意
  if (!agreeTerms.value) {
    errors.agreeTerms = t('register.agreeTermsRequired');
    isValid = false;
  }
  
  return isValid;
};

// 处理注册
const handleRegister = async () => {
  if (isRegistering.value) return;
  
  // 表单验证
  if (!validateForm()) return;
  
  isRegistering.value = true;
  
  try {
    // 模拟注册请求
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 实际项目中这里应该调用API进行注册
    // 根据项目实际需求调整参数
    const registerSuccess = await userStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    });
    
    if (registerSuccess) {
      // 注册成功后跳转到登录页或首页
      alert(t('register.registerSuccess'));
      router.push({ name: 'Login' });
    } else {
      alert(t('register.registerFailed'));
    }
  } catch (error) {
    console.error('Register failed:', error);
    alert(t('register.registerFailed'));
  } finally {
    isRegistering.value = false;
  }
};

// 切换密码可见性
const togglePassword = () => {
  showPassword.value = !showPassword.value;
  if (!showPassword.value && !password.value) {
    showPasswordTooltip.value = true;
  } else {
    showPasswordTooltip.value = false;
  }
};

// 切换确认密码可见性
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// 导航到登录页面
const navigateToLogin = () => {
  router.push({ name: 'Login' });
};

// 第三方注册
const registerWithGoogle = () => {
  console.log('Register with Google');
  alert(t('register.googleRegisterComingSoon'));
};

const registerWithFacebook = () => {
  console.log('Register with Facebook');
  alert(t('register.facebookRegisterComingSoon'));
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  position: relative;
  overflow: hidden;
}

.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.5;
}

.login-card {
  background-color: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
}

.password-label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password-btn {
  background: none;
  border: none;
  color: #4facfe;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
}

.forgot-password-btn:hover {
  text-decoration: underline;
}

.password-input-container {
  position: relative;
}

.password-input {
  padding-right: 45px;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.password-tooltip {
  font-size: 12px;
  color: #666;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 4px;
}

.remember-me-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.remember-me-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.remember-me-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.login-btn {
  background-color: #4facfe;
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled) {
  background-color: #3a8fd9;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.register-btn {
  background: none;
  border: none;
  color: #4facfe;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.register-btn:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e1e5e9;
}

.divider span {
  font-size: 12px;
  color: #999;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  background-color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: #4facfe;
  background-color: #f8f9ff;
}

.social-icon {
  font-weight: 700;
  font-size: 16px;
}

.google-btn .social-icon {
  color: #db4437;
}

.facebook-btn .social-icon {
  color: #4267b2;
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误信息样式 */
.error-message {
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
}

/* 协议同意样式 */
.agreement-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.agreement-checkbox {
  margin-top: 2px;
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.agreement-text {
  flex: 1;
  line-height: 1.4;
}

.agreement-text a {
  color: #4facfe;
  text-decoration: none;
}

.agreement-text a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    margin: 20px;
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>