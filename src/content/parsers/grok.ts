/**
 * AI Chat Exporter - Grok Parser
 * 解析 Grok (grok.x.com / x.ai / grok.com) 的聊天记录
 */

import type { ChatMessage, PlatformParser } from '../../types';

export const GrokParser: PlatformParser = {
  extract(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    try {
      let messageElements: Element[] = [];

      const selectors = ['[class*="message"]', '[class*="Message"]', '[data-testid*="message"]'];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          messageElements = Array.from(elements);
          break;
        }
      }

      if (messageElements.length === 0) {
        const chatArea = document.querySelector('[class*="conversation"], [class*="chat"], main, [role="log"]');
        if (chatArea) {
          messageElements = Array.from(chatArea.children).filter((el) => {
            const text = el.textContent?.trim() || '';
            return text.length > 10 && text.length < 50000;
          });
        }
      }

      messageElements.forEach((element) => {
        const role = this.detectMessageRole(element as HTMLElement);
        const content = this.extractContent(element as HTMLElement);

        if (content && content.trim().length >= 2 && !this.isJunkContent(content)) {
          messages.push({
            role: role,
            content: content.trim(),
          });
        }
      });

      return messages;
    } catch (error) {
      console.error('Grok Parser: Error extracting messages', error);
      return messages;
    }
  },

  isJunkContent(text: string): boolean {
    if (!text) return true;

    const junkPatterns = [/^找到\s*\d+\s*条消息/, /^Found\s*\d+\s*messages/, /^\d+\s*(条|messages?)\s*$/, /^复制$/, /^Copy$/, /^分享$/, /^Share$/];

    for (const pattern of junkPatterns) {
      if (pattern.test(text.trim())) {
        return true;
      }
    }

    return false;
  },

  detectMessageRole(element: HTMLElement): 'user' | 'assistant' {
    const classList = element.className.toLowerCase();
    const html = element.outerHTML?.substring(0, 500).toLowerCase() || '';

    if (classList.includes('user') || html.includes('user')) {
      return 'user';
    }

    return 'assistant';
  },

  extractContent(element: HTMLElement): string {
    const proseEl = element.querySelector('.prose, [class*="markdown"], [class*="content"]');
    if (proseEl) {
      return this.extractFormattedText(proseEl as HTMLElement);
    }

    return element.textContent?.trim() || '';
  },

  extractFormattedText(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;

    clone.querySelectorAll('button, svg, [class*="button"]').forEach((el) => el.remove());

    let text = clone.textContent || '';
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
  },

  getTitle(): string {
    const pageTitle = document.title.replace(' - Grok', '').replace(' - X', '').trim();
    if (pageTitle && pageTitle !== 'Grok' && pageTitle !== 'X') {
      return pageTitle;
    }

    return 'Grok Chat';
  },
};

// 注册
if (typeof window.ChatExporter !== 'undefined') {
  window.ChatExporter.setPlatform('Grok', GrokParser);
  console.log('AI Chat Exporter: Grok parser registered');
} else {
  setTimeout(() => {
    if (typeof window.ChatExporter !== 'undefined') {
      window.ChatExporter.setPlatform('Grok', GrokParser);
    }
  }, 100);
}
