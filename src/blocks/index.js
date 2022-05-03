/**
 * WordPRess dependencies
 */
import { updateCategory } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';
import { otterIcon as icon } from './helpers/icons.js';

updateCategory( 'themeisle-blocks', { icon });
updateCategory( 'themeisle-woocommerce-blocks', { icon });
