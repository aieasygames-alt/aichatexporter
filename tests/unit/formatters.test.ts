/**
 * AI Chat Exporter - Formatters Unit Tests
 * 格式化器单元测试
 */

import { describe, it, expect } from 'vitest';
import type { ExportMetadata } from '../../src/types';

// 导入所有格式化器（触发注册）
import '../../src/content/formatters';
import { formatRegistry } from '../../src/content/formatters';

// 导入测试数据
import {
  basicMessages,
  emptyMessages,
  punctuationMessages,
  unicodeMessages,
  codeMessages,
  markdownMessages,
  whitespaceMessages,
  multilingualMessages,
  csvSpecialMessages,
} from '../fixtures/messages';

describe('Format Registry', () => {
  it('should have all formats registered', () => {
    const formats = formatRegistry.getFormats();
    const formatIds = formats.map((f) => f.id);

    expect(formatIds).toContain('markdown');
    expect(formatIds).toContain('json');
    expect(formatIds).toContain('txt');
    expect(formatIds).toContain('csv');
    expect(formatIds).toContain('html');
    expect(formatIds).toContain('pdf');
    expect(formatIds).toHaveLength(6);
  });

  it('should return undefined for unknown format', () => {
    const formatter = formatRegistry.get('unknown' as never);
    expect(formatter).toBeUndefined();
  });
});

