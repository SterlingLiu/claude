<template>
  <div class="skeleton-wrapper" :class="type">
    <!-- 卡片骨架屏 -->
    <template v-if="type === 'card'">
      <div v-for="i in count" :key="i" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-body">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
        </div>
      </div>
    </template>

    <!-- 列表项骨架屏 -->
    <template v-else-if="type === 'list'">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
    </template>

    <!-- 详情页骨架屏 -->
    <template v-else-if="type === 'detail'">
      <div class="skeleton-detail">
        <div class="skeleton-image large"></div>
        <div class="skeleton-title large"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    </template>

    <!-- 默认骨架屏 -->
    <template v-else>
      <div v-for="i in count" :key="i" class="skeleton-line"></div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'LoadingSkeleton',
  props: {
    type: {
      type: String,
      default: 'card',
      validator: (value) => ['card', 'list', 'detail', 'line'].includes(value)
    },
    count: {
      type: Number,
      default: 6
    }
  }
}
</script>

<style scoped>
.skeleton-wrapper {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 骨架屏动画 */
.skeleton-image,
.skeleton-title,
.skeleton-text,
.skeleton-avatar,
.skeleton-line {
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    #f0f0f0 50%,
    var(--border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 卡片骨架屏 */
.skeleton-card {
  display: inline-block;
  width: calc(25% - 12px);
  margin: 0 6px 16px;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.skeleton-image {
  height: 180px;
  background: var(--border);
}

.skeleton-body {
  padding: 16px;
}

.skeleton-title {
  height: 20px;
  width: 70%;
  margin-bottom: 12px;
}

.skeleton-text {
  height: 14px;
  width: 100%;
  margin-bottom: 8px;
}

.skeleton-text.short {
  width: 60%;
}

/* 列表项骨架屏 */
.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
}

.skeleton-content .skeleton-title {
  width: 40%;
  margin-bottom: 8px;
}

.skeleton-content .skeleton-text {
  width: 80%;
}

/* 详情页骨架屏 */
.skeleton-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.skeleton-image.large {
  height: 400px;
  margin-bottom: 24px;
  border-radius: var(--radius-lg);
}

.skeleton-title.large {
  height: 32px;
  width: 50%;
  margin-bottom: 20px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .skeleton-card {
    width: calc(33.33% - 12px);
  }
}

@media (max-width: 768px) {
  .skeleton-card {
    width: calc(50% - 12px);
  }
  .skeleton-image.large {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .skeleton-card {
    width: 100%;
    margin: 0 0 16px;
  }
}

/* 无障碍：尊重用户的动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .skeleton-image,
  .skeleton-title,
  .skeleton-text,
  .skeleton-avatar,
  .skeleton-line {
    animation: none;
  }
}
</style>
