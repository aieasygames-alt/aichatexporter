/**
 * AI Chat Exporter - HTML Formatter
 * 生成样式化的 HTML 页面，支持深色/浅色主题
 */

import type { ChatMessage, ExportMetadata } from '../../types';
import type { FormatterDefinition } from './registry';
import { registerFormat } from './registry';

const htmlFormatter: FormatterDefinition = {
  id: 'html',
  name: 'HTML',
  extension: 'html',
  mimeType: 'text/html',

  format(messages: ChatMessage[], metadata: ExportMetadata = {}): string {
    const title = metadata.title || 'Chat Export';
    const source = metadata.source || 'AI Chat';
    const exportedAt = new Date().toLocaleString();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f7f7f8;
      --bg-user: #f0f7ff;
      --bg-ai: #f7f7f8;
      --text-primary: #1a1a1a;
      --text-secondary: #6b6b6b;
      --border-color: #e5e5e5;
      --accent-color: #10a37f;
      --user-accent: #2563eb;
      --ai-accent: #10a37f;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #1a1a1a;
        --bg-secondary: #2d2d2d;
        --bg-user: #1e3a5f;
        --bg-ai: #2d2d2d;
        --text-primary: #ffffff;
        --text-secondary: #a0a0a0;
        --border-color: #404040;
      }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .header .meta {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .header .meta span {
      margin: 0 10px;
    }

    .header .badge {
      display: inline-block;
      background: var(--accent-color);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      margin-top: 10px;
    }

    .messages {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .message {
      padding: 20px;
      border-radius: 12px;
      position: relative;
    }

    .message.user {
      background: var(--bg-user);
      border-left: 4px solid var(--user-accent);
    }

    .message.assistant {
      background: var(--bg-ai);
      border-left: 4px solid var(--ai-accent);
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-weight: 600;
    }

    .message.user .message-header {
      color: var(--user-accent);
    }

    .message.assistant .message-header {
      color: var(--ai-accent);
    }

    .message-icon {
      font-size: 20px;
    }

    .message-content {
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .message-content code {
      background: var(--bg-secondary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.9em;
    }

    .message-content pre {
      background: var(--bg-secondary);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
    }

    .message-content pre code {
      background: none;
      padding: 0;
    }

    .footer {
      text-align: center;
      padding: 30px 0;
      margin-top: 30px;
      border-top: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 12px;
    }

    .footer a {
      color: var(--accent-color);
      text-decoration: none;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    /* Print styles */
    @media print {
      body {
        padding: 0;
        max-width: none;
      }

      .message {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">
      <span>📥 Source: ${escapeHtml(source)}</span>
      <span>📅 ${escapeHtml(exportedAt)}</span>
      <span>💬 ${messages.length} messages</span>
    </div>
    <div class="badge">Exported by AI Chat Exporter</div>
  </header>

  <main class="messages">
${messages.map((msg) => formatMessage(msg)).join('\n')}
  </main>

  <footer class="footer">
    <p>Exported by <a href="https://github.com/ai-chat-exporter">AI Chat Exporter</a></p>
  </footer>
</body>
</html>`;
  },
};

/**
 * 格式化单条消息
 */
function formatMessage(msg: ChatMessage): string {
  const isUser = msg.role === 'user';
  const roleClass = isUser ? 'user' : 'assistant';
  const roleIcon = isUser ? '👤' : '🤖';
  const roleName = isUser ? 'You' : 'AI';

  return `    <article class="message ${roleClass}">
      <div class="message-header">
        <span class="message-icon">${roleIcon}</span>
        <span>${roleName}</span>
      </div>
      <div class="message-content">${formatContent(msg.content)}</div>
    </article>`;
}

/**
 * 格式化消息内容（处理代码块等）
 */
function formatContent(content: string): string {
  // 转义 HTML
  let formatted = escapeHtml(content);

  // 处理代码块 ```code```
  formatted = formatted.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre><code class="language-$1">$2</code></pre>'
  );

  // 处理行内代码 `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

  return formatted;
}

/**
 * 转义 HTML 特殊字符
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

registerFormat(htmlFormatter);

export { htmlFormatter };
