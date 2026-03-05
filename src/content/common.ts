/**
 * AI Chat Exporter - Common Utilities
 * 通用工具函数和导出逻辑
 */

import type { ExportMetadata, ExportResult, ExtractResult, PlatformParser, ExportFormat } from '../types';

// 导入并初始化所有格式化器
import './formatters';
import { formatRegistry, openPrintDialog } from './formatters';

/** 通用消息处理器 */
export const ChatExporter = {
  currentPlatform: null as string | null,
  parser: null as PlatformParser | null,

  /**
   * 设置当前平台和解析器
   */
  setPlatform(platform: string, parser: PlatformParser): void {
    this.currentPlatform = platform;
    this.parser = parser;
  },

  /**
   * 获取所有可用格式
   */
  getAvailableFormats() {
    return formatRegistry.getFormats();
  },

  /**
   * 提取当前页面的对话
   */
  extractConversation(): ExtractResult {
    if (!this.parser) {
      return { success: false, error: 'No parser available for this page' };
    }

    try {
      const messages = this.parser.extract();
      const title = this.parser.getTitle?.() || 'Chat Export';

      if (messages.length === 0) {
        return { success: false, error: 'No messages found on this page' };
      }

      return {
        success: true,
        data: {
          platform: this.currentPlatform || 'Unknown',
          title: title,
          messages: messages,
          url: window.location.href,
        },
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * 导出对话
   */
  async export(format: ExportFormat | 'image'): Promise<ExportResult> {
    const result = this.extractConversation();

    if (!result.success) {
      return result;
    }

    const { platform, title, messages, url } = result.data!;
    const metadata: ExportMetadata = { title, source: platform, url };

    // 图片导出需要特殊处理
    if (format === 'image') {
      return {
        success: true,
        data: {
          type: 'image',
          title: title,
          messages: messages,
          platform: platform,
        },
      };
    }

    // PDF 导出需要特殊处理（打开打印对话框）
    if (format === 'pdf') {
      // 在后台打开打印对话框
      openPrintDialog(messages, metadata);
      return {
        success: true,
        data: {
          type: 'pdf',
          title: title,
          filename: `${this.sanitizeFilename(title)}.pdf`,
          mimeType: 'application/pdf',
        },
      };
    }

    // 使用格式注册表处理其他格式
    try {
      const formatter = formatRegistry.get(format);

      if (!formatter) {
        return { success: false, error: `Unsupported format: ${format}` };
      }

      const formattedContent = await formatter.format(messages, metadata);
      const baseFilename = this.sanitizeFilename(title);

      // 处理 Blob 和字符串两种返回类型
      let content: string;
      let mimeType: string;

      if (formattedContent instanceof Blob) {
        // Blob 类型（如 PDF）
        return {
          success: true,
          data: {
            content: await blobToDataUrl(formattedContent),
            filename: `${baseFilename}.${formatter.extension}`,
            mimeType: formatter.mimeType,
          },
        };
      } else {
        content = formattedContent;
        mimeType = formatter.mimeType;
      }

      return {
        success: true,
        data: {
          content,
          filename: `${baseFilename}.${formatter.extension}`,
          mimeType,
        },
      };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: (error as Error).message };
    }
  },

  /**
   * 清理文件名
   */
  sanitizeFilename(name: string): string {
    return (
      name
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100) || 'chat-export'
    );
  },
};

/**
 * Blob 转 Data URL
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('AI Chat Exporter: Received message', message.action);

  if (message.action === 'ping') {
    const response = {
      success: true,
      platform: ChatExporter.currentPlatform,
    };
    console.log('AI Chat Exporter: Sending ping response', response);
    sendResponse(response);
    return true;
  }

  if (message.action === 'extract') {
    const result = ChatExporter.extractConversation();
    console.log('AI Chat Exporter: Extract result', result);
    sendResponse(result);
    return true;
  }

  if (message.action === 'export') {
    // 使用 Promise 处理异步导出
    ChatExporter.export(message.format)
      .then((result) => {
        console.log('AI Chat Exporter: Export result', result.success ? 'success' : result.error);
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开启以等待异步响应
  }

  if (message.action === 'openPopup') {
    if (window.FloatingPopup) {
      window.FloatingPopup.open();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'FloatingPopup not loaded' });
    }
    return true;
  }

  // 获取可用格式
  if (message.action === 'getFormats') {
    const formats = ChatExporter.getAvailableFormats();
    sendResponse({ success: true, formats });
    return true;
  }

  // 快速导出（从快捷键触发）
  if (message.action === 'quickExport') {
    ChatExporter.export(message.format)
      .then(async (result) => {
        if (result.success && result.data?.content) {
          // 自动触发下载
          await chrome.runtime.sendMessage({
            action: 'download',
            data: result.data as { content: string; filename: string; mimeType: string },
          });
          sendResponse({ success: true });
        } else {
          sendResponse(result);
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  return false;
});

console.log('AI Chat Exporter: Common module loaded');

// 导出给其他 content script 使用
if (typeof window !== 'undefined') {
  window.ChatExporter = ChatExporter;
  // 兼容旧代码：同时导出格式注册表
  (window as unknown as Record<string, unknown>).formatRegistry = formatRegistry;
}
