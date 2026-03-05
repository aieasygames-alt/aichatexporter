/**
 * AI Chat Exporter - 多语言支持
 * 支持：英文、西班牙语、法语、日语、俄语、简体中文
 */

import type { LanguageCode, LanguageInfo, TranslationDict, TranslationKey } from '../types';

type LanguageDict = Record<LanguageCode, TranslationDict>;

const languages: LanguageDict = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    title: 'AI Chat Exporter',
    connected: 'Connected',
    messagesFound: '{count} message{s} found',
    exportFormat: 'Export Format',
    exportAsImage: 'Image (PNG)',
    exportAsHtml: 'HTML',
    exportAsPdf: 'PDF',
    exporting: 'Exporting...',
    generatingImage: 'Generating image...',
    exportedSuccess: 'Exported successfully as {format}!',
    exportFailed: 'Export failed',
    downloadFailed: 'Download failed',
    noMessages: 'No messages found',
    notAvailable: 'ChatExporter not available',
    you: 'You',
    ai: 'AI',
    exportedBy: 'Exported by AI Chat Exporter',
    close: 'Close',
    language: 'Language',
    supportedPlatforms: 'ChatGPT • Claude • Gemini • Grok • DeepSeek',
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    title: 'AI Chat Exporter',
    connected: 'Conectado',
    messagesFound: '{count} mensaje{s} encontrado{s}',
    exportFormat: 'Formato de exportación',
    exportAsImage: 'Imagen (PNG)',
    exportAsHtml: 'HTML',
    exportAsPdf: 'PDF',
    exporting: 'Exportando...',
    generatingImage: 'Generando imagen...',
    exportedSuccess: '¡Exportado correctamente como {format}!',
    exportFailed: 'Error de exportación',
    downloadFailed: 'Error de descarga',
    noMessages: 'No se encontraron mensajes',
    notAvailable: 'ChatExporter no disponible',
    you: 'Tú',
    ai: 'IA',
    exportedBy: 'Exportado por AI Chat Exporter',
    close: 'Cerrar',
    language: 'Idioma',
    supportedPlatforms: 'ChatGPT • Claude • Gemini • Grok • DeepSeek',
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    title: 'AI Chat Exporter',
    connected: 'Connecté',
    messagesFound: '{count} message{s} trouvé{s}',
    exportFormat: "Format d'exportation",
    exportAsImage: 'Image (PNG)',
    exportAsHtml: 'HTML',
    exportAsPdf: 'PDF',
    exporting: 'Exportation...',
    generatingImage: "Génération de l'image...",
    exportedSuccess: 'Exporté avec succès en {format} !',
    exportFailed: "Échec de l'exportation",
    downloadFailed: 'Échec du téléchargement',
    noMessages: 'Aucun message trouvé',
    notAvailable: 'ChatExporter non disponible',
    you: 'Vous',
    ai: 'IA',
    exportedBy: 'Exporté par AI Chat Exporter',
    close: 'Fermer',
    language: 'Langue',
    supportedPlatforms: 'ChatGPT • Claude • Gemini • Grok • DeepSeek',
  },
  ja: {
    name: '日本語',
    flag: '🇯🇵',
    title: 'AI Chat Exporter',
    connected: '接続済み',
    messagesFound: '{count}件のメッセージが見つかりました',
    exportFormat: 'エクスポート形式',
    exportAsImage: '画像 (PNG)',
    exportAsHtml: 'HTML',
    exportAsPdf: 'PDF',
    exporting: 'エクスポート中...',
    generatingImage: '画像を生成中...',
    exportedSuccess: '{format}として正常にエクスポートされました！',
    exportFailed: 'エクスポートに失敗しました',
    downloadFailed: 'ダウンロードに失敗しました',
    noMessages: 'メッセージが見つかりません',
    notAvailable: 'ChatExporterが利用できません',
    you: 'あなた',
    ai: 'AI',
    exportedBy: 'AI Chat Exporterによってエクスポート',
    close: '閉じる',
    language: '言語',
    supportedPlatforms: 'ChatGPT • Claude • Gemini • Grok • DeepSeek',
  },
  ru: {
    name: 'Русский',
    flag: '🇷🇺',
    title: 'AI Chat Exporter',
    connected: 'Подключено',
    messagesFound: 'Найдено {count} сообщени{y}',
    exportFormat: 'Формат экспорта',
    exportAsImage: 'Изображение (PNG)',
    exportAsHtml: 'HTML',
    exportAsPdf: 'PDF',
    exporting: 'Экспорт...',
    generatingImage: 'Создание изображения...',
    exportedSuccess: 'Успешно экспортировано в {format}!',
    exportFailed: 'Ошибка экспорта',
    downloadFailed: 'Ошибка загрузки',
    noMessages: 'Сообщения не найдены',
    notAvailable: 'ChatExporter недоступен',
    you: 'Вы',
    ai: 'ИИ',
    exportedBy: 'Экспортировано AI Chat Exporter',
    close: 'Закрыть',
    language: 'Язык',
    supportedPlatforms: 'ChatGPT • Claude • Gemini • Grok • DeepSeek',
  },
  'zh-CN': {
    name: '简体中文',
    flag: '🇨🇳',
    title: 'AI 聊天导出器',
    connected: '已连接',
    messagesFound: '找到 {count} 条消息',
    exportFormat: '导出格式',
    exportAsImage: '图片 (PNG)',
    exportAsHtml: 'HTML',
    exportAsPdf: 'PDF',
    exporting: '导出中...',
    generatingImage: '生成图片中...',
    exportedSuccess: '已成功导出为 {format}！',
    exportFailed: '导出失败',
    downloadFailed: '下载失败',
    noMessages: '未找到消息',
    notAvailable: 'ChatExporter 不可用',
    you: '你',
    ai: 'AI',
    exportedBy: '由 AI 聊天导出器导出',
    close: '关闭',
    language: '语言',
    supportedPlatforms: 'ChatGPT • Claude • Gemini • Grok • DeepSeek',
  },
};

