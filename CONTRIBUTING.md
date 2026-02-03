# Contributing to Social Media Scraper

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Be patient with questions

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported
2. Ensure you're using the latest version
3. Test with different URLs if applicable

**Bug Report Template:**
```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Node version:
- Package version:
- Platform (Instagram/Facebook):
- OS:

**Additional Context:**
Any other relevant information
```

### Suggesting Features

**Feature Request Template:**
```markdown
**Feature Description:**
Clear description of the proposed feature

**Use Case:**
Why is this feature needed?

**Proposed Solution:**
How would you implement it?

**Alternatives:**
Other solutions you've considered
```

### Pull Requests

1. **Fork** the repository
2. **Clone** your fork
   ```bash
   git clone https://github.com/yourusername/social-media-scraper.git
   cd social-media-scraper
   ```

3. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary
   - Update documentation

6. **Test your changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

7. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   ```

   **Commit Message Format:**
   - `Add: new feature`
   - `Fix: bug description`
   - `Update: what was updated`
   - `Refactor: what was refactored`
   - `Docs: documentation changes`

8. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Submit!

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Git

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/social-media-scraper.git
cd social-media-scraper

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### Project Structure

```
social-media-scraper/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types.ts              # Type definitions
│   ├── utils.ts              # Utility functions
│   └── scrapers/
│       ├── instagram.ts      # Instagram scraper
│       └── facebook.ts       # Facebook scraper
├── dist/                     # Compiled output
├── examples/                 # Usage examples
├── tests/                    # Test files
└── package.json
```

## Code Style

### TypeScript

- Use TypeScript for all source code
- Define interfaces for all data structures
- Use explicit return types for functions
- Avoid `any` type when possible

**Example:**
```typescript
// Good
async function scrape(url: string): Promise<VideoMetadata> {
  // ...
}

// Avoid
async function scrape(url: any): Promise<any> {
  // ...
}
```

### Naming Conventions

- **Variables/Functions**: camelCase
  ```typescript
  const videoUrl = 'https://...';
  function extractMetadata() {}
  ```

- **Classes**: PascalCase
  ```typescript
  class InstagramScraper {}
  ```

- **Constants**: UPPER_SNAKE_CASE
  ```typescript
  const MAX_RETRIES = 3;
  ```

- **Interfaces/Types**: PascalCase
  ```typescript
  interface VideoMetadata {}
  type Platform = 'instagram' | 'facebook';
  ```

### Code Organization

1. **Imports** - Group and order logically
   ```typescript
   // External dependencies
   import axios from 'axios';
   
   // Internal modules
   import { validateURL } from './utils.js';
   import { VideoMetadata } from './types.js';
   ```

2. **Functions** - Single responsibility
   ```typescript
   // Good - does one thing
   function extractVideoURL(html: string): string | null {
     // ...
   }
   
   // Avoid - does too many things
   function extractAndDownloadVideo(html: string) {
     // extracts, downloads, saves...
   }
   ```

3. **Comments** - Explain why, not what
   ```typescript
   // Good - explains reasoning
   // Retry with exponential backoff to handle rate limiting
   await retry(fetchData, 3, 1000);
   
   // Avoid - obvious
   // Call retry function
   await retry(fetchData, 3, 1000);
   ```

### Error Handling

Always use custom error types:

```typescript
// Good
throw new URLError('Invalid Instagram URL');

// Avoid
throw new Error('Invalid URL');
```

Catch and handle errors appropriately:

```typescript
try {
  const data = await fetchData();
  return data;
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network errors
  }
  throw error;
}
```

## Testing

### Writing Tests

Create tests in `tests/` directory:

```typescript
import { validateURL } from '../src/utils';

describe('validateURL', () => {
  test('should validate Instagram URL', () => {
    const result = validateURL('https://www.instagram.com/p/XXXXX/');
    expect(result.platform).toBe('instagram');
  });

  test('should throw error for invalid URL', () => {
    expect(() => validateURL('invalid')).toThrow(URLError);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="validateURL"

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

## Documentation

### Code Documentation

Use JSDoc comments for public APIs:

```typescript
/**
 * Download video from Instagram or Facebook
 * @param url - Video URL from Instagram or Facebook
 * @param options - Download options
 * @returns Download result with buffer and metadata
 * @throws {URLError} If URL is invalid
 * @throws {NetworkError} If download fails
 * 
 * @example
 * ```typescript
 * const result = await scraper.download('https://instagram.com/p/XXX/');
 * fs.writeFileSync('video.mp4', result.buffer);
 * ```
 */
async download(url: string, options?: DownloadOptions): Promise<DownloadResult> {
  // ...
}
```

### README Updates

When adding new features, update:
- Features list
- API documentation
- Examples
- Table of contents

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create git tag
5. Push to GitHub
6. Create GitHub release
7. Publish to NPM

## Questions?

- Open an issue for questions
- Join discussions in GitHub Discussions
- Email: your.email@example.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
