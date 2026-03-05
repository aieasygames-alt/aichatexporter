/**
 * AI Chat Exporter - DeepSeek Parser
 * 解析 DeepSeek (chat.deepseek.com) 的聊天记录
 */

import type { ChatMessage, PlatformParser } from '../../types';

export const DeepSeekParser: PlatformParser = {
  extract(): ChatMessage[] {
    const messages: ChatMessage[] = [];

    try {
      const messageContainer = document.querySelector('[class*="dad65929"]');

      if (!messageContainer) {
        console.warn('DeepSeek Parser: Message container not found');
        return messages;
      }

      const children = Array.from(messageContainer.children);

      let currentUserContent = '';

      children.forEach((child) => {
        const classList = child.className || '';

        if (classList.includes('_9663006')) {
          if (currentUserContent && currentUserContent.length >= 2) {
            messages.push({
              role: 'user',
              content: currentUserContent.trim(),
            });
            currentUserContent = '';
          }
          currentUserContent = child.textContent?.trim() || '';
        } else if (classList.includes('_4f9bf79')) {
          if (currentUserContent && currentUserContent.length >= 2) {
            messages.push({
              role: 'user',
              content: currentUserContent.trim(),
            });
            currentUserContent = '';
          }

          const content = this.extractAIContent(child as HTMLElement);
          if (content && content.length >= 5) {
            messages.push({
              role: 'assistant',
              content: content,
            });
          }
        }
      });

      if (currentUserContent && currentUserContent.length >= 2) {
        messages.push({
          role: 'user',
          content: currentUserContent.trim(),
        });
      }

      return messages;
    } catch (error) {
      console.error('DeepSeek Parser: Error extracting messages', error);
      return messages;
    }
  },

  extractAIContent(element: HTMLElement): string {
    const prose = element.querySelector('.prose, .markdown-body, [class*="markdown"]');

    if (prose) {
      return this.extractFormattedText(prose as HTMLElement);
    }

    return this.extractFormattedText(element);
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

    clone.querySelectorAll('pre').forEach((pre) => {
      const code = pre.textContent?.trim() || '';
      pre.replaceWith(document.createTextNode(`\n\`\`\`\n${code}\n\`\`\`\n`));
    });

    clone.querySelectorAll('p').forEach((p) => {
      const text = p.textContent?.trim() || '';
      if (text) {
        p.replaceWith(document.createTextNode(`${text}\n`));
      }
    });

    let text = clone.textContent || '';
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
  },

  getTitle(): string {
    const pageTitle = document.title.replace(' - DeepSeek', '').trim();
    if (pageTitle && pageTitle !== 'DeepSeek') {
      return pageTitle;
    }

    return 'DeepSeek Chat';
  },
};

// 注册
if (typeof window.ChatExporter !== 'undefined') {
  window.ChatExporter.setPlatform('DeepSeek', DeepSeekParser);
  console.log('AI Chat Exporter: DeepSeek parser registered');
} else {
  setTimeout(() => {
    if (typeof window.ChatExporter !== 'undefined') {
      window.ChatExporter.setPlatform('DeepSeek', DeepSeekParser);
    }
  }, 100);
}
