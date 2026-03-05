/**
 * AI Chat Exporter - Type Definitions
 */

/** 支持的语言代码 */
export type LanguageCode = 'en' | 'es' | 'fr' | 'ja' | 'ru' | 'zh-CN';

/** 消息角色 */
export type MessageRole = 'user' | 'assistant';

/** 导出格式 */
export type ExportFormat = 'markdown' | 'json' | 'txt' | 'csv' | 'image' | 'html' | 'pdf';

/** 主题模式 */
export type ThemeMode = 'auto' | 'light' | 'dark';

/** 聊天消息 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/** 导出元数据 */
export interface ExportMetadata {
  title?: string;
  source?: string;
  url?: string;
}

/** 提取结果 */
export interface ExtractResult {
  success: boolean;
  error?: string;
  data?: {
    platform: string;
    title: string;
    messages: ChatMessage[];
    url: string;
  };
}

/** 导出结果 */
export interface ExportResult {
  success: boolean;
  error?: string;
  data?: {
    type?: string;
    title?: string;
    messages?: ChatMessage[];
    platform?: string;
    content?: string;
    filename?: string;
    mimeType?: string;
  };
}

/** 平台解析器接口 */
export interface PlatformParser {
  extract(): ChatMessage[];
  getTitle(): string;
  extractFormattedText?(element: Element): string;
  // 允许解析器有额外的方法
  [key: string]: unknown;
}

/** 格式化器接口 */
export interface Formatter {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  format(messages: ChatMessage[], metadata: ExportMetadata): string | Blob | Promise<string | Blob>;
}

/** 格式化器定义（与 Formatter 相同，用于注册表） */
export type FormatterDefinition = Formatter;

/** 应用设置 */
export interface AppSettings {
  language: LanguageCode;
  defaultFormat: ExportFormat;
  theme: ThemeMode;
  includeMetadata: boolean;
  pngScale: number;
  showConfirmation: boolean;
}

/** 默认设置 */
export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  defaultFormat: 'markdown',
  theme: 'auto',
  includeMetadata: true,
  pngScale: 2,
  showConfirmation: true,
};

/** 语言信息 */
export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  flag: string;
}

/** 翻译键 */
export type TranslationKey =
  | 'title'
  | 'connected'
  | 'messagesFound'
  | 'exportFormat'
  | 'exportAsImage'
  | 'exportAsHtml'
  | 'exportAsPdf'
  | 'exporting'
  | 'generatingImage'
  | 'exportedSuccess'
  | 'exportFailed'
  | 'downloadFailed'
  | 'noMessages'
  | 'notAvailable'
  | 'you'
  | 'ai'
  | 'exportedBy'
  | 'close'
  | 'language'
  | 'supportedPlatforms';

/** 翻译字典 */
export type TranslationDict = Record<TranslationKey, string> & {
  name: string;
  flag: string;
};

/** Chrome 消息动作 */
export type ChromeMessageAction =
  | 'ping'
  | 'extract'
  | 'export'
  | 'openPopup'
  | 'download';

/** Chrome 消息 */
export interface ChromeMessage {
  action: ChromeMessageAction;
  format?: ExportFormat;
  data?: DownloadData;
}

/** 下载数据 */
export interface DownloadData {
  content: string;
  filename: string;
  mimeType: string;
  isDataUrl?: boolean;
}

/** 下载响应 */
export interface DownloadResponse {
  success: boolean;
  error?: string;
}

/** 扩展 Window 接口 */
declare global {
  interface Window {
    I18n: typeof import('../content/i18n').I18n;
    ChatExporter: typeof import('../content/common').ChatExporter;
    FloatingPopup: typeof import('../content/injected-ui').FloatingPopup;
  }
}
