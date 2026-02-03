import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import {
  FacebookMetadata,
  ScraperConfig,
  NetworkError,
  ParseError,
  MediaType,
} from '../types.js';
import {
  extractFacebookVideoId,
  retry,
  safeJSONParse,
  cleanText,
} from '../utils.js';

export class FacebookScraper {
  private client: AxiosInstance;
  private config: Required<ScraperConfig>;

  constructor(config: ScraperConfig = {}) {
    this.config = {
      userAgent:
        config.userAgent ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      proxy: config.proxy || '',
      cookies: config.cookies || '',
    };

    this.client = axios.create({
      timeout: this.config.timeout,
      headers: {
        'User-Agent': this.config.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
    });
  }

  /**
   * Scrape Facebook video metadata
   */
  async scrape(url: string): Promise<FacebookMetadata> {
    const videoId = extractFacebookVideoId(url);
    if (!videoId) {
      throw new ParseError('Could not extract video ID from URL', 'facebook');
    }

    return retry(
      async () => {
        // Try method 1: HTML scraping
        let result = await this.scrapeWithHTML(url);
        if (result) return result;

        // Try method 2: Mobile site
        result = await this.scrapeWithMobileSite(url);
        if (result) return result;

        // Try method 3: Graph API (if available)
        result = await this.scrapeWithGraphAPI(videoId);
        if (result) return result;

        throw new ParseError('Could not extract video metadata', 'facebook');
      },
      this.config.retries,
      this.config.retryDelay
    );
  }

  /**
   * Method 1: Scrape by parsing HTML
   */
  private async scrapeWithHTML(url: string): Promise<FacebookMetadata | null> {
    try {
      const response = await this.client.get(url, {
        headers: {
          Cookie: this.config.cookies,
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Try to find video URL in various places
      const videoUrl = this.extractVideoURL(html, $);
      if (!videoUrl) return null;

      // Extract metadata
      const metadata = this.extractMetadataFromHTML($, url);

      return {
        platform: 'facebook',
        type: 'video',
        url,
        videoUrl,
        ...metadata,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Method 2: Scrape using mobile site
   */
  private async scrapeWithMobileSite(url: string): Promise<FacebookMetadata | null> {
    try {
      // Convert to mobile URL
      const mobileUrl = url.replace('www.facebook.com', 'm.facebook.com');

      const response = await this.client.get(mobileUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const videoUrl = this.extractVideoURL(html, $);
      if (!videoUrl) return null;

      const metadata = this.extractMetadataFromHTML($, url);

      return {
        platform: 'facebook',
        type: 'video',
        url,
        videoUrl,
        ...metadata,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Method 3: Try Graph API (requires access token)
   */
  private async scrapeWithGraphAPI(videoId: string): Promise<FacebookMetadata | null> {
    // This would require a Facebook access token
    // For now, return null
    return null;
  }

  /**
   * Extract video URL from HTML
   */
  private extractVideoURL(html: string, $: cheerio.CheerioAPI): string | null {
    // Method 1: Look for HD source
    let match = html.match(/"(?:hd_src|playable_url)":"([^"]+)"/);
    if (match) {
      return match[1].replace(/\\\//g, '/');
    }

    // Method 2: Look for SD source
    match = html.match(/"(?:sd_src)":"([^"]+)"/);
    if (match) {
      return match[1].replace(/\\\//g, '/');
    }

    // Method 3: Look in meta tags
    const ogVideo =
      $('meta[property="og:video"]').attr('content') ||
      $('meta[property="og:video:secure_url"]').attr('content');
    
    if (ogVideo) {
      return ogVideo;
    }

    // Method 4: Look for video tag
    const videoTag = $('video').attr('src');
    if (videoTag) {
      return videoTag;
    }

    // Method 5: Look in JSON data
    match = html.match(/"playable_url(?:_quality_hd)?":"([^"]+)"/);
    if (match) {
      return match[1].replace(/\\\//g, '/');
    }

    return null;
  }

  /**
   * Extract metadata from HTML
   */
  private extractMetadataFromHTML($: cheerio.CheerioAPI, url: string): Partial<FacebookMetadata> {
    const metadata: Partial<FacebookMetadata> = {};

    // Extract from meta tags
    metadata.thumbnail =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    metadata.caption =
      cleanText($('meta[property="og:description"]').attr('content') || '') ||
      cleanText($('meta[name="description"]').attr('content') || '');

    metadata.pageName =
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[property="og:title"]').attr('content');

    // Try to extract engagement data from HTML
    const engagementMatch = $.html().match(/"engagement":{"count":(\d+)}/);
    if (engagementMatch) {
      metadata.likes = parseInt(engagementMatch[1], 10);
    }

    // Try to extract video duration
    const durationMatch = $.html().match(/"playable_duration_in_ms":(\d+)/);
    if (durationMatch) {
      metadata.duration = parseInt(durationMatch[1], 10) / 1000;
    }

    // Check if it's a live video
    metadata.isLive = $.html().includes('"is_live":true') || $.html().includes('"broadcast_status":"LIVE"');

    return metadata;
  }

  /**
   * Download video
   */
  async download(url: string): Promise<Buffer> {
    const metadata = await this.scrape(url);

    if (!metadata.videoUrl) {
      throw new ParseError('Video URL not found', 'facebook');
    }

    try {
      const response = await this.client.get(metadata.videoUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new NetworkError(`Failed to download video: ${(error as Error).message}`, 'facebook');
    }
  }
}
