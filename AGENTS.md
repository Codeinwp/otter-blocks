# Agent Workflow 

## Project Overview

Otter Blocks is a WordPress Gutenberg blocks page builder plugin. It's a monorepo containing:
- **Otter Blocks** (main free plugin) — `otter-blocks.php`
- **Otter Pro** (premium extension) — `plugins/otter-pro/`
- **Blocks Animation** — `plugins/blocks-animation/`
- **Blocks CSS** — `plugins/blocks-css/`
- **Blocks Export/Import** — `plugins/blocks-export-import/`

Namespace: `ThemeIsle\GutenbergBlocks`. Requires WordPress 6.2+, PHP 7.4+ (platform target).

## Build & Development Commands

```bash
# Setup
npm ci && composer install

# Development (watch mode)
npm run start              # All configs with watch
npm run dev:lite           # Watch lite blocks only
npm run dev:pro            # Watch pro blocks only

# Production build
npm run build              # Full production build (all configs in parallel)
npm run prod:lite          # Lite blocks only
npm run prod:pro           # Pro blocks only
npm run prod:grunt         # SASS compilation via Grunt

# Sister plugins build
npm run plugins            # Build blocks-animation, blocks-css, blocks-export-import
```

## Testing

```bash
# JavaScript unit tests (Jest)
npm run test:unit
npm run test:unit:watch

# PHP unit tests (requires wp-env)
npm run test:unit:php           # Starts wp-env + runs PHPUnit
npm run test:unit:php:base      # PHPUnit only (if wp-env already running)
npm run test:unit:php:multisite # Multisite PHPUnit tests

# E2E tests (Playwright)
npm run test:e2e:playwright
npm run test:e2e:playwright:serial    # Serial-only specs
npm run test:e2e:playwright:parallel  # Parallel-safe specs
npm run test:e2e:playwright-ui  # With UI

# Performance tests
npm run test:performance
```

PHPUnit config: `phpunit.xml` (single-site), `phpunit/multisite.xml`.
Playwright config: `src/blocks/test/e2e/playwright.config.js`.

### Playwright E2E Split

The blocks E2E suite is split by Playwright project:

- `chromium-serial` runs specs listed in `SERIAL_SPECS` from `src/blocks/test/e2e/playwright.config.js` with `workers: 1`.
- `chromium-parallel` ignores those serial specs and runs the rest with `E2E_WORKERS` (`CI ? 4 : 2` by default).
- GitHub Actions runs `test:e2e:playwright:serial`, `test:e2e:playwright:parallel`, and `test:performance` as separate matrix jobs.

Keep specs in the parallel project by default. Add a spec to `SERIAL_SPECS` only when it mutates shared WordPress state that cannot be isolated, such as global options, active theme/editor state, users/auth state, or external service state. Do not add `test.describe.configure({ mode: 'serial' })` just to control file-level parallelism; the project split handles that.

For parallel-safe tests:

- Avoid broad cleanup helpers like `deleteAllPosts()` or `deleteAllMedia()` inside individual specs.
- Prefer test-local setup and cleanup: create the post/media/options needed by the test and remove only those resources when cleanup is necessary.
- Do not rely on another spec's created content or settings.
- Keep selectors user-facing where possible (`getByRole`, labels, visible text) and use block attributes only when validating saved block state.

`wp-scripts test-playwright` downloads all Playwright browsers unless `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` is set. CI installs Chromium explicitly with `npx playwright install --with-deps chromium` and sets `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true` when running matrix jobs.

### TDD Practices

Use vertical red-green-refactor cycles for behavior changes:

- Start with one behavior-focused test that uses the public interface.
- Run it and confirm it fails for the expected reason.
- Implement the smallest change that makes that test pass.
- Repeat one behavior at a time; do not write a large batch of speculative tests before implementation.
- Refactor only while tests are green, and rerun the relevant suite after each meaningful refactor.

Good tests in this repo should read like behavior specs. They should verify what users, WordPress APIs, block markup, REST endpoints, or public helpers do, not private implementation details. Avoid tests that mock internal collaborators, assert private function shape, or inspect storage directly when the behavior can be verified through the editor, frontend, REST API, or public PHP/JS interface.

## Linting & Formatting

```bash
# JavaScript
npm run lint               # ESLint check
npm run format             # ESLint autofix

# PHP
composer run lint          # PHPCS
composer run format        # PHPCBF
composer run phpstan       # PHPStan static analysis (uses phpstan.neon + baseline)
```

ESLint: WordPress preset with TypeScript (`eslint.config.cjs`). PHPCS: WordPress-Core/Docs/Extra + VIP-Go (`phpcs.xml`).

## Architecture

### Webpack Build Pipeline

Three webpack configs, all extending `@wordpress/scripts`:
- `webpack.config.js` — Lite: dashboard, onboarding, animation frontend, and all free blocks
- `webpack.config.pro.js` — Pro blocks and features
- `webpack.config.plugins.js` — Sister plugins (animation, CSS, export-import)

Grunt handles SASS compilation and version bumping (`Gruntfile.js`).

### Block Metadata Registry

`blocks.json` is the central manifest mapping every block to its `block.json` path and SCSS asset paths. Both webpack and Grunt read this file. Pro blocks are marked with `isPro: true`.

### PHP Structure (`inc/`)

- `class-main.php` — Singleton bootstrap, hooks, autoloading, SVG/MIME handling
- `class-registration.php` — Block registration (WordPress native), asset enqueue, block categories (`themeisle-blocks`, `themeisle-woocommerce-blocks`), lazy-load dependencies
- `class-pro.php` — Pro plugin loader
- `class-patterns.php` — Pattern library
- `css/` — CSS generation classes (`Block_Frontend`, `CSS_Handler`)
- `plugins/` — Feature modules: Block_Conditions, Dynamic_Content, Dashboard, Stripe_API, Template_Cloud
- `render/` — Dynamic block server-side renderers
- `server/` — REST API endpoints
- `integrations/` — Form provider integrations (email services)

### JavaScript Structure (`src/`)

- `src/blocks/blocks/` — Individual block implementations (edit.js, index.js, inspector.js, block.json)
- `src/blocks/components/` — Shared React components
- `src/blocks/frontend/` — Block frontend scripts (loaded on visitor-facing pages)
- `src/blocks/plugins/` — Editor plugins (conditions, CSS, animations, copy-paste styles)
- `src/blocks/helpers/` — Utility functions
- `src/pro/` — Pro block implementations
- `src/dashboard/` — Otter settings dashboard
- `src/onboarding/` — Onboarding wizard
- `src/animation/`, `src/css/`, `src/export-import/` — Sister plugin sources

### Development Environment

Uses `@wordpress/env` (wp-env). Config: `.wp-env.override.json`. Start with `npm run test:unit:php:setup` or `npx wp-env start`.

## Key Conventions

- Text domains: `otter-blocks`, `otter-pro`, `blocks-animation`, `blocks-css`, `blocks-export-import`
- Tab indentation (JS and PHP), single quotes, semicolons required (JS)
- Block namespace: `themeisle-blocks/<block-name>` (e.g., `themeisle-blocks/accordion`)
- PHP autoloading follows class file naming: `class-<name>.php`
- Distribution via `npm run dist` (runs `bin/dist.sh`, creates ZIP artifacts filtered by `.distignore`)
