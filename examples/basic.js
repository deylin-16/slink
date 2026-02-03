/**
 * Basic usage example
 */

import { SocialMediaScraper } from '../dist/index.js';
import fs from 'fs';

const scraper = new SocialMediaSaper();

// Example URLs (replace with real ones)
const INSTAGRAM_URL = 'https://www.instagram.com/p/XXXXX/';
const FACEBOOK_URL = 'https://www.facebook.com/watch/?v=12345';

async function basicExample() {
  console.log('='.repeat(60));
  console.log('Basic Usage Example');
  console.log('='.repeat(60));

  // Example 1: Get Instagram metadata
  console.log('\n1️⃣ Getting Instagram metadata...');
  try {
    const igMetadata = await scraper.getMetadata(INSTAGRAM_URL);
    console.log('✅ Instagram Metadata:');
    console.log(JSON.stringify(igMetadata, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Example 2: Get Facebook metadata
  console.log('\n2️⃣ Getting Facebook metadata...');
  try {
    const fbMetadata = await scraper.getMetadata(FACEBOOK_URL);
    console.log('✅ Facebook Metadata:');
    console.log(JSON.stringify(fbMetadata, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Example 3: Download Instagram video
  console.log('\n3️⃣ Downloading Instagram video...');
  try {
    const result = await scraper.download(INSTAGRAM_URL);
    if (result.success) {
      const filename = `instagram_${Date.now()}.mp4`;
      fs.writeFileSync(filename, result.buffer);
      console.log(`✅ Video saved: ${filename}`);
      console.log(`Size: ${(result.buffer.length / 1024 / 1024).toFixed(2)} MB`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Example 4: Get video URL only
  console.log('\n4️⃣ Getting video URL...');
  try {
    const videoUrl = await scraper.getVideoURL(INSTAGRAM_URL);
    console.log('✅ Video URL:', videoUrl);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Example 5: Check if URL is supported
  console.log('\n5️⃣ Checking URL support...');
  const urls = [
    INSTAGRAM_URL,
    FACEBOOK_URL,
    'https://www.youtube.com/watch?v=XXXXX',
    'https://twitter.com/user/status/12345',
  ];

  for (const url of urls) {
    const supported = scraper.isSupported(url);
    console.log(`${supported ? '✅' : '❌'} ${url}`);
  }
}

// Run example
basicExample().catch(console.error);
