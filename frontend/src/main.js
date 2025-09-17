import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// 导入路由配置
import router from './router'

// 导入Pinia状态管理
import { createPinia } from 'pinia'
const pinia = createPinia()

// 导入国际化配置
import i18n from './i18n'

// 导入Header组件并全局注册
import Header from './components/Header.vue'

// 导入i18n store
import { useI18nStore } from './stores/i18n'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(router)
app.use(pinia)
app.use(i18n)

// 初始化i18n store
const i18nStore = useI18nStore()
i18nStore.initializeLocale()

// 全局注册Header组件
app.component('Header', Header)

// 挂载应用
app.mount('#app')
