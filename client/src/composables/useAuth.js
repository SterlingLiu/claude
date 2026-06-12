import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

/**
 * 用户认证相关的 composable
 * 提供登录状态管理、用户信息获取等功能
 */
export function useAuth() {
  const router = useRouter()
  const user = ref(getUserFromStorage())
  const token = ref(localStorage.getItem('token'))

  /**
   * 从 localStorage 获取用户信息
   */
  function getUserFromStorage() {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }

  /**
   * 是否已登录
   */
  const isLogin = computed(() => !!token.value)

  /**
   * 是否是管理员
   */
  const isAdmin = computed(() => user.value?.role === 1)

  /**
   * 用户昵称
   */
  const nickname = computed(() => user.value?.nickname || user.value?.username || '用户')

  /**
   * 用户头像（首字母）
   */
  const avatarLetter = computed(() => {
    const name = user.value?.nickname || user.value?.username || 'U'
    return name[0]?.toUpperCase() || 'U'
  })

  /**
   * 设置登录信息
   * @param {string} newToken - JWT token
   * @param {object} newUser - 用户信息
   */
  function setLoginInfo(newToken, newUser) {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    token.value = newToken
    user.value = newUser
  }

  /**
   * 退出登录
   */
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    token.value = null
    user.value = {}
    router.push('/')
  }

  /**
   * 更新用户信息
   * @param {object} newInfo - 新的用户信息
   */
  function updateUserInfo(newInfo) {
    const updatedUser = { ...user.value, ...newInfo }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    user.value = updatedUser
  }

  /**
   * 检查是否需要登录，如果未登录则跳转到登录页
   * @param {string} redirectPath - 登录后重定向的路径
   * @returns {boolean} 是否已登录
   */
  function requireLogin(redirectPath) {
    if (!isLogin.value) {
      router.push({
        path: '/login',
        query: { redirect: redirectPath || router.currentRoute.value.fullPath }
      })
      return false
    }
    return true
  }

  return {
    user,
    token,
    isLogin,
    isAdmin,
    nickname,
    avatarLetter,
    setLoginInfo,
    logout,
    updateUserInfo,
    requireLogin
  }
}
