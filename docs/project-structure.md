# The Everlasting Otter

As time goes by, the project grows and evolves. The codebase becomes more complex. It's important to keep the project organized and easy to understand for everyone.

## Project structure

- `docs/` contains the documentation of the project
- `src/` contains the source code of the project (mainly JS & SCSS files)
  - `blocks/` the JS & SCSS files for Otter Blocks plugin
    - `components/` contains reusable components
    - `blocks/`  blocks definition and functionality
    - `frontend/` script that add functionality for the end user. E.g.: opening tabs in accordion, sending form to the backend for Form Block.
    - `plugins/` global features: Global Defaults, Sticky Blocks, Copy & Paste Styles, Dynamic Content & Conditions
    - `helpers/` utility functions: Add an ID to the block, Google Fonts loader.
    - `test` contains the test files for the blocks
  - `css/` contains the CSS files for Custom CSS plugin
  - `animation/` contains the JS & SCSS files for Animation plugin
  - `dashboard/` contains the JS & SCSS files for Otter Dashboard (in WP: Tools > Otter )
  - `export-import/` contains the JS & SCSS files for Export/Import Block plugin
  - `pro/` contains the JS & SCSS files for Otter Pro plugin
    - `blocks/` Pro blocks source files
    - `components/` reusable components
    - `dashboard/` dashboard extension with Pro features
    - `helpers/` utility functions
    - `plugins/` Pro features for Blocks: Dynamic Content & Conditions, Sticky options, Countdown options, Live Search, etc.
    - `woocommerce/` WooCommerce features and extensions
- `inc/` contains the PHP files for all plugins
  - `css/` CSS dynamic generator for Blocks. It's used to generate the CSS for the blocks based on the user settings.
  - `integration/` Form Block utilities
  - `patterns/` contains the patterns for the Pattern Library
  - `plugins/` plugins functionality: Dynamic Content & Conditions, Stripe, WordPress Options definitions for Rest API, etc.
  - `render/` render classes for dynamic blocks (e.g.: Form File Field, Google/Leaflet Map, Plugin Card, Stripe Checkout, etc.)
  - `server/` WP REST API endpoints: Form Block, Dynamic Content & Conditions, Stripe, etc.
- `plugins/` contains PHP files for other plugins
  - `blocks-css/` Custom CSS plugin
  - `blocks-animation/` Animation plugin
  - `blocks-export-import/` Export/Import Block plugin
  - `otter-pro/` Otter Pro plugin
    - `css/` CSS dynamic generator for Pro blocks
    - `plugins/` Pro features for Blocks: Dynamic Content & Conditions, Sticky options, Countdown options, Live Search, etc.
    - `render/` render classes for dynamic blocks: WooCommerce
    - `server/` WP REST API endpoints: Live Search

## Tips on navigation

If you are working on Form block: `./src/blocks/blocks/form/`, `./inc/integrations/` and `./inc/server/class-form-server.php` are the main hot spots.

Dealing with the CSS generation? `./inc/css/` are the main files.

PHP loading related issues: `./inc/class-registration.php` is the main file.

Add PHP functionality only for Otter Pro: `./plugins/otter-pro/` is the main folder.

JS is not working on frontend for a block: `./src/blocks/frontend/`

Add a new tab in Global Default interface for a block: `./src/blocks/plugins/options/global-defaults/controls`

Add a new options in WordPress Options Settings: `./inc/plugins/class-options-settings.php`

When you make a PHP file and don't know where to hook it up (make it visible to others) look at how similar file do it. API Endpoint? `./inc/server/`. CSS Generator? `./inc/css/`. Dynamic block rendering? `./inc/render/`.