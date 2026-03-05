/**
 * AI Chat Exporter - Grok Parser
 * 解析 Grok (grok.x.com / x.ai / grok.com) 的聊天记录
 */

const GrokParser = {
  /**
   * 提取所有对话消息
   */
  extract() {
    const messages = [];

    try {
      // 添加调试日志
      console.log('Grok Parser: Checking selectors...');

      // 尝试多种选择器
      let messageElements = [];

      // 策略1: 查找消息容器
      const selectors = [
        '[class*="message"]',
        '[class*="Message"]',
        '[data-testid*="message"]'
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Grok Parser: ${selector} found ${elements.length} elements`);
        if (elements.length > 0) {
          messageElements = Array.from(elements);
          break;
        }
      }

      // 策略2: 查找聊天区域内的直接子元素
      if (messageElements.length === 0) {
        const chatArea = document.querySelector('[class*="conversation"], [class*="chat"], main, [role="log"]');
        if (chatArea) {
          messageElements = Array.from(chatArea.children).filter(el => {
            const text = el.textContent.trim();
            return text.length > 10 && text.length < 50000;
          });
          console.log('Grok Parser: Found from chat area', messageElements.length, 'elements');
        }
      }

      console.log('Grok Parser: Found', messageElements.length, 'message elements');

      // 提取内容和角色
      messageElements.forEach((element) => {
        const role = this.detectMessageRole(element);
        const content = this.extractContent(element);

        // 过滤掉垃圾内容
        if (content && content.trim().length >= 2 && !this.isJunkContent(content)) {
          messages.push({
            role: role,
            content: content.trim()
          });
        }
      });

      console.log('Grok Parser: Extracted', messages.length, 'messages');
      return messages;

    } catch (error) {
      console.error('Grok Parser: Error extracting messages', error);
      return messages;
    }
  },

  /**
   * 检查是否是垃圾内容
   */
  isJunkContent(text) {
    if (!text) return true;

    // 过滤界面元素文本
    const junkPatterns = [
      /^找到\s*\d+\s*条消息/,
      /^Found\s*\d+\s*messages/,
      /^\d+\s*(条|messages?)\s*$/,
      /^复制$/,
      /^Copy$/,
      /^分享$/,
      /^Share$/
    ];

    for (const pattern of junkPatterns) {
      if (pattern.test(text.trim())) {
        return true;
      }
    }

    return false;
  },

  /**
   * 检测消息角色
   */
  detectMessageRole(element) {
    // 安全获取 className（可能是 SVGAnimatedString 对象）
    const getClassStr = (el) => {
      if (!el) return '';
      const className = el.className;
      if (typeof className === 'string') {
        return className.toLowerCase();
      }
      // SVG 元素的 className 是 SVGAnimatedString 对象
      if (className && typeof className.baseVal === 'string') {
        return className.baseVal.toLowerCase();
      }
      return '';
    };

    const classList = getClassStr(element);
    const parentClass = getClassStr(element.parentElement);
    const combinedClasses = `${classList} ${parentClass}`;

    // 检查数据属性
    const testId = element.getAttribute?.('data-testid') || '';
    const role = element.getAttribute?.('data-role') || '';
    const dataUser = element.getAttribute?.('data-is-user');

    // 用户消息标记
    if (dataUser === 'true' ||
        role === 'user' ||
        testId.includes('user') ||
        combinedClasses.includes('user') ||
        combinedClasses.includes('human') ||
        combinedClasses.includes('self') ||
        combinedClasses.includes('you')) {
      return 'user';
    }

    // AI 消息标记
    if (dataUser === 'false' ||
        role === 'assistant' ||
        testId.includes('assistant') ||
        testId.includes('grok') ||
        testId.includes('bot') ||
        combinedClasses.includes('assistant') ||
        combinedClasses.includes('grok') ||
        combinedClasses.includes('bot') ||
        combinedClasses.includes('ai') ||
        combinedClasses.includes('model')) {
      return 'assistant';
    }

    // 检查是否有 Grok 图标/头像
    const hasGrokIcon = element.querySelector?.('[class*="grok"], [class*="bot"], [class*="ai"]');
    const hasUserIcon = element.querySelector?.('[class*="user-avatar"], [class*="profile"], [class*="self"]');

    if (hasGrokIcon && !hasUserIcon) {
      return 'assistant';
    }
    if (hasUserIcon && !hasGrokIcon) {
      return 'user';
    }

    // 默认为 assistant
    return 'assistant';
  },

  /**
   * 提取消息内容
   */
  extractContent(element) {
    // 查找内容区域
    const contentSelectors = [
      '[class*="prose"]',
      '[class*="content"]',
      '[class*="markdown"]',
      '[class*="text-content"]',
      '[class*="message-content"]'
    ];

    for (const selector of contentSelectors) {
      const contentEl = element.querySelector(selector);
      if (contentEl && contentEl.textContent.trim().length > 5) {
        return this.extractFormattedText(contentEl);
      }
    }

    return this.extractFormattedText(element);
  },

  /**
   * 从 DOM 元素提取格式化文本（保留格式）
   */
  extractFormattedText(element) {
    const clone = element.cloneNode(true);

    // 移除不需要的元素
    const removeSelectors = [
      'button',
      'svg',
      '.copy-button',
      '[class*="button"]',
      '[class*="icon"]',
      '[class*="avatar"]',
      '[class*="action"]'
    ];
    removeSelectors.forEach(selector => {
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

    // 处理代码块
    clone.querySelectorAll('pre').forEach(pre => {
      const code = pre.textContent.trim();
      pre.replaceWith(`\n\`\`\`\n${code}\n\`\`\`\n`);
    });

    // 处理行内代码
    clone.querySelectorAll('code').forEach(code => {
      const text = code.textContent.trim();
      code.replaceWith(`\`${text}\``);
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

    // 获取最终文本
    let text = clone.textContent || '';

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
    const titleSelectors = [
      '[class*="conversation-title"]',
      '[class*="chat-title"]',
      'h1',
      '[class*="title"]'
    ];

    for (const selector of titleSelectors) {
      const titleEl = document.querySelector(selector);
      if (titleEl?.textContent?.trim() && titleEl.textContent.length < 100) {
        return titleEl.textContent.trim();
      }
    }

    return 'Grok Chat';
  }
};

// 注册到 ChatExporter
if (typeof ChatExporter !== 'undefined') {
  ChatExporter.setPlatform('Grok', GrokParser);
  console.log('AI Chat Exporter: Grok parser registered');
} else {
  console.warn('AI Chat Exporter: ChatExporter not found, waiting...');
  setTimeout(() => {
    if (typeof ChatExporter !== 'undefined') {
      ChatExporter.setPlatform('Grok', GrokParser);
      console.log('AI Chat Exporter: Grok parser registered (delayed)');
    }
  }, 100);
}
