import en from './en.json';
import zhCN from './zh-CN.json';
import ja from './ja.json';
import ko from './ko.json';
import es from './es.json';
import fr from './fr.json';

export const languages = {
  en: 'English',
  'zh-CN': '简体中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
};

export const defaultLang = 'en';

export const translations = {
  en,
  'zh-CN': zhCN,
  ja,
  ko,
  es,
  fr,
} as const;

export type Lang = keyof typeof translations;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    const keys = key.split('.');
    let value: unknown = translations[lang];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Fallback to English
        value = translations[defaultLang];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = (value as Record<string, unknown>)[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };
}

export function getRouteFromUrl(url: URL): string {
  const pathname = url.pathname;
  const parts = pathname.split('/').filter(Boolean);

  // Remove language prefix
  if (parts[0] && parts[0] in translations) {
    parts.shift();
  }

  return '/' + parts.join('/');
}

export function getLocalizedUrl(url: URL, lang: Lang): string {
  const route = getRouteFromUrl(url);
  return `/${lang}${route === '/' ? '' : route}`;
}
