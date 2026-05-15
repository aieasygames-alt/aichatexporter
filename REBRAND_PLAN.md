# AI Chat Exporter — 品牌重塑 & 功能扩展规划

> 日期：2025-05-15
> 域名：`aichatexporter.cc`（不变更）
> GitHub：`github.com/nicepkg/aichatexporter`（不变更）

---

## 一、现状分析

### 1.1 产品全貌

| 产品形态 | 说明 |
|---------|------|
| Chrome/Edge 扩展 | 一键导出 ChatGPT、Claude、Gemini、Grok、DeepSeek 对话 |
| Desktop 应用 (Tauri) | 桌面端独立应用 |
| 在线工具网站 (Astro) | 20+ 免费、隐私优先、纯前端的在线工具 |

### 1.2 现有工具清单（20 个）

| 类别 | 工具 | URL slug |
|------|------|----------|
| 文档转换 | Doc to Markdown | `/doc-to-markdown` |
| 文档转换 | HTML to Markdown | `/html-to-markdown` |
| 文档转换 | Markdown to PDF | `/markdown-to-pdf` |
| 文本处理 | Text Case | `/text-case` |
| 文本处理 | URL & Base64 Encoder | `/url-encoder` |
| 文本处理 | CSV to JSON | `/csv-to-json` |
| 文本处理 | Markdown Table Generator | `/markdown-table` |
| 开发工具 | Code to PDF | `/code-to-pdf` |
| 开发工具 | Diff Checker | `/diff-checker` |
| 开发工具 | JSON to Markdown | `/json-to-markdown` |
| AI 对话导出 | ChatGPT Export | `/chatgpt-export` |
| AI 对话导出 | Claude Export | `/claude-export` |
| AI 对话导出 | Gemini Export | `/gemini-export` |
| AI 对话导出 | DeepSeek Export | `/deepseek-export` |
| 学习工具 | Exam Handwriting Eraser | `/exam-erase` |
| 学习工具 | Wrong Question Practice | `/wrong-question-practice` |
| 信息页面 | Features | `/features` |
| 信息页面 | How to Use | `/how-to-use` |
| 信息页面 | FAQ | `/faq` |
| 信息页面 | Download | `/download` |

### 1.3 现有问题

1. **品牌名与产品范围不匹配**：「AI Chat Exporter」仅体现对话导出功能，但网站已涵盖 20+ 工具
2. **Logo 过于通用**：当前 logo 是一个上传/导出图标，无法代表工具集的概念
3. **SEO 关键词集中于对话导出**：工具类页面（JSON、Diff、CSV 等）的 SEO 潜力未充分挖掘
4. **开发工具数量偏少**：仅 3 个，对于开发者用户群吸引力不足
5. **工具分类不够直观**：「Developer Tools」类别下工具太少

---

## 二、品牌重塑方案

### 2.1 品牌名称

**保持「AI Chat Exporter」作为扩展和核心产品名称**，但网站整体定位升级为：

> **AI Chat Exporter — Free Online Toolbox**

理由：
- 域名 `aichatexporter.cc` 不变，品牌名必须与域名呼应
- 扩展名在 Chrome Web Store 已有用户基础，不宜改名
- 通过副标题 "Free Online Toolbox" 传达更广泛的工具集定位

### 2.2 Slogan / Tagline

| 语言 | Slogan |
|------|--------|
| English | **Free Online Toolbox. Privacy First. Everything Local.** |
| 中文 | **免费在线工具箱 · 隐私优先 · 一切本地完成** |
| 日文 | **無料オンラインツールボックス · プライバシー第一 · すべてローカル処理** |
| 韩文 | **무료 온라인 툴박스 · 개인정보 보호 · 모든 처리는 로컬에서** |
| 西班牙语 | **Caja de herramientas en línea gratis. Privacidad primero. Todo local.** |
| 法语 | **Boîte à outils en ligne gratuite. Confidentialité d'abord. Tout en local.** |

### 2.3 Logo 设计方案

**设计理念**：工具箱 + AI 对话气泡 + 隐私盾牌

```
设计方案 — 多合一工具图标
╭────────────────╮
│                │
│   ╭──╮  ╭──╮  │    方形圆角底 (32×32)
│   │💬│  │🔧│  │    渐变背景：Indigo → Cyan
│   ╰──╯  ╰──╯  │    左侧：对话气泡 = AI Chat
│   ╭──╮  ╭──╮  │    右侧：扳手/齿轮 = 工具
│   │📄│  │🔒│  │    右下：盾牌/锁 = 隐私
│   ╰──╯  ╰──╯  │
│                │
╰────────────────╯
```

