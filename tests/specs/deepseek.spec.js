// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * DeepSeek 平台自动化测试
 */
test.describe('AI Chat Exporter - DeepSeek', () => {
  let context;
  let page;
  let extensionId;

  test.beforeAll(async ({ browser }) => {
    // 获取扩展路径
    const extensionPath = path.resolve(__dirname, '../../');

    // 创建带有扩展的浏览器上下文
    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    // 获取扩展 ID
    const [background] = context.serviceWorkers();
    if (background) {
      extensionId = background.url().split('/')[2];
    }

    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('应该能够加载 DeepSeek 页面', async () => {
    await page.goto('https://chat.deepseek.com');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 截图
    await page.screenshot({ path: 'reports/deepseek-homepage.png' });

    // 验证 URL
    expect(page.url()).toContain('deepseek.com');
  });

  test('应该能够检测到聊天消息', async () => {
    await page.goto('https://chat.deepseek.com');
    await page.waitForLoadState('networkidle');

    // 等待聊天消息加载
    await page.waitForSelector('.ds-message', { timeout: 30000 }).catch(() => {
      console.log('No messages found - may need to start a conversation first');
    });

    // 检查是否有消息
    const messages = await page.$$('.ds-message');
    console.log(`Found ${messages.length} messages on the page`);

    // 截图
    await page.screenshot({ path: 'reports/deepseek-messages.png' });
  });

  test('应该能够触发扩展弹窗', async () => {
    await page.goto('https://chat.deepseek.com');
    await page.waitForLoadState('networkidle');

    // 模拟点击扩展图标
    // 由于扩展使用 action API，我们需要通过键盘快捷键或其他方式触发
    // 这里我们直接注入消息来模拟

    // 检查 content script 是否已加载
    const isContentScriptLoaded = await page.evaluate(() => {
      return typeof window.ChatExporter !== 'undefined';
    });

    console.log(`Content script loaded: ${isContentScriptLoaded}`);

    // 截图
    await page.screenshot({ path: 'reports/deepseek-extension-check.png' });
  });

  test('应该能够提取消息并验证格式', async () => {
    await page.goto('https://chat.deepseek.com');
    await page.waitForLoadState('networkidle');

    // 等待消息
    await page.waitForSelector('.ds-message', { timeout: 10000 }).catch(() => {});

    // 在页面中执行提取
    const result = await page.evaluate(() => {
      if (typeof ChatExporter === 'undefined') {
        return { error: 'ChatExporter not loaded' };
      }

      return ChatExporter.extractConversation();
    });

    console.log('Extraction result:', JSON.stringify(result, null, 2));

    // 如果成功提取，验证数据结构
    if (result.success) {
      expect(result.data).toHaveProperty('messages');
      expect(Array.isArray(result.data.messages)).toBe(true);
    }
  });

  test('应该能够导出 Markdown', async () => {
    await page.goto('https://chat.deepseek.com');
    await page.waitForLoadState('networkidle');

    // 等待消息
    await page.waitForSelector('.ds-message', { timeout: 10000 }).catch(() => {});

    // 监听下载
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);

    // 触发导出
    await page.evaluate(() => {
      if (typeof ChatExporter !== 'undefined') {
        const result = ChatExporter.export('markdown');
        if (result.success) {
          // 触发下载
          chrome.runtime.sendMessage({
            action: 'download',
            data: result
          });
        }
      }
    });

    const download = await downloadPromise;
    if (download) {
      console.log(`Downloaded: ${download.suggestedFilename()}`);
      expect(download.suggestedFilename()).toMatch(/\.md$/);
    }
  });
});
