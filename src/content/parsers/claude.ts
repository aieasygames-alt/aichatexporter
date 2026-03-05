/**
 * AI Chat Exporter - Claude Parser
 * 解析 Claude (claude.ai) 的聊天记录
 */

import type { ChatMessage, PlatformParser } from '../../types';

interface MessageStart {
  element: HTMLElement;
  isUser: boolean;
  top: number;
}

export const ClaudeParser: PlatformParser = {
  /**
   * 提取所有对话消息
   */
  extract(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    try {
      let mainContainer = document.querySelector('main');

      if (!mainContainer) {
        mainContainer =
          document.querySelector('[class*="chat"]') ||
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

      const userMarkers = mainContainer.querySelectorAll('[class*="font-user"]');
      const aiMarkers = mainContainer.querySelectorAll('[class*="font-claude"]');

      const messageStarts: MessageStart[] = [];

      userMarkers.forEach((el) => {
        const container = this.findOuterContainer(el as HTMLElement);
        if (container) {
          messageStarts.push({
            element: container,
            isUser: true,
            top: container.getBoundingClientRect().top,
          });
        }
      });

      aiMarkers.forEach((el) => {
        const container = this.findOuterContainer(el as HTMLElement);
        if (container) {
          messageStarts.push({
            element: container,
            isUser: false,
            top: container.getBoundingClientRect().top,
          });
        }
      });

      console.log('Claude Parser: Found', messageStarts.length, 'message markers');

      messageStarts.sort((a, b) => a.top - b.top);

      const uniqueMessages: MessageStart[] = [];
      let lastRole: boolean | null = null;
      let lastElement: HTMLElement | null = null;

      messageStarts.forEach((msg) => {
        if (msg.isUser !== lastRole || !lastElement) {
          uniqueMessages.push(msg);
          lastRole = msg.isUser;
          lastElement = msg.element;
        }
      });

      console.log('Claude Parser: After merge', uniqueMessages.length, 'messages');

      uniqueMessages.forEach(({ element, isUser }) => {
        const content = this.extractContent(element);
        if (content && content.trim().length >= 2) {
          messages.push({
            role: isUser ? 'user' : 'assistant',
            content: content.trim(),
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
  findOuterContainer(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;
    const maxDepth = 15;
    let depth = 0;

    while (current && depth < maxDepth) {
      const classList = (current.className || '').toLowerCase();

      if (
        classList.includes('message') ||
        classList.includes('human') ||
        classList.includes('assistant') ||
        classList.includes('user') ||
        classList.includes('claude') ||
        current.getAttribute('data-is-user')
      ) {
        return current;
      }

      if (classList.includes('chat') || classList.includes('conversation') || current.tagName === 'MAIN' || current.tagName === 'BODY') {
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
  extractContent(element: HTMLElement): string {
    const proseEl = element.querySelector('.prose, [class*="prose"]');
    if (proseEl) {
      return this.extractFormattedText(proseEl as HTMLElement);
    }

    return this.extractFormattedText(element);
  },

  /**
   * 从 DOM 元素提取格式化文本
   */
  extractFormattedText(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;

    const removeSelectors = [
      'button',
      'svg',
      '.copy-button',
      '[class*="button"]',
      '[class*="icon"]',
      '[class*="search-result"]',
      '[class*="web-search"]',
      '[class*="citation"]',
      '[class*="source"]',
      '[data-source]',
    ];
    removeSelectors.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // 处理列表
    clone.querySelectorAll('ol').forEach((ol) => {
      const items = ol.querySelectorAll(':scope > li');
      let listText = '';
      items.forEach((li, idx) => {
        const text = li.textContent?.trim() || '';
        listText += `${idx + 1}. ${text}\n`;
        li.remove();
      });
      const textNode = document.createTextNode(listText);
      ol.parentNode?.insertBefore(textNode, ol);
      ol.remove();
    });

    clone.querySelectorAll('ul').forEach((ul) => {
      const items = ul.querySelectorAll(':scope > li');
      let listText = '';
      items.forEach((li) => {
        const text = li.textContent?.trim() || '';
        listText += `• ${text}\n`;
        li.remove();
      });
      const textNode = document.createTextNode(listText);
      ul.parentNode?.insertBefore(textNode, ul);
      ul.remove();
    });

    // 处理代码块
    clone.querySelectorAll('pre').forEach((pre) => {
      const code = pre.textContent?.trim() || '';
      pre.replaceWith(document.createTextNode(`\n\`\`\`\n${code}\n\`\`\`\n`));
    });

    clone.querySelectorAll('code').forEach((code) => {
      const text = code.textContent?.trim() || '';
      code.replaceWith(document.createTextNode(`\`${text}\``));
    });

    clone.querySelectorAll('p').forEach((p) => {
      const text = p.textContent?.trim() || '';
      if (text) {
        p.replaceWith(document.createTextNode(`${text}\n`));
      } else {
        p.remove();
      }
    });

    clone.querySelectorAll('br').forEach((br) => {
      br.replaceWith(document.createTextNode('\n'));
    });

    let text = clone.textContent || '';

    text = text.replace(/Searched the web/gi, '');
    text = text.replace(/Done/gi, '');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    return text;
  },

  /**
   * 获取对话标题
   */
  getTitle(): string {
    const titleSelectors = ['[class*="conversation-title"]', '[class*="chat-title"]', 'h1', '[class*="title"]'];

    for (const selector of titleSelectors) {
      const titleEl = document.querySelector(selector);
      if (titleEl?.textContent?.trim() && titleEl.textContent.length < 100) {
        return titleEl.textContent.trim();
      }
    }

    return 'Claude Chat';
  },
};

// 注册到 ChatExporter
if (typeof window.ChatExporter !== 'undefined') {
  window.ChatExporter.setPlatform('Claude', ClaudeParser);
  console.log('AI Chat Exporter: Claude parser registered');
} else {
  console.warn('AI Chat Exporter: ChatExporter not found, waiting...');
  setTimeout(() => {
    if (typeof window.ChatExporter !== 'undefined') {
      window.ChatExporter.setPlatform('Claude', ClaudeParser);
      console.log('AI Chat Exporter: Claude parser registered (delayed)');
    }
  }, 100);
}
