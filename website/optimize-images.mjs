#!/usr/bin/env node
/**
 * 图片优化脚本
 * - 压缩图片尺寸
 * - 转换为 WebP 格式
 * - 保留原 PNG 作为 fallback
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { basename, dirname, join, extname } from 'path';

const ASSETS_DIR = './public/assets';

// 图片优化配置
const config = {
  formats: { size: 64, files: ['md', 'json', 'txt', 'csv', 'png'] },
  platforms: { size: 64, files: ['chatgpt', 'claude', 'gemini', 'deepseek', 'grok'] },
  icons: { size: 80, files: ['export', 'fast', 'language', 'privacy'] },
  screenshots: { maxWidth: 1024, files: ['hero-screenshot'] },
  'demo-steps': { maxWidth: 1344, files: ['demo-steps'] },
};

// 颜色配置（用于生成 pdf.png）
const PDF_COLOR = '#E74C3C'; // 红色，代表 PDF

async function optimizeImage(inputPath, outputPath, webpPath, options) {
  try {
    let image = sharp(inputPath);

    // 获取图片信息
    const metadata = await image.metadata();
    const inputSize = metadata.size || 0;
    console.log(`  原始: ${metadata.width}x${metadata.height}, ${Math.round(inputSize / 1024)}KB`);

    // 调整尺寸
    if (options.size) {
      image = image.resize(options.size, options.size, { fit: 'contain' });
    } else if (options.maxWidth) {
      image = image.resize(options.maxWidth, null, { fit: 'inside', withoutEnlargement: true });
    }

    // 使用临时文件路径
    const tempPng = outputPath + '.tmp.png';
    const tempWebp = webpPath + '.tmp.webp';

    // 保存为 PNG (压缩)
    await image.clone()
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(tempPng);

    // 保存为 WebP
    await image.clone()
      .webp({ quality: 85, effort: 6 })
      .toFile(tempWebp);

    // 移动临时文件到目标位置
    const fs = await import('fs/promises');
    await fs.rename(tempPng, outputPath);
    await fs.rename(tempWebp, webpPath);

    // 获取优化后的大小
    const pngBuffer = await sharp(outputPath).toBuffer();
    const webpBuffer = await sharp(webpPath).toBuffer();

    console.log(`  PNG: ${Math.round(pngBuffer.length / 1024)}KB, WebP: ${Math.round(webpBuffer.length / 1024)}KB`);

    return true;
  } catch (error) {
    console.error(`  错误: ${error.message}`);
    return false;
  }
}

async function createPdfIcon(outputPath, webpPath) {
  try {
    // 创建一个简单的 PDF 图标
    const size = 64;
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="8" fill="${PDF_COLOR}"/>
        <text x="50%" y="55%" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">PDF</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outputPath);

    await sharp(Buffer.from(svg))
      .resize(size, size)
      .webp({ quality: 85 })
      .toFile(webpPath);

    console.log(`  创建 PDF 图标成功`);
    return true;
  } catch (error) {
    console.error(`  创建 PDF 图标失败: ${error.message}`);
    return false;
  }
}

async function createAppleTouchIcon(outputPath) {
  try {
    // 从 favicon.svg 创建 apple-touch-icon
    const faviconPath = './public/favicon.svg';
    if (existsSync(faviconPath)) {
      const svgContent = readFileSync(faviconPath, 'utf-8');

      await sharp(Buffer.from(svgContent))
        .resize(180, 180)
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

      console.log(`  创建 apple-touch-icon.png 成功`);
      return true;
    }
  } catch (error) {
    console.error(`  创建 apple-touch-icon 失败: ${error.message}`);
  }
  return false;
}

async function optimizeOgImage() {
  const inputPath = './public/og-image.png';
  const outputPath = './public/og-image-optimized.png';

  try {
    await sharp(inputPath)
      .resize(1200, 630, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outputPath);

    const stats = await sharp(outputPath).stats();
    console.log(`  OG Image 优化后: ${Math.round(stats.size / 1024)}KB`);

    // 重命名文件
    const fs = await import('fs/promises');
    await fs.rename(outputPath, inputPath);

    return true;
  } catch (error) {
    console.error(`  OG Image 优化失败: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🖼️  开始优化图片...\n');

  const results = { success: 0, failed: 0 };

  // 优化 formats 图标
  console.log('📁 处理 formats 图标 (64x64)...');
  for (const name of config.formats.files) {
    const input = `${ASSETS_DIR}/formats/${name}.png`;
    const output = `${ASSETS_DIR}/formats/${name}.png`;
    const webp = `${ASSETS_DIR}/formats/${name}.webp`;

    if (existsSync(input)) {
      console.log(`  处理 ${name}.png...`);
      if (await optimizeImage(input, output, webp, { size: 64 })) {
        results.success++;
      } else {
        results.failed++;
      }
    } else {
      console.log(`  ⚠️ 文件不存在: ${input}`);
    }
  }

  // 创建 PDF 图标
  console.log('  创建 pdf.png...');
  const pdfOutput = `${ASSETS_DIR}/formats/pdf.png`;
  const pdfWebp = `${ASSETS_DIR}/formats/pdf.webp`;
  if (await createPdfIcon(pdfOutput, pdfWebp)) {
    results.success++;
  } else {
    results.failed++;
  }

  // 优化 platforms 图标
  console.log('\n📁 处理 platforms 图标 (64x64)...');
  for (const name of config.platforms.files) {
    const input = `${ASSETS_DIR}/platforms/${name}.png`;
    const output = `${ASSETS_DIR}/platforms/${name}.png`;
    const webp = `${ASSETS_DIR}/platforms/${name}.webp`;

    if (existsSync(input)) {
      console.log(`  处理 ${name}.png...`);
      if (await optimizeImage(input, output, webp, { size: 64 })) {
        results.success++;
      } else {
        results.failed++;
      }
    } else {
      console.log(`  ⚠️ 文件不存在: ${input}`);
    }
  }

  // 优化 icons 图标
  console.log('\n📁 处理 icons 图标 (80x80)...');
  for (const name of config.icons.files) {
    const input = `${ASSETS_DIR}/icons/${name}.png`;
    const output = `${ASSETS_DIR}/icons/${name}.png`;
    const webp = `${ASSETS_DIR}/icons/${name}.webp`;

    if (existsSync(input)) {
      console.log(`  处理 ${name}.png...`);
      if (await optimizeImage(input, output, webp, { size: 80 })) {
        results.success++;
      } else {
        results.failed++;
      }
    } else {
      console.log(`  ⚠️ 文件不存在: ${input}`);
    }
  }

  // 优化 hero-screenshot
  console.log('\n📁 处理 hero-screenshot (1024px max)...');
  const heroInput = `${ASSETS_DIR}/screenshots/hero-screenshot.png`;
  const heroOutput = `${ASSETS_DIR}/screenshots/hero-screenshot.png`;
  const heroWebp = `${ASSETS_DIR}/screenshots/hero-screenshot.webp`;
  if (existsSync(heroInput)) {
    console.log(`  处理 hero-screenshot.png...`);
    if (await optimizeImage(heroInput, heroOutput, heroWebp, { maxWidth: 1024 })) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  // 优化 demo-steps
  console.log('\n📁 处理 demo-steps (1344px max)...');
  const demoInput = `${ASSETS_DIR}/screenshots/demo-steps.png`;
  const demoOutput = `${ASSETS_DIR}/screenshots/demo-steps.png`;
  const demoWebp = `${ASSETS_DIR}/screenshots/demo-steps.webp`;
  if (existsSync(demoInput)) {
    console.log(`  处理 demo-steps.png...`);
    if (await optimizeImage(demoInput, demoOutput, demoWebp, { maxWidth: 1344 })) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  // 优化 OG Image
  console.log('\n📁 处理 og-image (1200x630)...');
  if (existsSync('./public/og-image.png')) {
    if (await optimizeOgImage()) {
      results.success++;
    } else {
      results.failed++;
    }
  }

  // 创建 apple-touch-icon
  console.log('\n📁 创建 apple-touch-icon.png (180x180)...');
  const appleOutput = './public/apple-touch-icon.png';
  if (await createAppleTouchIcon(appleOutput)) {
    results.success++;
  } else {
    results.failed++;
  }

  // 输出结果
  console.log('\n' + '='.repeat(50));
  console.log(`✅ 成功: ${results.success} 个`);
  console.log(`❌ 失败: ${results.failed} 个`);
  console.log('='.repeat(50));
}

main().catch(console.error);
