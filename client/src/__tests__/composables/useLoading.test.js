import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLoading } from '@/composables/useLoading.js'

describe('useLoading Composable 测试', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  });

  describe('初始状态', () => {

    it('应该返回默认初始状态', () => {
      const { loading, error } = useLoading()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    });

    it('应该接受自定义初始状态', () => {
      const { loading } = useLoading(true)
      expect(loading.value).toBe(true)
    });
  });

  describe('withLoading', () => {

    it('应该在异步操作期间设置 loading 状态', async () => {
      const { withLoading, loading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue('result')

      expect(loading.value).toBe(false)
      const promise = withLoading(asyncFn)
      expect(loading.value).toBe(true)
      await promise
      expect(loading.value).toBe(false)
    });

    it('应该返回异步函数的结果', async () => {
      const { withLoading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue({ data: 'test' })

      const result = await withLoading(asyncFn)
      expect(result).toEqual({ data: 'test' })
    });

    it('应该在失败时设置错误状态', async () => {
      const { withLoading, error } = useLoading()
      const asyncFn = vi.fn().mockRejectedValue(new Error('测试错误'))

      await expect(withLoading(asyncFn)).rejects.toThrow('测试错误')
      expect(error.value).toBeTruthy()
    });

    it('应该在成功时调用 onSuccess 回调', async () => {
      const { withLoading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue('result')
      const onSuccess = vi.fn()

      await withLoading(asyncFn, { onSuccess })
      expect(onSuccess).toHaveBeenCalledWith('result')
    });

    it('应该在失败时调用 onError 回调', async () => {
      const { withLoading } = useLoading()
      const mockError = new Error('error')
      const asyncFn = vi.fn().mockRejectedValue(mockError)
      const onError = vi.fn()

      await expect(withLoading(asyncFn, { onError })).rejects.toThrow()
      expect(onError).toHaveBeenCalledWith(mockError)
    });

    it('应该在完成时调用 onFinally 回调', async () => {
      const { withLoading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue('result')
      const onFinally = vi.fn()

      await withLoading(asyncFn, { onFinally })
      expect(onFinally).toHaveBeenCalled()
    });

    it('应该清除之前的错误状态', async () => {
      const { withLoading, error } = useLoading()

      const asyncFn1 = vi.fn().mockRejectedValue(new Error('error'))
      await expect(withLoading(asyncFn1)).rejects.toThrow()
      expect(error.value).toBeTruthy()

      const asyncFn2 = vi.fn().mockResolvedValue('success')
      await withLoading(asyncFn2)
      expect(error.value).toBeNull()
    });
  });

  describe('clearError', () => {

    it('应该清除错误状态', async () => {
      const { withLoading, clearError, error } = useLoading()

      const asyncFn = vi.fn().mockRejectedValue(new Error('error'))
      await expect(withLoading(asyncFn)).rejects.toThrow()
      expect(error.value).toBeTruthy()

      clearError()
      expect(error.value).toBeNull()
    });
  });

  describe('reset', () => {

    it('应该重置所有状态', async () => {
      const { withLoading, reset, loading, error } = useLoading()

      const asyncFn = vi.fn().mockRejectedValue(new Error('error'))
      await expect(withLoading(asyncFn)).rejects.toThrow()

      reset()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    });
  });

  describe('边界情况', () => {

    it('应该处理 undefined 返回值', async () => {
      const { withLoading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue(undefined)

      const result = await withLoading(asyncFn)
      expect(result).toBeUndefined()
    });

    it('应该处理 null 返回值', async () => {
      const { withLoading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue(null)

      const result = await withLoading(asyncFn)
      expect(result).toBeNull()
    });

    it('应该处理 0 返回值', async () => {
      const { withLoading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue(0)

      const result = await withLoading(asyncFn)
      expect(result).toBe(0)
    });

    it('应该处理 options 为 undefined', async () => {
      const { withLoading } = useLoading()
      const asyncFn = vi.fn().mockResolvedValue('result')

      const result = await withLoading(asyncFn, undefined)
      expect(result).toBe('result')
    });
  });
});
