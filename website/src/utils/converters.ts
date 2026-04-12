export const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
export const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'xlsx'];

export function validateFile(name: string, size: number): { valid: boolean; error?: string } {
  if (size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Please select a file under 8MB.' };
  }
  const ext = name.split('.').pop()?.toLowerCase();
  if (!ext || !SUPPORTED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: 'Unsupported format. Please upload PDF, DOCX, PPTX, or XLSX.' };
  }
  return { valid: true };
}

export function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// XLSX → Markdown table
export function xlsxToMarkdown(fileName: string, sheets: { name: string; data: any[][] }[]): string {
  const parts: string[] = [];
  for (const sheet of sheets) {
    if (!sheet.data.length) continue;
    const h = sheet.data[0];
    let t = `## ${sheet.name}\n\n| ${h.map((v: any) => v ?? '').join(' | ')} |\n| ${h.map(() => '---').join(' | ')} |\n`;
    for (const row of sheet.data.slice(1)) {
      t += `| ${h.map((_ : any, ci: number) => row?.[ci] ?? '').join(' | ')} |\n`;
    }
    parts.push(t.trim());
  }
  return `# ${fileName}\n\n${parts.join('\n\n---\n\n')}`;
}

// PPTX XML text extraction (given parsed slide entries)
export function pptxSlidesToMarkdown(fileName: string, slides: { slideNum: number; texts: string[] }[]): string {
  const parts = slides.map(slide => {
    if (slide.texts.length === 0) return '';
    const title = slide.texts[0] || `Slide ${slide.slideNum}`;
    const body = slide.texts.slice(1).join('\n\n');
    return `## Slide ${slide.slideNum}: ${title}${body ? '\n\n' + body : ''}`;
  }).filter(Boolean);

  return `# ${fileName}\n\n${parts.join('\n\n---\n\n')}`;
}

// PDF pages to Markdown
export function pdfPagesToMarkdown(fileName: string, pages: { pageNum: number; text: string }[]): string {
  const parts = pages
    .filter(p => p.text.trim())
    .map(p => `## Page ${p.pageNum}\n\n${p.text}`);
  return `# ${fileName}\n\n${parts.join('\n\n---\n\n')}`;
}

// DOCX to Markdown (wraps mammoth output)
export function docxToMarkdown(fileName: string, content: string): string {
  return `# ${fileName}\n\n${content}`;
}
