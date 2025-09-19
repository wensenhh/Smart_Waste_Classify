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

        <!-- 手机号输入 -->
        <div class="form-group">
          <label for="phone">{{ $t('register.phone') }}</label>
          <div class="phone-input-container">
            <!-- 区号选择器 -->
            <div class="country-code-selector" @click="showCountryCodeDropdown = !showCountryCodeDropdown">
              <span class="selected-code">{{ selectedCountryCode }}</span>
              <span class="dropdown-icon">{{ showCountryCodeDropdown ? '▲' : '▼' }}</span>
            </div>
            
            <!-- 手机号输入框 -->
            <input
              type="tel"
              id="phone"
              v-model="phone"
              :placeholder="$t('register.enterPhone')"
              required
              class="form-input phone-input"
              @blur="validatePhone()"
            />
          </div>
          
          <!-- 区号下拉列表 -->
          <div v-if="showCountryCodeDropdown" class="country-code-dropdown">
            <div class="search-container">
              <input
                type="text"
                v-model="searchKeyword"
                @input="filterCountries"
                placeholder="搜索国家/地区..."
                class="search-input"
              />
            </div>
            <div class="country-list">
              <div
                v-for="country in filteredCountries"
                :key="country.code"
                class="country-item"
                @click="selectCountryCode(country.code)"
              >
                <span class="flag">{{ country.flag }}</span>
                <span class="country-name">{{ currentLanguage === 'zh' ? country.cnName : country.name }}</span>
                <span class="country-code">{{ country.code }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
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
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useI18n } from 'vue-i18n';
import { countryCodes, getCountryCodeByLocation, validatePhoneNumber, formatPhoneNumber } from '../utils/countryCodes';
import { useI18nStore } from '../stores/i18n';

defineOptions({
  name: 'Register'
});

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

// 表单数据
const username = ref('');
const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreeTerms = ref(false);

// 区号选择相关状态
const selectedCountryCode = ref('+86'); // 默认使用中国区号
const showCountryCodeDropdown = ref(false);
const searchKeyword = ref('');
const filteredCountries = ref([]);

// 状态控制
const isRegistering = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showPasswordTooltip = ref(false);
const errors = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: ''
});

// 获取当前语言
const i18nStore = useI18nStore();
const currentLanguage = ref('zh');

// 初始化
onMounted(async () => {
  // 获取当前语言
  currentLanguage.value = i18nStore.getLocale || 'zh';
  
  // 确保filteredCountries有初始数据
  filteredCountries.value = [...countryCodes];
  console.log('初始化国家列表:', filteredCountries.value.length, '个国家/地区');
  
  try {
    // 尝试根据用户地理位置自动选择区号
    const countryCode = await getCountryCodeByLocation();
    selectedCountryCode.value = countryCode;
  } catch (error) {
    console.warn('无法自动选择区号，使用默认值:', error);
  }
});

// 过滤国家列表
const filterCountries = () => {
  if (!searchKeyword.value.trim()) {
    filteredCountries.value = [...countryCodes];
  } else {
    const keyword = searchKeyword.value.toLowerCase();
    filteredCountries.value = countryCodes.filter(country => 
      country.name.toLowerCase().includes(keyword) ||
      country.cnName.toLowerCase().includes(keyword) ||
      country.code.includes(keyword)
    );
  }
  console.log('过滤后的国家列表:', filteredCountries.value.length, '个国家/地区');
};

// 选择国家区号
const selectCountryCode = (code) => {
  selectedCountryCode.value = code;
  showCountryCodeDropdown.value = false;
  searchKeyword.value = '';
  
  // 重新验证手机号
  if (phone.value.trim()) {
    validatePhone();
  }
};

// 单独验证手机号
const validatePhone = () => {
  if (!phone.value.trim()) {
    errors.phone = t('register.phoneRequired');
    return false;
  } else if (!validatePhoneNumber(selectedCountryCode.value, phone.value)) {
    errors.phone = t('register.phoneInvalid');
    return false;
  } else {
    errors.phone = '';
    return true;
  }
};

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
    
    // 验证手机号（使用新的验证逻辑）
    if (!validatePhone()) {
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
      // 根据API文档调整参数
        const registerSuccess = await userStore.register({
          name: username.value,
          phone: phone.value,
          password: password.value,
          phoneCode: selectedCountryCode.value
        });
      
      if (registerSuccess) {
        // 注册成功后跳转到登录页或首页
        window.$popup.success(t('register.registerSuccess'));
        router.push({ name: 'Login' });
      } else {
        window.$popup.error(t('register.registerFailed'));
      }
  } catch (error) {
    console.error('Register failed:', error);
    window.$popup.error(t('register.registerFailed'));
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
  window.$popup.info(t('register.googleRegisterComingSoon'));
};

const registerWithFacebook = () => {
  console.log('Register with Facebook');
  window.$popup.info(t('register.facebookRegisterComingSoon'));
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
  position: relative;
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

/* 区号选择器样式 */
.phone-input-container {
  display: flex;
  align-items: center;
  position: relative;
}

.country-code-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 100px;
  padding: 12px 16px;
  margin-right: 10px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.country-code-selector:hover {
  background-color: #e9ecef;
  border-color: #4facfe;
}

.selected-code {
  margin-right: 8px;
}

.dropdown-icon {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.phone-input {
  flex: 1;
}

.country-code-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  margin-top: 8px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4facfe;
}

.country-list {
  max-height: 220px;
  overflow-y: auto;
  padding: 8px 0;
}

.country-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.country-item:hover {
  background-color: #f8f9fa;
}

.flag {
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.country-name {
  flex: 1;
  color: #333;
}

.country-code {
  font-weight: 600;
  color: #4facfe;
}

/* 响应式调整 */
@media (max-width: 480px) {
  .country-code-selector {
    min-width: 85px;
    padding: 12px 12px;
    font-size: 13px;
  }
  
  .flag {
    font-size: 16px;
    margin-right: 8px;
  }
  
  .country-name {
    font-size: 13px;
  }
  
  .country-code {
    font-size: 13px;
  }
}
</style>