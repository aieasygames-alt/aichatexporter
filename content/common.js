/**
 * AI Chat Exporter - Common Utilities
 * 通用工具函数和导出格式化器
 */

// 导出格式化器
const ExportFormatter = {
  /**
   * 将消息转换为 Markdown 格式
   */
  toMarkdown(messages, title = 'Chat Export') {
    let md = `# ${title}\n\n`;
    md += `> Exported by AI Chat Exporter\n`;
    md += `> Date: ${new Date().toLocaleString()}\n\n---\n\n`;

    messages.forEach(msg => {
      const roleIcon = msg.role === 'user' ? '👤 **You**' : '🤖 **AI**';
      md += `${roleIcon}\n\n${msg.content}\n\n---\n\n`;
    });

    return md;
  },

  /**
   * 将消息转换为 JSON 格式
   */
  toJSON(messages, metadata = {}) {
    return JSON.stringify({
      title: metadata.title || 'Chat Export',
      source: metadata.source || 'Unknown',
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages
    }, null, 2);
  },

  /**
   * 将消息转换为 TXT 格式
   */
  toTXT(messages) {
    const separator = '\n\n' + '='.repeat(60) + '\n\n';

    const header = `AI Chat Export\nExported: ${new Date().toLocaleString()}\n${'='.repeat(60)}\n\n`;

    const content = messages.map(msg => {
      const role = msg.role === 'user' ? '[USER]' : '[AI]';
      return `${role}\n\n${msg.content}`;
    }).join(separator);

    return header + content;
  },

  /**
   * 将消息转换为 CSV 格式
   */
  toCSV(messages, metadata = {}) {
    // CSV header
    let csv = 'Index,Role,Content,Timestamp\n';

    // CSV rows
    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'User' : 'AI';
      // Escape content for CSV (handle quotes, commas, newlines)
      const content = this.escapeCSVField(msg.content);
      const timestamp = new Date().toISOString();

      csv += `${index + 1},"${role}",${content},"${timestamp}"\n`;
    });

    return csv;
  },

  /**
   * 转义 CSV 字段
   */
  escapeCSVField(field) {
    if (!field) return '""';
    // Replace double quotes with two double quotes and wrap in quotes
    const escaped = field.replace(/"/g, '""');
    // Replace newlines with space
    const cleaned = escaped.replace(/\n/g, ' ').replace(/\r/g, '');
    return `"${cleaned}"`;
  }
};

// 通用消息处理器
const ChatExporter = {
  currentPlatform: null,
  parser: null,

  /**
   * 设置当前平台和解析器
   */
  setPlatform(platform, parser) {
    this.currentPlatform = platform;
    this.parser = parser;
  },

  /**
   * 提取当前页面的对话
   */
  extractConversation() {
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
          platform: this.currentPlatform,
          title: title,
          messages: messages,
          url: window.location.href
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  /**
   * 导出对话
   */
  export(format) {
    const result = this.extractConversation();

    if (!result.success) {
      return result;
    }

    const { platform, title, messages, url } = result.data;
    let content, filename, mimeType;

    switch (format) {
      case 'markdown':
        content = ExportFormatter.toMarkdown(messages, title);
        filename = `${this.sanitizeFilename(title)}.md`;
        mimeType = 'text/markdown';
        break;

      case 'json':
        content = ExportFormatter.toJSON(messages, { title, source: platform, url });
        filename = `${this.sanitizeFilename(title)}.json`;
        mimeType = 'application/json';
        break;

      case 'txt':
        content = ExportFormatter.toTXT(messages);
        filename = `${this.sanitizeFilename(title)}.txt`;
        mimeType = 'text/plain';
        break;

      case 'csv':
        content = ExportFormatter.toCSV(messages, { title, source: platform });
        filename = `${this.sanitizeFilename(title)}.csv`;
        mimeType = 'text/csv';
        break;

      case 'image':
        // 图片导出需要特殊处理，返回标记
        return {
          success: true,
          data: {
            type: 'image',
            title: title,
            messages: messages,
            platform: platform
          }
        };

      default:
        return { success: false, error: 'Unsupported format' };
    }

    return {
      success: true,
      data: {
        content,
        filename,
        mimeType
      }
    };
  },

  /**
   * 清理文件名
   */
  sanitizeFilename(name) {
    return name
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100) || 'chat-export';
  }
};

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('AI Chat Exporter: Received message', message.action);

  if (message.action === 'ping') {
    // 检查 content script 是否已加载
    const response = {
      success: true,
      platform: ChatExporter.currentPlatform
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
    const result = ChatExporter.export(message.format);
    console.log('AI Chat Exporter: Export result', result.success ? 'success' : result.error);
    sendResponse(result);
    return true;
  }

  // 打开浮动弹窗
  if (message.action === 'openPopup') {
    if (window.FloatingPopup) {
      FloatingPopup.open();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'FloatingPopup not loaded' });
    }
    return true;
  }

  return false;
});

console.log('AI Chat Exporter: Common module loaded');

// 导出给其他 content script 使用
if (typeof window !== 'undefined') {
  window.ChatExporter = ChatExporter;
  window.ExportFormatter = ExportFormatter;
}
