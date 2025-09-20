import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // 设置基础路径，如果部署在子目录需要修改
  plugins: [vue()],
  server: {
    proxy: {
      // 配置代理解决跨域问题
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // 确保构建产物正确处理静态资源路径
    assetsDir: 'assets'
  }
})
