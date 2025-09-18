module.exports = {
  // 测试环境
  testEnvironment: 'node',
  // 测试文件匹配模式
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  // 忽略的目录和文件
  testPathIgnorePatterns: ['/node_modules/', '/dist/', 'src/test.js'],
  // 测试运行器配置
  runner: 'jest-runner',
  // 覆盖率报告配置
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/**/*.d.ts', '!src/**/index.js', '!src/**/config/**', '!src/**/utils/db.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  // 转换配置
  transform: {
    '^.+\.jsx?$': 'babel-jest',
  },
  // 转换忽略
  transformIgnorePatterns: ['/node_modules/', '\.pnp\.[^\/]+$'],
  // 全局设置
  setupFilesAfterEnv: ['./jest.setup.js'],
  // 测试超时设置
  testTimeout: 30000,
  // 检测内存泄漏
  detectLeaks: true,
  // 缓存配置
  cacheDirectory: '.jest-cache',
};