# 📦 NPM Publishing Guide

This guide will help you publish the `social-media-scraper` package to NPM.

## Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **Node.js**: Version 16 or higher
3. **Git**: For version control

## Step-by-Step Publishing Process

### 1. Prepare Your Package

#### a. Update package.json

Make sure to update these fields in `package.json`:

```json
{
  "name": "social-media-scraper",
  "version": "1.0.0",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/social-media-scraper.git"
  }
}
```

**Important naming notes:**
- Package names must be unique on NPM
- Check if your name is available: `npm search social-media-scraper`
- Consider scoped packages: `@yourname/social-media-scraper`

#### b. Build the project

```bash
npm install
npm run build
```

This will:
- Install dependencies
- Compile TypeScript to JavaScript
- Generate type definitions in `dist/` folder

#### c. Test locally

Before publishing, test your package locally:

```bash
# In your package directory
npm link

# In another project
npm link social-media-scraper

# Test it
node test-script.js
```

### 2. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included. Verify:
- ✅ `dist/` folder is included
- ✅ `README.md` is included
- ✅ `LICENSE` is included
- ❌ `src/` folder is excluded (via .npmignore)
- ❌ `node_modules/` is excluded

### 3. Login to NPM

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify login:
```bash
npm whoami
```

### 4. Publish to NPM

#### First time publishing:

```bash
npm publish
```

#### If using a scoped package:

```bash
# Public scoped package
npm publish --access public

# Private scoped package (requires paid account)
npm publish --access restricted
```

### 5. Verify Publication

1. **Check on NPM**: Visit `https://www.npmjs.com/package/social-media-scraper`
2. **Test installation**:
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install social-media-scraper
   ```

3. **Test usage**:
   ```javascript
   import { SocialMediaScraper } from 'social-media-scraper';
   const scraper = new SocialMediaScraper();
   console.log('Package works!');
   ```

## Updating Your Package

### Versioning

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.0 → 1.0.1): Bug fixes
  ```bash
  npm version patch
  ```

- **Minor** (1.0.0 → 1.1.0): New features (backwards compatible)
  ```bash
  npm version minor
  ```

- **Major** (1.0.0 → 2.0.0): Breaking changes
  ```bash
  npm version major
  ```

### Publishing an update

```bash
# 1. Make your changes
# 2. Update version
npm version patch  # or minor, or major

# 3. Build
npm run build

# 4. Publish
npm publish

# 5. Push git tags
git push && git push --tags
```

## Best Practices

### Before Publishing

- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Update CHANGELOG.md
- [ ] Update version in package.json
- [ ] Update README if needed
- [ ] Commit all changes
- [ ] Create git tag: `git tag v1.0.0`

### Documentation

- [ ] Clear README with examples
- [ ] API documentation
- [ ] License file (MIT)
- [ ] Changelog
- [ ] Contributing guidelines (optional)

### Package Quality

- [ ] Add keywords for discoverability
- [ ] Include TypeScript definitions
- [ ] Minimize package size
- [ ] Add badges to README
- [ ] Set up CI/CD (optional)

## Common Issues

### "Package name already exists"

Solutions:
1. Choose a different name
2. Use a scoped package: `@yourname/package-name`
3. Check available names: `npm search your-package-name`

### "You must verify your email"

Go to npmjs.com and verify your email address

### "403 Forbidden"

- Check if you're logged in: `npm whoami`
- Make sure you have permission to publish
- For scoped packages, use `--access public`

### Files not included in package

- Check `.npmignore`
- Verify with: `npm pack --dry-run`
- Make sure `dist/` is built before publishing

## Unpublishing (Emergency Only)

⚠️ **WARNING**: Unpublishing is permanent and affects all users!

Only unpublish if absolutely necessary (security issues, etc.):

```bash
# Unpublish specific version
npm unpublish social-media-scraper@1.0.0

# Unpublish entire package (only within 72 hours)
npm unpublish social-media-scraper --force
```

**Better alternative**: Deprecate instead:

```bash
npm deprecate social-media-scraper@1.0.0 "Security issue, please upgrade to 1.0.1"
```

## Automation with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Maintenance

### Regular updates

1. **Dependencies**: Update regularly
   ```bash
   npm update
   npm outdated
   ```

2. **Security**: Check for vulnerabilities
   ```bash
   npm audit
   npm audit fix
   ```

3. **Issues**: Respond to GitHub issues
4. **Pull Requests**: Review and merge PRs
5. **Documentation**: Keep README current

## Quick Checklist

```bash
# 1. Prepare
npm install
npm run build
npm test

# 2. Version
npm version patch  # or minor/major

# 3. Verify
npm pack --dry-run

# 4. Login
npm login

# 5. Publish
npm publish

# 6. Verify
npm view social-media-scraper

# 7. Git
git push && git push --tags
```

## Resources

- [NPM Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [Package.json Guide](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

---

🎉 **Congratulations!** Your package is now published on NPM!

Users can install it with:
```bash
npm install social-media-scraper
```
