# 📹 Social Media Scraper

A powerful Node.js library to download videos from Instagram and Facebook with complete metadata extraction.

[![npm version](https://img.shields.io/npm/v/social-media-scraper.svg)](https://www.npmjs.com/package/social-media-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 📥 **Download videos** from Instagram and Facebook
- 📊 **Complete metadata** extraction (likes, comments, views, etc.)
- 🎯 **TypeScript** support with full type definitions
- 🔄 **Multiple fallback methods** for reliable scraping
- ⚡ **Fast and efficient** with retry mechanisms
- 🛡️ **Error handling** with custom error types
- 🎨 **Simple API** - easy to use
- 🔧 **Configurable** with custom options

## 📦 Installation

```bash
npm install social-media-scraper
```

or with yarn:

```bash
yarn add social-media-scraper
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { SocialMediaScraper } from 'social-media-scraper';

const scraper = new SocialMediaScraper();

// Get metadata
const metadata = await scraper.getMetadata('https://www.instagram.com/p/XXXXX/');
console.log(metadata);

// Download video
const result = await scraper.download('https://www.instagram.com/p/XXXXX/');
if (result.success) {
  console.log('Video downloaded!', result.buffer);
}
```

### Using Convenience Functions

```javascript
import { getMetadata, downloadVideo, getVideoURL } from 'social-media-scraper';

// Get metadata
const metadata = await getMetadata('https://www.instagram.com/p/XXXXX/');

// Download video
const result = await downloadVideo('https://www.facebook.com/watch/?v=12345');

// Get video URL only
const videoUrl = await getVideoURL('https://www.instagram.com/reel/XXXXX/');
```

## 📖 API Documentation

### SocialMediaScraper

Main class for scraping videos.

#### Constructor

```typescript
new SocialMediaScraper(config?: ScraperConfig)
```

**Config options:**
```typescript
interface ScraperConfig {
  userAgent?: string;      // Custom user agent
  timeout?: number;        // Request timeout (ms)
  retries?: number;        // Number of retries
  retryDelay?: number;     // Delay between retries (ms)
  proxy?: string;          // Proxy URL
  cookies?: string;        // Cookies for authentication
}
```

#### Methods

##### `getMetadata(url: string): Promise<VideoMetadata>`

Get video metadata without downloading.

```javascript
const metadata = await scraper.getMetadata('https://www.instagram.com/p/XXXXX/');
console.log(metadata);
```

**Returns:**
```typescript
interface InstagramMetadata {
  platform: 'instagram';
  type: 'video' | 'reel' | 'story';
  url: string;
  videoUrl?: string;
  thumbnail?: string;
  username?: string;
  caption?: string;
  timestamp?: string;
  duration?: number;
  likes?: number;
  comments?: number;
  views?: number;
  isVerified?: boolean;
  hashtags?: string[];
  mentions?: string[];
  location?: string;
}

interface FacebookMetadata {
  platform: 'facebook';
  type: 'video' | 'post';
  url: string;
  videoUrl?: string;
  thumbnail?: string;
  caption?: string;
  timestamp?: string;
  duration?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  reactions?: {
    like?: number;
    love?: number;
    haha?: number;
    wow?: number;
    sad?: number;
    angry?: number;
  };
  pageId?: string;
  pageName?: string;
  isLive?: boolean;
}
```

##### `download(url: string, options?: DownloadOptions): Promise<DownloadResult>`

Download video and get metadata.

```javascript
const result = await scraper.download('https://www.instagram.com/p/XXXXX/');
if (result.success) {
  // Save to file
  fs.writeFileSync('video.mp4', result.buffer);
}
```

**Options:**
```typescript
interface DownloadOptions {
  quality?: 'high' | 'medium' | 'low';
  includeAudio?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}
```

**Returns:**
```typescript
interface DownloadResult {
  success: boolean;
  metadata: VideoMetadata;
  buffer?: Buffer;
  error?: string;
}
```

##### `getVideoURL(url: string): Promise<string>`

Get direct video URL without downloading.

```javascript
const videoUrl = await scraper.getVideoURL('https://www.instagram.com/p/XXXXX/');
console.log(videoUrl);
```

##### `isSupported(url: string): boolean`

Check if URL is supported.

```javascript
const supported = scraper.isSupported('https://www.instagram.com/p/XXXXX/');
console.log(supported); // true
```

### Convenience Functions

#### `getMetadata(url, config?)`

```javascript
import { getMetadata } from 'social-media-scraper';

const metadata = await getMetadata('https://www.instagram.com/p/XXXXX/');
```

#### `downloadVideo(url, options?, config?)`

```javascript
import { downloadVideo } from 'social-media-scraper';

const result = await downloadVideo('https://www.instagram.com/p/XXXXX/');
```

#### `getVideoURL(url, config?)`

```javascript
import { getVideoURL } from 'social-media-scraper';

const videoUrl = await getVideoURL('https://www.instagram.com/p/XXXXX/');
```

### Platform-Specific Scrapers

You can also use platform-specific scrapers directly:

#### Instagram

```javascript
import { InstagramScraper } from 'social-media-scraper';

const instagram = new InstagramScraper();
const metadata = await instagram.scrape('https://www.instagram.com/p/XXXXX/');
const buffer = await instagram.download('https://www.instagram.com/p/XXXXX/');
```

#### Facebook

```javascript
import { FacebookScraper } from 'social-media-scraper';

const facebook = new FacebookScraper();
const metadata = await facebook.scrape('https://www.facebook.com/watch/?v=12345');
const buffer = await facebook.download('https://www.facebook.com/watch/?v=12345');
```

## 📝 Examples

### Example 1: Download Instagram Reel

```javascript
import { SocialMediaScraper } from 'social-media-scraper';
import fs from 'fs';

const scraper = new SocialMediaScraper();

async function downloadReel() {
  try {
    const url = 'https://www.instagram.com/reel/XXXXX/';
    const result = await scraper.download(url);

    if (result.success) {
      const filename = `${result.metadata.username}_reel.mp4`;
      fs.writeFileSync(filename, result.buffer);
      console.log(`✅ Downloaded: ${filename}`);
      console.log(`👤 Username: ${result.metadata.username}`);
      console.log(`❤️ Likes: ${result.metadata.likes}`);
      console.log(`💬 Comments: ${result.metadata.comments}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

downloadReel();
```

### Example 2: Get Facebook Video Metadata

```javascript
import { getMetadata } from 'social-media-scraper';

async function getFacebookInfo() {
  const url = 'https://www.facebook.com/watch/?v=12345';
  const metadata = await getMetadata(url);

  console.log('Video Info:');
  console.log(`- Page: ${metadata.pageName}`);
  console.log(`- Caption: ${metadata.caption}`);
  console.log(`- Likes: ${metadata.likes}`);
  console.log(`- Comments: ${metadata.comments}`);
  console.log(`- Shares: ${metadata.shares}`);
  console.log(`- Duration: ${metadata.duration}s`);
}

getFacebookInfo();
```

### Example 3: Batch Download

```javascript
import { SocialMediaScraper } from 'social-media-scraper';
import fs from 'fs';

const scraper = new SocialMediaScraper();

const urls = [
  'https://www.instagram.com/p/XXXXX1/',
  'https://www.instagram.com/p/XXXXX2/',
  'https://www.facebook.com/watch/?v=12345',
];

async function batchDownload() {
  for (const url of urls) {
    try {
      console.log(`Downloading: ${url}`);
      const result = await scraper.download(url);

      if (result.success) {
        const filename = `video_${Date.now()}.mp4`;
        fs.writeFileSync(filename, result.buffer);
        console.log(`✅ Saved: ${filename}`);
      }

      // Wait 2 seconds between downloads
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error with ${url}:`, error.message);
    }
  }
}

batchDownload();
```

### Example 4: Custom Configuration

```javascript
import { SocialMediaScraper } from 'social-media-scraper';

const scraper = new SocialMediaScraper({
  userAgent: 'Custom User Agent',
  timeout: 15000,
  retries: 5,
  retryDelay: 2000,
});

const metadata = await scraper.getMetadata('https://www.instagram.com/p/XXXXX/');
```

### Example 5: Error Handling

```javascript
import { SocialMediaScraper, URLError, NetworkError, ParseError } from 'social-media-scraper';

const scraper = new SocialMediaScraper();

async function safeDownload(url) {
  try {
    const result = await scraper.download(url);
    return result;
  } catch (error) {
    if (error instanceof URLError) {
      console.error('Invalid URL:', error.message);
    } else if (error instanceof NetworkError) {
      console.error('Network error:', error.message);
    } else if (error instanceof ParseError) {
      console.error('Parse error:', error.message);
    } else {
      console.error('Unknown error:', error);
    }
  }
}
```

## 🔧 Advanced Usage

### With TypeScript

```typescript
import { SocialMediaScraper, InstagramMetadata, FacebookMetadata } from 'social-media-scraper';

const scraper = new SocialMediaScraper();

async function getVideoInfo(url: string) {
  const metadata = await scraper.getMetadata(url);

  if (metadata.platform === 'instagram') {
    const igMetadata = metadata as InstagramMetadata;
    console.log(`Hashtags: ${igMetadata.hashtags?.join(', ')}`);
  } else if (metadata.platform === 'facebook') {
    const fbMetadata = metadata as FacebookMetadata;
    console.log(`Reactions: ${JSON.stringify(fbMetadata.reactions)}`);
  }
}
```

### Using Proxy

```javascript
const scraper = new SocialMediaScraper({
  proxy: 'http://proxy.example.com:8080',
});
```

### Custom Headers

```javascript
const result = await scraper.download(url, {
  headers: {
    'Custom-Header': 'value',
  },
});
```

## ⚠️ Important Notes

1. **Rate Limiting**: Don't abuse the service. Instagram and Facebook have rate limits.
2. **Legal**: Respect copyright and intellectual property. Use responsibly.
3. **Terms of Service**: Using this library may violate the terms of service of Instagram and Facebook.
4. **Changes**: Social media platforms frequently change their structure, which may break the scraper.
5. **Authentication**: Some content requires authentication (cookies).

## 🐛 Error Handling

The library provides custom error types:

```typescript
- URLError: Invalid or unsupported URL
- NetworkError: Network-related errors
- ParseError: Failed to parse metadata
- ScraperError: Base error class
```

## 🔍 Troubleshooting

### Video not found
- Ensure the post is public
- Check if the URL is correct
- The post might not contain a video

### Network errors
- Check your internet connection
- Try using a proxy
- Increase timeout in config

### Parse errors
- Instagram/Facebook might have changed their structure
- Try updating to the latest version
- Report the issue on GitHub

## 📊 Supported Platforms

| Platform  | Videos | Reels | Stories | Live |
|-----------|--------|-------|---------|------|
| Instagram | ✅     | ✅    | ⚠️      | ❌   |
| Facebook  | ✅     | ❌    | ❌      | ⚠️   |

✅ Fully supported | ⚠️ Partially supported | ❌ Not supported

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by various scraping libraries
- Built with TypeScript and Axios
- Uses Cheerio for HTML parsing

## 📞 Support

If you have any questions or issues:
- Open an issue on [GitHub](https://github.com/yourusername/social-media-scraper/issues)
- Check existing issues for solutions
- Read the documentation

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/social-media-scraper)
- [GitHub Repository](https://github.com/yourusername/social-media-scraper)
- [Documentation](https://github.com/yourusername/social-media-scraper#readme)
- [Changelog](https://github.com/yourusername/social-media-scraper/blob/main/CHANGELOG.md)

---

Made with ❤️ by developers, for developers
