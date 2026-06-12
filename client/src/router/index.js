import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '../utils'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: '首页 - 校园失物招领平台',
      description: '浏览和搜索校园失物招领信息',
      keywords: '失物招领,校园,丢失物品'
    }
  },
  {
    path: '/lost/:id',
    name: 'LostDetail',
    component: () => import('../views/DetailView.vue'),
    meta: {
      title: '失物详情 - 校园失物招领平台',
      description: '查看失物详细信息并申请认领'
    }
  },
  {
    path: '/found/:id',
    name: 'FoundDetail',
    component: () => import('../views/DetailView.vue'),
    meta: {
      title: '招领详情 - 校园失物招领平台',
      description: '查看招领物品详细信息'
    }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('../views/PublishView.vue'),
    meta: {
      auth: true,
      title: '发布信息 - 校园失物招领平台',
      description: '发布失物或招领信息'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      title: '登录 - 校园失物招领平台',
      description: '登录或注册校园失物招领平台账号'
    }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/UserView.vue'),
    meta: {
      auth: true,
      title: '个人中心 - 校园失物招领平台',
      description: '查看个人信息、通知和发布记录'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '页面未找到 - 校园失物招领平台',
      description: '抱歉，您访问的页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const defaultTitle = '校园失物招领与互助平台'
  document.title = to.meta.title || defaultTitle

  // 更新 meta 描述
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription && to.meta.description) {
    metaDescription.setAttribute('content', to.meta.description)
  }

  // 更新 meta 关键词
  const metaKeywords = document.querySelector('meta[name="keywords"]')
  if (metaKeywords && to.meta.keywords) {
    metaKeywords.setAttribute('content', to.meta.keywords)
  }

  // 检查是否需要登录
  if (to.meta.auth && !storage.isLoggedIn()) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

// 全局后置守卫 - 页面加载完成
router.afterEach((to, from) => {
  // 可以在这里添加页面访问统计等
  // 例如：trackPageView(to.path)
})

export default router
