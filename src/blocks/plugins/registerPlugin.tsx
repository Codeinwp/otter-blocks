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
 * Load optional modules on demand, gated on their toggle, so they're only
 * fetched when enabled.
 *
 * `conditions` stays a static import above: its `blocks.registerBlockType`
 * filter must run before core blocks register, which an async chunk can't
 * guarantee. The modules below only add late-safe hooks, so deferring is fine.
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
