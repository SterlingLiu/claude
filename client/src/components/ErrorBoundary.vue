<template>
  <div class="error-boundary" v-if="error">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">{{ title }}</h2>
      <p class="error-message">{{ message }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="handleRetry" :loading="retrying">
          <el-icon><RefreshRight /></el-icon>
          重试
        </el-button>
        <el-button @click="handleGoHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
      </div>
      <details class="error-details" v-if="showDetails">
        <summary>错误详情</summary>
        <pre>{{ error.message }}</pre>
        <pre v-if="error.stack">{{ error.stack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshRight, HomeFilled } from '@element-plus/icons-vue'

export default {
  name: 'ErrorBoundary',
  components: {
    RefreshRight,
    HomeFilled
  },
  props: {
    title: {
      type: String,
      default: '出现了一些问题'
    },
    message: {
      type: String,
      default: '抱歉，页面加载时发生错误。请尝试刷新页面或返回首页。'
    },
    showDetails: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry'],
  setup(props, { emit }) {
    const router = useRouter()
    const error = ref(null)
    const retrying = ref(false)

    onErrorCaptured((err, instance, info) => {
      error.value = err
      console.error('ErrorBoundary caught error:', err)
      console.error('Component:', instance)
      console.error('Info:', info)
      return false // 阻止错误继续传播
    })

    const handleRetry = async () => {
      retrying.value = true
      error.value = null

      try {
        emit('retry')
        // 等待一小段时间让组件重新渲染
        await new Promise(resolve => setTimeout(resolve, 100))
      } finally {
        retrying.value = false
      }
    }

    const handleGoHome = () => {
      error.value = null
      router.push('/')
    }

    return {
      error,
      retrying,
      handleRetry,
      handleGoHome
    }
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 24px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 24px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.error-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.error-message {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.error-actions .el-button {
  padding: 12px 24px;
  font-weight: 600;
}

.error-details {
  text-align: left;
  background: #f5f5f5;
  border-radius: var(--radius);
  padding: 16px;
  margin-top: 24px;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.error-details pre {
  font-size: 12px;
  color: var(--accent);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 8px 0;
  padding: 12px;
  background: white;
  border-radius: var(--radius-sm);
  overflow-x: auto;
}

@media (prefers-reduced-motion: reduce) {
  .error-icon {
    animation: none;
  }
}
</style>
