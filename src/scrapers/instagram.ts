import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import {
  InstagramMetadata,
  ScraperConfig,
  NetworkError,
  ParseError,
  MediaType,
} from './types.js';
import {
  extractInstagramShortcode,
  extractHashtags,
  extractMentions,
  retry,
  safeJSONParse,
  cleanText,
} from './utils.js';

export class InstagramScraper {
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
        Pragma: 'no-cache',
      },
    });
  }

  /**
   * Scrape Instagram video metadata
   */
  async scrape(url: string): Promise<InstagramMetadata> {
    const shortcode = extractInstagramShortcode(url);
    if (!shortcode) {
      throw new ParseError('Could not extract shortcode from URL', 'instagram');
    }

    return retry(
      async () => {
        // Try method 1: API endpoint
        let result = await this.scrapeWithAPI(url);
        if (result) return result;

        // Try method 2: HTML scraping
        result = await this.scrapeWithHTML(url);
        if (result) return result;

        throw new ParseError('Could not extract video metadata', 'instagram');
      },
      this.config.retries,
      this.config.retryDelay
    );
  }

  /**
   * Method 1: Scrape using Instagram's API endpoint
   */
  private async scrapeWithAPI(url: string): Promise<InstagramMetadata | null> {
    try {
      const response = await this.client.get(`${url}?__a=1&__d=dis`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://www.instagram.com/',
        },
      });

      if (response.data?.items?.[0]) {
        return this.parseAPIResponse(response.data.items[0], url);
      }

      if (response.data?.graphql?.shortcode_media) {
        return this.parseGraphQLResponse(response.data.graphql.shortcode_media, url);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Method 2: Scrape by parsing HTML
   */
  private async scrapeWithHTML(url: string): Promise<InstagramMetadata | null> {
    try {
      const response = await this.client.get(url);
      const html = response.data;

      // Try JSON-LD
      const jsonLdData = this.extractFromJSONLD(html, url);
      if (jsonLdData) return jsonLdData;

      // Try embedded scripts
      const scriptData = this.extractFromScripts(html, url);
      if (scriptData) return scriptData;

      // Try meta tags
      const metaData = this.extractFromMetaTags(html, url);
      if (metaData) return metaData;

      return null;
    } catch (error) {
      throw new NetworkError(`Failed to fetch HTML: ${(error as Error).message}`, 'instagram');
    }
  }

  /**
   * Parse API response
   */
  private parseAPIResponse(item: any, url: string): InstagramMetadata {
    const isVideo = item.media_type === 2 || item.product_type === 'clips';
    if (!isVideo) {
      throw new ParseError('Post does not contain a video', 'instagram');
    }

    const type: MediaType = item.product_type === 'clips' ? 'reel' : 'video';

    return {
      platform: 'instagram',
      type,
      url,
      videoUrl: item.video_versions?.[0]?.url || item.video_url,
      thumbnail: item.image_versions2?.candidates?.[0]?.url || item.thumbnail_url,
      username: item.user?.username || 'unknown',
      caption: cleanText(item.caption?.text || ''),
      timestamp: item.taken_at ? new Date(item.taken_at * 1000).toISOString() : undefined,
      duration: item.video_duration || 0,
      likes: item.like_count || 0,
      comments: item.comment_count || 0,
      views: item.play_count || item.view_count || 0,
      isVerified: item.user?.is_verified || false,
      hashtags: extractHashtags(item.caption?.text || ''),
      mentions: extractMentions(item.caption?.text || ''),
    };
  }

  /**
   * Parse GraphQL response
   */
  private parseGraphQLResponse(media: any, url: string): InstagramMetadata {
    if (!media.is_video) {
      throw new ParseError('Post does not contain a video', 'instagram');
    }

    const type: MediaType = media.__typename === 'GraphVideo' ? 'video' : 'reel';
    const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text || '';

    return {
      platform: 'instagram',
      type,
      url,
      videoUrl: media.video_url,
      thumbnail: media.display_url,
      username: media.owner?.username || 'unknown',
      caption: cleanText(caption),
      timestamp: media.taken_at_timestamp
        ? new Date(media.taken_at_timestamp * 1000).toISOString()
        : undefined,
      duration: media.video_duration || 0,
      likes: media.edge_media_preview_like?.count || 0,
      comments: media.edge_media_to_comment?.count || 0,
      views: media.video_view_count || 0,
      isVerified: media.owner?.is_verified || false,
      hashtags: extractHashtags(caption),
      mentions: extractMentions(caption),
      location: media.location?.name,
    };
  }

  /**
   * Extract from JSON-LD
   */
  private extractFromJSONLD(html: string, url: string): InstagramMetadata | null {
    try {
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">({.*?})<\/script>/s);
      if (!jsonLdMatch) return null;

      const data = safeJSONParse(jsonLdMatch[1]);
      if (!data || data['@type'] !== 'VideoObject') return null;

      return {
        platform: 'instagram',
        type: 'video',
        url,
        videoUrl: data.contentUrl,
        thumbnail: data.thumbnailUrl,
        username: data.author?.alternateName || data.author || 'unknown',
        caption: cleanText(data.description || data.caption || ''),
        timestamp: data.uploadDate,
        duration: 0,
        hashtags: extractHashtags(data.description || ''),
        mentions: extractMentions(data.description || ''),
      };
    } catch {
      return null;
    }
  }

  /**
   * Extract from embedded scripts
   */
  private extractFromScripts(html: string, url: string): InstagramMetadata | null {
    try {
      // Try window._sharedData
      let match = html.match(/window\._sharedData\s*=\s*({.+?});<\/script>/);
      if (match) {
        const sharedData = safeJSONParse(match[1]);
        const media = sharedData?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
        if (media && media.is_video) {
          return this.parseGraphQLResponse(media, url);
        }
      }

      // Try window.__additionalDataLoaded
      match = html.match(/window\.__additionalDataLoaded\('extra',({.+?})\);/);
      if (match) {
        const data = safeJSONParse(match[1]);
        const media = data?.graphql?.shortcode_media;
        if (media && media.is_video) {
          return this.parseGraphQLResponse(media, url);
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Extract from meta tags
   */
  private extractFromMetaTags(html: string, url: string): InstagramMetadata | null {
    try {
      const $ = cheerio.load(html);

      const videoUrl =
        $('meta[property="og:video"]').attr('content') ||
        $('meta[property="og:video:secure_url"]').attr('content');

      if (!videoUrl) return null;

      const caption = $('meta[property="og:description"]').attr('content') || '';
      const username = $('meta[property="og:title"]').attr('content')?.split('•')[0]?.trim() || 'unknown';

      return {
        platform: 'instagram',
        type: 'video',
        url,
        videoUrl,
        thumbnail: $('meta[property="og:image"]').attr('content') || '',
        username,
        caption: cleanText(caption),
        hashtags: extractHashtags(caption),
        mentions: extractMentions(caption),
      };
    } catch {
      return null;
    }
  }

  /**
   * Download video
   */
  async download(url: string): Promise<Buffer> {
    const metadata = await this.scrape(url);

    if (!metadata.videoUrl) {
      throw new ParseError('Video URL not found', 'instagram');
    }

    try {
      const response = await this.client.get(metadata.videoUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
      });

      return Buffer.from(response.data);
    } catch (error) {
      throw new NetworkError(`Failed to download video: ${(error as Error).message}`, 'instagram');
    }
  }
}
