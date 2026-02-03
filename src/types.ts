/**
 * Supported social media platforms
 */
export type Platform = 'instagram' | 'facebook';

/**
 * Type of media content
 */
export type MediaType = 'video' | 'reel' | 'story' | 'post';

/**
 * Video quality options
 */
export type VideoQuality = 'high' | 'medium' | 'low';

/**
 * Base metadata interface shared across platforms
 */
export interface BaseMetadata {
  platform: Platform;
  type: MediaType;
  url: string;
  videoUrl?: string;
  thumbnail?: string;
  username?: string;
  caption?: string;
  timestamp?: string;
  duration?: number;
}

/**
 * Instagram-specific metadata
 */
export interface InstagramMetadata extends BaseMetadata {
  platform: 'instagram';
  likes?: number;
  comments?: number;
  views?: number;
  isVerified?: boolean;
  hashtags?: string[];
  mentions?: string[];
  location?: string;
}

/**
 * Facebook-specific metadata
 */
export interface FacebookMetadata extends BaseMetadata {
  platform: 'facebook';
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

/**
 * Union type for all metadata
 */
export type VideoMetadata = InstagramMetadata | FacebookMetadata;

/**
 * Download options
 */
export interface DownloadOptions {
  quality?: VideoQuality;
  includeAudio?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Scraper configuration
 */
export interface ScraperConfig {
  userAgent?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  proxy?: string;
  cookies?: string;
}

/**
 * Download result
 */
export interface DownloadResult {
  success: boolean;
  metadata: VideoMetadata;
  buffer?: Buffer;
  error?: string;
}

/**
 * Error types
 */
export class ScraperError extends Error {
  constructor(message: string, public code: string, public platform?: Platform) {
    super(message);
    this.name = 'ScraperError';
  }
}

export class URLError extends ScraperError {
  constructor(message: string, platform?: Platform) {
    super(message, 'INVALID_URL', platform);
    this.name = 'URLError';
  }
}

export class NetworkError extends ScraperError {
  constructor(message: string, platform?: Platform) {
    super(message, 'NETWORK_ERROR', platform);
    this.name = 'NetworkError';
  }
}

export class ParseError extends ScraperError {
  constructor(message: string, platform?: Platform) {
    super(message, 'PARSE_ERROR', platform);
    this.name = 'ParseError';
  }
}
