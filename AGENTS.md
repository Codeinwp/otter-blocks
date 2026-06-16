# Agent Workflow (Compressed)

## Repo + Scope

Otter Blocks monorepo:
- Free plugin: `otter-blocks.php`
- Pro: `plugins/otter-pro/`
- Sister plugins: `plugins/blocks-animation/`, `plugins/blocks-css/`, `plugins/blocks-export-import/`

Namespace: `ThemeIsle\GutenbergBlocks`  
Minimums: WordPress `6.2+`, PHP `7.4+` (Composer platform target).

## Read First

- Use `./docs/` for feature workflow/context before edits.
- Prefer behavior-first changes + tests.

## Core Commands

```bash
# Setup
npm ci && composer install

# Dev/build
npm run start
npm run dev:lite
npm run dev:pro
npm run build
npm run prod:lite
npm run prod:pro
npm run prod:grunt
npm run plugins

# JS tests
npm run test:unit
npm run test:unit:watch

# PHP tests
npm run test:unit:php
npm run test:unit:php:base
npm run test:unit:php:multisite

# E2E/perf
npm run test:e2e:playwright
npm run test:e2e:playwright:serial
npm run test:e2e:playwright:parallel
npm run test:e2e:playwright-ui
npm run test:performance

# Lint/format
npm run lint
npm run format
composer run lint
composer run format
composer run phpstan
```

Configs:
- Playwright: `src/blocks/test/e2e/playwright.config.js`
- PHPUnit: `phpunit.xml`, `phpunit/multisite.xml`
- wp-env: `.wp-env.json` + gitignored `.wp-env.override.json`

## wp-env Instance (Ports + Multi-Checkout)

Single environment (`"testsEnvironment": false`): one `wordpress`/`cli`/`mysql` container set serves dev and all test suites. Never use `tests-wordpress`/`tests-cli` in `wp-env run`, never add `testsPort`/`env.tests` config (deprecated in wp-env >= 11).

```bash
npm run env:start    # reuse running instance, or pick a free port + start
npm run env:stop
npm run env:cleanup  # remove THIS checkout's containers/volumes (run before deleting a worktree)
```

`env:start` (`bin/wp-env-up.js`) handles everything: reuses a running instance, otherwise probes for a free port (default `8888`, scans upward) and pins it in the gitignored `.wp-env.override.json`. The Playwright configs read the same override file, so `npm run test:e2e:playwright` / `test:performance` follow the pinned port with no env var. Port precedence everywhere: `WP_BASE_URL` > `WP_ENV_PORT` > `.wp-env.override.json` > `8888`.

If `env:start` is unavailable, the manual steps it automates:

1. `npx wp-env status --json` — `"status": "running"` means reuse it; do not start a second one. (`wp-env install-path` was removed in wp-env >= 11 and exits 0 silently — don't use it for detection.)
2. Pick a free port (`nc -z localhost <port>`; exit 0 = taken), pin it in `.wp-env.override.json` as `{ "port": <port> }`, then `npm run wp-env start`.

Notes: `afterStart` (`bin/e2e-tests.sh`) seeds the AI key option. PHPUnit runs in the same instance (`wp-env run wordpress …`, PHPUnit lib mounted with `WP_TESTS_DIR` preset). Containers are namespaced per checkout — only host ports can conflict. Each worktree needs its own `npm ci && composer install && npm run build`. Login: `admin`/`password`. The root `docker-compose.yml` is legacy, not wp-env — ignore it.

## E2E Rules (Important)

- Split:
  - `chromium-serial`: specs from `SERIAL_SPECS`, `workers: 1`
  - `chromium-parallel`: everything else, workers from `E2E_WORKERS` (`CI ? 4 : 2`)
- Add to `SERIAL_SPECS` only if shared WP state cannot be isolated (global options, auth/users, editor/theme global state, external state).
- Do **not** use `test.describe.configure({ mode: 'serial' })` to force file-level serial; project split handles this.
- Parallel-safe specs:
  - no broad cleanup (`deleteAllPosts()`, `deleteAllMedia()`)
  - create/clean only test-local resources
  - do not depend on other specs
  - prefer user-facing selectors (`getByRole`, labels, visible text)
- CI: install Chromium and set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true`.

## TDD + Test Quality

- Use red -> green -> refactor loops.
- Add one behavior test, fail first, implement minimum fix, repeat.
- Keep tests on public behavior (editor/frontend/REST/public helpers), not private internals.

## Architecture Quick Map

- Build:
  - `webpack.config.js` (lite/main)
  - `webpack.config.pro.js` (pro)
  - `webpack.config.plugins.js` (sister plugins)
  - `Gruntfile.js` (SASS + version tasks)
- Block registry: `blocks.json` (used by webpack + Grunt, includes `isPro`)

PHP (`inc/`):
- bootstrap/registration: `class-main.php`, `class-registration.php`, `class-pro.php`, `class-patterns.php`
- feature dirs: `css/`, `plugins/`, `render/`, `server/`, `integrations/`

JS (`src/`):
- blocks: `src/blocks/blocks/`
- shared: `src/blocks/components/`, `src/blocks/helpers/`
- editor plugins: `src/blocks/plugins/`
- frontend scripts: `src/blocks/frontend/`
- pro: `src/pro/`
- dashboard/onboarding: `src/dashboard/`, `src/onboarding/`
- sister plugins: `src/animation/`, `src/css/`, `src/export-import/`

## Conventions

- Text domains: `otter-blocks`, `otter-pro`, `blocks-animation`, `blocks-css`, `blocks-export-import`
- JS/PHP: tabs; JS uses single quotes + semicolons.
- Block namespace: `themeisle-blocks/<name>`
- PHP class files: `class-<name>.php`
- Dist: `npm run dist` (`bin/dist.sh`, `.distignore` filters)

## PHP Bug-Fix Checklist

1) Write failing test (TDD)  
2) Implement smallest fix  
3) Run: `composer run lint`, `composer run format`, `composer run phpstan`  
4) Run relevant tests again
