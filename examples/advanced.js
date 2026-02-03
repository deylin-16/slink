/**
 * Advanced usage examples
 */

import { SocialMediaScraper, InstagramScraper, FacebookScraper } from '../dist/index.js';
import fs from 'fs';
import path from 'path';

// Example 1: Using custom configuration
async function customConfigExample() {
  console.log('\n📋 Example: Custom Configuration\n');

  const scraper = new SocialMediaScraper({
    userAgent: 'Custom User Agent String',
    timeout: 15000,
    retries: 5,
    retryDelay: 2000,
  });

  const url = 'https://www.instagram.com/p/XXXXX/';
  
  try {
    const metadata = await scraper.getMetadata(url);
    console.log('✅ Metadata retrieved with custom config');
    console.log(`Platform: ${metadata.platform}`);
    console.log(`Type: ${metadata.type}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Example 2: Batch download
async function batchDownloadExample() {
  console.log('\n📋 Example: Batch Download\n');

  const scraper = new SocialMediaScraper();
  const urls = [
    'https://www.instagram.com/p/XXXXX1/',
    'https://www.instagram.com/reel/XXXXX2/',
    'https://www.facebook.com/watch/?v=12345',
  ];

  const downloadDir = './downloads';
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir);
  }

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Processing: ${url}`);

    try {
      const result = await scraper.download(url);

      if (result.success) {
        const filename = path.join(
          downloadDir,
          `${result.metadata.platform}_${result.metadata.username || 'unknown'}_${Date.now()}.mp4`
        );
        fs.writeFileSync(filename, result.buffer);
        console.log(`✅ Saved: ${filename}`);
        console.log(`   Size: ${(result.buffer.length / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Duration: ${result.metadata.duration}s`);
      }

      // Wait between downloads to avoid rate limiting
      if (i < urls.length - 1) {
        console.log('⏳ Waiting 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`❌ Error with ${url}:`, error.message);
    }
  }

  console.log('\n✨ Batch download completed');
}

// Example 3: Platform-specific scrapers
async function platformSpecificExample() {
  console.log('\n📋 Example: Platform-Specific Scrapers\n');

  // Instagram scraper
  const instagram = new InstagramScraper();
  const igUrl = 'https://www.instagram.com/p/XXXXX/';

  try {
    const igMetadata = await instagram.scrape(igUrl);
    console.log('Instagram Video Info:');
    console.log(`- Username: @${igMetadata.username}`);
    console.log(`- Likes: ${igMetadata.likes?.toLocaleString()}`);
    console.log(`- Comments: ${igMetadata.comments?.toLocaleString()}`);
    console.log(`- Views: ${igMetadata.views?.toLocaleString()}`);
    console.log(`- Hashtags: ${igMetadata.hashtags?.join(', ')}`);
  } catch (error) {
    console.error('❌ Instagram error:', error.message);
  }

  // Facebook scraper
  const facebook = new FacebookScraper();
  const fbUrl = 'https://www.facebook.com/watch/?v=12345';

  try {
    const fbMetadata = await facebook.scrape(fbUrl);
    console.log('\nFacebook Video Info:');
    console.log(`- Page: ${fbMetadata.pageName}`);
    console.log(`- Likes: ${fbMetadata.likes?.toLocaleString()}`);
    console.log(`- Comments: ${fbMetadata.comments?.toLocaleString()}`);
    console.log(`- Shares: ${fbMetadata.shares?.toLocaleString()}`);
    console.log(`- Is Live: ${fbMetadata.isLive ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error('❌ Facebook error:', error.message);
  }
}

// Example 4: Error handling
async function errorHandlingExample() {
  console.log('\n📋 Example: Error Handling\n');

  const scraper = new SocialMediaScraper();
  const testUrls = [
    'https://www.instagram.com/p/INVALID/',
    'https://not-a-real-site.com/video',
    'invalid-url',
  ];

  for (const url of testUrls) {
    try {
      const result = await scraper.download(url);
      if (result.success) {
        console.log(`✅ ${url}`);
      } else {
        console.log(`⚠️ ${url}: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${url}: ${error.name} - ${error.message}`);
    }
  }
}

// Example 5: Metadata analysis
async function metadataAnalysisExample() {
  console.log('\n📋 Example: Metadata Analysis\n');

  const scraper = new SocialMediaScraper();
  const url = 'https://www.instagram.com/p/XXXXX/';

  try {
    const metadata = await scraper.getMetadata(url);

    console.log('📊 Video Analysis:');
    console.log('='.repeat(40));

    if (metadata.platform === 'instagram') {
      console.log(`Platform: Instagram ${metadata.type}`);
      console.log(`Username: @${metadata.username}`);
      console.log(`Verified: ${metadata.isVerified ? '✓' : '✗'}`);
      
      if (metadata.caption) {
        console.log(`\nCaption (${metadata.caption.length} chars):`);
        console.log(metadata.caption.substring(0, 100) + '...');
      }

      console.log('\nEngagement:');
      const totalEngagement = (metadata.likes || 0) + (metadata.comments || 0);
      console.log(`- Total: ${totalEngagement.toLocaleString()}`);
      console.log(`- Likes: ${metadata.likes?.toLocaleString()}`);
      console.log(`- Comments: ${metadata.comments?.toLocaleString()}`);
      console.log(`- Views: ${metadata.views?.toLocaleString()}`);

      if (metadata.hashtags && metadata.hashtags.length > 0) {
        console.log(`\nHashtags (${metadata.hashtags.length}):`);
        console.log(`#${metadata.hashtags.slice(0, 5).join(' #')}`);
      }

      if (metadata.mentions && metadata.mentions.length > 0) {
        console.log(`\nMentions (${metadata.mentions.length}):`);
        console.log(`@${metadata.mentions.slice(0, 5).join(' @')}`);
      }

      if (metadata.location) {
        console.log(`\nLocation: ${metadata.location}`);
      }
    }

    console.log('='.repeat(40));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🚀 Advanced Examples for Social Media Scraper\n');
  console.log('⚠️ Replace example URLs with real URLs before running\n');

  await customConfigExample();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await platformSpecificExample();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await errorHandlingExample();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await metadataAnalysisExample();
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Uncomment to run batch download (will take longer)
  // await batchDownloadExample();

  console.log('\n✨ All examples completed!');
}

runAllExamples().catch(console.error);
