import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EmptyState from '@/components/EmptyState.vue'

describe('EmptyState 组件测试', () => {

  describe('组件渲染', () => {

    it('应该正确渲染默认状态', () => {
      const wrapper = mount(EmptyState)

      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.find('.empty-icon').text()).toBe('📭')
    });

    it('应该渲染自定义图标', () => {
      const wrapper = mount(EmptyState, {
        props: { icon: '🔍' }
      })

      expect(wrapper.find('.empty-icon').text()).toBe('🔍')
    });

    it('应该渲染标题', () => {
      const wrapper = mount(EmptyState, {
        props: { title: '暂无数据' }
      })

      expect(wrapper.find('.empty-title').exists()).toBe(true)
      expect(wrapper.find('.empty-title').text()).toBe('暂无数据')
    });

    it('应该渲染描述', () => {
      const wrapper = mount(EmptyState, {
        props: { description: '这里什么都没有' }
      })

      expect(wrapper.find('.empty-description').exists()).toBe(true)
      expect(wrapper.find('.empty-description').text()).toBe('这里什么都没有')
    });

    it('不应该渲染空的标题', () => {
      const wrapper = mount(EmptyState, {
        props: { title: '' }
      })

      expect(wrapper.find('.empty-title').exists()).toBe(false)
    });

    it('不应该渲染空的描述', () => {
      const wrapper = mount(EmptyState, {
        props: { description: '' }
      })

      expect(wrapper.find('.empty-description').exists()).toBe(false)
    });
  });

  describe('Props 验证', () => {

    it('应该使用默认 props', () => {
      const wrapper = mount(EmptyState)

      expect(wrapper.props('icon')).toBe('📭')
      expect(wrapper.props('title')).toBe('')
      expect(wrapper.props('description')).toBe('')
      expect(wrapper.props('size')).toBe('medium')
    });

    it('应该验证 size prop 的有效性', () => {
      ['small', 'medium', 'large'].forEach(size => {
        const wrapper = mount(EmptyState, { props: { size } })
        expect(wrapper.props('size')).toBe(size)
        expect(wrapper.find('.empty-state').classes()).toContain(size)
      });
    });
  });

  describe('插槽内容', () => {

    it('应该渲染默认插槽', () => {
      const wrapper = mount(EmptyState, {
        slots: {
          default: '<button>重试</button>'
        }
      })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toBe('重试')
    });
  });

  describe('尺寸变化', () => {

    it('小尺寸应该应用正确的类', () => {
      const wrapper = mount(EmptyState, { props: { size: 'small' } })
      expect(wrapper.find('.empty-state').classes()).toContain('small')
    });

    it('大尺寸应该应用正确的类', () => {
      const wrapper = mount(EmptyState, { props: { size: 'large' } })
      expect(wrapper.find('.empty-state').classes()).toContain('large')
    });
  });

  describe('动态更新', () => {

    it('应该响应 props 变化', async () => {
      const wrapper = mount(EmptyState, {
        props: { icon: '📭', title: '初始标题' }
      })

      expect(wrapper.find('.empty-title').text()).toBe('初始标题')

      await wrapper.setProps({ icon: '🎉', title: '新标题' })

      expect(wrapper.find('.empty-icon').text()).toBe('🎉')
      expect(wrapper.find('.empty-title').text()).toBe('新标题')
    });
  });
});
