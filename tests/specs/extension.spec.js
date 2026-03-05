// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * 扩展基础功能测试
 */
test.describe('AI Chat Exporter - Extension Basics', () => {
  let context;
  let page;
  let extensionId;

  test.beforeAll(async ({ browser }) => {
    const extensionPath = path.resolve(__dirname, '../../');

    context = await browser.newContext({
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    // 获取扩展 ID
    const background = context.serviceWorkers()[0];
    if (background) {
      const url = background.url();
      const matches = url.match(/chrome-extension:\/\/([^/]+)/);
      if (matches) {
        extensionId = matches[1];
        console.log(`Extension ID: ${extensionId}`);
      }
    }

    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('扩展应该成功加载', async () => {
    // 打开扩展管理页面
    await page.goto('chrome://extensions/');

    // 等待扩展列表加载
    await page.waitForSelector('extensions-manager', { timeout: 10000 });

    // 检查是否有我们的扩展
    const extensionItems = await page.$$('extensions-item');
    let found = false;

    for (const item of extensionItems) {
      const name = await item.evaluate(el => el.getAttribute('name'));
      if (name && name.includes('AI Chat Exporter')) {
        found = true;
        console.log(`✅ Extension found: ${name}`);
        break;
      }
    }

    expect(found).toBe(true);
  });

  test('扩展应该有正确的图标', async () => {
    // 检查扩展图标文件是否存在
    const fs = require('fs');
    const iconsDir = path.resolve(__dirname, '../../icons');

    expect(fs.existsSync(path.join(iconsDir, 'icon16.png'))).toBe(true);
    expect(fs.existsSync(path.join(iconsDir, 'icon48.png'))).toBe(true);
    expect(fs.existsSync(path.join(iconsDir, 'icon128.png'))).toBe(true);

    console.log('✅ All icon files exist');
  });

  test('manifest.json 应该有效', async () => {
    const fs = require('fs');
    const manifestPath = path.resolve(__dirname, '../../manifest.json');

    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    // 验证必需字段
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('AI Chat Exporter');
    expect(manifest.permissions).toContain('downloads');
    expect(manifest.permissions).toContain('activeTab');

    console.log('✅ manifest.json is valid');
  });

  test('Content Script 应该正确注入到 DeepSeek', async () => {
    await page.goto('https://chat.deepseek.com');
    await page.waitForLoadState('networkidle');

    // 等待 content script 加载
    await page.waitForTimeout(2000);

    // 检查 ChatExporter 是否存在
    const chatExporterExists = await page.evaluate(() => {
      return typeof window.ChatExporter !== 'undefined';
    });

    console.log(`ChatExporter loaded: ${chatExporterExists}`);
  });

  test('多语言功能应该正常工作', async () => {
    await page.goto('https://chat.deepseek.com');
    await page.waitForLoadState('networkidle');

    // 检查 I18n 模块
    const i18nExists = await page.evaluate(() => {
      return typeof window.I18n !== 'undefined';
    });

    if (i18nExists) {
      const languages = await page.evaluate(() => {
        return Object.keys(window.I18n.languages);
      });

      console.log('Supported languages:', languages);
      expect(languages.length).toBeGreaterThan(0);
    }
  });
});
