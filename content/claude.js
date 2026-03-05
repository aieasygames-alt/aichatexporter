/**
 * AI Chat Exporter - Claude Parser
 * 解析 Claude (claude.ai) 的聊天记录
 */

const ClaudeParser = {
  /**
   * 提取所有对话消息
   */
  extract() {
    const messages = [];

    try {
      // 查找主聊天区域 - 尝试多种选择器
      let mainContainer = document.querySelector('main');

      if (!mainContainer) {
        mainContainer = document.querySelector('[class*="chat"]') ||
                        document.querySelector('[class*="conversation"]') ||
                        document.querySelector('[class*="messages"]') ||
                        document.querySelector('[data-testid="chat-container"]') ||
                        document.body;
        console.log('Claude Parser: Using fallback container:', mainContainer?.tagName);
      }

      if (!mainContainer) {
        console.warn('Claude Parser: No container found');
        return messages;
      }

      // 调试：检查可用的元素
      console.log('Claude Parser: Checking selectors...');
      console.log('Claude Parser: font-user count:', mainContainer.querySelectorAll('[class*="font-user"]').length);
      console.log('Claude Parser: font-claude count:', mainContainer.querySelectorAll('[class*="font-claude"]').length);
      console.log('Claude Parser: prose count:', mainContainer.querySelectorAll('.prose, [class*="prose"]').length);

      // 通过 font-user/font-claude 查找消息起始位置
      const userMarkers = mainContainer.querySelectorAll('[class*="font-user"]');
      const aiMarkers = mainContainer.querySelectorAll('[class*="font-claude"]');

      // 收集所有消息起始点
      const messageStarts = [];

      userMarkers.forEach(el => {
        const container = this.findOuterContainer(el);
        if (container) {
          messageStarts.push({ element: container, isUser: true, top: container.getBoundingClientRect().top });
        }
      });

      aiMarkers.forEach(el => {
        const container = this.findOuterContainer(el);
        if (container) {
          messageStarts.push({ element: container, isUser: false, top: container.getBoundingClientRect().top });
        }
      });

      console.log('Claude Parser: Found', messageStarts.length, 'message markers');

      // 按垂直位置排序
      messageStarts.sort((a, b) => a.top - b.top);

      // 去重 - 合并相邻的同角色消息
      const uniqueMessages = [];
      let lastRole = null;
      let lastElement = null;

      messageStarts.forEach(msg => {
        if (msg.isUser !== lastRole || !lastElement) {
          // 新的消息
          uniqueMessages.push(msg);
          lastRole = msg.isUser;
          lastElement = msg.element;
        }
        // 如果角色相同，跳过（属于同一条消息的不同部分）
      });

      console.log('Claude Parser: After merge', uniqueMessages.length, 'messages');

      // 提取内容
      uniqueMessages.forEach(({ element, isUser }) => {
        const content = this.extractContent(element);
        if (content && content.trim().length >= 2) {
          messages.push({
            role: isUser ? 'user' : 'assistant',
            content: content.trim()
          });
        }
      });

      console.log('Claude Parser: Extracted', messages.length, 'final messages');
      return messages;

    } catch (error) {
      console.error('Claude Parser: Error extracting messages', error);
      return messages;
    }
  },

  /**
   * 找到消息的外层容器
   */
  findOuterContainer(element) {
    let current = element;
    let maxDepth = 15;
    let depth = 0;

    // 向上查找，找到一个合适的外层容器
    while (current && depth < maxDepth) {
      const classList = (current.className || '').toLowerCase();

      // 检查是否是消息容器
      if (classList.includes('message') ||
          classList.includes('human') ||
          classList.includes('assistant') ||
          classList.includes('user') ||
          classList.includes('claude') ||
          current.getAttribute('data-is-user')) {
        return current;
      }

      // 检查是否到达了聊天区域的边界
      if (classList.includes('chat') ||
          classList.includes('conversation') ||
          current.tagName === 'MAIN' ||
          current.tagName === 'BODY') {
        return current !== document.body ? current : element.closest('div[class]');
      }

      current = current.parentElement;
      depth++;
    }

    return element;
  },

  /**
   * 提取消息内容
   */
  extractContent(element) {
    // 查找 prose 内容区域
    const proseEl = element.querySelector('.prose, [class*="prose"]');
    if (proseEl) {
      return this.extractFormattedText(proseEl);
    }

    // 直接从元素提取
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
      // Claude 搜索工具相关元素
      '[class*="search-result"]',
      '[class*="web-search"]',
      '[class*="citation"]',
      '[class*="source"]',
      '[data-source]',
      'a[href*="sputniknews"]',
      'a[href*="bbc.com"]',
      'a[href*="nytimes"]',
      'a[href*="theguardian"]',
      'a[href*="bjd.com"]',
      'a[href*="people.com"]',
      'a[href*="dayoo.com"]',
      'a[href*="thepaper.cn"]',
      'a[href*="fmprc.gov"]',
      'a[href*="xinhuanet"]',
      'a[href*="cnr.cn"]'
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

    // 移除 Claude 搜索相关的文本
    text = text.replace(/Searched the web/gi, '');
    text = text.replace(/Done/gi, '');

    // 移除孤立的网址
    text = text.replace(/\b(?:news\.bjd\.com\.cn|sputniknews\.cn|people\.people\.com\.cn|gzdaily\.dayoo\.com|china\.cnr\.cn|m\.thepaper\.cn|www\.thepaper\.cn|www\.fmprc\.gov\.cn|mrdx\.xinhuanet\.com|www\.bbc\.com|www\.nytimes\.com|www\.theguardian\.com)\b/gi, '');

    // 移除 "日期 + 新闻" 模式
    text = text.replace(/\d{4}年\d{1,2}月\d{1,2}日[^\n]*/g, '');

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

    return 'Claude Chat';
  }
};

// 注册到 ChatExporter
if (typeof ChatExporter !== 'undefined') {
  ChatExporter.setPlatform('Claude', ClaudeParser);
  console.log('AI Chat Exporter: Claude parser registered');
} else {
  console.warn('AI Chat Exporter: ChatExporter not found, waiting...');
  setTimeout(() => {
    if (typeof ChatExporter !== 'undefined') {
      ChatExporter.setPlatform('Claude', ClaudeParser);
      console.log('AI Chat Exporter: Claude parser registered (delayed)');
    }
  }, 100);
}
