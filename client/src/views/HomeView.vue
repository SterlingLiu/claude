<template>
  <div class="home">
    <!-- Hero 区域 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>安全 · 高效 · 互助</span>
        </div>
        <h1 class="hero-title">丢了东西？来这里找找</h1>
        <p class="hero-desc">校园失物招领互助平台，让每一个丢失的物品都能找到回家的路</p>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-box">
        <div class="search-input-wrap">
          <el-icon class="search-icon"><Search /></el-icon>
          <el-input
            v-model="keyword"
            placeholder="输入物品名称搜索..."
            clearable
            @clear="search"
            @keyup.enter="search"
            size="large"
            class="search-input"
          />
        </div>
        <el-select
          v-model="category"
          placeholder="全部分类"
          clearable
          @change="search"
          size="large"
          class="category-select"
        >
          <el-option
            v-for="c in categories"
            :key="c"
            :label="c"
            :value="c"
          />
        </el-select>
        <el-button
          type="primary"
          size="large"
          @click="search"
          class="search-btn"
        >
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-button>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tabs-section">
      <div class="tabs-row">
        <button
          :class="['tab-btn', { active: tab === 'lost' }]"
          @click="switchTab('lost')"
        >
          <span class="tab-icon">📢</span>
          <span class="tab-text">寻物启事</span>
          <span class="tab-count" v-if="tab === 'lost'">{{ total }}</span>
        </button>
        <button
          :class="['tab-btn', { active: tab === 'found' }]"
          @click="switchTab('found')"
        >
          <span class="tab-icon">🎁</span>
          <span class="tab-text">招领启事</span>
          <span class="tab-count" v-if="tab === 'found'">{{ total }}</span>
        </button>
      </div>
    </div>

    <!-- 加载骨架屏 -->
    <LoadingSkeleton v-if="loading" type="card" :count="8" />

    <!-- 物品列表 -->
    <div v-else-if="list.length > 0" class="items-grid">
      <article
        v-for="(item, idx) in list"
        :key="item.id"
        class="card-item"
        :style="{ animationDelay: idx * 0.04 + 's' }"
        @click="goDetail(item)"
      >
        <div class="card-img-wrap">
          <img
            :src="getImageUrl(item.image_url) || getPlaceholderImage(item.category)"
            :alt="item.title"
            class="card-img"
            loading="lazy"
            @error="handleImageError"
          />
          <span class="card-badge" :class="getStatusClass(item.status)">
            {{ getStatusLabel(item.status) }}
          </span>
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-meta">
            <el-tag size="small" effect="plain" type="info" class="category-tag">
              {{ item.category }}
            </el-tag>
            <span class="card-time">{{ formatTime(item.created_at) }}</span>
          </p>
          <div class="card-footer">
            <span class="card-user">
              <span class="user-dot"></span>
              {{ item.nickname }}
            </span>
            <span class="card-place" v-if="item.lost_place || item.found_place">
              📍 {{ item.lost_place || item.found_place }}
            </span>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <EmptyState
      v-else
      icon="📭"
      :title="'暂无' + (tab === 'lost' ? '失物' : '招领') + '信息'"
      description="暂时没有相关物品信息，您可以稍后再来看看，或者发布一条新的信息"
      size="large"
    >
      <el-button type="primary" size="large" @click="goPublish" class="empty-publish-btn">
        <el-icon><Plus /></el-icon>
        <span>发布{{ tab === 'lost' ? '失物' : '招领' }}信息</span>
      </el-button>
    </EmptyState>

    <!-- 分页 -->
    <div class="pagination-wrap" v-if="total > size">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="size"
        v-model:current-page="page"
        @change="fetchData"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus } from '@element-plus/icons-vue'
import api from '../api'
import { categories, formatTime, getImageUrl, getPlaceholderImage, itemStatus } from '../utils'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import EmptyState from '../components/EmptyState.vue'

