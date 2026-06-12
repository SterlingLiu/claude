<template>
  <div class="user-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-card">
        <div class="loading-skeleton avatar-skeleton"></div>
        <div class="loading-skeleton text-skeleton"></div>
        <div class="loading-skeleton text-skeleton short"></div>
      </div>
    </div>

    <!-- 主内容 -->
    <div v-else class="user-container">
      <!-- 用户头部卡片 -->
      <div class="user-hero-card">
        <!-- 背景装饰 -->
        <div class="hero-bg">
          <div class="hero-gradient"></div>
          <div class="hero-pattern"></div>
        </div>

        <!-- 用户信息 -->
        <div class="hero-content">
          <div class="user-avatar-section">
            <div class="user-avatar-large">
              <span class="avatar-text">{{ user.nickname?.[0] || 'U' }}</span>
            </div>
            <div class="avatar-badge">
              <el-icon><Check /></el-icon>
            </div>
          </div>

          <div class="user-info-section">
            <h1 class="user-name">{{ user.nickname || '未设置昵称' }}</h1>
            <div class="user-meta">
              <span class="meta-item" v-if="user.phone">
                <el-icon><Phone /></el-icon>
                <span>{{ user.phone }}</span>
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                <span>注册于 {{ formatTime(user.created_at, false) || '未知' }}</span>
              </span>
            </div>
          </div>

          <el-button
            type="primary"
            round
            @click="openEditDialog"
            class="edit-profile-btn"
          >
            <el-icon><Edit /></el-icon>
            <span>编辑资料</span>
          </el-button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon-wrap">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ notifications.length }}</span>
            <span class="stat-label">通知消息</span>
          </div>
        </div>

        <div class="stat-card highlight">
          <div class="stat-icon-wrap">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ unreadCount }}</span>
            <span class="stat-label">未读消息</span>
          </div>
          <div class="stat-badge" v-if="unreadCount > 0">
            <span>{{ unreadCount }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ allItems.length }}</span>
            <span class="stat-label">我的发布</span>
          </div>
        </div>
      </div>

      <!-- 内容标签页 -->
      <div class="content-section">
        <el-tabs v-model="tab" class="user-tabs">
          <!-- 通知消息 -->
          <el-tab-pane name="notify">
            <template #label>
              <div class="tab-label">
                <el-icon><Bell /></el-icon>
                <span>通知消息</span>
                <span class="tab-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
              </div>
            </template>

            <!-- 通知列表 -->
            <div class="notify-list" v-if="notifications.length > 0">
              <div
                v-for="n in notifications"
                :key="n.id"
                :class="['notify-card', { unread: !n.is_read }]"
                @click="handleNotifyClick(n)"
              >
                <div class="notify-avatar">
                  {{ n.from_nickname?.[0] || 'U' }}
                </div>
                <div class="notify-content">
                  <div class="notify-header">
                    <span class="notify-sender">{{ n.from_nickname || '系统' }}</span>
                    <span class="notify-time">{{ formatTime(n.created_at) }}</span>
                  </div>
                  <p class="notify-message">{{ n.message }}</p>
                </div>
                <div class="notify-status" v-if="!n.is_read">
                  <span class="unread-dot"></span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <div class="empty-icon">🔔</div>
              <h3 class="empty-title">暂无通知</h3>
              <p class="empty-desc">当有人认领你发布的物品时，你会收到通知</p>
            </div>
          </el-tab-pane>

          <!-- 我的发布 -->
          <el-tab-pane name="myposts">
            <template #label>
              <div class="tab-label">
                <el-icon><Document /></el-icon>
                <span>我的发布</span>
              </div>
            </template>

            <!-- 发布列表 -->
            <div class="post-list" v-if="allItems.length > 0">
              <div
                v-for="item in allItems"
                :key="item._type + '-' + item.id"
                class="post-card"
                @click="goItem(item)"
              >
                <div class="post-image">
                  <img
                    :src="getImageUrl(item.image_url) || getPlaceholderImage(item.category)"
                    :alt="item.title"
                    @error="handleImageError"
                  />
                </div>
                <div class="post-content">
                  <div class="post-header">
                    <el-tag
                      size="small"
                      :type="item._type === 'lost' ? 'warning' : 'success'"
                      effect="plain"
                    >
                      {{ item._type === 'lost' ? '寻物' : '招领' }}
                    </el-tag>
                    <span class="post-title">{{ item.title }}</span>
                  </div>
                  <div class="post-meta">
                    <el-tag size="small" effect="plain" type="info">
                      {{ item.category }}
                    </el-tag>
                    <span class="post-time">{{ formatTime(item.created_at) }}</span>
                  </div>
                </div>
                <div class="post-status">
                  <el-tag
                    :type="item.status === 0 ? 'warning' : 'success'"
                    size="small"
                    effect="dark"
                    round
                  >
                    {{ item.status === 0 ? '进行中' : '已完成' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <div class="empty-icon">📦</div>
              <h3 class="empty-title">还没有发布过物品</h3>
              <p class="empty-desc">发布失物或招领信息，帮助物品找到主人</p>
              <el-button type="primary" @click="$router.push('/publish')">
                <el-icon><Plus /></el-icon>
                <span>发布信息</span>
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editDialog"
      title="编辑个人资料"
      width="440px"
      :close-on-click-modal="false"
      class="edit-dialog"
    >
      <div class="dialog-content">
        <div class="dialog-avatar">
          <div class="avatar-preview">
            {{ editForm.nickname?.[0] || 'U' }}
          </div>
        </div>

        <el-form :model="editForm" label-position="top" class="edit-form">
          <el-form-item label="昵称">
            <el-input
              v-model="editForm.nickname"
              placeholder="请输入昵称"
              size="large"
              maxlength="20"
              show-word-limit
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="手机号">
            <el-input
              v-model="editForm.phone"
              placeholder="请输入手机号"
              size="large"
              maxlength="11"
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialog = false" size="large" class="cancel-btn">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="saveEdit"
            size="large"
            class="save-btn"
            :loading="saving"
          >
            <el-icon><Check /></el-icon>
            <span>保存修改</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Bell, ChatDotRound, Document, Edit, Phone, Timer,
  User, Check, Plus
} from '@element-plus/icons-vue'
import api from '../api'
import { storage } from '../utils'
import { formatTime, getImageUrl, getPlaceholderImage } from '../utils'

export default {
  name: 'UserView',
  components: {
    Bell, ChatDotRound, Document, Edit, Phone, Timer,
    User, Check, Plus
  },
  setup() {
    const router = useRouter()
    const tab = ref('notify')
    const loading = ref(false)
    const saving = ref(false)
    const notifications = ref([])
    const allItems = ref([])
    const user = ref(storage.getUser())
    const editDialog = ref(false)
    const editForm = reactive({
      nickname: user.value.nickname || '',
      phone: user.value.phone || ''
    })

    const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length)

    const fetch = async () => {
      loading.value = true
      try {
        const [nr, lr, fr] = await Promise.all([
          api.getNotifications(),
          api.myLostItems(),
          api.myFoundItems()
        ])
        notifications.value = nr.data || []
        const losts = (lr.data || []).map(i => ({ ...i, _type: 'lost' }))
        const founds = (fr.data || []).map(i => ({ ...i, _type: 'found' }))
        allItems.value = [...losts, ...founds].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const openEditDialog = () => {
      editForm.nickname = user.value.nickname || ''
      editForm.phone = user.value.phone || ''
      editDialog.value = true
    }

    const readNotify = async (id) => {
      try {
        await api.markRead(id)
        notifications.value = notifications.value.map(n =>
          n.id === id ? { ...n, is_read: 1 } : n
        )
      } catch (e) {
        console.error(e)
      }
    }

    const handleNotifyClick = (n) => {
      if (!n.is_read) {
        readNotify(n.id)
      }
    }

    const goItem = (item) => {
      router.push('/' + item._type + '/' + item.id)
    }

    const handleImageError = (e) => {
      e.target.src = getPlaceholderImage('图片加载失败')
    }

    const saveEdit = async () => {
      if (!editForm.nickname.trim()) {
        ElMessage.warning('请输入昵称')
        return
      }

      saving.value = true
      try {
        await api.updateUserInfo({
          nickname: editForm.nickname.trim(),
          phone: editForm.phone.trim()
        })
        ElMessage.success('修改成功')
        editDialog.value = false
        // 使用 storage 工具更新用户信息
        user.value = storage.updateUser({
          nickname: editForm.nickname.trim(),
          phone: editForm.phone.trim()
        })
      } catch (e) {
        console.error(e)
      } finally {
        saving.value = false
      }
    }

    onMounted(fetch)

    return {
      tab, loading, saving, notifications, allItems, user,
      unreadCount, editDialog, editForm,
      formatTime, getImageUrl, getPlaceholderImage,
      openEditDialog, readNotify, handleNotifyClick,
      goItem, handleImageError, saveEdit
    }
  }
}
</script>

<style scoped>
.user-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px 40px;
}

/* ========== Loading State ========== */
.loading-container {
  padding: 20px 0;
}

.loading-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-md);
}