**配色方案**：

| 用途 | 色值 | 含义 |
|------|------|------|
| 主色 | `#6366F1` (Indigo-500) | 科技感、智慧 |
| 辅色 | `#06B6D4` (Cyan-500) | 轻量、清新 |
| 强调 | `#8B5CF6` (Violet-500) | AI、创新 |
| 成功 | `#10B981` (Emerald-500) | 安全、完成 |
| 深底 | `#0F172A` (Slate-900) | 暗色主题背景 |

**Logo 文件清单**：

| 文件 | 尺寸 | 用途 |
|------|------|------|
| `favicon.svg` | 32×32 | 浏览器标签页 |
| `icons/icon16.png` | 16×16 | 扩展图标 |
| `icons/icon48.png` | 48×48 | 扩展管理页 |
| `icons/icon128.png` | 128×128 | Chrome Web Store |
| `apple-touch-icon.png` | 180×180 | iOS 桌面快捷方式 |
| `og-image.png` | 1200×630 | 社交媒体分享 |

---

## 三、新增开发工具规划

### 3.1 工具选型原则

- **纯前端可实现**：不依赖后端服务（Crypto API、Canvas 等）
- **高频搜索需求**：有可观的 SEO 搜索量
- **与现有工具互补**：不重复已有功能
- **开发成本合理**：每个工具 1-3 天可完成

### 3.2 新增工具列表（8 个）

| # | 工具名 | URL slug | 分类 | 搜索热度 | 实现方案 | 说明 |
|---|--------|----------|------|---------|---------|------|
| 1 | **JSON Formatter** | `/json-formatter` | 开发工具 | ★★★★★ | 原生 JSON.parse + 高亮渲染 | 格式化、验证、高亮 JSON 数据。支持压缩/美化/树形视图 |
| 2 | **Regex Tester** | `/regex-tester` | 开发工具 | ★★★★★ | 原生 RegExp + 实时匹配 | 正则表达式测试，支持匹配高亮、分组捕获、常用正则模板 |
| 3 | **Color Picker** | `/color-picker` | 开发工具 | ★★★★☆ | Canvas + 原生转换 | 颜色选择器，HEX/RGB/HSL/CMYK 互转，色板收藏，对比度检查 |
| 4 | **Hash Generator** | `/hash-generator` | 开发工具 | ★★★★☆ | Web Crypto API | 生成 MD5/SHA-1/SHA-256/SHA-512 哈希值，支持文本和文件 |
| 5 | **Timestamp Converter** | `/timestamp-converter` | 开发工具 | ★★★★☆ | Date API | Unix 时间戳 ↔ 人类可读日期互转，支持多时区 |
| 6 | **JWT Decoder** | `/jwt-decoder` | 开发工具 | ★★★☆☆ | atob + JSON.parse | 解码和检查 JWT Token，显示 Header/Payload/Signature |
| 7 | **QR Code Generator** | `/qr-code-generator` | 开发工具 | ★★★★★ | qrcode.js 库 | 生成 QR 码，支持文本/URL/WiFi/vCard，自定义颜色和尺寸 |
| 8 | **Number Base Converter** | `/number-base-converter` | 开发工具 | ★★★☆☆ | parseInt/toString | 二进制/八进制/十进制/十六进制互转，支持自定义进制 |

### 3.3 工具详情

#### 1. JSON Formatter / Validator
- **功能**：格式化（美化/压缩）、语法验证、错误定位、树形视图
- **输入**：粘贴文本 或 上传 `.json` 文件
- **输出**：格式化 JSON + 语法树 + 复制/下载
- **技术**：`JSON.parse()` + 自定义高亮渲染
- **关键词 SEO**：json formatter, json validator, json beautifier, json prettifier

#### 2. Regex Tester
- **功能**：实时匹配高亮、分组捕获显示、常用正则模板库（邮箱/URL/手机号/IP 等）
- **输入**：正则表达式 + 测试字符串
- **输出**：匹配结果高亮 + 分组列表 + 匹配统计
- **技术**：`RegExp` + `String.match()` + `exec()`
- **关键词 SEO**：regex tester, regular expression tester, regex checker

