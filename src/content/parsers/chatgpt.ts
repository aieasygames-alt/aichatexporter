/**
 * AI Chat Exporter - ChatGPT Parser
 * 解析 ChatGPT (chatgpt.com) 的聊天记录
 */

import type { ChatMessage, PlatformParser } from '../../types';

export const ChatGPTParser: PlatformParser = {
  /**
   * 提取所有对话消息
   */
  extract(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    try {
      // ChatGPT 使用 article[data-testid="conversation-turn"]
      const messageElements = document.querySelectorAll('[data-testid="conversation-turn"]');

      console.log('ChatGPT Parser: Found', messageElements.length, 'messages');

      if (messageElements.length === 0) {
        return this.extractByStructure();
      }

      messageElements.forEach((element) => {
        const role = this.detectMessageRole(element);
        const content = this.extractContent(element);

        if (content && content.trim() && !this.isJunkContent(content)) {
          messages.push({
            role: role,
            content: content.trim(),
          });
        }
      });

      console.log('ChatGPT Parser: Extracted', messages.length, 'messages');
      return messages;
    } catch (error) {
      console.error('ChatGPT Parser: Error extracting messages', error);
      return messages;
    }
  },

  /**
   * 检查是否是垃圾内容
   */
  isJunkContent(text: string): boolean {
    if (!text) return true;

    const junkPatterns = [
      /window\.__oai_/,
      /requestAnimationFrame/,
      /__oai_logHTML/,
      /__oai_SSR_/,
      /Date\.now\(\)/,
      /^\s*function\s*\(/,
      /^\s*\(\s*function/,
      /console\./,
      /^\s*\{.*\}\s*$/,
    ];

    for (const pattern of junkPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    if (text.trim().length < 2) {
      return true;
    }

    return false;
  },

  /**
   * 备用提取方法
   */
  extractByStructure(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    const selectors = ['[class*="text-base"]', '[data-message-author-role]', '.group', '[class*="conversation"]'];

    let textBases: NodeListOf<Element> | null = null;
    for (const selector of selectors) {
      textBases = document.querySelectorAll(selector);
      if (textBases.length > 0) {
        break;
      }
    }

    if (!textBases) return messages;

    textBases.forEach((element) => {
      const content = this.extractContent(element as HTMLElement);
      if (!content || content.length < 5) return;
      if (this.isJunkContent(content)) return;

      const role = this.detectMessageRole(element as HTMLElement);

      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.content === content) return;

      messages.push({
        role: role,
        content: content,
      });
    });

    return messages;
  },

  /**
   * 检测消息角色
   */
  detectMessageRole(element: HTMLElement): 'user' | 'assistant' {
    const testId = element.getAttribute('data-testid') || '';
    const classList = element.className || '';
    const html = element.outerHTML?.substring(0, 500) || '';

    if (testId.includes('user') || classList.includes('user') || html.includes('data-testid="user"')) {
      return 'user';
    }

    if (testId.includes('assistant') || classList.includes('assistant') || html.includes('data-testid="assistant"')) {
      return 'assistant';
    }

    const userAvatar = element.querySelector('[data-testid*="user"], [class*="user"]');
    const aiAvatar = element.querySelector('[data-testid*="assistant"], [class*="assistant"]');

    if (userAvatar && !aiAvatar) return 'user';
    if (aiAvatar && !userAvatar) return 'assistant';

    return 'assistant';
  },

  /**
   * 提取消息内容
   */
  extractContent(element: HTMLElement): string {
    const contentSelectors = ['[class*="markdown"]', '[class*="prose"]', '.prose', '[data-message-author-role]'];

    for (const selector of contentSelectors) {
      const contentEl = element.querySelector(selector);
      if (contentEl) {
        const text = this.extractFormattedText(contentEl as HTMLElement);
        if (text && !this.isJunkContent(text)) {
          return text;
        }
      }
    }

    const text = this.extractFormattedText(element);
    if (text && !this.isJunkContent(text)) {
      return text;
    }

    const fallbackText = element.textContent?.trim() || '';
    if (this.isJunkContent(fallbackText)) {
      return '';
    }

    return fallbackText;
  },

  /**
   * 从 DOM 元素提取格式化文本
   */
  extractFormattedText(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;

    const removeSelectors = ['button', 'svg', '.copy-button', '[class*="button"]', '[class*="icon"]'];
    removeSelectors.forEach((selector) => {
      clone.querySelectorAll(selector).forEach((el) => el.remove());
    });

    // 处理有序列表
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

    // 处理无序列表
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

    // 处理剩余列表项
    clone.querySelectorAll('li').forEach((li) => {
      const text = li.textContent?.trim() || '';
      li.replaceWith(document.createTextNode(`• ${text}\n`));
    });

    // 处理 ChatGPT 特殊有序列表
    clone.querySelectorAll('div > span').forEach((span) => {
      const spanText = span.textContent?.trim() || '';
      if (/^\d+\.$/.test(spanText)) {
        const parent = span.parentElement;
        if (parent) {
          const fullText = parent.textContent?.trim() || '';
          parent.replaceWith(document.createTextNode(`${fullText}\n`));
        }
      }
    });

    // 处理段落
    clone.querySelectorAll('p').forEach((p) => {
      const text = p.textContent?.trim() || '';
      if (text) {
        p.replaceWith(document.createTextNode(`${text}\n`));
      } else {
        p.remove();
      }
    });

    // 处理换行
    clone.querySelectorAll('br').forEach((br) => {
      br.replaceWith(document.createTextNode('\n'));
    });

    // 处理标题
    clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      const text = h.textContent?.trim() || '';
      const level = parseInt(h.tagName.charAt(1));
      const prefix = '#'.repeat(level);
      h.replaceWith(document.createTextNode(`\n${prefix} ${text}\n`));
    });

    // 处理代码块
    clone.querySelectorAll('pre').forEach((pre) => {
      const code = pre.textContent?.trim() || '';
      pre.replaceWith(document.createTextNode(`\n\`\`\`\n${code}\n\`\`\``));
    });

    // 处理行内代码
    clone.querySelectorAll('code').forEach((code) => {
      const text = code.textContent?.trim() || '';
      code.replaceWith(document.createTextNode(`\`${text}\``));
    });

    // 处理引用
    clone.querySelectorAll('blockquote').forEach((bq) => {
      const text = bq.textContent?.trim() || '';
      bq.replaceWith(document.createTextNode(`\n> ${text.replace(/\n/g, '\n> ')}`));
    });

    let text = clone.textContent || '';

    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    return text;
  },

  /**
   * 获取对话标题
   */
  getTitle(): string {
    const pageTitle = document.title.replace(' - ChatGPT', '').trim();
    if (pageTitle && pageTitle !== 'ChatGPT') {
      return pageTitle;
    }

    const urlMatch = window.location.href.match(/\/c\/([a-f0-9]+)/);
    if (urlMatch) {
      return `ChatGPT Chat ${urlMatch[1].substring(0, 8)}`;
    }

    return 'ChatGPT Chat';
  },
};

// 注册到 ChatExporter
if (typeof window.ChatExporter !== 'undefined') {
  window.ChatExporter.setPlatform('ChatGPT', ChatGPTParser);
  console.log('AI Chat Exporter: ChatGPT parser registered');
} else {
  console.warn('AI Chat Exporter: ChatExporter not found, waiting...');
  setTimeout(() => {
    if (typeof window.ChatExporter !== 'undefined') {
      window.ChatExporter.setPlatform('ChatGPT', ChatGPTParser);
      console.log('AI Chat Exporter: ChatGPT parser registered (delayed)');
    } else {
      console.error('AI Chat Exporter: ChatExporter not available');
    }
  }, 100);
}
