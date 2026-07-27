#!/bin/sh

# Set-up the `wp_env` environment.
npm run wp-env run cli wp option set themeisle_open_ai_api_key "sk_XXXXXXXXXXXXXXXXXXXXXXXx" # Used by AI tools.
npm run wp-env run cli wp rewrite structure '/%postname%/' # Pretty permalinks: the e2e global-setup reads /wp-json/
npm run wp-env run cli wp transient delete _wc_activation_redirect # WooCommerce would hijack the first wp-admin visit with its setup wizard..