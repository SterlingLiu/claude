import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSkeleton from '@/components/LoadingSkeleton.vue'

describe('LoadingSkeleton 组件测试', () => {

  describe('组件渲染', () => {

    it('应该正确渲染默认卡片类型', () => {
      const wrapper = mount(LoadingSkeleton)

      expect(wrapper.find('.skeleton-wrapper').exists()).toBe(true)
      expect(wrapper.find('.skeleton-wrapper').classes()).toContain('card')

      const cards = wrapper.findAll('.skeleton-card')
      expect(cards).toHaveLength(6)
    });

    it('应该正确渲染列表类型', () => {
      const wrapper = mount(LoadingSkeleton, {
        props: { type: 'list', count: 3 }
      })

      expect(wrapper.find('.skeleton-wrapper').classes()).toContain('list')
      expect(wrapper.findAll('.skeleton-list-item')).toHaveLength(3)
    });

    it('应该正确渲染详情类型', () => {
      const wrapper = mount(LoadingSkeleton, {
        props: { type: 'detail' }
      })

      expect(wrapper.find('.skeleton-wrapper').classes()).toContain('detail')
      expect(wrapper.find('.skeleton-detail').exists()).toBe(true)
    });

    it('应该正确渲染线条类型', () => {
      const wrapper = mount(LoadingSkeleton, {
        props: { type: 'line', count: 4 }
      })

      expect(wrapper.findAll('.skeleton-line')).toHaveLength(4)
    });
  });

  describe('Props 验证', () => {

    it('应该使用默认 props', () => {
      const wrapper = mount(LoadingSkeleton)

      expect(wrapper.props('type')).toBe('card')
      expect(wrapper.props('count')).toBe(6)
    });

    it('应该接受自定义 count', () => {
      const wrapper = mount(LoadingSkeleton, {
        props: { count: 10 }
      })

      expect(wrapper.findAll('.skeleton-card')).toHaveLength(10)
    });

    it('应该处理 count 为 0', () => {
      const wrapper = mount(LoadingSkeleton, {
        props: { count: 0 }
      })

      expect(wrapper.findAll('.skeleton-card')).toHaveLength(0)
    });
  });
});
