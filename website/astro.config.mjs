import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aichatexporter.cc',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          'zh-CN': 'zh-CN',
          ja: 'ja-JP',
          ko: 'ko-KR',
          es: 'es-ES',
          fr: 'fr-FR',
        },
      },
    }),
  ],
  // 不使用 Astro 内置 i18n，改用自定义重定向
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
