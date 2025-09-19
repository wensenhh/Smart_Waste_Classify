<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decorations">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 登录表单卡片 -->
    <div class="login-card">
      <div class="login-header">
        <h1>{{ $t('login.title') }}</h1>
        <p>{{ $t('login.subtitle') }}</p>
      </div>

      <!-- 错误提示区域 -->
      <div v-if="loginError" class="error-message">
        <span class="error-icon">⚠️</span>
        {{ loginError }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- 用户名/邮箱输入 -->
        <div class="form-group">
          <label for="username">{{ $t('login.username') }}</label>
          <input
            type="text"
            id="username"
            v-model="username"
            :placeholder="$t('login.enterUsername')"
            required
            class="form-input"
            @focus="showPasswordTooltip = false; clearLoginError()"
          />
        </div>

        <!-- 密码输入 -->
        <div class="form-group">
          <div class="password-label-container">
            <label for="password">{{ $t('login.password') }}</label>
            <button 
              type="button" 
              class="forgot-password-btn"
              @click="showForgotPassword = true"
            >
              {{ $t('login.forgotPassword') }}
            </button>
          </div>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              :placeholder="$t('login.enterPassword')"
              required
              class="form-input password-input"
              @focus="clearLoginError()"
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
            {{ $t('login.passwordTooltip') }}
          </div>
        </div>

        <!-- 记住我选项 -->
        <div class="remember-me-container">
          <label class="remember-me-label">
            <input type="checkbox" v-model="rememberMe" class="remember-me-checkbox" />
            <span class="remember-me-text">{{ $t('login.rememberMe') }}</span>
          </label>
        </div>

        <!-- 登录按钮 -->
        <button 
          type="submit" 
          class="login-btn"
          :disabled="isLoggingIn"
        >
          <span v-if="isLoggingIn" class="loading-spinner"></span>
          {{ isLoggingIn ? $t('login.loggingIn') : $t('login.login') }}
        </button>

        <!-- 注册提示 -->
        <div class="register-container">
          <span>{{ $t('login.noAccount') }}</span>
          <button 
            type="button" 
            class="register-btn"
            @click="navigateToRegister"
          >
            {{ $t('login.register') }}
          </button>
        </div>
      </form>

      <!-- 分隔线 -->
      <div class="divider">
        <span>{{ $t('login.or') }}</span>
      </div>

      <!-- 第三方登录选项 -->
      <div class="social-login">
        <button 
          type="button" 
          class="social-btn google-btn"
          @click="loginWithGoogle"
        >
          <span class="social-icon">G</span>
          {{ $t('login.loginWithGoogle') }}
        </button>
        <button 
          type="button" 
          class="social-btn facebook-btn"
          @click="loginWithFacebook"
        >
          <span class="social-icon">f</span>
          {{ $t('login.loginWithFacebook') }}
        </button>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <div v-if="showForgotPassword" class="modal-overlay" @click="closeForgotPassword">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('login.forgotPassword') }}</h3>
          <button class="modal-close-btn" @click="closeForgotPassword">×</button>
        </div>
        <div class="modal-body">
          <p>{{ $t('login.forgotPasswordDesc') }}</p>
          <div class="form-group">
            <label for="resetEmail">{{ $t('login.email') }}</label>
            <input
              type="email"
              id="resetEmail"
              v-model="resetEmail"
              :placeholder="$t('login.enterEmail')"
              required
              class="form-input"
            />
          </div>
          <button 
            class="reset-password-btn"
            @click="resetPassword"
            :disabled="isResettingPassword"
          >
            <span v-if="isResettingPassword" class="loading-spinner"></span>
            {{ isResettingPassword ? $t('login.sending') : $t('login.sendResetLink') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'Login'
});

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

// 表单数据
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const showForgotPassword = ref(false);
const resetEmail = ref('');

// 状态控制
const isLoggingIn = ref(false);
const isResettingPassword = ref(false);
const showPassword = ref(false);
const showPasswordTooltip = ref(false);
const loginError = ref('');

// 清除登录错误
const clearLoginError = () => {
  loginError.value = '';
};

// 处理登录
const handleLogin = async () => {
  if (isLoggingIn.value) return;
  
  isLoggingIn.value = true;
  clearLoginError();
  
  try {
    // 实际项目中这里应该调用API进行登录
    // 根据user.js中的login方法定义，它接受一个credentials对象
    const loginSuccess = await userStore.login({
      name: username.value,
      password: password.value
    });
    
    if (loginSuccess) {
      // 登录成功后跳转到首页
      router.push({ name: 'Home' });
    } else {
      // 显示具体的错误信息
      loginError.value = userStore.error || '登录失败：账号或密码错误';
    }
  } catch (error) {
    console.error('Login failed:', error);
    loginError.value = '登录失败：网络错误或服务器问题';
  } finally {
    isLoggingIn.value = false;
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

// 导航到注册页面
const navigateToRegister = () => {
  // 跳转到注册页面
  console.log('Navigate to register page');
  router.push('/register');
};

// 第三方登录
const loginWithGoogle = () => {
  console.log('Login with Google');
  window.$popup.info(t('login.googleLoginComingSoon'));
};

const loginWithFacebook = () => {
  console.log('Login with Facebook');
  window.$popup.info(t('login.facebookLoginComingSoon'));
};

// 关闭忘记密码弹窗
const closeForgotPassword = () => {
  showForgotPassword.value = false;
  resetEmail.value = '';
  isResettingPassword.value = false;
};

// 重置密码
const resetPassword = async () => {
  if (isResettingPassword.value || !resetEmail.value) return;
  
  isResettingPassword.value = true;
  
  try {
    // 模拟重置密码请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 实际项目中这里应该调用API发送重置密码邮件
    
    window.$popup.success(t('login.resetLinkSent'));
    closeForgotPassword();
  } catch (error) {
    console.error('Reset password failed:', error);
    window.$popup.error(t('login.resetFailed'));
  } finally {
    isResettingPassword.value = false;
  }
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
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.login-header p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.1);
}

.password-label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.forgot-password-btn {
  background: none;
  border: none;
  color: #4facfe;
  font-size: 14px;
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
  padding-right: 50px;
}

.toggle-password-btn {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 5px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.remember-me-container {
  margin-bottom: 10px;
}

.remember-me-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.remember-me-checkbox {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  cursor: pointer;
}

.remember-me-text {
  font-size: 14px;
  color: #666;
}

.login-btn {
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.register-container {
  text-align: center;
  margin-top: 10px;
}

.register-container span {
  font-size: 14px;
  color: #666;
}

.register-btn {
  background: none;
  border: none;
  color: #4facfe;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  margin-left: 5px;
}

.register-btn:hover {
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  margin: 30px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e0e0e0;
}

.divider span {
  padding: 0 15px;
  font-size: 14px;
  color: #666;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background-color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background-color: #f5f5f5;
}

.social-icon {
  font-size: 20px;
  font-weight: bold;
}

.google-btn .social-icon {
  color: #db4437;
}

.facebook-btn .social-icon {
  color: #4267b2;
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
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #666;
}

.reset-password-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.reset-password-btn:hover:not(:disabled) {
  box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
}

.reset-password-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  
  .social-login {
    gap: 8px;
  }
  
  .social-btn {
    padding: 10px;
    font-size: 13px;
  }
}
</style>