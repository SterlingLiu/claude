<template>
  <div class="app-wrapper">
    <!-- 背景层 -->
    <div class="bg-layer">
      <div class="bg-gradient"></div>
      <div class="bg-particles">
        <span v-for="i in 15" :key="i" class="particle" :style="particleStyle(i)"></span>
      </div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="top-nav" :class="{ scrolled, 'nav-visible': true }">
      <div class="nav-inner">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <div class="logo-icon-wrap">
            <span class="logo-icon">🔍</span>
          </div>
          <div class="logo-text-wrap">
            <span class="logo-text">校园招领</span>
            <span class="logo-subtitle">Lost & Found</span>
          </div>
        </router-link>

        <!-- 导航链接 -->
        <nav class="nav-links">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </router-link>

          <router-link to="/publish" class="nav-link nav-publish" v-if="isLogin">
            <el-icon><Plus /></el-icon>
            <span>发布信息</span>
          </router-link>

          <!-- 通知铃铛 -->
          <div class="nav-notification" v-if="isLogin" @click="goToUser">
            <el-badge :value="unread" :hidden="!unread" :max="99" class="notification-badge">
              <el-icon class="notification-icon"><Bell /></el-icon>
            </el-badge>
          </div>

          <!-- 用户菜单 -->
          <el-dropdown trigger="click" v-if="isLogin" @command="handleCmd" class="user-dropdown">
            <div class="user-avatar-wrap">
              <div class="user-avatar">
                <span class="avatar-text">{{ user.nickname?.[0] || 'U' }}</span>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.nickname || '用户' }}</span>
                <span class="user-role">普通用户</span>
              </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-menu">
                <el-dropdown-item command="user" class="menu-item">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided class="menu-item logout-item">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 登录按钮 -->
          <router-link to="/login" class="nav-link login-btn" v-else>
            <el-icon><User /></el-icon>
            <span>登录 / 注册</span>
          </router-link>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <ErrorBoundary @retry="handleRetry">
        <router-view @login="onLogin" v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </ErrorBoundary>
    </main>

    <!-- 底部页脚 -->
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-content">
          <!-- Logo 和描述 -->
          <div class="footer-brand">
            <div class="footer-logo">
              <span class="footer-logo-icon">🔍</span>
              <span class="footer-logo-text">校园招领平台</span>
            </div>
            <p class="footer-desc">帮助每一位同学找回丢失的物品，让校园充满互助与温暖</p>
          </div>

          <!-- 快速链接 -->
          <div class="footer-links">
            <h4 class="footer-title">快速链接</h4>
            <ul class="footer-list">
              <li><router-link to="/">首页</router-link></li>
              <li><router-link to="/publish">发布信息</router-link></li>
              <li><router-link to="/user">个人中心</router-link></li>
            </ul>
          </div>

          <!-- 联系方式 -->
          <div class="footer-contact">
            <h4 class="footer-title">联系我们</h4>
            <ul class="footer-list">
              <li>
                <el-icon><Message /></el-icon>
                <span>contact@lostfound.edu</span>
              </li>
              <li>
                <el-icon><Phone /></el-icon>
                <span>400-123-4567</span>
              </li>
              <li>
                <el-icon><Location /></el-icon>
                <span>潍坊职业学院信息工程学院</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 底部版权 -->
        <div class="footer-bottom">
          <div class="footer-copyright">
            <span>© 2026 校园失物招领平台. All rights reserved.</span>
          </div>
          <div class="footer-powered">
            <span>Powered by Vue 3 + Node.js</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- 返回顶部按钮 -->
    <BackToTop :visibility-height="300" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Plus, Bell, User, SwitchButton, HomeFilled,
  ArrowDown, Message, Phone, Location
} from '@element-plus/icons-vue'
import api from './api'
import { storage, userStorage } from './utils'
import ErrorBoundary from './components/ErrorBoundary.vue'
import BackToTop from './components/BackToTop.vue'

export default {
  name: 'App',
  components: {
    Plus, Bell, User, SwitchButton, HomeFilled,
    ArrowDown, Message, Phone, Location,
    ErrorBoundary, BackToTop
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const user = ref(storage.getUser())
    const unread = ref(0)
    const scrolled = ref(false)

    const isLogin = computed(() => storage.isLoggedIn())

    const fetchUnread = async () => {
      if (!isLogin.value) return
      try {
        const r = await api.getUnreadCount()
        unread.value = r.data.count
      } catch (e) {
        console.error(e)
      }
    }

    const onLogin = () => {
      user.value = storage.getUser()
      fetchUnread()
    }

    const handleScroll = () => {
      scrolled.value = window.scrollY > 10
    }

    const handleCmd = (c) => {
      if (c === 'logout') {
        storage.clearAuth()
        user.value = {}
        unread.value = 0
        router.push('/')
      } else if (c === 'user') {
        router.push('/user')
      }
    }

    const goToUser = () => {
      router.push('/user')
    }

    const handleRetry = () => {
      window.location.reload()
    }

    const particleStyle = (i) => {
      const seed = ((i * 137 + 53) % 100) / 100
      return {
        left: ((i * 17 + 5) % 100) + '%',
        top: ((i * 29 + 11) % 100) + '%',
        width: (2 + (i % 3)) + 'px',
        height: (2 + (i % 3)) + 'px',
        animationDelay: (seed * 8) + 's',
        animationDuration: (8 + (i % 6)) + 's',
        opacity: 0.1 + seed * 0.15
      }
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
      fetchUnread()
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    router.afterEach(() => {
      user.value = storage.getUser()
      fetchUnread()
    })

    return {
      user, unread, scrolled, isLogin, route,
      onLogin, handleCmd, goToUser, handleRetry, particleStyle
    }
  }
}
</script>

<style>
/* ========== App Layout ========== */
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ========== Background Layer ========== */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 10%, rgba(79, 110, 246, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(232, 93, 117, 0.04) 0%, transparent 55%);
}

