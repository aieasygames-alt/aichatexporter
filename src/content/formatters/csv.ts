/**
 * AI Chat Exporter - CSV Formatter
 */

import type { ChatMessage, ExportMetadata } from '../../types';
import type { FormatterDefinition } from './registry';
import { registerFormat } from './registry';

const csvFormatter: FormatterDefinition = {
  id: 'csv',
  name: 'CSV',
  extension: 'csv',
  mimeType: 'text/csv',

  format(messages: ChatMessage[], _metadata: ExportMetadata = {}): string {
    // CSV header
    let csv = 'Index,Role,Content,Timestamp\n';

    // CSV rows
    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'User' : 'AI';
      const content = escapeCSVField(msg.content);
      const timestamp = new Date().toISOString();

      csv += `${index + 1},"${role}",${content},"${timestamp}"\n`;
    });

    return csv;
  },
};

/**
 * 转义 CSV 字段
 */
function escapeCSVField(field: string): string {
  if (!field) return '""';
  // Replace double quotes with two double quotes and wrap in quotes
  const escaped = field.replace(/"/g, '""');
  // Replace newlines with space
  const cleaned = escaped.replace(/\n/g, ' ').replace(/\r/g, '');
  return `"${cleaned}"`;
}

registerFormat(csvFormatter);

export { csvFormatter };
