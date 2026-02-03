# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-03

### Added
- Initial release
- Instagram video scraper with metadata extraction
- Facebook video scraper with metadata extraction
- TypeScript support with full type definitions
- Multiple fallback methods for reliable scraping
- Retry mechanism with configurable options
- Custom error types (URLError, NetworkError, ParseError)
- Download videos as Buffer
- Extract complete metadata (likes, comments, views, etc.)
- Support for Instagram posts, reels, and videos
- Support for Facebook videos and watch links
- Convenience functions for quick usage
- Comprehensive documentation and examples
- MIT License

### Features
- Get video metadata without downloading
- Download videos with metadata
- Get direct video URL
- Check if URL is supported
- Platform-specific scrapers
- Custom configuration options
- Hashtag and mention extraction (Instagram)
- Reaction counts (Facebook)
- TypeScript definitions

## [Unreleased]

### Planned
- Instagram Stories support
- Facebook Live video support
- Better rate limiting handling
- Proxy rotation support
- Video quality selection
- Progress callbacks for downloads
- Batch download optimization
- Cache system for metadata
- CLI tool
- Web scraping via Puppeteer as fallback

---

For more information, see the [README](README.md).
