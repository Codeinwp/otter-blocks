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
import './galley-extension/index.js';
import './masonry-extension/index.js';
import './image-extension/index.js';
import './menu-icons/index.js';
import './copy-paste/index.js';
import './sticky/index.js';
import './dynamic-content/index.js';
import './welcome-guide/index.js';
import '../components/otter-tools/index';
import './feedback/index.js';
import './bf-deal/index.js';
import './otter-tools-inspector/index';

const icon = <Icon icon={ otterIcon } />;

if ( Boolean( window.themeisleGutenberg?.isBlockEditor ) && select( 'core/editor' ) ) {
	registerPlugin( 'themeisle-blocks', {
		icon,
		render: Options
	});
}
