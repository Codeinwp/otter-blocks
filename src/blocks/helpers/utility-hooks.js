/**
 * WordPress dependencies...
 */
import { useSelect } from '@wordpress/data';

import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { buildResponsiveGetAttributes, buildResponsiveSetAttributes, isColorDark } from './helper-functions.js';

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

/**
 * Utility hook to get/set dark background class.
 *
 * @param {string} backgroundColor - The background color.
 * @param {Object} attributes - The block attributes.
 * @param {Function} setAttributes - The setAttributes function from the block.
 * @param {string} className - The class name to add/remove.
 */
export const useDarkBackground = ( backgroundColor, attributes, setAttributes, className = 'has-dark-bg' ) => {
	useEffect( () => {
		const isDark = isColorDark( backgroundColor );

		if ( isDark && ! attributes?.className?.includes( className ) ) {
			let classes = attributes.className || '';
			classes = classes.split( ' ' );
			classes.push( className );
			classes = classes.join( ' ' ).trim();
			setAttributes({ className: classes });
		}

		if ( ! isDark && attributes?.className?.includes( className ) ) {
			setAttributes({ className: attributes.className.replace( className, '' ).trim() });
		}
	}, [ backgroundColor ]);
};
