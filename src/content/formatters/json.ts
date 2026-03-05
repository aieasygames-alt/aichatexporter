/**
 * AI Chat Exporter - JSON Formatter
 */

import type { ChatMessage, ExportMetadata } from '../../types';
import type { FormatterDefinition } from './registry';
import { registerFormat } from './registry';

interface JSONExport {
  title: string;
  source: string;
  url?: string;
  exportedAt: string;
  messageCount: number;
  messages: ChatMessage[];
}

const jsonFormatter: FormatterDefinition = {
  id: 'json',
  name: 'JSON',
  extension: 'json',
  mimeType: 'application/json',

  format(messages: ChatMessage[], metadata: ExportMetadata = {}): string {
    const exportData: JSONExport = {
      title: metadata.title || 'Chat Export',
      source: metadata.source || 'Unknown',
      url: metadata.url,
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages,
    };

    return JSON.stringify(exportData, null, 2);
  },
};

registerFormat(jsonFormatter);

export { jsonFormatter };
