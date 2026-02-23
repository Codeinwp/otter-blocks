# E2E Test Setup Guide

This guide explains how to set up and run the end-to-end (e2e) tests for Otter Blocks.

## Prerequisites

1. **Docker**: Docker must be installed and running
   ```bash
   docker --version
   docker ps
   ```

2. **Node.js**: Node.js and npm must be installed
   ```bash
   node --version
   npm --version
   ```

3. **Network Access**: Internet connection is required to download WordPress and dependencies

## Setup Steps

### 1. Install Dependencies

```bash
npm ci
```

This installs all required packages including:
- `@wordpress/env` - WordPress environment manager
- `@playwright/test` - Playwright testing framework
- All other project dependencies

### 2. Install Playwright Browsers

```bash
npx playwright install chromium
```

This downloads the Chromium browser binary required for running tests.

### 3. Start WordPress Environment

```bash
npm run wp-env start
```

This command:
- Downloads WordPress (if not cached)
- Creates Docker containers
- Sets up a test WordPress site at http://localhost:8889
- Installs the Otter Blocks plugin
- Configures test themes and plugins

**Note**: First run may take 5-10 minutes to download WordPress and set up containers.

### 4. Build the Plugin

```bash
npm run build
```

Or for development builds:
```bash
npm run build-dev
```

### 5. Run E2E Tests

```bash
npm run test:e2e:playwright
```

Additional test commands:
- `npm run test:e2e:playwright-ui` - Run tests with Playwright UI
- `npm run test:performance` - Run performance tests

## Troubleshooting

### Network Issues

If you see errors about network unavailability:
```
✖ Could not find the current WordPress version in the cache and the network is not available.
```

**Solutions:**
1. Ensure you have internet connectivity
2. Check if your firewall allows Docker to access the internet
3. Try clearing the wp-env cache: `npm run wp-env clean all`

### Docker Issues

If Docker is not running:
```bash
# On Linux/Mac
sudo service docker start

# Or check Docker Desktop application
```

### Port Conflicts

If port 8889 is already in use, you can:
1. Stop the conflicting service
2. Change the port in `.wp-env.json` (update both `port` and `env.tests.port`)

### Reset Environment

To completely reset the test environment:
```bash
npm run wp-env clean all
npm run wp-env start
```

## Test Structure

- **E2E Tests**: `src/blocks/test/e2e/blocks/`
- **Test Configuration**: `src/blocks/test/e2e/playwright.config.js`
- **Test Theme**: `test/emptytheme/`
- **Test Plugins**: `packages/e2e-tests/plugins/`
- **MU Plugins**: `packages/e2e-tests/mu-plugins/`

## Configuration Files

- `.wp-env.json` - Base WordPress environment configuration
- `.wp-env.override.json` - Override configuration with additional settings
- `playwright.config.js` - Playwright test configuration

## Continuous Integration

In CI environments (GitHub Actions), the workflow:
1. Installs dependencies
2. Installs Playwright browsers
3. Starts wp-env
4. Builds the plugin
5. Runs e2e tests
6. Uploads test artifacts

See `.github/workflows/e2e-js.yml` for the complete CI configuration.

## Development Tips

### Watch Mode

For development, you can run tests in watch mode:
```bash
npx playwright test --config src/blocks/test/e2e/playwright.config.js --ui
```

### Debug Mode

To debug failing tests:
```bash
npx playwright test --config src/blocks/test/e2e/playwright.config.js --debug
```

### Specific Tests

To run a specific test file:
```bash
npx playwright test src/blocks/test/e2e/blocks/accordion.spec.js
```

### Screenshots and Videos

Test artifacts (screenshots, videos) are saved to:
- `artifacts/test-results/` - Test results and failure screenshots
- `artifacts/storage-states/` - Authentication state

## Common Issues

### Tests Failing After Code Changes

1. Rebuild the plugin: `npm run build`
2. Restart wp-env: `npm run wp-env restart`
3. Clear browser cache if needed

### Authentication Issues

The tests use stored authentication state. If you see login failures:
1. Check `artifacts/storage-states/admin.json` exists
2. Verify the global setup script runs: `src/blocks/test/e2e/global-setup.ts`

### Timeout Errors

If tests timeout, you can increase the timeout in `playwright.config.js`:
```javascript
timeout: 100_000, // 100 seconds (default)
```

## Getting Help

- Check test output for specific error messages
- Review test artifacts in `artifacts/` directory
- Check Docker logs: `docker logs <container-id>`
- Verify WordPress is running: http://localhost:8889

## Cleaning Up

After testing, to stop and remove containers:
```bash
npm run wp-env stop
```

To completely remove all wp-env data:
```bash
npm run wp-env destroy
```
