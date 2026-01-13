#!/usr/bin/env node

/**
 * Image Optimization Script
 * Converts PNG/JPG images to WebP format for better performance
 *
 * Usage:
 *   npm install sharp (run this first)
 *   node scripts/convert-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './public/assets/images';

// Priority files to convert (largest files first)
const filesToConvert = [
  'backgrounds/bg-arena.jpg',
  'ui/frame-score_red.png',
  'ui/frame-score_blue.png',
  'cards/card-back.png',
  'cards/card-phoenix.png',
  'cards/card-sage.png',
  'cards/card-reyna.png',
  'cards/card-jett.png',
  'cards/card-yasuo.png',
  'cards/card-ezreal.png',
  'cards/card-lux.png',
  'cards/card-jinx.png',
];

async function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function convertToWebP() {
  let totalOriginalSize = 0;
  let totalConvertedSize = 0;
  let successCount = 0;
  let failCount = 0;

  console.log('🚀 Starting image conversion to WebP...\n');

  for (const file of filesToConvert) {
    const inputPath = path.join(inputDir, file);
    const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

    try {
      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  File not found: ${file}`);
        failCount++;
        continue;
      }

      const originalSize = await getFileSize(inputPath);
      totalOriginalSize += originalSize;

      // Convert to WebP
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(outputPath);

      const convertedSize = await getFileSize(outputPath);
      totalConvertedSize += convertedSize;

      const savings = ((originalSize - convertedSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   ${formatBytes(originalSize)} → ${formatBytes(convertedSize)} (${savings}% smaller)\n`);

      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${file}`);
      console.error(`   Error: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log('📊 CONVERSION SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📦 Total original size: ${formatBytes(totalOriginalSize)}`);
  console.log(`📦 Total converted size: ${formatBytes(totalConvertedSize)}`);
  console.log(`💾 Total savings: ${formatBytes(totalOriginalSize - totalConvertedSize)} (${((totalOriginalSize - totalConvertedSize) / totalOriginalSize * 100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════════\n');

  if (successCount > 0) {
    console.log('🎯 Next steps:');
    console.log('1. Update image references in your code from .png/.jpg to .webp');
    console.log('2. Test the converted images on your site');
    console.log('3. If satisfied, you can delete the original files to save space');
    console.log('4. Run: npm run build && npm run start to test production build\n');
  }

  if (failCount > 0 && successCount === 0) {
    console.log('⚠️  No images were converted. Make sure you have installed sharp:');
    console.log('   npm install sharp\n');
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  convertToWebP().catch(console.error);
} catch (e) {
  console.error('❌ Error: sharp is not installed');
  console.error('📦 Please install sharp first:');
  console.error('   npm install sharp\n');
  process.exit(1);
}
