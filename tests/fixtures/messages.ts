/**
 * AI Chat Exporter - Test Fixtures
 * 测试消息数据
 */

import type { ChatMessage } from '../../src/types';

/**
 * 基础测试消息
 */
export const basicMessages: ChatMessage[] = [
  { role: 'user', content: 'Hello, how are you?' },
  { role: 'assistant', content: 'I am doing well, thank you! How can I help you today?' },
  { role: 'user', content: 'What is 2 + 2?' },
  { role: 'assistant', content: '2 + 2 equals 4.' },
];

/**
 * 空消息
 */
export const emptyMessages: ChatMessage[] = [];

/**
 * 单条消息
 */
export const singleMessage: ChatMessage[] = [
  { role: 'user', content: 'Hello!' },
];

/**
 * 特殊字符测试消息 - 标点符号
 */
export const punctuationMessages: ChatMessage[] = [
  {
    role: 'user',
    content: '测试中文标点：，。！？、；（）【】《》',
  },
  {
    role: 'assistant',
    content: '英文标点: ,.!?;:\'()[]{}',
  },
  {
    role: 'user',
    content: '特殊引号测试 "smart quotes" and \'single quotes\'',
  },
  {
    role: 'assistant',
    content: '省略号测试...和-破折号-以及~波浪号~',
  },
];

/**
 * 特殊字符测试消息 - Unicode 和 Emoji
 */
export const unicodeMessages: ChatMessage[] = [
  {
    role: 'user',
    content: 'Emoji 测试: 😀🎉🚀❤️👍🤔🔥💯⭐🎯',
  },
  {
    role: 'assistant',
    content: '数学符号: ∑∏∫∂√∞≈≠≤≥±×÷',
  },
  {
    role: 'user',
    content: '货币符号: $€£¥₹₽₿',
  },
  {
    role: 'assistant',
    content: '其他符号: ©®™§¶†‡°′″‰※',
  },
];

/**
 * 特殊字符测试消息 - 代码相关
 */
export const codeMessages: ChatMessage[] = [
  {
    role: 'user',
    content: `代码块测试:
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);

function add(a, b) {
  return a + b;
}
\`\`\``,
  },
  {
    role: 'assistant',
    content: `\`\`\`python
def greet(name):
    return f"Hello, {name}!"

# Test
print(greet("World"))
\`\`\``,
  },
  {
    role: 'user',
    content: '行内代码测试: Use `npm install` to install and `npm run dev` to start.',
  },
  {
    role: 'assistant',
    content: `多语言代码:
\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`

\`\`\`json
{"name": "John", "age": 30}
\`\`\``,
  },
];

/**
 * 特殊字符测试消息 - Markdown 格式
 */
export const markdownMessages: ChatMessage[] = [
  {
    role: 'user',
    content: '# 标题测试\n## 二级标题\n### 三级标题',
  },
  {
    role: 'assistant',
    content: '**粗体** and *斜体* and ***粗斜体***\n\n~~删除线~~ and `代码`',
  },
  {
    role: 'user',
    content: '> 引用测试\n> 多行引用\n>\n> 嵌套引用',
  },
  {
    role: 'assistant',
    content: '列表测试:\n1. 第一项\n2. 第二项\n3. 第三项\n\n- 无序列表\n- 另一项\n  - 嵌套项',
  },
  {
    role: 'user',
    content: '| 表格 | 测试 |\n|------|------|\n| A1 | B1 |\n| A2 | B2 |',
  },
  {
    role: 'assistant',
    content: '[链接测试](https://example.com)\n\n![图片描述](https://example.com/image.png)',
  },
];

/**
 * 特殊字符测试消息 - 换行和空格
 */
export const whitespaceMessages: ChatMessage[] = [
  {
    role: 'user',
    content: '单行文本',
  },
  {
    role: 'assistant',
    content: '多行文本\n第二行\n第三行',
  },
  {
    role: 'user',
    content: '包含空行\n\n空行上面\n\n空行下面',
  },
  {
    role: 'assistant',
    content: '  前导空格  和  中间空格  和尾随空格  ',
  },
  {
    role: 'user',
    content: 'Tab\t测试\t\t双Tab',
  },
];

/**
 * 特殊字符测试消息 - 混合内容
 */
export const mixedContentMessages: ChatMessage[] = [
  {
    role: 'user',
    content: '混合测试: `代码` and **粗体** and 中文和English mix! 😀\n\n> 引用中的 `代码` 和 **粗体**',
  },
  {
    role: 'assistant',
    content: `复杂消息:

1. 列表中的 \`代码\`
2. **粗体** 和 *斜体*

\`\`\`
代码块中的中文和Emoji 🎉
\`\`\`

最后一段。`,
  },
];

/**
 * 边界情况测试消息
 */
export const edgeCaseMessages: ChatMessage[] = [
  {
    role: 'user',
    content: '',
  },
  {
    role: 'assistant',
    content: '   ',
  },
  {
    role: 'user',
    content: '\n\n\n',
  },
  {
    role: 'assistant',
    content: 'A'.repeat(1000), // 较长内容
  },
];

/**
 * 多语言测试消息
 */
export const multilingualMessages: ChatMessage[] = [
  {
    role: 'user',
    content: '中文测试：这是一段中文文本。',
  },
  {
    role: 'assistant',
    content: '日本語テスト：これは日本語のテキストです。',
  },
  {
    role: 'user',
    content: '한국어 테스트: 이것은 한국어 텍스트입니다.',
  },
  {
    role: 'assistant',
    content: 'Русский тест: Это текст на русском языке.',
  },
  {
    role: 'user',
    content: 'العربية اختبار: هذا نص باللغة العربية.',
  },
  {
    role: 'assistant',
    content: 'Mixed: Hello 世界 🌍 こんにちは 안녕하세요',
  },
];

/**
 * CSV 特殊字符测试消息
 */
export const csvSpecialMessages: ChatMessage[] = [
  {
    role: 'user',
    content: '包含逗号,的消息,测试',
  },
  {
    role: 'assistant',
    content: '包含"双引号"的消息',
  },
  {
    role: 'user',
    content: '包含\n换行符\n的消息',
  },
  {
    role: 'assistant',
    content: '混合,特殊"字符\n和换行',
  },
];

/**
 * 完整测试套件
 */
export const fullTestSuite = {
  basic: basicMessages,
  empty: emptyMessages,
  single: singleMessage,
  punctuation: punctuationMessages,
  unicode: unicodeMessages,
  code: codeMessages,
  markdown: markdownMessages,
  whitespace: whitespaceMessages,
  mixed: mixedContentMessages,
  edgeCases: edgeCaseMessages,
  multilingual: multilingualMessages,
  csvSpecial: csvSpecialMessages,
};

/**
 * 获取所有特殊字符测试消息
 */
export function getAllSpecialCharMessages(): ChatMessage[] {
  return [
    ...punctuationMessages,
    ...unicodeMessages,
    ...codeMessages,
    ...markdownMessages,
    ...whitespaceMessages,
    ...mixedContentMessages,
    ...csvSpecialMessages,
  ];
}