export default {
  name: 'HomeView',
  components: {
    Search, Plus, LoadingSkeleton, EmptyState
  },
  setup() {
    const router = useRouter()
    const tab = ref('lost')
    const list = ref([])
    const loading = ref(false)
    const keyword = ref('')
    const category = ref('')
    const page = ref(1)
    const size = ref(12)
    const total = ref(0)

    const fetchData = async () => {
      loading.value = true
      const params = {
        page: page.value,
        size: size.value,
        keyword: keyword.value,
        category: category.value
      }
      try {
        const res = tab.value === 'lost'
          ? await api.listLost(params)
          : await api.listFound(params)
        list.value = res.data.list
        total.value = res.data.total
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    const search = () => {
      page.value = 1
      fetchData()
    }

    const switchTab = (t) => {
      tab.value = t
      page.value = 1
      keyword.value = ''
      category.value = ''
      fetchData()
    }

    const goDetail = (item) => {
      router.push('/' + tab.value + '/' + item.id)
    }

    const goPublish = () => {
      router.push('/publish')
    }

    const getStatusClass = (status) => {
      const statusMap = itemStatus[tab.value] || {}
      return statusMap[status]?.class || 'pending'
    }

    const getStatusLabel = (status) => {
      const statusMap = itemStatus[tab.value] || {}
      return statusMap[status]?.label || '未知'
    }

    const handleImageError = (e) => {
      e.target.src = getPlaceholderImage('图片加载失败')
    }

    onMounted(fetchData)

    return {
      tab, list, loading, keyword, category, page, size, total,
      categories, formatTime, getImageUrl, getPlaceholderImage,
      search, switchTab, goDetail, goPublish,
      getStatusClass, getStatusLabel, handleImageError
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ========== Hero Section ========== */
.hero-section {
  text-align: center;
  padding: 48px 0 32px;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: var(--primary-light);
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  margin-bottom: 20px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1px;
  margin-bottom: 12px;
  line-height: 1.2;
}

.hero-desc {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ========== Search Section ========== */
.search-section {
  margin-bottom: 32px;
}

.search-box {
  display: flex;
  gap: 12px;
  max-width: 680px;
  margin: 0 auto;
  background: white;
  padding: 8px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.search-input-wrap {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 18px;
  color: var(--text-muted);
  z-index: 1;
}

.search-input :deep(.el-input__wrapper) {
  padding-left: 36px;
  border-radius: var(--radius);
  box-shadow: none !important;
  background: transparent;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: none !important;
}

.category-select {
  width: 140px;
}

.category-select :deep(.el-input__wrapper) {
  border-radius: var(--radius);
  box-shadow: none !important;
  background: var(--bg);
}

.search-btn {
  padding: 0 24px;
  border-radius: var(--radius);
  background: var(--primary-gradient);
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.3);
  transition: all 0.2s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 110, 246, 0.4);
}

/* ========== Tabs Section ========== */
.tabs-section {
  margin-bottom: 28px;
}

.tabs-row {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-xs);
}

.tab-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tab-btn.active {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(79, 110, 246, 0.35);
  transform: translateY(-2px);
}

.tab-icon {
  font-size: 18px;
}

.tab-count {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
}

.tab-btn:not(.active) .tab-count {
  background: var(--primary-light);
  color: var(--primary);
}

/* ========== Items Grid ========== */
.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  min-height: 400px;
}

.card-item {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  animation: cardIn 0.4s ease-out both;
}

.card-item:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-item {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

.card-img-wrap {
  position: relative;
  height: 180px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.card-item:hover .card-img {
  transform: scale(1.08);
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.card-badge.pending {
  background: rgba(255, 107, 107, 0.9);
  color: white;
}

.card-badge.done {
  background: rgba(91, 175, 127, 0.9);
  color: white;
}

.card-body {
  padding: 16px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.category-tag {
  border-radius: var(--radius-sm);
}

.card-time {
  font-size: 12px;
  color: var(--text-muted);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}

.card-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.user-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
}

.card-place {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== Empty State Button ========== */
.empty-publish-btn {
  padding: 12px 32px;
  border-radius: var(--radius);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(79, 110, 246, 0.3);
}

/* ========== Pagination ========== */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-bottom: 20px;
}

.pagination-wrap :deep(.el-pagination) {
  --el-pagination-bg-color: white;
  --el-pagination-border-radius: var(--radius);
}

.pagination-wrap :deep(.el-pager li) {
  border-radius: var(--radius-sm);
}

.pagination-wrap :deep(.el-pager li.is-active) {
  background: var(--primary);
}

/* ========== Responsive Design ========== */
@media (max-width: 1024px) {
  .items-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .search-box {
    flex-direction: column;
  }

  .category-select {
    width: 100%;
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .tabs-row {
    gap: 8px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 0 16px;
  }

  .hero-section {
    padding: 32px 0 24px;
  }

  .hero-title {
    font-size: 24px;
  }

  .items-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
