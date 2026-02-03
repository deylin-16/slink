import { Platform, URLError } from './types.js';

/**
 * Validate and normalize URL
 */
export function validateURL(url: string): { platform: Platform; normalizedUrl: string } {
  if (!url || typeof url !== 'string') {
    throw new URLError('URL must be a non-empty string');
  }

  const urlLower = url.toLowerCase();

  // Check Instagram
  if (urlLower.includes('instagram.com')) {
    return {
      platform: 'instagram',
      normalizedUrl: normalizeInstagramURL(url),
    };
  }

  // Check Facebook
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com') || urlLower.includes('fb.watch')) {
    return {
      platform: 'facebook',
      normalizedUrl: normalizeFacebookURL(url),
    };
  }

  throw new URLError('Unsupported platform. Only Instagram and Facebook are supported');
}

/**
 * Normalize Instagram URL
 */
function normalizeInstagramURL(url: string): string {
  // Remove query parameters
  const cleanUrl = url.split('?')[0];
  
  // Ensure it ends with /
  return cleanUrl.endsWith('/') ? cleanUrl : cleanUrl + '/';
}

/**
 * Normalize Facebook URL
 */
function normalizeFacebookURL(url: string): string {
  // Handle fb.watch redirects
  if (url.includes('fb.watch')) {
    return url;
  }

  // Remove query parameters except video ID
  const urlObj = new URL(url);
  const videoId = urlObj.searchParams.get('v');
  
  if (videoId) {
    return `https://www.facebook.com/watch/?v=${videoId}`;
  }

  return url.split('?')[0];
}

/**
 * Extract shortcode from Instagram URL
 */
export function extractInstagramShortcode(url: string): string | null {
  const patterns = [
    /instagram\.com\/p\/([^/?]+)/,
    /instagram\.com\/reel\/([^/?]+)/,
    /instagram\.com\/tv\/([^/?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract video ID from Facebook URL
 */
export function extractFacebookVideoId(url: string): string | null {
  const patterns = [
    /facebook\.com\/watch\/?\?v=(\d+)/,
    /facebook\.com\/.*\/videos\/(\d+)/,
    /fb\.watch\/([^/?]+)/,
    /facebook\.com\/video\.php\?v=(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (!num || num < 0) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  if (!text) return [];
  
  const hashtagPattern = /#(\w+)/g;
  const matches = text.match(hashtagPattern);
  
  return matches ? matches.map(tag => tag.slice(1)) : [];
}

/**
 * Extract mentions from text
 */
export function extractMentions(text: string): string[] {
  if (!text) return [];
  
  const mentionPattern = /@(\w+)/g;
  const matches = text.match(mentionPattern);
  
  return matches ? matches.map(mention => mention.slice(1)) : [];
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await sleep(delay * (i + 1));
      }
    }
  }

  throw lastError!;
}

/**
 * Parse JSON safely
 */
export function safeJSONParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Clean text (remove extra whitespace, newlines, etc.)
 */
export function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .trim();
}
