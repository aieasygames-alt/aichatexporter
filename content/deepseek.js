/**
 * AI Chat Exporter - DeepSeek Parser
 * 解析 DeepSeek (chat.deepseek.com) 的聊天记录
 */

const DeepSeekParser = {
  /**
   * 提取所有对话消息
   */
  extract() {
    const messages = [];

    try {
      // 查找消息容器
      const messageContainer = document.querySelector('[class*="dad65929"]');

      if (!messageContainer) {
        console.warn('DeepSeek Parser: Message container not found');
        return messages;
      }

      // 获取所有消息块
      const children = Array.from(messageContainer.children);
      console.log('DeepSeek Parser: Found', children.length, 'message blocks');

      let currentUserContent = '';

      children.forEach((child, index) => {
        const classList = child.className || '';

        // _9663006 是用户消息
        if (classList.includes('_9663006')) {
          // 如果之前有待处理的用户消息，先添加
          if (currentUserContent && currentUserContent.length >= 2) {
            messages.push({
              role: 'user',
              content: currentUserContent.trim()
            });
            currentUserContent = '';
          }
          currentUserContent = child.textContent.trim();
        }
        // _4f9bf79 是 AI 消息
        else if (classList.includes('_4f9bf79')) {
          // 先添加用户消息
          if (currentUserContent && currentUserContent.length >= 2) {
            messages.push({
              role: 'user',
              content: currentUserContent.trim()
            });
            currentUserContent = '';
          }

          // 提取 AI 消息内容（保留格式）
          const content = this.extractAIContent(child);
          if (content && content.length >= 5) {
            messages.push({
              role: 'assistant',
              content: content
            });
          }
        }
      });

      // 处理最后一个用户消息
      if (currentUserContent && currentUserContent.length >= 2) {
        messages.push({
          role: 'user',
          content: currentUserContent.trim()
        });
      }

      console.log('DeepSeek Parser: Extracted', messages.length, 'messages');
      return messages;

    } catch (error) {
      console.error('DeepSeek Parser: Error extracting messages', error);
      return messages;
    }
  },

  /**
   * 提取 AI 消息内容（保留换行和段落格式）
   */
  extractAIContent(element) {
    // 尝试找到 markdown/prose 内容区域
    const prose = element.querySelector('.prose, .markdown-body, [class*="markdown"]');

    if (prose) {
      return this.extractFormattedText(prose);
    }

    // 如果没有找到 prose，直接处理元素
    return this.extractFormattedText(element);
  },

  /**
   * 从 DOM 元素提取格式化文本（保留段落和换行）
   */
  extractFormattedText(element) {
    // 克隆元素以避免修改原始 DOM
    const clone = element.cloneNode(true);

    // 移除不需要的元素（按钮、图标等）
    const removeSelectors = ['button', 'svg', '.copy-button', '[class*="button"]', '[class*="icon"]'];
    removeSelectors.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    // 处理块级元素，添加换行
    const blockElements = clone.querySelectorAll('p, div, br, li, h1, h2, h3, h4, h5, h6, pre, blockquote, ul, ol');

    // 替换块级元素为带有换行的文本
    blockElements.forEach(el => {
      if (el.tagName === 'BR') {
        el.replaceWith('\n');
      } else if (el.tagName === 'P' || el.tagName === 'DIV') {
        // 段落前后加换行
        const text = el.textContent.trim();
        if (text) {
          el.replaceWith('\n' + text + '\n');
        } else {
          el.remove();
        }
      } else if (el.tagName === 'LI') {
        // 列表项
        el.replaceWith('\n• ' + el.textContent.trim());
      } else if (el.tagName.match(/^H\d$/)) {
        // 标题
        el.replaceWith('\n\n' + el.textContent.trim() + '\n');
      } else if (el.tagName === 'PRE') {
        // 代码块
        el.replaceWith('\n```\n' + el.textContent.trim() + '\n```\n');
      } else if (el.tagName === 'BLOCKQUOTE') {
        // 引用
        el.replaceWith('\n> ' + el.textContent.trim() + '\n');
      } else {
        el.replaceWith('\n' + el.textContent.trim());
      }
    });

    // 获取最终文本
    let text = clone.textContent || '';

    // 清理多余的空行（最多保留两个连续换行）
    text = text.replace(/\n{3,}/g, '\n\n');

    // 清理开头和结尾的空白
    text = text.trim();

    return text;
  },

  /**
   * 获取对话标题
   */
  getTitle() {
    // 尝试从侧边栏获取当前对话标题
    const activeChat = document.querySelector('[class*="active"] [class*="title"], [class*="selected"] [class*="title"]');
    if (activeChat?.textContent?.trim()) {
      return activeChat.textContent.trim();
    }

    // 尝试从页面标题获取
    const titleEl = document.querySelector('h1, [class*="chat-title"], [class*="conversation-title"]');
    if (titleEl?.textContent?.trim() && titleEl.textContent.length < 100) {
      return titleEl.textContent.trim();
    }

    return 'DeepSeek Chat';
  }
};

// 注册到 ChatExporter
if (typeof ChatExporter !== 'undefined') {
  ChatExporter.setPlatform('DeepSeek', DeepSeekParser);
  console.log('AI Chat Exporter: DeepSeek parser registered');
} else {
  console.warn('AI Chat Exporter: ChatExporter not found, waiting...');
  setTimeout(() => {
    if (typeof ChatExporter !== 'undefined') {
      ChatExporter.setPlatform('DeepSeek', DeepSeekParser);
      console.log('AI Chat Exporter: DeepSeek parser registered (delayed)');
    } else {
      console.error('AI Chat Exporter: ChatExporter not available');
    }
  }, 100);
}
