/**
 * AI Chat Exporter - DOM Mock Templates
 * 用于解析器测试的 DOM 模拟模板
 */

/**
 * ChatGPT 消息 DOM 模板
 */
export const chatgptDOM = `
<div data-testid="conversation">
  <article data-testid="conversation-turn" class="user-message">
    <div class="text-base">
      <div class="font-user">Hello with "quotes" and 'apostrophes'</div>
    </div>
  </article>
  <article data-testid="conversation-turn" class="assistant-message">
    <div class="text-base">
      <div class="markdown prose">
        <p>I can help with that!</p>
        <pre><code>const x = 1;
console.log(x);</code></pre>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <ol>
          <li>First</li>
          <li>Second</li>
        </ol>
        <blockquote>
          <p>This is a quote</p>
        </blockquote>
      </div>
    </div>
  </article>
  <article data-testid="conversation-turn" class="user-message">
    <div class="text-base">
      <div class="font-user">测试中文内容 😀</div>
    </div>
  </article>
  <article data-testid="conversation-turn" class="assistant-message">
    <div class="text-base">
      <div class="markdown prose">
        <h3>标题测试</h3>
        <p>代码块测试:</p>
        <pre><code class="language-javascript">const greeting = "Hello";
console.log(greeting);</code></pre>
        <p>行内代码: <code>npm install</code></p>
      </div>
    </div>
  </article>
</div>
`;

/**
 * ChatGPT 空消息 DOM 模板
 */
export const chatgptEmptyDOM = `
<div data-testid="conversation">
</div>
`;

/**
 * ChatGPT 单条消息 DOM 模板
 */
export const chatgptSingleDOM = `
<div data-testid="conversation">
  <article data-testid="conversation-turn" class="user-message">
    <div class="text-base">
      <div class="font-user">Single message</div>
    </div>
  </article>
</div>
`;

/**
 * Claude 消息 DOM 模板
 */
export const claudeDOM = `
<div class="flex flex-col">
  <div class="font-user">
    <div class="prose">
      <p>Hello from Claude test</p>
    </div>
  </div>
  <div class="font-claude">
    <div class="prose">
      <p>Claude response with <strong>bold</strong> and <em>italic</em></p>
      <pre><code>def hello():
    print("Hello")</code></pre>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
    </div>
  </div>
  <div class="font-user">
    <div class="prose">
      <p>中文测试 😀🎉</p>
    </div>
  </div>
  <div class="font-claude">
    <div class="prose">
      <p>Special characters: "quotes" and 'apostrophes'</p>
      <blockquote>A quote from Claude</blockquote>
    </div>
  </div>
</div>
`;

/**
 * Gemini 消息 DOM 模板
 */
export const geminiDOM = `
<div class="chat-container">
  <user-query>
    <div class="user-query-bubble-with-background">
      <p>Hello Gemini with "quotes"</p>
    </div>
  </user-query>
  <model-response>
    <div class="model-response-text">
      <p>Gemini response with special characters: 😀🎉</p>
      <pre><code>console.log("Hello");</code></pre>
    </div>
  </model-response>
  <user-query>
    <div class="user-query-bubble-with-background">
      <p>中文测试内容</p>
    </div>
  </user-query>
  <model-response>
    <div class="model-response-text">
      <p>Another response</p>
    </div>
  </model-response>
</div>
`;

/**
 * DeepSeek 消息 DOM 模板
 */
export const deepseekDOM = `
<div class="dad65929">
  <div class="_9663006">
    <div class="_4f9bf79">
      <p>Hello DeepSeek "with quotes"</p>
    </div>
  </div>
  <div class="_9663006 _assistant">
    <div class="_4f9bf79">
      <p>DeepSeek response with 😀 emoji</p>
      <pre><code>const x = 1;</code></pre>
    </div>
  </div>
  <div class="_9663006">
    <div class="_4f9bf79">
      <p>中文内容测试</p>
    </div>
  </div>
  <div class="_9663006 _assistant">
    <div class="_4f9bf79">
      <p>Special: 'quotes' and "double quotes"</p>
    </div>
  </div>
</div>
`;

/**
 * Grok 消息 DOM 模板
 */
export const grokDOM = `
<div class="grok-chat-container">
  <div class="message user-message">
    <div class="message-content">
      <p>Hello Grok with "quotes"</p>
    </div>
  </div>
  <div class="message assistant-message">
    <div class="message-content">
      <p>Grok response with emoji 😀</p>
    </div>
  </div>
  <div class="message user-message">
    <div class="message-content">
      <p>中文测试</p>
    </div>
  </div>
  <div class="message assistant-message">
    <div class="message-content">
      <p>Another response with special chars: 'quotes'</p>
    </div>
  </div>
</div>
`;

/**
 * 创建 DOM 元素的辅助函数
 */
export function createDOMElement(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild as HTMLElement;
}

/**
 * 创建 DocumentFragment 的辅助函数
 */
export function createDocumentFragment(html: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

/**
 * 所有平台 DOM 模板
 */
export const platformDOMs = {
  chatgpt: {
    full: chatgptDOM,
    empty: chatgptEmptyDOM,
    single: chatgptSingleDOM,
  },
  claude: {
    full: claudeDOM,
    empty: '<div class="flex flex-col"></div>',
    single: `<div class="flex flex-col"><div class="font-user"><p>Single</p></div></div>`,
  },
  gemini: {
    full: geminiDOM,
    empty: '<div class="chat-container"></div>',
    single: `<div class="chat-container"><user-query><p>Single</p></user-query></div>`,
  },
  deepseek: {
    full: deepseekDOM,
    empty: '<div class="dad65929"></div>',
    single: `<div class="dad65929"><div class="_9663006"><p>Single</p></div></div>`,
  },
  grok: {
    full: grokDOM,
    empty: '<div class="grok-chat-container"></div>',
    single: `<div class="grok-chat-container"><div class="message user-message"><p>Single</p></div></div>`,
  },
};
