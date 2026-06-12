module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 40,
      lines: 60,
      statements: 60
    }
  },
  testTimeout: 10000,
  clearMocks: true,
  setupFiles: ['./__tests__/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/setup.js']
};
