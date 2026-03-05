/**
 * ExportFormatter 单元测试 (兼容旧测试)
 */

import { describe, it, expect } from 'vitest';
import type { ChatMessage } from '../../src/types';

// 导入格式注册表
import '../../src/content/formatters';
import { formatRegistry } from '../../src/content/formatters';

describe('ExportFormatter', () => {
  const sampleMessages: ChatMessage[] = [
    { role: 'user', content: 'Hello, how are you?' },
    { role: 'assistant', content: 'I am doing well, thank you!' },
    { role: 'user', content: 'What is 2 + 2?' },
    { role: 'assistant', content: '2 + 2 equals 4.' },
  ];

  describe('toMarkdown', () => {
    it('should convert messages to markdown format', async () => {
      const result = await formatRegistry.format('markdown', sampleMessages, { title: 'Test Chat' });

      expect(result.content).toContain('# Test Chat');
      expect(result.content).toContain('Exported by AI Chat Exporter');
      expect(result.content).toContain('👤 **You**');
      expect(result.content).toContain('🤖 **AI**');
      expect(result.content).toContain('Hello, how are you?');
      expect(result.content).toContain('I am doing well, thank you!');
    });

    it('should use default title if not provided', async () => {
      const result = await formatRegistry.format('markdown', sampleMessages, {});
      expect(result.content).toContain('# Chat Export');
    });
  });

  describe('toJSON', () => {
    it('should convert messages to JSON format', async () => {
      const result = await formatRegistry.format('json', sampleMessages, { title: 'Test', source: 'ChatGPT' });
      const parsed = JSON.parse(result.content as string);

      expect(parsed.title).toBe('Test');
      expect(parsed.source).toBe('ChatGPT');
      expect(parsed.messageCount).toBe(4);
      expect(parsed.messages).toHaveLength(4);
      expect(parsed.messages[0].role).toBe('user');
    });

    it('should use default metadata if not provided', async () => {
      const result = await formatRegistry.format('json', sampleMessages, {});
      const parsed = JSON.parse(result.content as string);

      expect(parsed.title).toBe('Chat Export');
      expect(parsed.source).toBe('Unknown');
    });
  });

  describe('toTXT', () => {
    it('should convert messages to plain text format', async () => {
      const result = await formatRegistry.format('txt', sampleMessages, {});

      expect(result.content).toContain('AI Chat Export');
      expect(result.content).toContain('[USER]');
      expect(result.content).toContain('[AI]');
      expect(result.content).toContain('Hello, how are you?');
    });
  });

  describe('toCSV', () => {
    it('should convert messages to CSV format', async () => {
      const result = await formatRegistry.format('csv', sampleMessages, {});

      expect(result.content).toContain('Index,Role,Content,Timestamp');
      expect(result.content).toContain('"User"');
      expect(result.content).toContain('"AI"');
    });

    it('should escape quotes in CSV fields', async () => {
      const messagesWithQuotes: ChatMessage[] = [
        { role: 'user', content: 'He said "hello"' },
      ];
      const result = await formatRegistry.format('csv', messagesWithQuotes, {});
      expect(result.content).toContain('""hello""');
    });

    it('should replace newlines with spaces', async () => {
      const messagesWithNewlines: ChatMessage[] = [
        { role: 'user', content: 'Line 1\nLine 2' },
      ];
      const result = await formatRegistry.format('csv', messagesWithNewlines, {});
      // 换行应该被替换为空格
      expect(result.content).toContain('Line 1');
      expect(result.content).toContain('Line 2');
    });

    it('should handle empty fields', async () => {
      const emptyMessages: ChatMessage[] = [
        { role: 'user', content: '' },
      ];
      const result = await formatRegistry.format('csv', emptyMessages, {});
      expect(result.content).toContain('""');
    });
  });
});
