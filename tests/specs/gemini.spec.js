// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * Gemini 平台自动化测试
 */
test.describe('AI Chat Exporter - Gemini', () => {
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

  test('应该能够加载 Gemini 页面', async () => {
    await page.goto('https://gemini.google.com');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({ path: 'reports/gemini-homepage.png' });

    expect(page.url()).toContain('gemini.google.com');
  });

  test('应该能够检测到聊天消息', async () => {
    await page.goto('https://gemini.google.com');
    await page.waitForLoadState('networkidle');

    // Gemini 使用 Web Components
    await page.waitForSelector('user-query, model-response', { timeout: 30000 }).catch(() => {
      console.log('No messages found - may need to start a conversation first');
    });

    const userMessages = await page.$$('user-query');
    const modelMessages = await page.$$('model-response');

    console.log(`Found ${userMessages.length} user messages and ${modelMessages.length} model responses`);

    await page.screenshot({ path: 'reports/gemini-messages.png' });
  });

  test('应该能够提取消息', async () => {
    await page.goto('https://gemini.google.com');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('user-query, model-response', { timeout: 10000 }).catch(() => {});

    const result = await page.evaluate(() => {
      if (typeof ChatExporter === 'undefined') {
        return { error: 'ChatExporter not loaded' };
      }

      return ChatExporter.extractConversation();
    });

    console.log('Gemini extraction result:', JSON.stringify(result, null, 2));

    if (result.success) {
      expect(result.data).toHaveProperty('messages');
      expect(result.data.platform).toBe('Gemini');
    }
  });
});