/** 语言映射 */
const langMap: Record<string, LanguageCode> = {
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  es: 'es',
  'es-ES': 'es',
  'es-LA': 'es',
  fr: 'fr',
  'fr-FR': 'fr',
  ja: 'ja',
  'ja-JP': 'ja',
  ru: 'ru',
  'ru-RU': 'ru',
  'zh-CN': 'zh-CN',
  'zh-Hans': 'zh-CN',
  zh: 'zh-CN',
  'zh-TW': 'zh-CN',
  'zh-HK': 'zh-CN',
  'zh-MO': 'zh-CN',
  'zh-Hant': 'zh-CN',
};

interface I18nModule {
  currentLang: LanguageCode;
  init(): LanguageCode;
  detectLanguage(browserLang: string): LanguageCode;
  setLanguage(lang: LanguageCode): void;
  getCurrentLanguage(): LanguageCode;
  getSupportedLanguages(): LanguageInfo[];
  t(key: TranslationKey, replacements?: Record<string, string | number>): string;
}

export const I18n: I18nModule = {
  currentLang: 'en',

  /**
   * 初始化 - 检测浏览器语言
   */
  init(): LanguageCode {
    const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'en';
    this.currentLang = this.detectLanguage(browserLang);
    return this.currentLang;
  },

  /**
   * 检测语言
   */
  detectLanguage(browserLang: string): LanguageCode {
    return langMap[browserLang] || 'en';
  },

  /**
   * 设置语言
   */
  setLanguage(lang: LanguageCode): void {
    if (languages[lang]) {
      this.currentLang = lang;
    }
  },

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): LanguageCode {
    return this.currentLang;
  },

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): LanguageInfo[] {
    return (Object.keys(languages) as LanguageCode[]).map((code) => ({
      code,
      name: languages[code].name,
      flag: languages[code].flag,
    }));
  },

  /**
   * 获取翻译文本
   */
  t(key: TranslationKey, replacements: Record<string, string | number> = {}): string {
    const lang = languages[this.currentLang] || languages.en;
    let text = lang[key] || languages.en[key] || key;

    // 处理复数形式
    if (text.includes('{s}')) {
      const count = typeof replacements.count === 'number' ? replacements.count : 1;
      text = text.replace('{s}', count === 1 ? '' : 's');
    }

    // 俄语特殊处理 - 消息的复数形式
    if (this.currentLang === 'ru' && key === 'messagesFound') {
      const count = typeof replacements.count === 'number' ? replacements.count : 1;
      const lastTwo = count % 100;
      const lastOne = count % 10;
      if (lastTwo >= 11 && lastTwo <= 14) {
        text = text.replace('{y}', 'ий');
      } else if (lastOne === 1) {
        text = text.replace('{y}', 'е');
      } else if (lastOne >= 2 && lastOne <= 4) {
        text = text.replace('{y}', 'я');
      } else {
        text = text.replace('{y}', 'й');
      }
    }

    // 替换占位符
    for (const [k, value] of Object.entries(replacements)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(value));
    }

    return text;
  },
};

// 初始化
I18n.init();

// 导出到全局
if (typeof window !== 'undefined') {
  window.I18n = I18n;
}

console.log('AI Chat Exporter: i18n loaded, language:', I18n.currentLang);
