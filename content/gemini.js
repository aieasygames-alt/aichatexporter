/**
 * AI Chat Exporter - Gemini Parser
 * 解析 Google Gemini (gemini.google.com) 的聊天记录
 */

const GeminiParser = {
  // DOM 选择器配置
  selectors: {
    // 聊天历史容器
    history: 'infinite-scroller.chat-history',

    // 消息元素（Web Components）
    userMessage: 'user-query',
    modelMessage: 'model-response',

    // 消息内容选择器
    userContent: '.user-query-bubble-with-background, .user-query-content, .query-content',
    modelContent: 'div.container, .response-container, .model-response-content',

    // 标题相关
    titleSelector: '.conversation-title, h1, [class*="title"]'
  },

  /**
   * 提取所有对话消息
   */
  extract() {
    const messages = [];

    try {
      // 查找聊天历史容器
      const historyContainer = document.querySelector(this.selectors.history);

      if (!historyContainer) {
        // 尝试备用选择器
        const alternateContainer = document.querySelector('[class*="chat"]') ||
                                    document.querySelector('[class*="conversation"]') ||
                                    document.querySelector('main');

        if (alternateContainer) {
          return this.extractFromContainer(alternateContainer);
        }

        console.warn('Gemini Parser: Chat history container not found');
        return messages;
      }

      return this.extractFromContainer(historyContainer);
    } catch (error) {
      console.error('Gemini Parser: Error extracting messages', error);
      return messages;
    }
  },

  /**
   * 从指定容器提取消息
   */
  extractFromContainer(container) {
    const messages = [];

    // 查找所有用户和模型消息
    const userQueries = container.querySelectorAll(this.selectors.userMessage);
    const modelResponses = container.querySelectorAll(this.selectors.modelMessage);

    // 合并并按 DOM 顺序排序
    const allMessages = [];

    userQueries.forEach(el => {
      allMessages.push({ element: el, isUser: true });
    });

    modelResponses.forEach(el => {
      allMessages.push({ element: el, isUser: false });
    });

    // 按 DOM 位置排序
    allMessages.sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    // 提取内容
    allMessages.forEach(({ element, isUser }) => {
      const content = this.extractMessageContent(element, isUser);

      if (content && content.trim()) {
        messages.push({
          role: isUser ? 'user' : 'assistant',
          content: content.trim()
        });
      }
    });

    return messages;
  },

  /**
   * 提取单个消息的内容（保留格式）
   */
  extractMessageContent(element, isUser) {
    // 查找消息内容区域
    const contentEl = element.querySelector(isUser ? this.selectors.userContent : this.selectors.modelContent);
    const targetEl = contentEl || element;

    // 使用格式化文本提取
    return this.extractFormattedText(targetEl);
  },

  /**
   * 从 DOM 元素提取格式化文本（保留列表、段落等格式）
   */
  extractFormattedText(element) {
    const clone = element.cloneNode(true);

    // 移除不需要的元素
    const removeSelectors = ['button', 'svg', '.copy-button', '[class*="button"]', '[class*="icon"]'];
    removeSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 移除开头的产品标识（You said, Gemini said 等）
    const headerSelectors = ['.query-source', '[class*="source"]', '[class*="header"]'];
    headerSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 移除结尾的垃圾内容
    const footerSelectors = ['.check-completed', '[class*="check"]', '[class*="footer"]'];
    footerSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 处理有序列表
    clone.querySelectorAll('ol').forEach(ol => {
      const items = ol.querySelectorAll(':scope > li');
      let listText = '';
      items.forEach((li, idx) => {
        const text = li.textContent.trim();
        listText += `${idx + 1}. ${text}\n`;
        li.remove();
      });
      const textNode = document.createTextNode(listText);
      ol.parentNode.insertBefore(textNode, ol);
      ol.remove();
    });

    // 处理无序列表
    clone.querySelectorAll('ul').forEach(ul => {
      const items = ul.querySelectorAll(':scope > li');
      let listText = '';
      items.forEach((li) => {
        const text = li.textContent.trim();
        listText += `• ${text}\n`;
        li.remove();
      });
      const textNode = document.createTextNode(listText);
      ul.parentNode.insertBefore(textNode, ul);
      ul.remove();
    });

    // 处理段落
    clone.querySelectorAll('p').forEach(p => {
      const text = p.textContent.trim();
      if (text) {
        p.replaceWith(`${text}\n`);
      } else {
        p.remove();
      }
    });

    // 处理换行
    clone.querySelectorAll('br').forEach(br => {
      br.replaceWith('\n');
    });

    // 处理 div，添加换行
    clone.querySelectorAll('div').forEach(div => {
      const text = div.textContent.trim();
      if (text && !div.querySelector('div, p, br')) {
        // 叶子节点 div，添加换行
        div.replaceWith(`${text}\n`);
      }
    });

    // 获取最终文本
    let text = clone.textContent || '';

    // 移除特定的垃圾文本
    text = text.replace(/Check completed\s*•\s*Understand the results/gi, '');
    text = text.replace(/You said\s*/gi, '');
    text = text.replace(/Gemini said\s*/gi, '');

    // 清理多余的空行
    text = text.replace(/\n{3,}/g, '\n\n');

    // 清理开头和结尾的空白
    text = text.trim();

    return text;
  },

  /**
   * 获取对话标题
   */
  getTitle() {
    // 尝试多种方式获取标题
    const titleEl = document.querySelector(this.selectors.titleSelector);
    if (titleEl?.textContent?.trim()) {
      return titleEl.textContent.trim();
    }

    // 从 URL 提取
    const urlMatch = window.location.href.match(/\/chat\/([^/]+)/);
    if (urlMatch) {
      return `Gemini Chat ${urlMatch[1].substring(0, 8)}`;
    }

    // 默认标题
    return 'Gemini Chat';
  },

  /**
   * 检测当前页面主题
   */
  detectTheme() {
    // 检查 body 类名
    if (document.body.classList.contains('dark-theme')) return 'dark';
    if (document.body.classList.contains('light-theme')) return 'light';

    // 检查背景色
    const bgColor = window.getComputedStyle(document.body).backgroundColor;
    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128 ? 'dark' : 'light';
    }

    // 检查系统偏好
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }
};

// 注册到 ChatExporter
if (typeof ChatExporter !== 'undefined') {
  ChatExporter.setPlatform('Gemini', GeminiParser);
  console.log('AI Chat Exporter: Gemini parser registered');
} else {
  console.warn('AI Chat Exporter: ChatExporter not found, waiting...');
  // 等待 ChatExporter 加载
  setTimeout(() => {
    if (typeof ChatExporter !== 'undefined') {
      ChatExporter.setPlatform('Gemini', GeminiParser);
      console.log('AI Chat Exporter: Gemini parser registered (delayed)');
    } else {
      console.error('AI Chat Exporter: ChatExporter not available');
    }
  }, 100);
}
