/**
 * AI Chat Exporter - Gemini Parser
 * 解析 Google Gemini (gemini.google.com) 的聊天记录
 */

import type { ChatMessage, PlatformParser } from '../../types';

export const GeminiParser: PlatformParser = {
  extract(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    try {
      const historyContainer = document.querySelector('infinite-scroller.chat-history');

      if (!historyContainer) {
        const alternateContainer =
          document.querySelector('[class*="chat"]') ||
          document.querySelector('[class*="conversation"]') ||
          document.querySelector('main');

        if (alternateContainer) {
          return this.extractFromContainer(alternateContainer as HTMLElement);
        }

        console.warn('Gemini Parser: Chat history container not found');
        return messages;
      }

      return this.extractFromContainer(historyContainer as HTMLElement);
    } catch (error) {
      console.error('Gemini Parser: Error extracting messages', error);
      return messages;
    }
  },

  extractFromContainer(container: HTMLElement): ChatMessage[] {
    const messages: ChatMessage[] = [];

    const userQueries = container.querySelectorAll('user-query');
    const modelResponses = container.querySelectorAll('model-response');

    const allMessages: { element: Element; isUser: boolean }[] = [];

    userQueries.forEach((el) => {
      allMessages.push({ element: el, isUser: true });
    });

    modelResponses.forEach((el) => {
      allMessages.push({ element: el, isUser: false });
    });

    allMessages.sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });

    allMessages.forEach(({ element, isUser }) => {
      const content = this.extractMessageContent(element as HTMLElement, isUser);

      if (content && content.trim()) {
        messages.push({
          role: isUser ? 'user' : 'assistant',
          content: content.trim(),
        });
      }
    });

    return messages;
  },

  extractMessageContent(element: HTMLElement, isUser: boolean): string {
    const contentEl = isUser
      ? element.querySelector('.user-query-bubble-with-background, .user-query-content, .query-content')
      : element.querySelector('div.container, .response-container, .model-response-content');

    if (contentEl) {
      return this.extractFormattedText(contentEl as HTMLElement);
    }

    return element.textContent?.trim() || '';
  },

  extractFormattedText(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;

    clone.querySelectorAll('button, svg, [class*="button"]').forEach((el) => el.remove());

    clone.querySelectorAll('ol').forEach((ol) => {
      const items = ol.querySelectorAll(':scope > li');
      let listText = '';
      items.forEach((li, idx) => {
        const text = li.textContent?.trim() || '';
        listText += `${idx + 1}. ${text}\n`;
        li.remove();
      });
      ol.parentNode?.insertBefore(document.createTextNode(listText), ol);
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
      ul.parentNode?.insertBefore(document.createTextNode(listText), ul);
      ul.remove();
    });

    clone.querySelectorAll('p').forEach((p) => {
      const text = p.textContent?.trim() || '';
      if (text) {
        p.replaceWith(document.createTextNode(`${text}\n`));
      }
    });

    clone.querySelectorAll('br').forEach((br) => {
      br.replaceWith(document.createTextNode('\n'));
    });

    let text = clone.textContent || '';
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
  },

  getTitle(): string {
    const titleSelectors = ['.conversation-title', 'h1', '[class*="title"]'];

    for (const selector of titleSelectors) {
      const titleEl = document.querySelector(selector);
      if (titleEl?.textContent?.trim() && titleEl.textContent.length < 100) {
        return titleEl.textContent.trim();
      }
    }

    return 'Gemini Chat';
  },
};

// 注册
if (typeof window.ChatExporter !== 'undefined') {
  window.ChatExporter.setPlatform('Gemini', GeminiParser);
  console.log('AI Chat Exporter: Gemini parser registered');
} else {
  setTimeout(() => {
    if (typeof window.ChatExporter !== 'undefined') {
      window.ChatExporter.setPlatform('Gemini', GeminiParser);
    }
  }, 100);
}
