/**
 * 通用工具函数模块
 * 包含格式化、验证、存储等功能
 */

// ==================== 常量定义 ====================

/**
 * 物品分类列表
 */
export const categories = ['证件', '电子产品', '生活用品', '衣物', '钥匙', '书本', '其他']

/**
 * 物品状态映射
 */
export const itemStatus = {
  lost: {
    0: { label: '寻找中', class: 'pending' },
    1: { label: '已找到', class: 'done' }
  },
  found: {
    0: { label: '待认领', class: 'pending' },
    1: { label: '已认领', class: 'done' }
  }
}

// ==================== 格式化函数 ====================

/**
 * 格式化时间为易读格式
 */
export function formatTime(time, showTime = true) {
  if (!time) return ''
  const date = new Date(time)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (seconds < 60) return '刚刚'
  if (minutes < 60) return minutes + '分钟前'
  if (hours < 24) return hours + '小时前'
  if (days === 1) return '昨天 ' + formatDateTime(date, true)
  if (days < 7) return days + '天前'
  return formatDateTime(date, showTime)
}

function formatDateTime(date, showTime = true) {
  const pad = n => String(n).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  if (showTime) {
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes
  }
  return year + '-' + month + '-' + day
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function truncateText(text, maxLength = 50, suffix = '...') {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

// ==================== 函数工具 ====================

export function debounce(func, wait = 300) {
  let timeout = null
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle(func, limit = 300) {
  let inThrottle = false
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length)
}

// ==================== 验证函数 ====================

export function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ==================== URL 工具 ====================

const API_BASE = import.meta.env.VITE_API_BASE || ''

export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return API_BASE + (path.startsWith('/') ? path : '/' + path)
}

export function getPlaceholderImage(text, width, height) {
  text = text || ''
  width = width || 200
  height = height || 200
  return 'https://via.placeholder.com/' + width + 'x' + height + '?text=' + encodeURIComponent(text)
}

// ==================== DOM 工具 ====================

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export function scrollToElement(selector, options) {
  options = options || {}
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start', ...options })
  }
}

// ==================== 本地存储 ====================

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
}

export const storage = {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  },
  setToken(token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  },
  removeToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  },
  getUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER)
      return userStr ? JSON.parse(userStr) : {}
    } catch (e) {
      return {}
    }
  },
  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },
  updateUser(newInfo) {
    const currentUser = this.getUser()
    const updatedUser = { ...currentUser, ...newInfo }
    this.setUser(updatedUser)
    return updatedUser
  },
  removeUser() {
    localStorage.removeItem(STORAGE_KEYS.USER)
  },
  isLoggedIn() {
    return !!this.getToken()
  },
  getAuth() {
    return {
      token: this.getToken(),
      user: this.getUser(),
      isLoggedIn: this.isLoggedIn()
    }
  },
  setAuth(token, user) {
    this.setToken(token)
    this.setUser(user)
  },
  clear() {
    localStorage.clear()
  },
  clearAuth() {
    this.removeToken()
    this.removeUser()
  }
}

export const userStorage = {
  getNickname() {
    const user = storage.getUser()
    return user.nickname || user.username || '用户'
  },
  getAvatarLetter() {
    const name = this.getNickname()
    return name[0] ? name[0].toUpperCase() : 'U'
  },
  isAdmin() {
    const user = storage.getUser()
    return user.role === 1
  },
  getUserId() {
    const user = storage.getUser()
    return user.id || null
  }
}

export default storage
