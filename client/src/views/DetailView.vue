<template>
  <div class="detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-card">
        <div class="loading-skeleton image-skeleton"></div>
        <div class="loading-content">
          <div class="loading-skeleton title-skeleton"></div>
          <div class="loading-skeleton text-skeleton"></div>
          <div class="loading-skeleton text-skeleton short"></div>
        </div>
      </div>
    </div>

    <!-- 物品详情 -->
    <div v-else-if="item && item.id" class="detail-container">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <button class="back-btn" @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回列表</span>
        </button>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ item.title }}</span>
      </div>

      <!-- 主内容区 -->
      <div class="detail-card">
        <!-- 左侧图片区 -->
        <div class="detail-image-section">
          <div class="image-wrapper">
            <img
              :src="getImageUrl(item.image_url) || getPlaceholderImage(item.category)"
              :alt="item.title"
              class="detail-image"
              @error="handleImageError"
            />
            <!-- 状态徽章 -->
            <div class="status-badge" :class="getStatusClass(item.status)">
              <span class="badge-icon">{{ getStatusIcon(item.status) }}</span>
              <span class="badge-text">{{ getStatusLabel(item.status) }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧信息区 -->
        <div class="detail-info-section">
          <!-- 头部信息 -->
          <div class="info-header">
            <div class="category-tag">
              <el-tag type="info" effect="plain" size="small">{{ item.category }}</el-tag>
            </div>
            <h1 class="detail-title">{{ item.title }}</h1>
            <div class="publish-info">
              <div class="publisher">
                <div class="publisher-avatar">{{ item.nickname?.[0] || 'U' }}</div>
                <div class="publisher-info">
                  <span class="publisher-name">{{ item.nickname || '匿名用户' }}</span>
                  <span class="publish-time">发布于 {{ formatTime(item.created_at, true) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="info-details">
            <div class="info-grid">
              <!-- 时间信息 -->
              <div class="info-card">
                <div class="info-card-icon">
                  <el-icon><Clock /></el-icon>
                </div>
                <div class="info-card-content">
                  <span class="info-card-label">{{ isLost ? '丢失时间' : '拾取时间' }}</span>
                  <span class="info-card-value">
                    {{ formatTime(item.lost_time || item.found_time || item.created_at, true) || '未填写' }}
                  </span>
                </div>
              </div>

              <!-- 地点信息 -->
              <div class="info-card">
                <div class="info-card-icon">
                  <el-icon><Location /></el-icon>
                </div>
                <div class="info-card-content">
                  <span class="info-card-label">{{ isLost ? '丢失地点' : '拾取地点' }}</span>
                  <span class="info-card-value">
                    {{ item.lost_place || item.found_place || '未填写' }}
                  </span>
                </div>
              </div>

              <!-- 联系方式 -->
              <div class="info-card contact-card">
                <div class="info-card-icon">
                  <el-icon><Phone /></el-icon>
                </div>
                <div class="info-card-content">
                  <span class="info-card-label">联系方式</span>
                  <span class="info-card-value contact-value">
                    {{ item.contact_info || '未填写' }}
                  </span>
                </div>
              </div>

              <!-- 分类信息 -->
              <div class="info-card">
                <div class="info-card-icon">
                  <el-icon><Collection /></el-icon>
                </div>
                <div class="info-card-content">
                  <span class="info-card-label">物品分类</span>
                  <span class="info-card-value">{{ item.category }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细描述 -->
          <div class="info-description" v-if="item.description">
            <h3 class="description-title">
              <el-icon><Document /></el-icon>
              <span>详细描述</span>
            </h3>
            <div class="description-content">
              <p>{{ item.description }}</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-section">
            <!-- 认领按钮 -->
            <el-button
              v-if="isLogin && item.user_id !== user.id && item.status === 0"
              type="primary"
              size="large"
              class="action-btn claim-btn"
              @click="doClaim"
            >
              <el-icon><Check /></el-icon>
              <span>申请认领</span>
            </el-button>

            <!-- 删除按钮 -->
            <el-button
              v-if="isLogin && item.user_id === user.id"
              type="danger"
              size="large"
              class="action-btn delete-btn"
              @click="doDelete"
              :loading="deleting"
            >
              <el-icon><Delete /></el-icon>
              <span>删除信息</span>
            </el-button>

            <!-- 未登录提示 -->
            <div v-if="!isLogin" class="login-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>登录后可以申请认领物品</span>
              <el-button type="primary" link @click="$router.push('/login')">立即登录</el-button>
            </div>

            <!-- 已认领提示 -->
            <div v-if="item.status !== 0" class="status-tip">
              <el-icon><CircleCheckFilled /></el-icon>
              <span>{{ isLost ? '该物品已被找到' : '该物品已被认领' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <div class="empty-card">
        <div class="empty-icon">😕</div>
        <h2 class="empty-title">物品不存在</h2>
        <p class="empty-desc">该物品可能已被删除或链接无效</p>
        <el-button type="primary" @click="$router.push('/')">
          <el-icon><HomeFilled /></el-icon>
          <span>返回首页</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Clock, Location, Phone, Collection,
  Document, Check, Delete, InfoFilled, CircleCheckFilled, HomeFilled
} from '@element-plus/icons-vue'
import api from '../api'
import { storage } from '../utils'
import { formatTime, getImageUrl, getPlaceholderImage, itemStatus } from '../utils'

export default {
  name: 'DetailView',
  components: {
    ArrowLeft, Clock, Location, Phone, Collection,
    Document, Check, Delete, InfoFilled, CircleCheckFilled, HomeFilled
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const item = ref(null)
    const loading = ref(true)
    const deleting = ref(false)
    const user = ref(storage.getUser())
    const isLogin = ref(storage.isLoggedIn())
    const isLost = computed(() => route.path.includes('/lost/'))

    const fetchItem = async () => {
      loading.value = true
      try {
        const id = route.params.id
        const res = isLost.value ? await api.getLost(id) : await api.getFound(id)
        if (res && res.data) {
          item.value = res.data
        } else {
          item.value = null
        }
      } catch (e) {
        item.value = null
      } finally {
        loading.value = false
      }
    }

    const getStatusClass = (status) => {
      const statusMap = itemStatus[isLost.value ? 'lost' : 'found'] || {}
      return statusMap[status]?.class || 'pending'
    }

    const getStatusLabel = (status) => {
      const statusMap = itemStatus[isLost.value ? 'lost' : 'found'] || {}
      return statusMap[status]?.label || '未知'
    }

    const getStatusIcon = (status) => {
      return status === 0 ? '🔍' : '✅'
    }

    const handleImageError = (e) => {
      e.target.src = getPlaceholderImage('图片加载失败')
    }

    const doClaim = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要申请认领该物品吗？系统会通知发布者。',
          '确认认领',
          { type: 'info', confirmButtonText: '确认认领', cancelButtonText: '取消' }
        )
        await api.claim(item.value.id, { type: isLost.value ? 'lost' : 'found' })
        ElMessage.success('认领申请已发送，请等待发布者确认')
      } catch (e) {
        if (e !== 'cancel') {
          console.error(e)
        }
      }
    }

    const doDelete = async () => {
      try {
        await ElMessageBox.confirm(
          '删除后将无法恢复，确定要删除吗？',
          '确认删除',
          { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
        )
        deleting.value = true
        if (isLost.value) {
          await api.deleteLost(item.value.id)
        } else {
          await api.deleteFound(item.value.id)
        }
        ElMessage.success('删除成功')
        router.push('/')
      } catch (e) {
        if (e !== 'cancel') {
          console.error(e)
        }
      } finally {
        deleting.value = false
      }
    }

    onMounted(() => fetchItem())

    return {
      item, loading, deleting, user, isLogin, isLost,
      formatTime, getImageUrl, getPlaceholderImage,
      getStatusClass, getStatusLabel, getStatusIcon,
      handleImageError, doClaim, doDelete
    }
  }
}
</script>

<style scoped>
.detail-page {
  max-width: 1000px;
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
  overflow: hidden;
  box-shadow: var(--shadow-md);
  display: flex;
  gap: 32px;
  padding: 32px;
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

.image-skeleton {
  width: 320px;
  height: 320px;
  flex-shrink: 0;
}

.loading-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title-skeleton {
  width: 60%;
  height: 32px;
}

.text-skeleton {
  width: 100%;
  height: 20px;
}

.text-skeleton.short {
  width: 40%;
}

/* ========== Breadcrumb ========== */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 14px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateX(-2px);
}

.breadcrumb-separator {
  color: var(--text-muted);
}

.breadcrumb-current {
  color: var(--text-secondary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== Detail Card ========== */
.detail-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  display: flex;
  gap: 0;
}

/* ========== Image Section ========== */
.detail-image-section {
  flex: 0 0 400px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.image-wrapper {
  position: relative;
  height: 100%;
  min-height: 400px;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.status-badge.pending {
  background: rgba(255, 107, 107, 0.9);
  color: white;
}

.status-badge.done {
  background: rgba(91, 175, 127, 0.9);
  color: white;
}

.badge-icon {
  font-size: 16px;
}

/* ========== Info Section ========== */
.detail-info-section {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Info Header */
.info-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-tag {
  display: flex;
  align-items: center;
}

.detail-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.publish-info {
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.publisher {
  display: flex;
  align-items: center;
  gap: 12px;
}

.publisher-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.publisher-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.publisher-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.publish-time {
  font-size: 12px;
  color: var(--text-muted);
}

/* Info Details */
.info-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.info-card:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
}

.info-card-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--primary);
  box-shadow: var(--shadow-xs);
  flex-shrink: 0;
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-card-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.info-card-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.contact-card {
  grid-column: span 2;
}

.contact-value {
  color: var(--primary);
}

/* Description */
.info-description {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.description-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.description-title .el-icon {
  color: var(--primary);
}

.description-content {
  padding: 16px;
  background: var(--bg);
  border-radius: var(--radius);
  border-left: 3px solid var(--primary);
}

.description-content p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0;
}

/* Action Section */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
}

.action-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius);
  transition: all 0.3s ease;
}

.claim-btn {
  background: var(--primary-gradient) !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(79, 110, 246, 0.35);
}

.claim-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 110, 246, 0.45) !important;
}

.delete-btn {
  border: 2px solid var(--accent) !important;
  color: var(--accent) !important;
  background: white !important;
}

.delete-btn:hover {
  background: var(--accent-light) !important;
  transform: translateY(-2px);
}

.login-tip,
.status-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--bg);
  border-radius: var(--radius);
  font-size: 14px;
  color: var(--text-secondary);
}

.login-tip .el-icon,
.status-tip .el-icon {
  font-size: 18px;
  color: var(--text-muted);
}

/* ========== Empty State ========== */
.empty-container {
  padding: 40px 0;
}

.empty-card {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.empty-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

/* ========== Responsive Design ========== */
@media (max-width: 768px) {
  .detail-page {
    padding: 0 16px 32px;
  }

  .detail-card {
    flex-direction: column;
  }

  .detail-image-section {
    flex: none;
  }

  .image-wrapper {
    min-height: 250px;
  }

  .detail-info-section {
    padding: 24px 20px;
  }

  .detail-title {
    font-size: 22px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .contact-card {
    grid-column: span 1;
  }

  .loading-card {
    flex-direction: column;
    padding: 20px;
  }

  .image-skeleton {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 480px) {
  .breadcrumb {
    font-size: 12px;
  }

  .breadcrumb-current {
    display: none;
  }

  .detail-info-section {
    padding: 20px 16px;
  }

  .detail-title {
    font-size: 20px;
  }
}
</style>
