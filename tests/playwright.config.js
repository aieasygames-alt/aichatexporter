// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * AI Chat Exporter - Playwright 测试配置
 * 用于自动化测试浏览器扩展功能
 */
module.exports = defineConfig({
  testDir: './specs',

  // 测试超时设置
  timeout: 60 * 1000,
  expect: {
    timeout: 10000
  },

  // 失败重试
  retries: process.env.CI ? 2 : 0,

  // 并行工作进程
  workers: process.env.CI ? 1 : undefined,

  // 报告配置
  reporter: [
    ['html', { outputFolder: 'reports' }],
    ['list']
  ],

  use: {
    // 基础 URL
    baseURL: '',

    // 收集失败测试的 trace
    trace: 'on-first-retry',

    // 截图
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // 浏览器上下文选项
    contextOptions: {
      // 加载扩展
      args: [
        `--disable-extensions-except=${process.env.EXTENSION_PATH || '../'}`,
        `--load-extension=${process.env.EXTENSION_PATH || '../'}`
      ]
    }
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 测试前运行
  globalSetup: require.resolve('./global-setup'),
});