.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.avatar-skeleton {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.text-skeleton {
  width: 200px;
  height: 24px;
}

.text-skeleton.short {
  width: 120px;
}

/* ========== Hero Card ========== */
.user-hero-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: var(--shadow-lg);
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #4f6ef6 0%, #6c5ce7 100%);
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  color: white;
}

.user-avatar-section {
  position: relative;
  flex-shrink: 0;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar-text {
  font-size: 32px;
  font-weight: 800;
  color: white;
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #5baf7f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  font-size: 12px;
}

.user-info-section {
  flex: 1;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  opacity: 0.9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-item .el-icon {
  font-size: 16px;
}

.edit-profile-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  transition: all 0.2s ease;
}

.edit-profile-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-2px);
}

/* ========== Stats Section ========== */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  border: 1px solid var(--border-light);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #eef1ff 0%, #f0f3ff 100%);
  border-color: var(--primary-light);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--primary);
  flex-shrink: 0;
}

.stat-card.highlight .stat-icon-wrap {
  background: var(--primary);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

.stat-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--accent);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(232, 93, 117, 0.4);
}

/* ========== Content Section ========== */
.content-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow-md);
}

.user-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.user-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.user-tabs :deep(.el-tabs__item) {
  padding: 0 20px 12px;
  height: auto;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  position: relative;
}