.bg-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--primary);
  animation: float-up linear infinite;
}

.particle:nth-child(odd) {
  background: var(--accent);
}

@keyframes float-up {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10vh) scale(1.2);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .particle {
    animation: none;
    display: none;
  }
}

/* ========== Top Navigation ========== */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid transparent;
  transition: all var(--transition-slow);
}

.top-nav.scrolled {
  background: rgba(255, 255, 255, 0.98);
  border-bottom-color: var(--border);
  box-shadow: var(--shadow-sm);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: transform var(--transition);
}

.logo:hover {
  transform: scale(1.02);
}

.logo-icon-wrap {
  width: 40px;
  height: 40px;
  background: var(--primary-gradient);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.3);
}

.logo-icon {
  font-size: 20px;
  filter: grayscale(1) brightness(10);
}

.logo-text-wrap {
  display: flex;
  flex-direction: column;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition);
  position: relative;
}

.nav-link:hover {
  color: var(--primary);
  background: var(--primary-light);
}

.nav-link.active {
  color: var(--primary);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--primary);
  border-radius: 1px;
}

/* Publish Button */
.nav-publish {
  background: var(--primary-gradient) !important;
  color: var(--text-white) !important;
  padding: 8px 20px;
  border-radius: var(--radius);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.3);
  transition: all var(--transition);
}

.nav-publish:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 110, 246, 0.4);
  background: var(--primary-gradient) !important;
}

/* Notification Bell */
.nav-notification {
  position: relative;
  padding: 8px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
}

.nav-notification:hover {
  background: var(--primary-light);
}

.notification-icon {
  font-size: 20px;
  color: var(--text-secondary);
  transition: color var(--transition);
}

.nav-notification:hover .notification-icon {
  color: var(--primary);
}

.notification-badge :deep(.el-badge__content) {
  background: var(--accent);
  border: 2px solid white;
}

/* User Avatar */
.user-avatar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--transition);
}

.user-avatar-wrap:hover {
  background: var(--primary-light);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(79, 110, 246, 0.3);
  transition: transform var(--transition);
}

.user-avatar-wrap:hover .user-avatar {
  transform: scale(1.05);
}

.avatar-text {
  color: white;
  font-weight: 700;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
}

.dropdown-icon {
  font-size: 12px;
  color: var(--text-muted);
  transition: transform var(--transition);
}

.user-dropdown {
  line-height: normal;
}

/* Login Button */
.login-btn {
  background: var(--primary-gradient) !important;
  color: var(--text-white) !important;
  padding: 8px 20px;
  border-radius: var(--radius);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 110, 246, 0.4);
  background: var(--primary-gradient) !important;
}

/* ========== Main Content ========== */
.main-content {
  flex: 1;
  padding-top: 84px;
  padding-bottom: 40px;
  position: relative;
  z-index: 1;
}

/* ========== Footer ========== */
.site-footer {
  background: var(--text);
  color: rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 40px;
  padding: 48px 0 40px;
}

/* Footer Brand */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-logo-icon {
  font-size: 24px;
}

.footer-logo-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  max-width: 300px;
}

/* Footer Links */
.footer-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-list a {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  transition: color var(--transition);
}

.footer-list a:hover {
  color: white;
}

.footer-list .el-icon {
  font-size: 16px;
  color: var(--primary);
}

.footer-list span {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-copyright span,
.footer-powered span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

/* ========== Page Transitions ========== */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ========== Responsive Design ========== */
@media (max-width: 768px) {
  .nav-inner {
    padding: 0 16px;
  }

  .logo-text-wrap {
    display: none;
  }

  .nav-link span {
    display: none;
  }

  .nav-link {
    padding: 8px;
  }

  .nav-publish {
    padding: 8px 12px;
  }

  .user-info {
    display: none;
  }

  .dropdown-icon {
    display: none;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px 0;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav-inner {
    height: 56px;
  }

  .main-content {
    padding-top: 76px;
  }
}
</style>
