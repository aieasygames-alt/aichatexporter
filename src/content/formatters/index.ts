/**
 * AI Chat Exporter - Formatters Index
 * 导出所有格式化器并初始化注册表
 */

// 导出注册表
export { formatRegistry, registerFormat, getFormat, getFormats, formatMessages } from './registry';

// 导入并注册所有格式化器（副作用导入）
import './markdown';
import './json';
import './txt';
import './csv';
import './html';
import './pdf';

// 导出各个格式化器（供直接访问）
export { markdownFormatter } from './markdown';
export { jsonFormatter } from './json';
export { txtFormatter } from './txt';
export { csvFormatter } from './csv';
export { htmlFormatter } from './html';
export { pdfFormatter, generatePrintableHTML, openPrintDialog } from './pdf';
