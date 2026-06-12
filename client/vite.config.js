import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },

  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',

    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router'],
          'axios': ['axios']
        }
      }
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // Source map
    sourcemap: false,

    // 资源内联阈值
    assetsInlineLimit: 4096,

    // CSS 代码分割
    cssCodeSplit: true,

    // Chunk 大小警告阈值
    chunkSizeWarningLimit: 1000
  },

  // CSS 配置
  css: {
    preprocessorOptions: {},
    devSourcemap: true
  },

  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'axios', 'element-plus'],
    exclude: []
  },

  // 环境变量
  envPrefix: 'VITE_'
})
