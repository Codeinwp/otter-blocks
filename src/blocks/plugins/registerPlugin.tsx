// @ts-nocheck

/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';
import { select } from '@wordpress/data';

import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import './editor.scss';
import { otterIcon } from '../helpers/icons.js';
import Options from './options/index.js';

import './conditions/index.js';
import './css-handler/index.js';
import './data/index.js';
import './data-logging/index.js';
import './data-logging/block-tracking.js';
import './galley-extension/index.js';
import './masonry-extension/index.js';
import './image-extension/index.js';
import './menu-icons/index.js';
import './keyboard-navigation/index.js';

// We disable the copy-paste plugin for now.
// import './copy-paste/index.js';
import './sticky/index.js';
import './welcome-guide/index.js';
import './feedback/index.js';
import './otter-tools-inspector/index';
import './live-search/index.js';
import './upsell-block/index.js';

/**
 * Optional modules are loaded on demand, gated on their settings toggle, so
 * their code is only downloaded and parsed when the module is enabled instead
 * of on every editor load.
 *
 * `conditions` is intentionally kept as a static import above: it registers a
 * `blocks.registerBlockType` attribute filter (`otterConditions`) that must be
 * in place before core blocks register during editor bootstrap — a timing an
 * async chunk cannot guarantee, and missing it would strip saved conditions.
 * The modules below only register late-safe hooks (RichText formats,
 * `editor.BlockEdit` / `editor.MediaUpload` filters), so deferring them is safe.
 */
if ( window.themeisleGutenberg?.hasModule?.dynamicContent ) {
	import( /* webpackChunkName: "dynamic-content" */ './dynamic-content/index.js' );
}

if ( window.themeisleGutenberg?.hasModule?.aiToolbar ) {
	import( /* webpackChunkName: "ai-content" */ './ai-content/index.tsx' );
}

const icon = <Icon icon={ otterIcon } />;

if ( Boolean( window.themeisleGutenberg?.isBlockEditor ) && select( 'core/editor' ) ) {
	registerPlugin( 'themeisle-blocks', {
		icon,
		render: Options
	});
}
