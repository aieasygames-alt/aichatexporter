/**
 * AI Chat Exporter - ChatGPT Parser
 * 解析 ChatGPT (chatgpt.com) 的聊天记录
 */

const ChatGPTParser = {
  /**
   * 提取所有对话消息
   */
  extract() {
    const messages = [];

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
            content: content.trim()
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
   * 检查是否是垃圾内容（脚本、追踪代码等）
   */
  isJunkContent(text) {
    if (!text) return true;

    // 过滤掉 ChatGPT 的追踪代码
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

    // 过滤太短的内容（少于2个字符）
    if (text.trim().length < 2) {
      return true;
    }

    return false;
  },

  /**
   * 备用提取方法
   */
  extractByStructure() {
    const messages = [];

    // 尝试多种选择器
    const selectors = [
      '[class*="text-base"]',
      '[data-message-author-role]',
      '.group',
      '[class*="conversation"]'
    ];

    let textBases = [];
    for (const selector of selectors) {
      textBases = document.querySelectorAll(selector);
      if (textBases.length > 0) {
        break;
      }
    }

    textBases.forEach((element) => {
      // 使用 extractContent 而不是直接 textContent，保留格式
      const content = this.extractContent(element);
      if (!content || content.length < 5) return;
      if (this.isJunkContent(content)) return;

      const role = this.detectMessageRole(element);

      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.content === content) return;

      messages.push({
        role: role,
        content: content
      });
    });

    return messages;
  },

  /**
   * 检测消息角色
   */
  detectMessageRole(element) {
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
   * 提取消息内容（保留格式）
   */
  extractContent(element) {
    // 查找 markdown 或 prose 内容区域（ChatGPT 使用 markdown 或 prose 类）
    const contentSelectors = [
      '[class*="markdown"]',
      '[class*="prose"]',
      '.prose',
      '[data-message-author-role]'
    ];

    for (const selector of contentSelectors) {
      const contentEl = element.querySelector(selector);
      if (contentEl) {
        const text = this.extractFormattedText(contentEl);
        if (text && !this.isJunkContent(text)) {
          return text;
        }
      }
    }

    // 尝试从整个元素提取
    const text = this.extractFormattedText(element);
    if (text && !this.isJunkContent(text)) {
      return text;
    }

    // 最后回退到 textContent
    const fallbackText = element.textContent.trim();
    if (this.isJunkContent(fallbackText)) {
      return '';
    }

    return fallbackText;
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

    // 处理有序列表 - 标准的 ol 标签
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

    // 处理无序列表 - 标准的 ul 标签
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

    // 处理列表项（没有被上面的选择器匹配到的）
    clone.querySelectorAll('li').forEach(li => {
      const text = li.textContent.trim();
      li.replaceWith(`• ${text}\n`);
    });

    // 处理 ChatGPT 特殊的有序列表格式
    // ChatGPT 可能用 div 包装列表项，检测带有数字前缀的 span
    clone.querySelectorAll('div > span').forEach(span => {
      // 检查 span 是否只包含数字和点（如 "1."、"2."）
      const spanText = span.textContent.trim();
      if (/^\d+\.$/.test(spanText)) {
        // 找到父 div，获取完整列表项文本
        const parent = span.parentElement;
        if (parent) {
          const fullText = parent.textContent.trim();
          // span 的数字已经包含在 fullText 中，直接保留
          parent.replaceWith(`${fullText}\n`);
        }
      }
    });

    // 处理带有 list-style 类或属性的元素
    clone.querySelectorAll('[class*="list"]').forEach(listItem => {
      const text = listItem.textContent.trim();
      // 检查是否已经有数字前缀
      if (!/^\d+\./.test(text) && !/^•/.test(text)) {
        // 没有，跳过
        return;
      }
      // 已有格式，保留
    });

    // 处理段落 - 只在段落间添加单个换行，减少图片导出时的间距
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

    // 处理标题 - 减少间距
    clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
      const text = h.textContent.trim();
      const level = parseInt(h.tagName.charAt(1));
      const prefix = '#'.repeat(level);
      h.replaceWith(`\n${prefix} ${text}\n`);
    });

    // 处理代码块 - 减少间距
    clone.querySelectorAll('pre').forEach(pre => {
      const code = pre.textContent.trim();
      pre.replaceWith(`\n\`\`\`\n${code}\n\`\`\``);
    });

    // 处理行内代码
    clone.querySelectorAll('code').forEach(code => {
      const text = code.textContent.trim();
      code.replaceWith(`\`${text}\``);
    });

    // 处理引用 - 减少间距
    clone.querySelectorAll('blockquote').forEach(bq => {
      const text = bq.textContent.trim();
      bq.replaceWith(`\n> ${text.replace(/\n/g, '\n> ')}`);
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
    const pageTitle = document.title.replace(' - ChatGPT', '').trim();
    if (pageTitle && pageTitle !== 'ChatGPT') {
      return pageTitle;
    }

    const urlMatch = window.location.href.match(/\/c\/([a-f0-9]+)/);
    if (urlMatch) {
      return `ChatGPT Chat ${urlMatch[1].substring(0, 8)}`;
    }

    return 'ChatGPT Chat';
  }
};

// 注册到 ChatExporter
if (typeof ChatExporter !== 'undefined') {
  ChatExporter.setPlatform('ChatGPT', ChatGPTParser);
  console.log('AI Chat Exporter: ChatGPT parser registered');
} else {
  console.warn('AI Chat Exporter: ChatExporter not found, waiting...');
  setTimeout(() => {
    if (typeof ChatExporter !== 'undefined') {
      ChatExporter.setPlatform('ChatGPT', ChatGPTParser);
      console.log('AI Chat Exporter: ChatGPT parser registered (delayed)');
    } else {
      console.error('AI Chat Exporter: ChatExporter not available');
    }
  }, 100);
}
