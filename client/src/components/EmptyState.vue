<template>
  <div class="empty-state" :class="size">
    <div class="empty-icon">{{ icon }}</div>
    <h3 class="empty-title" v-if="title">{{ title }}</h3>
    <p class="empty-description" v-if="description">{{ description }}</p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: '📭'
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 24px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state.small {
  padding: 32px 16px;
}

.empty-state.large {
  padding: 80px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-state.small .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state.large .empty-icon {
  font-size: 80px;
  margin-bottom: 28px;
}

.empty-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.empty-state.small .empty-title {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-state.large .empty-title {
  font-size: 28px;
  margin-bottom: 16px;
}

.empty-description {
  font-size: 15px;
  color: var(--text-secondary);
  max-width: 400px;
  margin: 0 auto 24px;
  line-height: 1.6;
}

.empty-state.small .empty-description {
  font-size: 13px;
  margin-bottom: 16px;
}

.empty-state.large .empty-description {
  font-size: 17px;
  margin-bottom: 32px;
}

@media (prefers-reduced-motion: reduce) {
  .empty-state {
    animation: none;
  }

  .empty-icon {
    animation: none;
  }
}
</style>
