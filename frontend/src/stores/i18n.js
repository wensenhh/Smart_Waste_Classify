import { defineStore } from 'pinia';
import i18n from '../i18n';

// 语言状态管理store
export const useI18nStore = defineStore('i18n', {
  state: () => ({
    // 从本地存储获取语言设置，如果没有则使用默认值
    locale: localStorage.getItem('appLocale') || 'zh',
    // 支持的语言列表
    availableLocales: [
      { code: 'zh', name: '中文' },
      { code: 'en', name: 'English' },
      { code: 'ms', name: 'Malay' }
    ]
  }),

  getters: {
    // 获取当前语言
    getLocale: (state) => state.locale,
    // 获取支持的语言列表
    getAvailableLocales: (state) => state.availableLocales
  },

  actions: {
    // 设置语言
    setLocale(locale) {
      // 验证语言是否受支持
      const isSupported = this.availableLocales.some(lang => lang.code === locale);
      if (!isSupported) {
        console.warn(`不支持的语言: ${locale}`);
        return;
      }
      
      // 更新i18n实例的语言
      i18n.global.locale.value = locale;
      // 更新store中的语言
      this.locale = locale;
      // 保存到本地存储
      localStorage.setItem('appLocale', locale);
      
      // 触发全局语言变更事件
      document.dispatchEvent(new CustomEvent('localeChanged', { detail: locale }));
    },
    
    // 初始化语言设置
    initializeLocale() {
      // 应用已保存的语言设置
      i18n.global.locale.value = this.locale;
    }
  }
});