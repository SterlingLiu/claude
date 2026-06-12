import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// CSRF Token 管理
let csrfToken = null
let sessionId = null

/**
 * 获取 CSRF Token
 */
async function fetchCsrfToken() {
  try {
    const response = await axios.get('/api/csrf-token')
    csrfToken = response.data.data.token
    sessionId = response.data.data.sessionId
    return csrfToken
  } catch (error) {
    console.error('获取 CSRF Token 失败:', error)
    return null
  }
}

// 创建 axios 实例 - 普通请求
const http = axios.create({
  baseURL: '/api',
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json'
  }
})

// 创建 axios 实例 - 文件上传
const uploadHttp = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// 请求拦截器 - 普通请求
http.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }

    // 添加 CSRF Token
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }

    // 添加请求时间戳（防止缓存）
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

// 请求拦截器 - 文件上传
uploadHttp.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }

    // 添加 CSRF Token
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }

    return config
  },
  error => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理
const responseInterceptor = (response) => {
  return response.data
}

// 错误拦截器 - 统一处理
const errorInterceptor = async (error) => {
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

  // HTTP 状态码处理
  const statusCode = response.status
  const errorMsg = response.data?.msg || '请求失败'

  // CSRF Token 失效时重新获取
  if (statusCode === 403 && errorMsg.includes('CSRF')) {
    await fetchCsrfToken()
    // 重新发起请求
    const config = error.config
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }
    return axios.request(config)
  }

  switch (statusCode) {
    case 400:
      ElMessage.warning(errorMsg || '请求参数错误')
      break

    case 401:
      ElMessage.warning('登录已过期，请重新登录')
      localStorage.clear()
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
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

// 应用拦截器
http.interceptors.response.use(responseInterceptor, errorInterceptor)
uploadHttp.interceptors.response.use(responseInterceptor, errorInterceptor)

// 重试函数
const retryRequest = async (fn, retries = 2, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
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
  createLost: (data) => uploadHttp.post('/lost', data),
  deleteLost: (id) => http.delete('/lost/' + id),
  myLostItems: () => retryRequest(() => http.get('/my/lost')),

  // ==================== 招领相关 ====================
  listFound: (params) => retryRequest(() => http.get('/found', { params })),
  getFound: (id) => retryRequest(() => http.get('/found/' + id)),
  createFound: (data) => uploadHttp.post('/found', data),
  deleteFound: (id) => http.delete('/found/' + id),
  myFoundItems: () => retryRequest(() => http.get('/my/found')),

  // ==================== 认领相关 ====================
  claim: (id, data) => http.post('/claim/' + id, data),

  // ==================== 通知相关 ====================
  getNotifications: () => retryRequest(() => http.get('/notifications')),
  getUnreadCount: () => retryRequest(() => http.get('/notifications/unread')),
  markRead: (id) => http.put('/notifications/' + id + '/read'),

  // ==================== 文件上传 ====================
  upload: (data) => uploadHttp.post('/upload', data),

  // ==================== CSRF Token ====================
  getCsrfToken: () => fetchCsrfToken()
}