#### 3. Color Picker & Converter
- **功能**：取色器、HEX/RGB/HSL 互转、颜色对比度检查 (WCAG)、CSS 代码复制
- **输入**：颜色值输入 或 色板选择
- **输出**：各格式色值 + 预览 + CSS 变量
- **技术**：`<input type="color">` + Canvas + 原生转换
- **关键词 SEO**：color picker, hex to rgb, color converter, color palette

#### 4. Hash Generator
- **功能**：支持 MD5/SHA-1/SHA-256/SHA-512，文本和文件哈希，一键复制
- **输入**：文本输入 或 文件拖拽
- **输出**：各算法哈希值
- **技术**：`crypto.subtle.digest()` (SHA 系列) + js-md5 库 (MD5)
- **关键词 SEO**：hash generator, sha256 generator, md5 hash, file hash checker

#### 5. Timestamp Converter
- **功能**：Unix 时间戳 ↔ 日期时间互转、多时区显示、相对时间计算
- **输入**：时间戳 或 日期选择器
- **输出**：多格式日期 + 各时区对应时间
- **技术**：`Intl.DateTimeFormat` + `Date` API
- **关键词 SEO**：timestamp converter, unix timestamp, epoch converter

#### 6. JWT Decoder
- **功能**：解码 JWT Token Header/Payload、语法高亮、过期时间检查、Token 结构验证
- **输入**：粘贴 JWT Token
- **输出**：Header JSON + Payload JSON + 签名 + 过期状态
- **技术**：`atob()` + `JSON.parse()`
- **关键词 SEO**：jwt decoder, jwt debugger, token decoder

#### 7. QR Code Generator
- **功能**：文本/URL 转 QR 码、WiFi 二维码、自定义前景/背景色、下载 PNG/SVG
- **输入**：文本/URL + 自定义参数
- **输出**：QR 码图片 + 下载
- **技术**：`qrcode-generator` 或 `qr-code-styling` 库
- **关键词 SEO**：qr code generator, free qr code, qr code maker

#### 8. Number Base Converter
- **功能**：二进制/八进制/十进制/十六进制互转、位运算可视化、补零设置
- **输入**：任意进制的数字
- **输出**：各进制表示
- **技术**：`parseInt()` + `Number.toString(radix)`
- **关键词 SEO**：number base converter, hex to decimal, binary converter

---

## 四、SEO 全面优化方案

### 4.1 关键词矩阵

| 优先级 | 关键词 (EN) | 月搜索量估算 | 目标页面 |
|--------|------------|-------------|---------|
| P0 | free online tools | 50K+ | 首页 |
| P0 | json formatter | 200K+ | `/json-formatter` (新增) |
| P0 | regex tester | 150K+ | `/regex-tester` (新增) |
| P0 | qr code generator | 500K+ | `/qr-code-generator` (新增) |
| P0 | pdf to markdown | 30K+ | `/doc-to-markdown` |
| P0 | diff checker | 100K+ | `/diff-checker` |
| P1 | color picker | 200K+ | `/color-picker` (新增) |
| P1 | hash generator | 50K+ | `/hash-generator` (新增) |
| P1 | timestamp converter | 100K+ | `/timestamp-converter` (新增) |
| P1 | csv to json | 80K+ | `/csv-to-json` |
| P1 | markdown to pdf | 100K+ | `/markdown-to-pdf` |
| P1 | url encoder | 80K+ | `/url-encoder` |
| P2 | jwt decoder | 50K+ | `/jwt-decoder` (新增) |
| P2 | chatgpt export | 20K+ | `/chatgpt-export` |
| P2 | number base converter | 20K+ | `/number-base-converter` (新增) |
| P2 | code to pdf | 10K+ | `/code-to-pdf` |

### 4.2 各页面 Meta 模板

#### 首页
```
Title:       Free Online Toolbox — 30+ Tools, Privacy First | AI Chat Exporter
Description: 30+ free browser-based tools: JSON formatter, regex tester, QR generator,
             document converter, diff checker, AI chat export and more. 100% local — your
             data never leaves your device.
Keywords:    free online tools, json formatter, regex tester, qr code generator,
             document converter, diff checker, privacy tools
```

#### 工具页（通用模板）
```
Title:       {Tool Name} — Free Online Tool | AI Chat Exporter
Description: {One-line description}. Free, no upload, works in your browser.
             Privacy-first — all processing happens locally.
```

