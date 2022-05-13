/**
 * WordPRess dependencies
 */
import { __ } from '@wordpress/i18n';

import { updateCategory } from '@wordpress/blocks';

import { Icon } from '@wordpress/components';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import {
	otterIcon,
	otterIconColored as icon
} from './helpers/icons.js';

updateCategory( 'themeisle-blocks', { icon });
updateCategory( 'themeisle-woocommerce-blocks', { icon });

const PoweredBy = () => {
	return (
		<div className="o-is-powered">{ __( 'Powered by Otter', 'otter-blocks' ) } { <Icon icon={ otterIcon } /> }</div>
	);
};

addFilter( 'otter.poweredBy', 'themeisle-gutenberg/powered-by-notice', PoweredBy );
