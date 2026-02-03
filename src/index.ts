import { InstagramScraper } from './scrapers/instagram.js';
import { FacebookScraper } from './scrapers/facebook.js';
import {
  VideoMetadata,
  ScraperConfig,
  DownloadOptions,
  DownloadResult,
  URLError,
} from './types.js';
import { validateURL } from './utils.js';

/**
 * Main SocialMediaScraper class
 */
export class SocialMediaScraper {
  private instagramScraper: InstagramScraper;
  private facebookScraper: FacebookScraper;

  constructor(config: ScraperConfig = {}) {
    this.instagramScraper = new InstagramScraper(config);
    this.facebookScraper = new FacebookScraper(config);
  }

  /**
   * Get video metadata from Instagram or Facebook
   * @param url - Video URL from Instagram or Facebook
   * @returns Video metadata
   */
  async getMetadata(url: string): Promise<VideoMetadata> {
    const { platform, normalizedUrl } = validateURL(url);

    switch (platform) {
      case 'instagram':
        return await this.instagramScraper.scrape(normalizedUrl);
      case 'facebook':
        return await this.facebookScraper.scrape(normalizedUrl);
      default:
        throw new URLError('Unsupported platform');
    }
  }

  /**
   * Download video from Instagram or Facebook
   * @param url - Video URL from Instagram or Facebook
   * @param options - Download options
   * @returns Download result with buffer and metadata
   */
  async download(url: string, options: DownloadOptions = {}): Promise<DownloadResult> {
    try {
      const { platform, normalizedUrl } = validateURL(url);

      let metadata: VideoMetadata;
      let buffer: Buffer;

      switch (platform) {
        case 'instagram':
          metadata = await this.instagramScraper.scrape(normalizedUrl);
          buffer = await this.instagramScraper.download(normalizedUrl);
          break;
        case 'facebook':
          metadata = await this.facebookScraper.scrape(normalizedUrl);
          buffer = await this.facebookScraper.download(normalizedUrl);
          break;
        default:
          throw new URLError('Unsupported platform');
      }

      return {
        success: true,
        metadata,
        buffer,
      };
    } catch (error) {
      return {
        success: false,
        metadata: {} as VideoMetadata,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check if URL is supported
   * @param url - URL to check
   * @returns True if URL is from Instagram or Facebook
   */
  isSupported(url: string): boolean {
    try {
      validateURL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get video URL only (without downloading)
   * @param url - Video URL from Instagram or Facebook
   * @returns Video URL
   */
  async getVideoURL(url: string): Promise<string> {
    const metadata = await this.getMetadata(url);
    
    if (!metadata.videoUrl) {
      throw new Error('Video URL not found');
    }

    return metadata.videoUrl;
  }
}

/**
 * Convenience function to get metadata
 */
export async function getMetadata(url: string, config?: ScraperConfig): Promise<VideoMetadata> {
  const scraper = new SocialMediaScraper(config);
  return await scraper.getMetadata(url);
}

/**
 * Convenience function to download video
 */
export async function downloadVideo(
  url: string,
  options?: DownloadOptions,
  config?: ScraperConfig
): Promise<DownloadResult> {
  const scraper = new SocialMediaScraper(config);
  return await scraper.download(url, options);
}

/**
 * Convenience function to get video URL
 */
export async function getVideoURL(url: string, config?: ScraperConfig): Promise<string> {
  const scraper = new SocialMediaScraper(config);
  return await scraper.getVideoURL(url);
}

// Export types
export * from './types.js';

// Export scrapers
export { InstagramScraper } from './scrapers/instagram.js';
export { FacebookScraper } from './scrapers/facebook.js';

// Default export
export default SocialMediaScraper;