describe('Markdown Formatter', () => {
  const metadata: ExportMetadata = { title: 'Test Chat', source: 'Test Platform' };

  it('should format basic messages correctly', async () => {
    const result = await formatRegistry.format('markdown', basicMessages, metadata);
    expect(result.content).toContain('# Test Chat');
    expect(result.content).toContain('👤 **You**');
    expect(result.content).toContain('🤖 **AI**');
    expect(result.content).toContain('Hello, how are you?');
    expect(result.filename).toBe('Test-Chat.md');
    expect(result.mimeType).toBe('text/markdown');
  });

  it('should preserve Chinese punctuation', async () => {
    const result = await formatRegistry.format('markdown', punctuationMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
    expect(content).toContain('，');
    expect(content).toContain('。');
    expect(content).toContain('！');
    expect(content).toContain('？');
  });

  it('should preserve Unicode and emoji', async () => {
    const result = await formatRegistry.format('markdown', unicodeMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('😀');
    expect(content).toContain('🎉');
    expect(content).toContain('🚀');
    expect(content).toContain('∑');
    expect(content).toContain('€');
    expect(content).toContain('¥');
  });

  it('should preserve code blocks', async () => {
    const result = await formatRegistry.format('markdown', codeMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('```javascript');
    expect(content).toContain('const greeting');
    expect(content).toContain('```python');
  });

  it('should preserve markdown formatting', async () => {
    const result = await formatRegistry.format('markdown', markdownMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('# 标题测试');
    expect(content).toContain('**粗体**');
    expect(content).toContain('*斜体*');
    expect(content).toContain('> 引用测试');
    expect(content).toContain('1. 第一项');
    expect(content).toContain('- 无序列表');
    expect(content).toContain('| 表格 | 测试 |');
  });

  it('should preserve newlines', async () => {
    const result = await formatRegistry.format('markdown', whitespaceMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('多行文本');
    expect(content).toContain('第二行');
  });

  it('should handle multilingual content', async () => {
    const result = await formatRegistry.format('markdown', multilingualMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('中文测试');
    expect(content).toContain('日本語テスト');
    expect(content).toContain('한국어 테스트');
    expect(content).toContain('Русский тест');
  });

  it('should handle empty messages', async () => {
    const result = await formatRegistry.format('markdown', emptyMessages, metadata);
    expect(result.content).toContain('# Test Chat');
  });
});

describe('JSON Formatter', () => {
  const metadata: ExportMetadata = { title: 'Test Chat', source: 'Test Platform', url: 'https://test.com' };

  it('should produce valid JSON', async () => {
    const result = await formatRegistry.format('json', basicMessages, metadata);
    expect(result.mimeType).toBe('application/json');
    expect(result.filename).toBe('Test-Chat.json');

    const parsed = JSON.parse(result.content as string);
    expect(parsed).toBeDefined();
  });

  it('should include all metadata', async () => {
    const result = await formatRegistry.format('json', basicMessages, metadata);
    const parsed = JSON.parse(result.content as string);

    expect(parsed.title).toBe('Test Chat');
    expect(parsed.source).toBe('Test Platform');
    expect(parsed.url).toBe('https://test.com');
    expect(parsed.exportedAt).toBeDefined();
    expect(parsed.messageCount).toBe(4);
  });

  it('should preserve all messages', async () => {
    const result = await formatRegistry.format('json', basicMessages, metadata);
    const parsed = JSON.parse(result.content as string);

    expect(parsed.messages).toHaveLength(4);
    expect(parsed.messages[0].role).toBe('user');
    expect(parsed.messages[0].content).toBe('Hello, how are you?');
    expect(parsed.messages[1].role).toBe('assistant');
  });

  it('should handle Unicode correctly', async () => {
    const result = await formatRegistry.format('json', unicodeMessages, metadata);
    const parsed = JSON.parse(result.content as string);

    expect(parsed.messages[0].content).toContain('😀');
    expect(parsed.messages[1].content).toContain('∑');
  });

  it('should handle code blocks correctly', async () => {
    const result = await formatRegistry.format('json', codeMessages, metadata);
    const parsed = JSON.parse(result.content as string);

    expect(parsed.messages[0].content).toContain('```javascript');
    expect(parsed.messages[0].content).toContain('const greeting');
  });

  it('should handle special characters', async () => {
    const result = await formatRegistry.format('json', punctuationMessages, metadata);
    const parsed = JSON.parse(result.content as string);

    expect(parsed.messages).toBeDefined();
    expect(parsed.messages[0].content).toContain('测试中文标点');
  });
});

describe('TXT Formatter', () => {
  const metadata: ExportMetadata = { title: 'Test Chat', source: 'Test Platform' };

  it('should format basic messages correctly', async () => {
    const result = await formatRegistry.format('txt', basicMessages, metadata);
    expect(result.mimeType).toBe('text/plain');
    expect(result.filename).toBe('Test-Chat.txt');

    const content = result.content as string;
    expect(content).toContain('AI Chat Export');
    expect(content).toContain('[USER]');
    expect(content).toContain('[AI]');
    expect(content).toContain('Hello, how are you?');
  });

  it('should use separators between messages', async () => {
    const result = await formatRegistry.format('txt', basicMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('============================================================');
  });

  it('should preserve newlines', async () => {
    const result = await formatRegistry.format('txt', whitespaceMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('多行文本');
    expect(content).toContain('第二行');
  });

  it('should preserve Chinese punctuation', async () => {
    const result = await formatRegistry.format('txt', punctuationMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
  });

  it('should preserve emoji', async () => {
    const result = await formatRegistry.format('txt', unicodeMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('😀');
    expect(content).toContain('🎉');
  });
});

describe('CSV Formatter', () => {
  const metadata: ExportMetadata = { title: 'Test Chat', source: 'Test Platform' };

  it('should produce valid CSV with header', async () => {
    const result = await formatRegistry.format('csv', basicMessages, metadata);
    expect(result.mimeType).toBe('text/csv');
    expect(result.filename).toBe('Test-Chat.csv');

    const content = result.content as string;
    expect(content.startsWith('Index,Role,Content,Timestamp\n')).toBe(true);
  });

  it('should escape commas in content', async () => {
    const result = await formatRegistry.format('csv', csvSpecialMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('包含逗号,的消息');
  });

  it('should escape double quotes by doubling them', async () => {
    const result = await formatRegistry.format('csv', csvSpecialMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('""双引号""');
  });

  it('should handle special characters', async () => {
    const result = await formatRegistry.format('csv', punctuationMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
  });

  it('should handle emoji in CSV', async () => {
    const result = await formatRegistry.format('csv', unicodeMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('😀');
  });
});

describe('HTML Formatter', () => {
  const metadata: ExportMetadata = { title: 'Test Chat', source: 'Test Platform' };

  it('should produce valid HTML document', async () => {
    const result = await formatRegistry.format('html', basicMessages, metadata);
    expect(result.mimeType).toBe('text/html');
    expect(result.filename).toBe('Test-Chat.html');

    const content = result.content as string;
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('<html');
    expect(content).toContain('</html>');
  });

  it('should include title and metadata', async () => {
    const result = await formatRegistry.format('html', basicMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('<title>Test Chat</title>');
    expect(content).toContain('<h1>Test Chat</h1>');
    expect(content).toContain('Source: Test Platform');
  });

  it('should escape HTML special characters', async () => {
    // 使用包含 HTML 标签的测试消息
    const htmlTagMessages = [
      { role: 'user' as const, content: '<script>alert("xss")</script>' },
      { role: 'assistant' as const, content: 'Use <div> and &amp; in HTML' },
    ];

    const result = await formatRegistry.format('html', htmlTagMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('&lt;script&gt;');
    expect(content).toContain('&amp;');
  });

  it('should convert code blocks to pre/code elements', async () => {
    const result = await formatRegistry.format('html', codeMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('<pre><code');
  });

  it('should include theme support CSS', async () => {
    const result = await formatRegistry.format('html', basicMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('prefers-color-scheme');
  });

  it('should preserve Chinese characters', async () => {
    const result = await formatRegistry.format('html', punctuationMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
  });

  it('should preserve emoji', async () => {
    const result = await formatRegistry.format('html', unicodeMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('😀');
  });
});

describe('PDF Formatter', () => {
  const metadata: ExportMetadata = { title: 'Test Chat', source: 'Test Platform' };

  it('should generate printable HTML', async () => {
    const result = await formatRegistry.format('pdf', basicMessages, metadata);
    expect(result.mimeType).toBe('application/pdf');
    expect(result.filename).toBe('Test-Chat.pdf');

    const content = result.content as string;
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('window.print()');
  });

  it('should include print button', async () => {
    const result = await formatRegistry.format('pdf', basicMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('Save as PDF');
    expect(content).toContain('print-btn');
  });

  it('should include print styles', async () => {
    const result = await formatRegistry.format('pdf', basicMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('@media print');
    expect(content).toContain('break-inside: avoid');
  });

  it('should preserve Chinese characters', async () => {
    const result = await formatRegistry.format('pdf', punctuationMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
  });
});

describe('Edge Cases', () => {
  const metadata: ExportMetadata = { title: 'Edge Case Test' };

  it('should handle empty content', async () => {
    const emptyContent = [
      { role: 'user' as const, content: '' },
      { role: 'assistant' as const, content: '' },
    ];

    const formats = ['markdown', 'json', 'txt', 'csv', 'html', 'pdf'] as const;

    for (const format of formats) {
      const result = await formatRegistry.format(format, emptyContent, metadata);
      expect(result.content).toBeDefined();
    }
  });

  it('should handle very long content', async () => {
    const longContent = [
      { role: 'user' as const, content: 'A'.repeat(10000) },
    ];

    const formats = ['markdown', 'json', 'txt', 'csv', 'html', 'pdf'] as const;

    for (const format of formats) {
      const result = await formatRegistry.format(format, longContent, metadata);
      expect((result.content as string).length).toBeGreaterThan(5000);
    }
  });

  it('should handle only whitespace content', async () => {
    const whitespaceContent = [
      { role: 'user' as const, content: '   ' },
      { role: 'assistant' as const, content: '\n\n\n' },
    ];

    const formats = ['markdown', 'json', 'txt', 'csv', 'html', 'pdf'] as const;

    for (const format of formats) {
      const result = await formatRegistry.format(format, whitespaceContent, metadata);
      expect(result.content).toBeDefined();
    }
  });

  it('should handle mixed language content', async () => {
    const result = await formatRegistry.format('json', multilingualMessages, metadata);
    const parsed = JSON.parse(result.content as string);

    expect(parsed.messages[0].content).toContain('中文');
    expect(parsed.messages[1].content).toContain('日本語');
    expect(parsed.messages[2].content).toContain('한국어');
    expect(parsed.messages[3].content).toContain('Русский');
    expect(parsed.messages[5].content).toContain('Hello 世界');
  });
});

describe('Content Integrity Tests', () => {
  const metadata: ExportMetadata = { title: 'Integrity Test' };

  it('should preserve all critical content in Markdown format', async () => {
    const allMessages = [
      ...punctuationMessages,
      ...unicodeMessages,
      ...codeMessages,
      ...markdownMessages,
    ];

    const result = await formatRegistry.format('markdown', allMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
    expect(content).toContain('😀');
    expect(content).toContain('```javascript');
    expect(content).toContain('const greeting');
    expect(content).toContain('**粗体**');
    expect(content).toContain('> 引用测试');
    expect(content).toContain('| 表格 | 测试 |');
  });

  it('should preserve all critical content in JSON format', async () => {
    const allMessages = [
      ...punctuationMessages,
      ...unicodeMessages,
      ...codeMessages,
      ...markdownMessages,
    ];

    const result = await formatRegistry.format('json', allMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
    expect(content).toContain('😀');
    expect(content).toContain('```javascript');
    expect(content).toContain('**粗体**');
  });

  it('should preserve all critical content in HTML format', async () => {
    const allMessages = [
      ...punctuationMessages,
      ...unicodeMessages,
      ...codeMessages,
      ...markdownMessages,
    ];

    const result = await formatRegistry.format('html', allMessages, metadata);
    const content = result.content as string;

    expect(content).toContain('测试中文标点');
    expect(content).toContain('😀');
  });
});
