import { ref } from 'vue'

/**
 * 加载状态管理的 composable
 * 提供统一的加载状态管理功能
 */
export function useLoading(initialState = false) {
  const loading = ref(initialState)
  const error = ref(null)

  /**
   * 执行异步操作并管理加载状态
   * @param {Function} asyncFn - 异步函数
   * @param {object} options - 配置选项
   * @param {boolean} options.showError - 是否显示错误（默认 true）
   * @param {Function} options.onError - 错误回调
   * @param {Function} options.onSuccess - 成功回调
   * @param {Function} options.onFinally - 完成回调
   * @returns {Promise} 异步操作的结果
   */
  async function withLoading(asyncFn, options = {}) {
    const {
      showError = true,
      onError,
      onSuccess,
      onFinally
    } = options

    loading.value = true
    error.value = null

    try {
      const result = await asyncFn()
      onSuccess?.(result)
      return result
    } catch (err) {
      error.value = err
      if (showError) {
        console.error('Operation failed:', err)
      }
      onError?.(err)
      throw err
    } finally {
      loading.value = false
      onFinally?.()
    }
  }

  /**
   * 清除错误状态
   */
  function clearError() {
    error.value = null
  }

  /**
   * 重置状态
   */
  function reset() {
    loading.value = false
    error.value = null
  }

  return {
    loading,
    error,
    withLoading,
    clearError,
    reset
  }
}
