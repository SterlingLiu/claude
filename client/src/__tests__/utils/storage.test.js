import { describe, it, expect, beforeEach } from 'vitest'
import { storage, userStorage } from '@/utils'

describe('storage 工具测试', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Token 管理', () => {
    it('应该设置和获取 Token', () => {
      storage.setToken('test-token-123')
      expect(storage.getToken()).toBe('test-token-123')
    })

    it('应该返回 null 当没有 Token 时', () => {
      expect(storage.getToken()).toBeNull()
    })

    it('应该移除 Token', () => {
      storage.setToken('test-token')
      storage.removeToken()
      expect(storage.getToken()).toBeNull()
    })
  })

  describe('用户信息管理', () => {
    it('应该设置和获取用户信息', () => {
      const user = { id: 1, username: 'test', nickname: '测试' }
      storage.setUser(user)
      expect(storage.getUser()).toEqual(user)
    })

    it('应该返回空对象当没有用户信息时', () => {
      expect(storage.getUser()).toEqual({})
    })

    it('应该更新用户信息', () => {
      storage.setUser({ id: 1, username: 'test', nickname: '旧昵称' })
      const updated = storage.updateUser({ nickname: '新昵称' })
      expect(updated.nickname).toBe('新昵称')
      expect(updated.username).toBe('test')
    })
  })

  describe('登录状态', () => {
    it('应该在有 Token 时返回已登录', () => {
      storage.setToken('test-token')
      expect(storage.isLoggedIn()).toBe(true)
    })

    it('应该在没有 Token 时返回未登录', () => {
      expect(storage.isLoggedIn()).toBe(false)
    })

    it('应该设置登录信息', () => {
      const user = { id: 1, username: 'test' }
      storage.setAuth('token-123', user)
      expect(storage.getToken()).toBe('token-123')
      expect(storage.getUser()).toEqual(user)
    })
  })

  describe('清除功能', () => {
    it('应该清除认证信息', () => {
      storage.setAuth('token', { id: 1 })
      storage.clearAuth()
      expect(storage.getToken()).toBeNull()
      expect(storage.getUser()).toEqual({})
    })
  })
})

describe('userStorage 工具测试', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该返回用户昵称', () => {
    storage.setUser({ id: 1, nickname: '测试用户' })
    expect(userStorage.getNickname()).toBe('测试用户')
  })

  it('应该回退到用户名', () => {
    storage.setUser({ id: 1, username: 'testuser' })
    expect(userStorage.getNickname()).toBe('testuser')
  })

  it('应该回退到默认值', () => {
    storage.setUser({})
    expect(userStorage.getNickname()).toBe('用户')
  })

  it('应该识别管理员', () => {
    storage.setUser({ role: 1 })
    expect(userStorage.isAdmin()).toBe(true)
  })

  it('应该识别普通用户', () => {
    storage.setUser({ role: 0 })
    expect(userStorage.isAdmin()).toBe(false)
  })
})
