<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-bg-decor">
      <div class="decor-circle circle-1"></div>
      <div class="decor-circle circle-2"></div>
      <div class="decor-circle circle-3"></div>
    </div>

    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-icon">
            <span>🔍</span>
          </div>
          <h1 class="brand-title">校园失物招领平台</h1>
          <p class="brand-subtitle">Campus Lost & Found</p>
          <div class="brand-features">
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>快速发布失物/招领信息</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>智能匹配，高效找回</span>
            </div>
            <div class="feature-item">
              <el-icon><Check /></el-icon>
              <span>安全可靠，保护隐私</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="login-form-section">
        <div class="login-card">
          <!-- 头部 -->
          <div class="login-header">
            <div class="header-icon-wrap">
              <span class="header-icon">{{ isRegister ? '📝' : '👋' }}</span>
            </div>
            <h2 class="login-title">{{ isRegister ? '创建账号' : '欢迎回来' }}</h2>
            <p class="login-subtitle">
              {{ isRegister ? '加入校园失物招领社区' : '登录后发布和认领物品' }}
            </p>
          </div>

          <!-- 表单 -->
          <el-form :model="form" class="login-form" @submit.prevent="handle">
            <!-- 用户名 -->
            <div class="form-group">
              <label class="form-label">用户名</label>
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
                class="form-input"
              />
            </div>

            <!-- 密码 -->
            <div class="form-group">
              <label class="form-label">密码</label>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                class="form-input"
              />
            </div>

            <!-- 昵称（注册时显示） -->
            <div class="form-group" v-if="isRegister">
              <label class="form-label">昵称 <span class="optional">(选填)</span></label>
              <el-input
                v-model="form.nickname"
                placeholder="请输入昵称"
                size="large"
                :prefix-icon="UserFilled"
                class="form-input"
              />
            </div>

            <!-- 登录/注册按钮 -->
            <el-button
              type="primary"
              size="large"
              @click="handle"
              :loading="loading"
              class="submit-btn"
            >
              <span class="btn-content">
                <span class="btn-text">{{ isRegister ? '立即注册' : '登录' }}</span>
                <el-icon class="btn-icon"><ArrowRight /></el-icon>
              </span>
            </el-button>
          </el-form>

          <!-- 切换链接 -->
          <div class="switch-section">
            <div class="switch-divider">
              <span class="divider-line"></span>
              <span class="divider-text">或</span>
              <span class="divider-line"></span>
            </div>
            <div class="switch-link">
              <span class="switch-text">{{ isRegister ? '已有账号？' : '还没有账号？' }}</span>
              <el-button
                link
                type="primary"
                @click="isRegister = !isRegister"
                class="switch-btn"
              >
                {{ isRegister ? '返回登录' : '立即注册' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, UserFilled, ArrowRight, Check } from '@element-plus/icons-vue'
import api from '../api'
import { storage } from '../utils'

export default {
  name: 'LoginView',
  components: {
    User, Lock, UserFilled, ArrowRight, Check
  },
  emits: ['login'],
  setup(props, { emit }) {
    const router = useRouter()
    const route = useRoute()
    const isRegister = ref(false)
    const loading = ref(false)
    const form = reactive({
      username: '',
      password: '',
      nickname: ''
    })

    const handle = async () => {
      if (!form.username || !form.password) {
        ElMessage.warning('请填写用户名和密码')
        return
      }

      loading.value = true
      try {
        if (isRegister.value) {
          await api.register({
            username: form.username,
            password: form.password,
            nickname: form.nickname
          })
          ElMessage.success('注册成功，请登录')
          isRegister.value = false
          // 清空整个表单，避免残留数据造成困惑
          form.username = ''
          form.password = ''
          form.nickname = ''
        } else {
          const res = await api.login({
            username: form.username,
            password: form.password
          })
          // 使用 storage 工具统一管理
          storage.setAuth(res.data.token, res.data.user)
          emit('login')
          ElMessage.success('登录成功')
          router.push(route.query.redirect || '/')
        }
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    return {
      isRegister, loading, form, handle
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: var(--primary);
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: var(--accent);
  bottom: -80px;
  left: -80px;
  animation: float 10s ease-in-out infinite reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: var(--primary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.15;
  }
}

/* 主容器 */
.login-container {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* 左侧品牌区域 */
.login-brand {
  flex: 1;
  background: linear-gradient(135deg, #4f6ef6 0%, #6c5ce7 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.brand-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.brand-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  backdrop-filter: blur(10px);
}

.brand-icon span {
  font-size: 40px;
  filter: grayscale(1) brightness(10);
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 40px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.feature-item .el-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

/* 右侧表单区域 */
.login-form-section {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 360px;
}

/* 头部 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-icon-wrap {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #eef1ff 0%, #f0f3ff 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.header-icon {
  font-size: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.form-label .optional {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 12px;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--border) inset;
  padding: 4px 12px;
  transition: all 0.2s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary) inset;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--primary) inset;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #4f6ef6 0%, #6c5ce7 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(79, 110, 246, 0.35);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 110, 246, 0.45);
}

.submit-btn:active {
  transform: translateY(0);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-icon {
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-icon {
  transform: translateX(4px);
}

/* 切换区域 */
.switch-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.switch-divider {
  display: flex;
  align-items: center;
  gap: 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.divider-text {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.switch-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.switch-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.switch-btn {
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  height: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    max-width: 440px;
  }

  .login-brand {
    padding: 40px 24px;
  }

  .brand-title {
    font-size: 22px;
  }

  .brand-features {
    display: none;
  }

  .login-form-section {
    padding: 40px 24px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }

  .login-container {
    border-radius: 16px;
  }

  .login-brand {
    padding: 30px 20px;
  }

  .login-form-section {
    padding: 30px 20px;
  }
}
</style>
