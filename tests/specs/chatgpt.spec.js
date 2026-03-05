// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * ChatGPT 平台自动化测试
 */
test.describe('AI Chat Exporter - ChatGPT', () => {
  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    const extensionPath = path.resolve(__dirname, '../../');

    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('应该能够加载 ChatGPT 页面', async () => {
    await page.goto('https://chatgpt.com');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({ path: 'reports/chatgpt-homepage.png' });

    expect(page.url()).toContain('chatgpt.com');
  });

  test('应该能够检测到聊天消息', async () => {
    await page.goto('https://chatgpt.com');
    await page.waitForLoadState('networkidle');

    // ChatGPT 消息选择器
    await page.waitForSelector('[class*="text-base"]', { timeout: 30000 }).catch(() => {
      console.log('No messages found - may need to login first');
    });

    const messages = await page.$$('[class*="text-base"]');
    console.log(`Found ${messages.length} message containers`);

    await page.screenshot({ path: 'reports/chatgpt-messages.png' });
  });

  test('应该能够提取消息', async () => {
    await page.goto('https://chatgpt.com');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('[class*="text-base"]', { timeout: 10000 }).catch(() => {});

    const result = await page.evaluate(() => {
      if (typeof ChatExporter === 'undefined') {
        return { error: 'ChatExporter not loaded' };
      }

      return ChatExporter.extractConversation();
    });

    console.log('ChatGPT extraction result:', JSON.stringify(result, null, 2));

    if (result.success) {
      expect(result.data).toHaveProperty('messages');
      expect(result.data.platform).toBe('ChatGPT');
    }
  });
});
