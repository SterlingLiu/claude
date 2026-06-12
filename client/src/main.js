import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入全局样式
import './styles/global.css'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', vm)
  console.error('Info:', info)

  // 可以在这里上报错误到监控系统
  // reportError(err, vm, info)
}

// 全局警告处理
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Vue Warning:', msg)
  // 在开发环境下打印详细信息
  if (import.meta.env.DEV) {
    console.warn('Trace:', trace)
  }
}

// 全局属性
app.config.globalProperties.$appName = '校园失物招领平台'

// 图标已在各组件中按需引入，无需全局注册
// 这样可以减少约 200KB 的打包体积

app.use(router).use(ElementPlus)
app.mount('#app')

// 移除加载占位
const loadingEl = document.getElementById('app-loading')
if (loadingEl) {
  loadingEl.style.transition = 'opacity 0.3s ease'
  loadingEl.style.opacity = '0'
  setTimeout(() => {
    loadingEl.remove()
  }, 300)
}
