/**
 * AI Chat Exporter - 页面内浮动弹窗
 * 在页面中间显示导出界面，支持多语言
 */

const FloatingPopup = {
  isOpen: false,
  overlay: null,
  popup: null,

  /**
   * 初始化浮动弹窗
   */
  init() {
    if (document.getElementById('ai-chat-exporter-overlay')) {
      return; // 已经初始化过了
    }

    // 创建样式
    this.injectStyles();

    // 创建遮罩层
    this.overlay = document.createElement('div');
    this.overlay.id = 'ai-chat-exporter-overlay';
    this.overlay.className = 'ace-overlay';
    this.overlay.onclick = () => this.close();

    // 创建弹窗容器
    this.popup = document.createElement('div');
    this.popup.id = 'ai-chat-exporter-popup';
    this.popup.className = 'ace-popup';
    this.popup.onclick = (e) => e.stopPropagation();

    // 获取 i18n 实例
    const i18n = window.I18n || {
      t: (k) => k,
      currentLang: 'en',
      getSupportedLanguages: () => [
        { code: 'en', name: 'English', flag: '🇺🇸' }
      ]
    };

    this.popup.innerHTML = `
      <div class="ace-header">
        <div class="ace-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="black"/>
            <rect x="5" y="4" width="4" height="4" rx="1" fill="#10A37F"/>
            <rect x="11" y="5" width="4" height="4" rx="1" fill="#8B5CF6"/>
            <rect x="14" y="10" width="4" height="4" rx="1" fill="#F97316"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
            <path d="M12 9 L12 14 M10 12 L12 14 L14 12" stroke="#1F2937" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span id="ace-title-text">${i18n.t('title')}</span>
        </div>
        <button class="ace-close" id="ace-close-btn" title="${i18n.t('close')}">×</button>
      </div>

      <div class="ace-body">
        <!-- 支持的平台 Logo -->
        <div class="ace-platform-logos">
          <img src="https://saveai.net/_next/static/media/claude.3a12900b.svg" alt="Claude" class="ace-platform-logo" data-platform="Claude" title="Claude">
          <img src="https://saveai.net/_next/static/media/gemini.3e268b2d.svg" alt="Gemini" class="ace-platform-logo" data-platform="Gemini" title="Gemini">
          <img src="https://saveai.net/_next/static/media/chatgpt.e37fb881.svg" alt="ChatGPT" class="ace-platform-logo" data-platform="ChatGPT" title="ChatGPT">
          <img src="https://saveai.net/_next/static/media/deepseek.573e9113.svg" alt="DeepSeek" class="ace-platform-logo" data-platform="DeepSeek" title="DeepSeek">
          <img src="https://saveai.net/_next/static/media/grok.58d2177e.svg" alt="Grok" class="ace-platform-logo" data-platform="Grok" title="Grok">
        </div>

        <div class="ace-status">
          <span class="ace-status-dot"></span>
          <span class="ace-status-text" id="ace-status-connected">${i18n.t('connected')}</span>
          <span class="ace-platform" id="ace-platform"></span>
        </div>

        <div class="ace-message-info" id="ace-message-info">
          <span id="ace-message-count">0 ${i18n.t('messagesFound', {count: 0})}</span>
        </div>

        <div class="ace-export-section">
          <h3 id="ace-export-format-title">${i18n.t('exportFormat')}</h3>
          <div class="ace-buttons ace-buttons-row">
            <button class="ace-btn" id="ace-export-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Markdown
            </button>
            <button class="ace-btn" id="ace-export-json">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              JSON
            </button>
            <button class="ace-btn" id="ace-export-txt">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              TXT
            </button>
            <button class="ace-btn" id="ace-export-csv">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
              </svg>
              CSV
            </button>
          </div>
          <div class="ace-buttons ace-buttons-row">
            <button class="ace-btn ace-btn-image" id="ace-export-image">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span id="ace-image-btn-text">${i18n.t('exportAsImage')}</span>
            </button>
          </div>
        </div>

        <div class="ace-status-message" id="ace-status-message"></div>

        <!-- 语言选择器 -->
        <div class="ace-language-selector">
          <label id="ace-language-label">${i18n.t('language')}:</label>
          <select id="ace-language-select">
            ${i18n.getSupportedLanguages().map(lang =>
              `<option value="${lang.code}" ${i18n.currentLang === lang.code ? 'selected' : ''}>${lang.flag} ${lang.name}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div class="ace-footer">
        <span>v1.0.0</span>
      </div>
    `;

    this.overlay.appendChild(this.popup);
    document.body.appendChild(this.overlay);

    // 使用 addEventListener 绑定事件（更可靠）
    this.bindEvents();

    // 更新平台信息
    this.updatePlatformInfo();
  },

  /**
   * 绑定按钮事件
   */
  bindEvents() {
    // 关闭按钮
    const closeBtn = document.getElementById('ace-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // 导出按钮
    const mdBtn = document.getElementById('ace-export-md');
    if (mdBtn) {
      mdBtn.addEventListener('click', () => this.export('markdown'));
    }

    const jsonBtn = document.getElementById('ace-export-json');
    if (jsonBtn) {
      jsonBtn.addEventListener('click', () => this.export('json'));
    }

    const txtBtn = document.getElementById('ace-export-txt');
    if (txtBtn) {
      txtBtn.addEventListener('click', () => this.export('txt'));
    }

    const csvBtn = document.getElementById('ace-export-csv');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => this.export('csv'));
    }

    const imageBtn = document.getElementById('ace-export-image');
    if (imageBtn) {
      imageBtn.addEventListener('click', () => this.exportAsImage());
    }

    // 语言选择器
    const langSelect = document.getElementById('ace-language-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
    }

    // 平台 Logo 点击事件
    document.querySelectorAll('.ace-platform-logo').forEach(logo => {
      logo.addEventListener('click', () => {
        const platform = logo.getAttribute('data-platform');
        const urls = {
          'Claude': 'https://claude.ai',
          'Gemini': 'https://gemini.google.com',
          'ChatGPT': 'https://chatgpt.com',
          'DeepSeek': 'https://chat.deepseek.com',
          'Grok': 'https://grok.com'
        };
        if (urls[platform]) {
          window.open(urls[platform], '_blank');
        }
      });
    });
  },

  /**
   * 注入样式
   */
  injectStyles() {
    if (document.getElementById('ai-chat-exporter-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'ai-chat-exporter-styles';
    style.textContent = `
      .ace-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .ace-overlay.open {
        display: flex;
      }

      .ace-popup {
        background: #1a1a1a;
        border-radius: 16px;
        width: 360px;
        max-width: 90vw;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        animation: ace-pop-in 0.2s ease-out;
      }

      @keyframes ace-pop-in {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }

      .ace-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #333;
      }

      .ace-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fff;
        font-weight: 600;
        font-size: 15px;
      }

      .ace-close {
        background: none;
        border: none;
        color: #888;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
      }

      .ace-close:hover { color: #fff; }

      .ace-body { padding: 20px; }

      .ace-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 14px;
      }

      .ace-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
      }

      .ace-status-text { color: #888; }

      .ace-platform {
        color: #fff;
        font-weight: 500;
        margin-left: auto;
      }

      .ace-platform-logos {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 12px;
      }

      .ace-platform-logo {
        width: 36px;
        height: 36px;
        padding: 12px;
        opacity: 0.7;
        border-radius: 12px;
        cursor: pointer;
        transition: opacity 0.2s, background 0.2s;
      }

      .ace-platform-logo:hover {
        opacity: 1;
        background: rgba(59, 130, 246, 0.3);
      }

      .ace-platform-logo.active {
        opacity: 1;
      }

      .ace-message-info {
        background: #252525;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 20px;
        font-size: 13px;
        color: #888;
      }

      .ace-export-section h3 {
        color: #888;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
      }

      .ace-buttons {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
      }

      .ace-buttons-row { margin-bottom: 0; }
      .ace-buttons-row:last-child { margin-top: 10px; }

      .ace-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 14px 10px;
        background: #252525;
        border: 1px solid #333;
        border-radius: 12px;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .ace-btn:hover { background: #333; border-color: #444; }
      .ace-btn:active { transform: scale(0.98); }
      .ace-btn:disabled { opacity: 0.5; cursor: not-allowed; }

      .ace-btn-image {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d1e5f 100%);
        border-color: #3b82f6;
      }
      .ace-btn-image:hover { background: linear-gradient(135deg, #2d4a6f 0%, #3d2e6f 100%); }

      .ace-status-message {
        margin-top: 16px;
        padding: 12px;
        border-radius: 8px;
        font-size: 13px;
        display: none;
      }

      .ace-status-message.show { display: block; }
      .ace-status-message.success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
      .ace-status-message.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
      .ace-status-message.info { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }

      .ace-language-selector {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #333;
      }

      .ace-language-selector label {
        color: #888;
        font-size: 12px;
      }

      .ace-language-selector select {
        flex: 1;
        padding: 8px 12px;
        background: #252525;
        border: 1px solid #333;
        border-radius: 8px;
        color: #fff;
        font-size: 13px;
        cursor: pointer;
      }

      .ace-language-selector select:hover { border-color: #444; }

      .ace-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-top: 1px solid #333;
        font-size: 11px;
        color: #666;
      }
    `;

    document.head.appendChild(style);
  },

  /**
   * 更新平台信息
   */
  updatePlatformInfo() {
    const platformEl = document.getElementById('ace-platform');
    const messageInfoEl = document.getElementById('ace-message-info');
    const messageCountEl = document.getElementById('ace-message-count');

    let currentPlatform = 'Unknown';
    if (typeof ChatExporter !== 'undefined') {
      currentPlatform = ChatExporter.currentPlatform || 'Unknown';
      if (platformEl) {
        platformEl.textContent = currentPlatform;
      }
    }

    // 高亮当前平台的 logo
    document.querySelectorAll('.ace-platform-logo').forEach(logo => {
      const logoPlatform = logo.getAttribute('data-platform');
      if (logoPlatform === currentPlatform) {
        logo.classList.add('active');
      } else {
        logo.classList.remove('active');
      }
    });

    // 获取消息数量
    if (typeof ChatExporter !== 'undefined' && ChatExporter.parser) {
      const result = ChatExporter.extractConversation();
      if (result.success && result.data) {
        const count = result.data.messages.length;
        const i18n = window.I18n || { t: (k, r) => `${r.count} messages` };
        messageCountEl.textContent = i18n.t('messagesFound', { count });
        messageInfoEl.style.display = 'block';
      } else {
        messageInfoEl.style.display = 'none';
      }
    }
  },

  /**
   * 切换语言
   */
  changeLanguage(lang) {
    const i18n = window.I18n;
    if (i18n && i18n.setLanguage(lang)) {
      // 更新 UI 文本
      this.updateUIText();
    }
  },

  /**
   * 更新 UI 文本
   */
  updateUIText() {
    const i18n = window.I18n || { t: (k) => k };

    // 更新各个文本元素
    const titleEl = document.getElementById('ace-title-text');
    if (titleEl) titleEl.textContent = i18n.t('title');

    const connectedEl = document.getElementById('ace-status-connected');
    if (connectedEl) connectedEl.textContent = i18n.t('connected');

    const formatTitleEl = document.getElementById('ace-export-format-title');
    if (formatTitleEl) formatTitleEl.textContent = i18n.t('exportFormat');

    const imageBtnTextEl = document.getElementById('ace-image-btn-text');
    if (imageBtnTextEl) imageBtnTextEl.textContent = i18n.t('exportAsImage');

    const langLabelEl = document.getElementById('ace-language-label');
    if (langLabelEl) langLabelEl.textContent = i18n.t('language');

    const platformsEl = document.getElementById('ace-supported-platforms');
    if (platformsEl) platformsEl.textContent = i18n.t('supportedPlatforms');

    const closeBtn = document.getElementById('ace-close-btn');
    if (closeBtn) closeBtn.title = i18n.t('close');

    // 更新消息计数
    this.updatePlatformInfo();
  },

  /**
   * 打开弹窗
   */
  open() {
    if (!this.overlay) {
      this.init();
    }
    this.overlay.classList.add('open');
    this.isOpen = true;
    this.updatePlatformInfo();
  },

  /**
   * 关闭弹窗
   */
  close() {
    if (this.overlay) {
      this.overlay.classList.remove('open');
    }
    this.isOpen = false;
  },

  /**
   * 切换弹窗
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  /**
   * 显示状态消息
   */
  showMessage(message, type = 'info') {
    const messageEl = document.getElementById('ace-status-message');
    if (messageEl) {
      messageEl.textContent = message;
      messageEl.className = `ace-status-message show ${type}`;

      if (type === 'success') {
        setTimeout(() => {
          messageEl.classList.remove('show');
        }, 3000);
      }
    }
  },

  /**
   * 获取翻译
   */
  t(key, replacements = {}) {
    const i18n = window.I18n || { t: (k) => k };
    return i18n.t(key, replacements);
  },

  /**
   * 导出（文本格式）
   */
  export(format) {
    if (typeof ChatExporter === 'undefined') {
      this.showMessage(this.t('notAvailable'), 'error');
      return;
    }

    this.showMessage(this.t('exporting'), 'info');

    // 禁用按钮
    document.querySelectorAll('.ace-btn').forEach(btn => btn.disabled = true);

    const result = ChatExporter.export(format);

    if (result.success && result.data) {
      // 发送到 background 进行下载
      chrome.runtime.sendMessage({
        action: 'download',
        data: result.data
      }, (response) => {
        if (response && response.success) {
          this.showMessage(this.t('exportedSuccess', { format: format.toUpperCase() }), 'success');
        } else {
          this.showMessage(response?.error || this.t('downloadFailed'), 'error');
        }
        // 启用按钮
        document.querySelectorAll('.ace-btn').forEach(btn => btn.disabled = false);
      });
    } else {
      this.showMessage(result.error || this.t('exportFailed'), 'error');
      // 启用按钮
      document.querySelectorAll('.ace-btn').forEach(btn => btn.disabled = false);
    }
  },

  /**
   * 导出为图片
   */
  async exportAsImage() {
    if (typeof ChatExporter === 'undefined') {
      this.showMessage(this.t('notAvailable'), 'error');
      return;
    }

    const result = ChatExporter.extractConversation();
    if (!result.success) {
      this.showMessage(result.error || this.t('noMessages'), 'error');
      return;
    }

    this.showMessage(this.t('generatingImage'), 'info');
    document.querySelectorAll('.ace-btn').forEach(btn => btn.disabled = true);

    try {
      const { messages, title, platform } = result.data;

      // 创建临时渲染容器
      const container = this.createImageContainer(messages, title, platform);
      document.body.appendChild(container);

      // 等待字体加载
      await new Promise(resolve => setTimeout(resolve, 100));

      // 渲染到 Canvas
      const dataUrl = await this.renderToCanvas(container);

      // 移除临时容器
      document.body.removeChild(container);

      // 下载图片
      const filename = `${ChatExporter.sanitizeFilename(title)}.png`;
      chrome.runtime.sendMessage({
        action: 'download',
        data: {
          content: dataUrl,
          filename: filename,
          mimeType: 'image/png',
          isDataUrl: true
        }
      }, (response) => {
        if (response && response.success) {
          this.showMessage(this.t('exportedSuccess', { format: 'PNG' }), 'success');
        } else {
          this.showMessage(response?.error || this.t('downloadFailed'), 'error');
        }
        document.querySelectorAll('.ace-btn').forEach(btn => btn.disabled = false);
      });

    } catch (error) {
      console.error('Image export error:', error);
      this.showMessage(this.t('exportFailed') + ': ' + error.message, 'error');
      document.querySelectorAll('.ace-btn').forEach(btn => btn.disabled = false);
    }
  },

  /**
   * 创建图片渲染容器 - 使用数据属性存储信息
   */
  createImageContainer(messages, title, platform) {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 600px;
      background: #1a1a1a;
      padding: 30px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #fff;
    `;

    const i18n = window.I18n || { t: (k) => k };

    // 标题
    const header = document.createElement('div');
    header.className = 'ace-image-header';
    header.innerHTML = `
      <div class="ace-image-title" style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">${this.escapeHtml(title)}</div>
      <div class="ace-image-meta" style="font-size: 12px; color: #888;">${platform} • ${new Date().toLocaleString()}</div>
    `;
    container.appendChild(header);

    // 消息容器
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'ace-image-messages';

    // 消息
    messages.forEach(msg => {
      const msgEl = document.createElement('div');
      msgEl.className = 'ace-image-message';
      msgEl.dataset.role = msg.role;
      msgEl.style.cssText = `
        margin-bottom: 20px;
        padding: 16px;
        background: ${msg.role === 'user' ? '#2a3950' : '#252525'};
        border-radius: 12px;
        border-left: 3px solid ${msg.role === 'user' ? '#3b82f6' : '#10b981'};
      `;

      const roleLabel = msg.role === 'user'
        ? `👤 ${i18n.t('you')}`
        : `🤖 ${i18n.t('ai')}`;
      // 清理 LaTeX 符号用于图片显示
      const cleanContent = this.cleanLatex(msg.content);
      msgEl.innerHTML = `
        <div style="font-size: 12px; color: #888; margin-bottom: 8px; font-weight: 500;">${roleLabel}</div>
        <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(cleanContent)}</div>
      `;
      // 存储清理后的纯文本内容（用于 Canvas 绘制）
      msgEl.textContent = cleanContent;
      messagesContainer.appendChild(msgEl);
    });
    container.appendChild(messagesContainer);

    // 页脚
    const footer = document.createElement('div');
    footer.className = 'ace-image-footer';
    footer.style.cssText = `
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #333;
      text-align: center;
      font-size: 11px;
      color: #666;
    `;
    footer.textContent = i18n.t('exportedBy');
    container.appendChild(footer);

    return container;
  },

  /**
   * 渲染到 Canvas - 使用纯 Canvas 绘制，避免安全错误
   */
  async renderToCanvas(container) {
    const scale = 2;
    const width = 600;
    const padding = 30;
    const lineHeight = 22;
    const messagePadding = 16;
    const messageGap = 20;

    // 从 container 获取数据
    const titleEl = container.querySelector('.ace-image-title');
    const metaEl = container.querySelector('.ace-image-meta');
    const messageEls = container.querySelectorAll('.ace-image-message');
    const footerEl = container.querySelector('.ace-image-footer');

    // 第一步：计算总高度
    let totalHeight = padding;

    // 标题区域高度
    totalHeight += 35; // 标题
    if (metaEl) totalHeight += 25; // 元信息
    totalHeight += 25; // 分隔线

    // 计算每条消息的高度
    const messageHeights = [];
    const contentWidth = width - padding * 2 - messagePadding * 2;

    messageEls.forEach((msgEl) => {
      const content = msgEl.textContent;
      const lines = this.getLinesForCalc(content, contentWidth, 14);
      const msgHeight = Math.max(lines.length * lineHeight + 45, 60);
      messageHeights.push(msgHeight);
      totalHeight += msgHeight + messageGap;
    });

    // 页脚高度 + 底部额外边距
    totalHeight += 35 + 25 + 20; // 增加20px底部边距

    const height = Math.max(totalHeight + padding, 400);

    // 第二步：创建 Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(scale, scale);

    // 背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    let currentY = padding;

    // 绘制标题
    if (titleEl) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(this.truncateText(ctx, titleEl.textContent, width - padding * 2), padding, currentY + 20);
      currentY += 35;

      // 绘制元信息
      if (metaEl) {
        ctx.fillStyle = '#888888';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(metaEl.textContent, padding, currentY);
        currentY += 25;
      }

      // 分隔线
      ctx.strokeStyle = '#333333';
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(width - padding, currentY);
      ctx.stroke();
      currentY += 25;
    }

    // 绘制消息
    messageEls.forEach((msgEl, index) => {
      const isUser = msgEl.dataset.role === 'user';
      const content = msgEl.textContent;
      const i18n = window.I18n || { t: (k) => k === 'you' ? 'You' : 'AI' };
      const roleLabel = isUser ? `👤 ${i18n.t('you')}` : `🤖 ${i18n.t('ai')}`;

      const msgHeight = messageHeights[index];
      const msgY = currentY;

      // 消息背景
      ctx.fillStyle = isUser ? '#2a3950' : '#252525';
      this.roundRect(ctx, padding, msgY, width - padding * 2, msgHeight, 12);

      // 左边框
      ctx.fillStyle = isUser ? '#3b82f6' : '#10b981';
      ctx.fillRect(padding, msgY, 3, msgHeight);

      // 角色标签
      ctx.fillStyle = '#888888';
      ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(roleLabel, padding + messagePadding, msgY + 20);

      // 消息内容
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      this.wrapText(ctx, content, padding + messagePadding, msgY + 42, contentWidth, lineHeight);

      currentY += msgHeight + messageGap;
    });

    // 页脚
    if (footerEl) {
      currentY += 10;
      ctx.strokeStyle = '#333333';
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(width - padding, currentY);
      ctx.stroke();
      currentY += 25;

      ctx.fillStyle = '#666666';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(footerEl.textContent, width / 2, currentY);
      currentY += 20; // 底部额外边距
    }

    return canvas.toDataURL('image/png');
  },

  /**
   * 计算文本行数（用于高度计算）
   * 忽略空行，减少段落间距
   */
  getLinesForCalc(text, maxWidth, fontSize) {
    const lines = [];
    const paragraphs = text.split('\n');

    // 估算字符宽度（中英文混合）
    const avgCharWidth = fontSize * 0.6;

    paragraphs.forEach(paragraph => {
      // 跳过空行，不添加到行数计算中
      if (paragraph.trim() === '') {
        return;
      }

      let currentLine = '';
      let currentWidth = 0;

      for (let i = 0; i < paragraph.length; i++) {
        const char = paragraph[i];
        const charWidth = char.charCodeAt(0) > 127 ? fontSize : avgCharWidth;

        if (currentWidth + charWidth > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = char;
          currentWidth = charWidth;
        } else {
          currentLine += char;
          currentWidth += charWidth;
        }
      }
      if (currentLine) lines.push(currentLine);
    });

    return lines.length > 0 ? lines : [''];
  },

  /**
   * 绘制圆角矩形
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  },

  /**
   * 截断文本
   */
  truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  },

  /**
   * 计算消息高度
   */
  calculateMessageHeight(ctx, text, maxWidth, lineHeight) {
    const lines = this.getLines(ctx, text, maxWidth);
    return lines.length * lineHeight;
  },

  /**
   * 获取文本行（跳过空行，减少段落间距）
   */
  getLines(ctx, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split('\n');

    paragraphs.forEach(paragraph => {
      // 跳过空行
      if (paragraph.trim() === '') {
        return;
      }

      let line = '';
      const words = paragraph.split('');

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i];
        if (ctx.measureText(testLine).width > maxWidth && line !== '') {
          lines.push(line);
          line = words[i];
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);
    });

    return lines;
  },

  /**
   * 绘制自动换行文本
   */
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = this.getLines(ctx, text, maxWidth);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight);
    });
  },

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 清理 LaTeX 符号（用于图片导出）
   */
  cleanLatex(text) {
    if (!text) return text;
    let cleaned = text;

    // 移除 $...$ 包裹的内容中的 $ 符号（简单的行内公式）
    cleaned = cleaned.replace(/\$([^$]+)\$/g, '$1');

    // 移除孤立的 $ 符号（前后是空格或数字的情况）
    cleaned = cleaned.replace(/\s\$\s/g, ' ');
    cleaned = cleaned.replace(/(\d)\$/g, '$1');
    cleaned = cleaned.replace(/\$(\d)/g, '$1');

    // 将 • 替换为 - （更通用的列表符号，确保在所有字体下都能显示）
    cleaned = cleaned.replace(/•/g, '-');

    return cleaned;
  }
};

// 将 FloatingPopup 暴露到全局
window.FloatingPopup = FloatingPopup;

console.log('AI Chat Exporter: Floating popup initialized');