#### 新增工具页 Meta

**JSON Formatter**
```
Title:       JSON Formatter & Validator — Free Online Tool | AI Chat Exporter
Description: Format, validate, and beautify JSON data instantly. Free online JSON
             formatter with syntax highlighting, error detection, and tree view.
             100% browser-based.
Keywords:    json formatter, json validator, json beautifier, json prettifier, json viewer
```

**Regex Tester**
```
Title:       Regex Tester — Test Regular Expressions Online | AI Chat Exporter
Description: Test regular expressions with real-time matching and highlight. Free online
             regex tester with capture groups, match counter, and common pattern library.
Keywords:    regex tester, regular expression tester, regex checker, regex online
```

**QR Code Generator**
```
Title:       QR Code Generator — Create Free QR Codes Online | AI Chat Exporter
Description: Generate QR codes from text, URL, or WiFi credentials. Free online QR code
             maker with custom colors, sizes, and instant download as PNG/SVG.
Keywords:    qr code generator, free qr code, create qr code, qr code maker
```

**Color Picker**
```
Title:       Color Picker & Converter — HEX RGB HSL | AI Chat Exporter
Description: Pick colors and convert between HEX, RGB, HSL, and CMYK formats. Free online
             color tool with contrast checker and CSS code export.
Keywords:    color picker, hex to rgb, color converter, hsl to hex, color palette
```

**Hash Generator**
```
Title:       Hash Generator — MD5 SHA-256 SHA-512 Online | AI Chat Exporter
Description: Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text or files. Free online
             hash generator. All processing happens locally in your browser.
Keywords:    hash generator, md5 hash, sha256 generator, file hash checker
```

**Timestamp Converter**
```
Title:       Timestamp Converter — Unix Epoch to Date | AI Chat Exporter
Description: Convert Unix timestamps to human-readable dates and vice versa. Supports
             multiple timezones and relative time calculation. Free online tool.
Keywords:    timestamp converter, unix timestamp, epoch converter, utc converter
```

**JWT Decoder**
```
Title:       JWT Decoder — Decode & Inspect JWT Tokens | AI Chat Exporter
Description: Decode and inspect JWT tokens to view header, payload, and expiration.
             Free online JWT debugger with syntax highlighting and validation.
Keywords:    jwt decoder, jwt debugger, token decoder, jwt inspector
```

**Number Base Converter**
```
Title:       Number Base Converter — Binary Hex Decimal | AI Chat Exporter
Description: Convert numbers between binary, octal, decimal, and hexadecimal. Free online
             base converter with custom radix support.
Keywords:    number base converter, hex to decimal, binary to decimal, base converter
```

### 4.3 技术性 SEO 优化

| 项目 | 当前状态 | 优化方案 |
|------|---------|---------|
| Schema.org | `SoftwareApplication` (单一) | 首页改为 `WebSite` + `ItemList`；工具页改为 `WebApplication` |
| sitemap | 已有 sitemap-index.xml | 新增工具页自动生成 |
| robots.txt | 已有 | 无需改动 |
| hreflang | 6 语言 (en, zh-CN, ja, ko, es, fr) | 新页面同步 6 语言 |
| 内链 | 工具页之间内链弱 | 每个工具页底部增加 **"Related Tools"** 模块（3-4 个相关工具） |
| 页面速度 | 基准待测 | 工具组件懒加载，关键 CSS 内联 |
| OG Image | 已有但需更新 | 重新设计，展示新 Logo + 工具集预览 |
| llms.txt | 已有 | 更新工具列表和描述 |

### 4.4 Schema.org 结构化数据更新

**首页**（替换现有 `SoftwareApplication`）：
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI Chat Exporter",
  "alternateName": "Free Online Toolbox",
  "url": "https://aichatexporter.cc",
  "description": "30+ free online tools...",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://aichatexporter.cc/en?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**工具页**（每个工具独立）：
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JSON Formatter & Validator",
  "url": "https://aichatexporter.cc/en/json-formatter",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

---

## 五、品牌统一更新清单

### 5.1 文件改动清单

