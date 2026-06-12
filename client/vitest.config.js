/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['src/**/*.test.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 10000,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.test.js',
        'src/main.js',
        'vitest.config.js'
      ],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
