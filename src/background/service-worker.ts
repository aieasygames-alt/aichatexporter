/**
 * AI Chat Exporter - Background Service Worker
 * 处理文件下载和跨组件通信
 */

import type { DownloadData, DownloadResponse } from '../types';

// 支持的 URL 模式
const SUPPORTED_URLS = [
  'https://chatgpt.com/',
  'https://chat.openai.com/',
  'https://claude.ai/',
  'https://gemini.google.com/',
  'https://grok.x.com/',
  'https://x.ai/',
  'https://www.x.ai/',
  'https://grok.com/',
  'https://chat.deepseek.com/',
  'https://deepseek.com/',
];

/**
 * 检查 URL 是否受支持
 */
function isSupportedUrl(url: string | undefined): boolean {
  if (!url) return false;
  return SUPPORTED_URLS.some((supported) => url.startsWith(supported));
}

/**
 * 监听来自 content script 的消息
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'download') {
    handleDownload(message.data as DownloadData)
      .then(() => sendResponse({ success: true } as DownloadResponse))
      .catch((error: Error) => sendResponse({ success: false, error: error.message } as DownloadResponse));
    return true; // 保持通道开放以进行异步响应
  }
});

/**
 * 处理文件下载
 */
async function handleDownload(data: DownloadData): Promise<number> {
  const { content, filename, mimeType, isDataUrl } = data;

  // 如果已经是 Data URL（如图片），直接使用
  const dataUrl = isDataUrl ? content : createDataUrl(content, mimeType);

  // 触发下载 - 直接下载到默认下载文件夹，不弹出保存对话框
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: dataUrl,
        filename: filename,
        saveAs: false, // 直接下载，不弹出保存对话框
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          console.log('Download started with ID:', downloadId);
          resolve(downloadId as number);
        }
      }
    );
  });
}

/**
 * 创建 Data URL
 */
function createDataUrl(content: string, mimeType: string): string {
  // 确保正确编码 UTF-8 内容
  const encoded = encodeURIComponent(content);
  return `data:${mimeType};charset=utf-8,${encoded}`;
}

/**
 * 扩展安装时的处理
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AI Chat Exporter installed successfully');
  } else if (details.reason === 'update') {
    console.log('AI Chat Exporter updated to version', chrome.runtime.getManifest().version);
  }
});

/**
 * 处理扩展图标点击 - 打开页面内的浮动弹窗
 */
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked on tab:', tab.id, 'URL:', tab.url);

  // 检查是否是支持的页面
  if (!isSupportedUrl(tab.url)) {
    console.log('Unsupported page, cannot open popup');
    // 可以选择打开一个新标签页或者什么都不做
    return;
  }

  // 向当前标签页发送消息，打开浮动弹窗
  try {
    const response = await chrome.tabs.sendMessage(tab.id as number, { action: 'openPopup' });
    console.log('Open popup response:', response);
  } catch (error) {
    console.log('Content script not ready, user may need to refresh the page');
    // 静默处理错误，不影响用户体验
  }
});

/**
 * 处理键盘快捷键命令
 */
chrome.commands.onCommand.addListener(async (command, tab) => {
  console.log('Command received:', command, 'on tab:', tab?.id);

  if (!tab?.id || !isSupportedUrl(tab.url)) {
    console.log('Command ignored: unsupported page');
    return;
  }

  try {
    if (command === 'export_markdown') {
      // 快速导出为 Markdown
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'quickExport', format: 'markdown' });
      console.log('Quick export response:', response);
    }
  } catch (error) {
    console.log('Command failed:', error);
  }
});