.tab-badge {
  background: var(--accent);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  margin-left: 4px;
}

/* ========== Notify List ========== */
.notify-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notify-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notify-card:hover {
  background: var(--primary-light);
  transform: translateX(4px);
}

.notify-card.unread {
  background: #eef1ff;
  border-left: 3px solid var(--primary);
}

.notify-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.notify-content {
  flex: 1;
  min-width: 0;
}

.notify-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.notify-sender {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.notify-time {
  font-size: 12px;
  color: var(--text-muted);
}

.notify-message {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notify-status {
  flex-shrink: 0;
  padding-top: 8px;
}

.unread-dot {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 3px rgba(232, 93, 117, 0.2);
}

/* ========== Post List ========== */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-card:hover {
  background: var(--primary-light);
  transform: translateX(4px);
}

.post-image {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--border-light);
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.post-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.post-time {
  color: var(--text-muted);
}

.post-status {
  flex-shrink: 0;
}

/* ========== Empty State ========== */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

/* ========== Edit Dialog ========== */
.edit-dialog :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

.edit-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #4f6ef6 0%, #6c5ce7 100%);
  padding: 20px 24px;
  margin: 0;
}

.edit-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
}

.edit-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.dialog-content {
  padding: 24px;
}

.dialog-avatar {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(79, 110, 246, 0.3);
}

.edit-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text);
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px 24px;
}

.cancel-btn {
  border-radius: 10px;
}

.save-btn {
  background: var(--primary-gradient) !important;
  border: none !important;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 110, 246, 0.4);
}

/* ========== Responsive Design ========== */
@media (max-width: 768px) {
  .user-page {
    padding: 0 16px 32px;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .user-info-section {
    text-align: center;
  }

  .user-meta {
    justify-content: center;
  }

  .stats-section {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .stat-icon-wrap {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stat-number {
    font-size: 22px;
  }

  .content-section {
    padding: 16px;
  }

  .notify-card,
  .post-card {
    padding: 12px;
  }

  .notify-avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .post-image {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: row;
    text-align: left;
  }

  .user-avatar-large {
    width: 64px;
    height: 64px;
  }

  .avatar-text {
    font-size: 24px;
  }

  .user-name {
    font-size: 20px;
  }
}
</style>
