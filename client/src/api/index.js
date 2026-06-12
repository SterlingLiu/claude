import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 防止 401 重复弹窗
let isRedirectingToLogin = false

// 创建 axios 实例
const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }

    // GET 请求添加时间戳防缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    return config
  },
  error => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => response.data,
  error => {
    const { response, message, code } = error

    // 网络错误
    if (code === 'ERR_NETWORK' || !response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }

    // 请求超时
    if (code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
      return Promise.reject(error)
    }

    const statusCode = response.status
    const errorMsg = response.data?.msg || '请求失败'

    switch (statusCode) {
      case 400:
        ElMessage.warning(errorMsg || '请求参数错误')
        break
      case 401:
        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true
          ElMessage.warning('登录已过期，请重新登录')
          localStorage.clear()
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
          setTimeout(() => { isRedirectingToLogin = false }, 1000)
        }
        break
      case 403:
        ElMessage.error('没有权限访问此资源')
        break
      case 404:
        ElMessage.warning(errorMsg || '请求的资源不存在')
        break
      case 413:
        ElMessage.error('文件过大，请压缩后上传')
        break
      case 429:
        ElMessage.warning(errorMsg || '请求过于频繁，请稍后再试')
        break
      case 500:
        ElMessage.error(errorMsg || '服务器内部错误')
        break
      case 502:
      case 503:
      case 504:
        ElMessage.error('服务器暂时不可用，请稍后重试')
        break
      default:
        ElMessage.error(errorMsg || `请求失败 (${statusCode})`)
    }

    return Promise.reject(error)
  }
)

// 重试函数（不重试认证错误）
const retryRequest = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    const status = error?.response?.status
    // 401/403 不重试，直接抛出
    if (status === 401 || status === 403) {
      throw error
    }
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay)
    }
    throw error
  }
}

// API 接口
export default {
  // ==================== 用户相关 ====================
  register: (data) => http.post('/register', data),
  login: (data) => http.post('/login', data),
  getUserInfo: () => retryRequest(() => http.get('/user/info')),
  updateUserInfo: (data) => http.put('/user/info', data),

  // ==================== 失物相关 ====================
  listLost: (params) => retryRequest(() => http.get('/lost', { params })),
  getLost: (id) => retryRequest(() => http.get('/lost/' + id)),
  createLost: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {}
    return http.post('/lost', data, config)
  },
  deleteLost: (id) => http.delete('/lost/' + id),
  myLostItems: () => retryRequest(() => http.get('/my/lost')),

  // ==================== 招领相关 ====================
  listFound: (params) => retryRequest(() => http.get('/found', { params })),
  getFound: (id) => retryRequest(() => http.get('/found/' + id)),
  createFound: (data) => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {}
    return http.post('/found', data, config)
  },
  deleteFound: (id) => http.delete('/found/' + id),
  myFoundItems: () => retryRequest(() => http.get('/my/found')),

  // ==================== 认领相关 ====================
  claim: (id, data) => http.post('/claim/' + id, data),

  // ==================== 通知相关 ====================
  getNotifications: () => retryRequest(() => http.get('/notifications')),
  getUnreadCount: () => retryRequest(() => http.get('/notifications/unread')),
  markRead: (id) => http.put('/notifications/' + id + '/read'),

  // ==================== 文件上传 ====================
  upload: (data) => http.post('/upload', data, {
    headers: { 'Content-Type': undefined },
    timeout: 30000
  })
}
