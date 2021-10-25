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
import './wc-integration/index.js';
import './masonry-extension/index.js';
import './image-extension/index.js';

const icon = <Icon icon={ otterIcon } />;

if ( select( 'core/editor' ) ) {
	registerPlugin( 'themeisle-blocks', {
		icon,
		render: Options
	});
}
