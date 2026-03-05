/**
 * AI Chat Exporter - Markdown Formatter
 */

import type { ChatMessage, ExportMetadata } from '../../types';
import type { FormatterDefinition } from './registry';
import { registerFormat } from './registry';

const markdownFormatter: FormatterDefinition = {
  id: 'markdown',
  name: 'Markdown',
  extension: 'md',
  mimeType: 'text/markdown',

  format(messages: ChatMessage[], metadata: ExportMetadata = {}): string {
    const title = metadata.title || 'Chat Export';
    let md = `# ${title}\n\n`;

    // 元数据
    md += `> Exported by AI Chat Exporter\n`;
    if (metadata.source) {
      md += `> Source: ${metadata.source}\n`;
    }
    md += `> Date: ${new Date().toLocaleString()}\n\n---\n\n`;

    // 消息
    messages.forEach((msg) => {
      const roleIcon = msg.role === 'user' ? '👤 **You**' : '🤖 **AI**';
      md += `${roleIcon}\n\n${msg.content}\n\n---\n\n`;
    });

    return md;
  },
};

registerFormat(markdownFormatter);

export { markdownFormatter };
