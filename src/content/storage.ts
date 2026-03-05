/**
 * AI Chat Exporter - Settings Storage
 * 使用 chrome.storage.local 持久化用户设置
 */

import type { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'ai-chat-exporter-settings';

/** 设置变更监听器类型 */
type SettingsChangeListener = (settings: AppSettings) => void;

/** 设置存储模块 */
class SettingsStorage {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  private listeners: Set<SettingsChangeListener> = new Set();
  private initialized = false;

  /**
   * 初始化设置（从存储加载）
   */
  async init(): Promise<AppSettings> {
    if (this.initialized) {
      return this.settings;
    }

    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        // 合并存储的设置与默认值（处理新增设置项）
        this.settings = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };
      }
      this.initialized = true;
      console.log('AI Chat Exporter: Settings loaded', this.settings);
    } catch (error) {
      console.error('AI Chat Exporter: Failed to load settings', error);
      this.settings = { ...DEFAULT_SETTINGS };
      this.initialized = true;
    }

    // 监听存储变更
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[STORAGE_KEY]) {
        this.settings = { ...DEFAULT_SETTINGS, ...changes[STORAGE_KEY].newValue };
        this.notifyListeners();
      }
    });

    return this.settings;
  }

  /**
   * 获取当前设置
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * 获取单个设置项
   */
  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  /**
   * 更新设置
   */
  async update(settings: Partial<AppSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.save();
  }

  /**
   * 重置为默认设置
   */
  async reset(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS };
    await this.save();
  }

  /**
   * 保存设置到存储
   */
  private async save(): Promise<void> {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: this.settings });
      console.log('AI Chat Exporter: Settings saved', this.settings);
    } catch (error) {
      console.error('AI Chat Exporter: Failed to save settings', error);
      throw error;
    }
  }

  /**
   * 添加设置变更监听器
   */
  onChange(listener: SettingsChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.settings);
      } catch (error) {
        console.error('AI Chat Exporter: Settings listener error', error);
      }
    });
  }
}

// 单例实例
export const settingsStorage = new SettingsStorage();

// 便捷函数
export const getSettings = () => settingsStorage.getSettings();
export const updateSettings = (settings: Partial<AppSettings>) => settingsStorage.update(settings);
export const resetSettings = () => settingsStorage.reset();
export const onSettingsChange = (listener: SettingsChangeListener) => settingsStorage.onChange(listener);

// 导出类型
export type { SettingsChangeListener };
