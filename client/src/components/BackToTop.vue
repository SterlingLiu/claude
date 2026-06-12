<template>
  <transition name="bounce">
    <div
      class="back-to-top"
      v-show="visible"
      @click="scrollToTop"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :style="{ bottom: bottom + 'px', right: right + 'px' }"
    >
      <div class="btn-inner">
        <el-icon class="arrow-icon" :class="{ 'arrow-up': isHovered }">
          <Top />
        </el-icon>
      </div>
      <div class="ripple" v-if="isHovered"></div>
    </div>
  </transition>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { Top } from '@element-plus/icons-vue'

export default {
  name: 'BackToTop',
  components: {
    Top
  },
  props: {
    visibilityHeight: {
      type: Number,
      default: 300
    },
    bottom: {
      type: Number,
      default: 40
    },
    right: {
      type: Number,
      default: 40
    }
  },
  setup(props) {
    const visible = ref(false)
    const isHovered = ref(false)
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          visible.value = window.scrollY > props.visibilityHeight
          ticking = false
        })
        ticking = true
      }
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      visible,
      isHovered,
      scrollToTop
    }
  }
}
</script>

<style scoped>
.back-to-top {
  position: fixed;
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, #4f6ef6 0%, #6c5ce7 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(79, 110, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
}

.back-to-top:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(79, 110, 246, 0.5);
  border-radius: 18px;
}

.back-to-top:active {
  transform: translateY(-2px) scale(1.02);
}

.btn-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 22px;
  transition: transform 0.3s ease;
}

.arrow-icon.arrow-up {
  transform: translateY(-2px);
}

.ripple {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: inherit;
  animation: ripple-animation 1s ease-out infinite;
}

@keyframes ripple-animation {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 弹跳动画 */
.bounce-enter-active {
  animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.bounce-leave-active {
  animation: bounce-out 0.3s ease-in;
}

@keyframes bounce-in {
  0% {
    transform: scale(0) translateY(20px);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) translateY(-5px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(0) translateY(20px);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top {
    transition: opacity 0.3s ease;
  }

  .back-to-top:hover {
    transform: none;
    border-radius: 16px;
  }

  .arrow-icon {
    transition: none;
  }

  .ripple {
    display: none;
  }

  .bounce-enter-active,
  .bounce-leave-active {
    animation: none;
    transition: opacity 0.3s ease;
  }

  .bounce-enter-from,
  .bounce-leave-to {
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .back-to-top {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    bottom: 24px !important;
    right: 24px !important;
  }

  .back-to-top:hover {
    border-radius: 16px;
  }
}
</style>
