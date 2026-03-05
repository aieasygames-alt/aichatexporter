/**
 * AI Chat Exporter - Format Registry
 * 格式注册表 - 管理所有导出格式
 */

import type { ChatMessage, ExportMetadata, Formatter, ExportFormat } from '../../types';

/** 格式化结果 */
export interface FormatResult {
  content: string | Blob;
  filename: string;
  mimeType: string;
}

/** 格式化器定义 */
export interface FormatterDefinition extends Formatter {
  /** 格式化方法 - 支持同步和异步 */
  format(messages: ChatMessage[], metadata: ExportMetadata): string | Blob | Promise<string | Blob>;
}

/** 格式注册表 */
class FormatRegistry {
  private formatters: Map<ExportFormat, FormatterDefinition> = new Map();
  private order: ExportFormat[] = [];

  /**
   * 注册格式化器
   */
  register(formatter: FormatterDefinition): void {
    if (this.formatters.has(formatter.id as ExportFormat)) {
      console.warn(`Formatter "${formatter.id}" already registered, overwriting`);
    } else {
      this.order.push(formatter.id as ExportFormat);
    }
    this.formatters.set(formatter.id as ExportFormat, formatter);
    console.log(`FormatRegistry: Registered formatter "${formatter.id}"`);
  }

  /**
   * 获取格式化器
   */
  get(format: ExportFormat): FormatterDefinition | undefined {
    return this.formatters.get(format);
  }

  /**
   * 获取所有已注册的格式
   */
  getFormats(): FormatterDefinition[] {
    return this.order.map((id) => this.formatters.get(id)!).filter(Boolean);
  }

  /**
   * 获取格式的显示信息
   */
  getFormatInfo(): Array<{ id: string; name: string; extension: string }> {
    return this.getFormats().map((f) => ({
      id: f.id,
      name: f.name,
      extension: f.extension,
    }));
  }

  /**
   * 格式化消息
   */
  async format(format: ExportFormat, messages: ChatMessage[], metadata: ExportMetadata): Promise<FormatResult> {
    const formatter = this.formatters.get(format);

    if (!formatter) {
      throw new Error(`Unsupported format: ${format}`);
    }

    const content = await formatter.format(messages, metadata);
    const baseFilename = this.sanitizeFilename(metadata.title || 'chat-export');

    return {
      content,
      filename: `${baseFilename}.${formatter.extension}`,
      mimeType: formatter.mimeType,
    };
  }

  /**
   * 清理文件名
   */
  private sanitizeFilename(name: string): string {
    return (
      name
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100) || 'chat-export'
    );
  }
}

// 单例实例
export const formatRegistry = new FormatRegistry();

// 便捷导出函数
export const registerFormat = (formatter: FormatterDefinition) => formatRegistry.register(formatter);
export const getFormat = (format: ExportFormat) => formatRegistry.get(format);
export const getFormats = () => formatRegistry.getFormats();
export const formatMessages = (format: ExportFormat, messages: ChatMessage[], metadata: ExportMetadata) =>
  formatRegistry.format(format, messages, metadata);
