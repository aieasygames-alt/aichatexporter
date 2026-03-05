import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';

// Custom plugin to copy manifest and icons
function copyStaticAssets() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const distDir = 'dist';

      // Ensure dist directory exists
      if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest.json
      copyFileSync('manifest.json', `${distDir}/manifest.json`);

      // Copy icons directory
      const iconsDir = `${distDir}/icons`;
      if (!existsSync(iconsDir)) {
        mkdirSync(iconsDir, { recursive: true });
      }

      if (existsSync('icons')) {
        const icons = readdirSync('icons');
        for (const icon of icons) {
          const srcPath = `icons/${icon}`;
          if (statSync(srcPath).isFile()) {
            copyFileSync(srcPath, `${iconsDir}/${icon}`);
          }
        }
      }
    }
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      input: {
        // Background service worker
        'background/service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
        // Content scripts - common
        'content/i18n': resolve(__dirname, 'src/content/i18n.ts'),
        'content/common': resolve(__dirname, 'src/content/common.ts'),
        'content/injected-ui': resolve(__dirname, 'src/content/injected-ui.ts'),
        // Content scripts - platform parsers
        'content/chatgpt': resolve(__dirname, 'src/content/parsers/chatgpt.ts'),
        'content/claude': resolve(__dirname, 'src/content/parsers/claude.ts'),
        'content/gemini': resolve(__dirname, 'src/content/parsers/gemini.ts'),
        'content/grok': resolve(__dirname, 'src/content/parsers/grok.ts'),
        'content/deepseek': resolve(__dirname, 'src/content/parsers/deepseek.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [copyStaticAssets()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
