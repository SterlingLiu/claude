// 测试环境设置
import { vi, beforeEach } from 'vitest'

// 模拟 localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value) }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index) => Object.keys(store)[index] || null)
  }
})()

// 设置到全局对象
globalThis.localStorage = localStorageMock
if (typeof window !== 'undefined') {
  window.localStorage = localStorageMock
}

// 每个测试前重置
beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})
