# AI Chat Exporter 自动化测试

使用 Playwright 进行浏览器扩展自动化测试。

## 安装

```bash
cd tests

# 安装依赖
npm install

# 安装浏览器
npx playwright install chromium
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行特定平台测试
npm run test:deepseek
npm run test:gemini
npm run test:chatgpt

# 可视化模式运行
npm run test:headed

# 调试模式
npm run test:debug

# UI 模式
npm run test:ui

# 查看测试报告
npm run report
```

## 测试用例说明

### 1. extension.spec.js - 扩展基础测试
- ✅ 扩展应该成功加载
- ✅ 扩展应该有正确的图标
- ✅ manifest.json 应该有效
- ✅ Content Script 应该正确注入
- ✅ 多语言功能应该正常工作

### 2. deepseek.spec.js - DeepSeek 平台测试
- ✅ 应该能够加载 DeepSeek 页面
- ✅ 应该能够检测到聊天消息
- ✅ 应该能够触发扩展弹窗
- ✅ 应该能够提取消息并验证格式
- ✅ 应该能够导出 Markdown

### 3. gemini.spec.js - Gemini 平台测试
- ✅ 应该能够加载 Gemini 页面
- ✅ 应该能够检测到聊天消息
- ✅ 应该能够提取消息

### 4. chatgpt.spec.js - ChatGPT 平台测试
- ✅ 应该能够加载 ChatGPT 页面
- ✅ 应该能够检测到聊天消息
- ✅ 应该能够提取消息

## 注意事项

### 登录问题
- ChatGPT、Gemini 和 DeepSeek 都需要登录才能使用
- 测试前请确保已经登录，或者使用持久化的浏览器上下文

### 使用持久化登录状态

```javascript
// 在 playwright.config.js 中添加
use: {
  storageState: 'auth.json',
}
```

保存登录状态：
```bash
npx playwright codegen --save-storage=auth.json https://chatgpt.com
```

### 环境变量

```bash
# 指定扩展路径
EXTENSION_PATH=/path/to/extension npm test
```

## 测试报告

测试完成后，报告会保存在 `reports/` 目录：
- HTML 报告：`reports/index.html`
- 截图：`reports/*.png`
- 视频录制：`reports/*.webm`（仅失败时）

## CI/CD 集成

```yaml
# GitHub Actions 示例
name: Test Extension

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd tests
          npm ci
          npx playwright install chromium

      - name: Run tests
        run: |
          cd tests
          npm test

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: tests/reports/
```

## 故障排除

### 扩展未加载
确保 `manifest.json` 格式正确，所有文件路径正确。

### 测试超时
增加 `playwright.config.js` 中的 timeout 值。

### 选择器找不到元素
AI 平台经常更新 DOM 结构，需要定期更新选择器。
