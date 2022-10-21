/**
 * WordPress dependencies...
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { buildResponsiveGetAttributes, buildResponsiveSetAttributes } from './helper-functions.js';

/**
 * Utiliy hook to get/set responsive attributes.
 *
 * @param {Function} setAttributes - The setAttributes function from the block.
 */
export const useResponsiveAttributes = ( setAttributes = () => {}) => useSelect( select => {
	const { getView } = select( 'themeisle-gutenberg/data' );
	const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
	const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

	return {
		responsiveSetAttributes: buildResponsiveSetAttributes( setAttributes, view ),
		responsiveGetAttributes: buildResponsiveGetAttributes( view )
	};
}, []);