| # | 改动项 | 文件/位置 | 改动内容 |
|---|--------|----------|---------|
| 1 | Slogan | `i18n/*.json` (6 文件) | `hero.title`, `hero.subtitle`, `site.*` |
| 2 | Logo | `favicon.svg` | 新设计 SVG 图标 |
| 3 | Logo (PNG) | `icons/icon*.png`, `apple-touch-icon.png` | 新 Logo 导出 |
| 4 | OG Image | `og-image.png` | 1200×630 新设计 |
| 5 | Navbar | `Navbar.astro` | Logo 图标 + 品牌文字 + 新工具菜单 |
| 6 | Footer | `Footer.astro` | Logo + 工具链接 + Slogan |
| 7 | Layout | `Layout.astro` | Schema.org + Meta 模板 |
| 8 | Navbar 工具分类 | `Navbar.astro` | 新增「Developer Tools」子菜单项 |
| 9 | Footer 工具链接 | `Footer.astro` | 添加新工具链接 |
| 10 | llms.txt | `public/llms.txt` | 更新品牌描述和工具列表 |
| 11 | manifest.json | `manifest.json` | `description` 字段更新 |
| 12 | i18n (EN) | `i18n/en.json` | 新增 `tools.jsonFormatter` 等键 + 更新 `site.*` |
| 13 | i18n (ZH) | `i18n/zh-CN.json` | 同上 |
| 14 | i18n (JA/KO/ES/FR) | `i18n/{ja,ko,es,fr}.json` | 同上 |

### 5.2 新增工具页文件清单

每个工具需要：

| 文件 | 路径 | 说明 |
|------|------|------|
| 页面 | `src/pages/[lang]/{slug}.astro` | Astro 页面，SEO meta + 布局 |
| 工具组件 | `src/components/tools/{ToolName}.astro` | 工具 UI 和逻辑 |
| i18n 键 | `src/i18n/*.json` (6 文件) | 每个工具约 30-40 个翻译键 |

---

## 六、实施计划

### Phase 1 — 品牌重塑（1-2 天）

- [ ] 设计新 Logo SVG（工具箱 + AI 气泡 + 隐私盾牌）
- [ ] 导出 PNG 图标（16/48/128/180px）
- [ ] 制作新 OG Image（1200×630）
- [ ] 更新 `i18n/*.json` 所有语言的 Slogan 和站点描述
- [ ] 更新 `Navbar.astro` 和 `Footer.astro` 的 Logo 和文案
- [ ] 更新 `Layout.astro` 的 Schema.org 和 Meta 模板
- [ ] 更新 `public/llms.txt`

### Phase 2 — 新增开发工具（5-8 天）

每个工具的标准开发流程：

1. 创建 Astro 页面 `src/pages/[lang]/{slug}.astro`
2. 创建工具组件 `src/components/tools/{ToolName}.astro`
3. 添加 i18n 翻译键（6 语言）
4. 更新 Navbar 工具菜单
5. 更新 Footer 工具链接
6. 添加 Schema.org `WebApplication` 结构化数据

推荐开发顺序（按 SEO 价值排序）：

1. **JSON Formatter** — 搜索量最高，开发者刚需
2. **Regex Tester** — 搜索量极高，实现简单
3. **QR Code Generator** — 搜索量最高，受众最广
4. **Timestamp Converter** — 实现简单，搜索量高
5. **Color Picker** — 视觉吸引力强
6. **Hash Generator** — 安全工具，互补性好
7. **JWT Decoder** — 开发者细分需求
8. **Number Base Converter** — 补充性工具

### Phase 3 — SEO 优化（2-3 天）

- [ ] 更新所有页面 Meta 标题和描述
- [ ] 为每个工具页添加 "Related Tools" 模块
- [ ] 首页 Schema.org 从 `SoftwareApplication` 改为 `WebSite` + `ItemList`
- [ ] 工具页 Schema.org 改为 `WebApplication`
- [ ] 生成更新后的 sitemap
- [ ] 检查所有页面的 canonical URL

### Phase 4 — 测试 & 上线（1-2 天）

- [ ] 6 语言所有页面渲染测试
- [ ] 所有新工具功能测试
- [ ] 移动端响应式测试
- [ ] Lighthouse SEO 评分 ≥ 95
- [ ] 部署上线

---

## 七、成功指标

| 指标 | 当前 | 目标（3 个月） |
|------|------|---------------|
| Google 收录页面数 | ~50 | 100+ |
| 工具总数 | 12 | 20 |
| 月自然搜索流量 | 基准 | +200% |
| Lighthouse SEO | 待测 | ≥ 95 |
| 6 语言覆盖率 | 100% | 100%（含新工具） |
