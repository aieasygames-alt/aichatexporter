/**
 * Vitest 测试设置文件
 */

import { vi } from 'vitest';

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    lastError: null,
    getManifest: vi.fn(() => ({ version: '1.0.0' })),
  },
  downloads: {
    download: vi.fn(),
  },
  tabs: {
    sendMessage: vi.fn(),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

// 设置全局 chrome 对象
(globalThis as Record<string, unknown>).chrome = mockChrome;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

export { mockChrome };
