<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-desc">抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" size="large" @click="goHome" class="home-btn">
        <el-icon><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
    <div class="error-illustration">
      <div class="floating-item" v-for="i in 6" :key="i" :style="getFloatStyle(i)">
        {{ getEmoji(i) }}
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

export default {
  name: 'NotFoundView',
  components: { HomeFilled },
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    const getFloatStyle = (index) => {
      const positions = [
        { top: '20%', left: '15%', animationDelay: '0s' },
        { top: '60%', left: '25%', animationDelay: '1s' },
        { top: '30%', left: '75%', animationDelay: '2s' },
        { top: '70%', left: '80%', animationDelay: '0.5s' },
        { top: '15%', left: '50%', animationDelay: '1.5s' },
        { top: '50%', left: '45%', animationDelay: '2.5s' }
      ]
      return positions[index - 1] || {}
    }

    const getEmoji = (index) => {
      const emojis = ['🔑', '📱', '💼', '📚', '🎒', '👓']
      return emojis[index - 1] || '📦'
    }

    return { goHome, getFloatStyle, getEmoji }
  }
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.not-found-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 16px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.error-title {
  font-size: 32px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 12px;
}

.error-desc {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.home-btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border: none;
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.3);
  transition: all 0.3s ease;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 110, 246, 0.4);
}

.error-illustration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-item {
  position: absolute;
  font-size: 48px;
  opacity: 0.2;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

@media (prefers-reduced-motion: reduce) {
  .error-code {
    animation: none;
  }
  .floating-item {
    animation: none;
  }
}
</style>
