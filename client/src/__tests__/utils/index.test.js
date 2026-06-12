import { describe, it, expect, vi } from 'vitest'
import {
  categories,
  itemStatus,
  formatTime,
  formatFileSize,
  truncateText,
  debounce,
  throttle,
  generateId,
  isValidPhone,
  isValidEmail
} from '@/utils/index'

describe('工具函数测试', () => {
  describe('categories 常量', () => {
    it('应该包含7个分类', () => {
      expect(categories).toHaveLength(7)
    })

    it('应该包含基本分类', () => {
      expect(categories).toContain('证件')
      expect(categories).toContain('电子产品')
      expect(categories).toContain('钥匙')
    })
  })

  describe('itemStatus 常量', () => {
    it('应该包含失物和招领状态', () => {
      expect(itemStatus.lost).toBeDefined()
      expect(itemStatus.found).toBeDefined()
    })

    it('失物应该有待找到和已找到状态', () => {
      expect(itemStatus.lost[0].label).toBe('寻找中')
      expect(itemStatus.lost[1].label).toBe('已找到')
    })

    it('招领应该有待认领和已认领状态', () => {
      expect(itemStatus.found[0].label).toBe('待认领')
      expect(itemStatus.found[1].label).toBe('已认领')
    })
  })

  describe('formatTime', () => {
    it('应该返回空字符串当时间为空', () => {
      expect(formatTime(null)).toBe('')
      expect(formatTime(undefined)).toBe('')
      expect(formatTime('')).toBe('')
    })

    it('应该返回空字符串当时间无效', () => {
      expect(formatTime('invalid-date')).toBe('')
    })

    it('应该返回刚刚当时间在1分钟内', () => {
      const now = new Date()
      expect(formatTime(now)).toBe('刚刚')
    })

    it('应该返回X分钟前', () => {
      const time = new Date(Date.now() - 5 * 60 * 1000)
      const result = formatTime(time)
      expect(result).toContain('分钟前')
    })

    it('应该返回X小时前', () => {
      const time = new Date(Date.now() - 3 * 60 * 60 * 1000)
      const result = formatTime(time)
      expect(result).toContain('小时前')
    })

    it('应该返回昨天', () => {
      const time = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const result = formatTime(time)
      expect(result).toContain('昨天')
    })

    it('应该返回完整日期当超过7天', () => {
      const time = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      const result = formatTime(time)
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('formatFileSize', () => {
    it('应该返回0 B当大小为0', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('应该格式化KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
    })

    it('应该格式化MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    })
  })

  describe('truncateText', () => {
    it('应该返回原文当文本长度小于最大长度', () => {
      expect(truncateText('短文本', 10)).toBe('短文本')
    })

    it('应该截断文本当超过最大长度', () => {
      const result = truncateText('这是一个很长的文本需要被截断', 5)
      expect(result).toBe('这是一个很...')
    })

    it('应该使用自定义后缀', () => {
      const result = truncateText('很长的文本内容', 3, '---')
      expect(result).toBe('很长的---')
    })
  })

  describe('debounce', () => {
    it('应该延迟执行函数', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('throttle', () => {
    it('应该立即执行第一次调用', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('generateId', () => {
    it('应该生成ID', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThan(0)
      expect(id.length).toBeLessThanOrEqual(8)
    })

    it('应该生成不同的ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('isValidPhone', () => {
    it('应该验证有效的手机号', () => {
      expect(isValidPhone('13800138000')).toBe(true)
      expect(isValidPhone('15012345678')).toBe(true)
    })

    it('应该拒绝无效的手机号', () => {
      expect(isValidPhone('12345678901')).toBe(false)
      expect(isValidPhone('1380013800')).toBe(false)
      expect(isValidPhone('')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('应该验证有效的邮箱', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
    })

    it('应该拒绝无效的邮箱', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })
})
