/**
 * 全局设置 - 在所有测试之前运行
 */

async function globalSetup() {
  console.log('🚀 Setting up AI Chat Exporter tests...');

  // 验证扩展路径
  const path = require('path');
  const fs = require('fs');

  const extensionPath = path.resolve(__dirname, '..');
  const manifestPath = path.join(extensionPath, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Extension manifest not found at: ${manifestPath}`);
  }

  console.log(`✅ Extension found at: ${extensionPath}`);

  // 设置环境变量
  process.env.EXTENSION_PATH = extensionPath;
}

module.exports = globalSetup;
