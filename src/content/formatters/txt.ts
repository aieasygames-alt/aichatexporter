/**
 * AI Chat Exporter - TXT Formatter
 */

import type { ChatMessage, ExportMetadata } from '../../types';
import type { FormatterDefinition } from './registry';
import { registerFormat } from './registry';

const txtFormatter: FormatterDefinition = {
  id: 'txt',
  name: 'Plain Text',
  extension: 'txt',
  mimeType: 'text/plain',

  format(messages: ChatMessage[], _metadata: ExportMetadata = {}): string {
    const separator = '\n\n' + '='.repeat(60) + '\n\n';

    const header = `AI Chat Export\nExported: ${new Date().toLocaleString()}\n${'='.repeat(60)}\n\n`;

    const content = messages
      .map((msg) => {
        const role = msg.role === 'user' ? '[USER]' : '[AI]';
        return `${role}\n\n${msg.content}`;
      })
      .join(separator);

    return header + content;
  },
};

registerFormat(txtFormatter);

export { txtFormatter };
