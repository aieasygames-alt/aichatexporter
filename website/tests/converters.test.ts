import { describe, it, expect } from 'vitest';
import {
  validateFile,
  getExtension,
  xlsxToMarkdown,
  pptxSlidesToMarkdown,
  pdfPagesToMarkdown,
  docxToMarkdown,
  MAX_FILE_SIZE,
} from '../src/utils/converters';

describe('validateFile', () => {
  it('should accept valid PDF file under size limit', () => {
    expect(validateFile('report.pdf', 1024)).toEqual({ valid: true });
  });

  it('should accept valid DOCX file under size limit', () => {
    expect(validateFile('document.docx', 5 * 1024 * 1024)).toEqual({ valid: true });
  });

  it('should accept valid PPTX file under size limit', () => {
    expect(validateFile('slides.pptx', 7 * 1024 * 1024)).toEqual({ valid: true });
  });

  it('should accept valid XLSX file under size limit', () => {
    expect(validateFile('data.xlsx', 8 * 1024 * 1024)).toEqual({ valid: true });
  });

  it('should reject file exceeding 8MB', () => {
    const result = validateFile('big.pdf', MAX_FILE_SIZE + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('8MB');
  });

  it('should reject unsupported file format', () => {
    const result = validateFile('image.png', 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported format');
  });

  it('should reject file with no extension', () => {
    const result = validateFile('noext', 1024);
    expect(result.valid).toBe(false);
  });

  it('should accept uppercase extensions', () => {
    expect(validateFile('report.PDF', 1024)).toEqual({ valid: true });
  });

  it('should accept exactly 8MB file', () => {
    expect(validateFile('file.pdf', MAX_FILE_SIZE)).toEqual({ valid: true });
  });
});

describe('getExtension', () => {
  it('should extract lowercase extension', () => {
    expect(getExtension('report.PDF')).toBe('pdf');
  });

  it('should handle normal filename', () => {
    expect(getExtension('data.xlsx')).toBe('xlsx');
  });

  it('should return the string itself when no extension', () => {
    expect(getExtension('noext')).toBe('noext');
  });
});

describe('xlsxToMarkdown', () => {
  it('should convert a single sheet to Markdown table', () => {
    const result = xlsxToMarkdown('data.xlsx', [
      {
        name: 'Sheet1',
        data: [
          ['Name', 'Age', 'City'],
          ['Alice', 30, 'NYC'],
          ['Bob', 25, 'LA'],
        ],
      },
    ]);
    expect(result).toContain('# data.xlsx');
    expect(result).toContain('## Sheet1');
    expect(result).toContain('| Name | Age | City |');
    expect(result).toContain('| --- | --- | --- |');
    expect(result).toContain('| Alice | 30 | NYC |');
    expect(result).toContain('| Bob | 25 | LA |');
  });

  it('should handle multiple sheets separated by ---', () => {
    const result = xlsxToMarkdown('data.xlsx', [
      { name: 'Sheet1', data: [['A', 'B'], ['1', '2']] },
      { name: 'Sheet2', data: [['X', 'Y'], ['3', '4']] },
    ]);
    expect(result).toContain('## Sheet1');
    expect(result).toContain('## Sheet2');
    expect(result).toContain('---');
  });

  it('should handle empty cells', () => {
    const result = xlsxToMarkdown('data.xlsx', [
      {
        name: 'Sheet1',
        data: [['A', 'B'], ['1', undefined as any]],
      },
    ]);
    expect(result).toContain('| 1 |  |');
  });

  it('should skip empty sheets', () => {
    const result = xlsxToMarkdown('data.xlsx', [
      { name: 'Empty', data: [] },
      { name: 'HasData', data: [['A'], ['1']] },
    ]);
    expect(result).not.toContain('## Empty');
    expect(result).toContain('## HasData');
  });
});

describe('pptxSlidesToMarkdown', () => {
  it('should convert slides with titles', () => {
    const result = pptxSlidesToMarkdown('pres.pptx', [
      { slideNum: 1, texts: ['Welcome', 'Intro text'] },
      { slideNum: 2, texts: ['Features', 'Feature A', 'Feature B'] },
    ]);
    expect(result).toContain('# pres.pptx');
    expect(result).toContain('## Slide 1: Welcome');
    expect(result).toContain('Intro text');
    expect(result).toContain('## Slide 2: Features');
    expect(result).toContain('Feature A');
    expect(result).toContain('---');
  });

  it('should skip empty slides', () => {
    const result = pptxSlidesToMarkdown('pres.pptx', [
      { slideNum: 1, texts: ['Title'] },
      { slideNum: 2, texts: [] },
    ]);
    expect(result).toContain('## Slide 1: Title');
    expect(result).not.toContain('## Slide 2');
  });

  it('should handle slide with title only', () => {
    const result = pptxSlidesToMarkdown('pres.pptx', [
      { slideNum: 1, texts: ['Just a Title'] },
    ]);
    expect(result).toContain('## Slide 1: Just a Title');
    expect(result).not.toContain('---');
  });
});

describe('pdfPagesToMarkdown', () => {
  it('should convert pages to Markdown', () => {
    const result = pdfPagesToMarkdown('report.pdf', [
      { pageNum: 1, text: 'First page content' },
      { pageNum: 2, text: 'Second page content' },
    ]);
    expect(result).toContain('# report.pdf');
    expect(result).toContain('## Page 1');
    expect(result).toContain('First page content');
    expect(result).toContain('## Page 2');
    expect(result).toContain('---');
  });

  it('should skip empty pages', () => {
    const result = pdfPagesToMarkdown('report.pdf', [
      { pageNum: 1, text: 'Content' },
      { pageNum: 2, text: '   ' },
    ]);
    expect(result).toContain('## Page 1');
    expect(result).not.toContain('## Page 2');
  });

  it('should handle single page', () => {
    const result = pdfPagesToMarkdown('one.pdf', [
      { pageNum: 1, text: 'Only page' },
    ]);
    expect(result).toContain('## Page 1');
    expect(result).not.toContain('---');
  });
});

describe('docxToMarkdown', () => {
  it('should wrap content with file header', () => {
    const result = docxToMarkdown('doc.docx', '# Hello\n\nWorld');
    expect(result).toBe('# doc.docx\n\n# Hello\n\nWorld');
  });

  it('should handle empty content', () => {
    const result = docxToMarkdown('empty.docx', '');
    expect(result).toBe('# empty.docx\n\n');
  });
});
