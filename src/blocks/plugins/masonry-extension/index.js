/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { assign } from 'lodash';

import { createHigherOrderComponent } from '@wordpress/compose';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Edit from './edit.js';

const addAttribute = ( props ) => {
	if ( 'core/gallery' === props.name ) {
		props.attributes = assign( props.attributes, {
			isMasonry: {
				type: 'boolean',
				default: false
			},
			margin: {
				type: 'number'
			}
		});
	}

	return props;
};

const withMasonryExtension = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( 'core/gallery' !== props.name || ! props.attributes?.isMasonry ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<Edit
				BlockEdit={ BlockEdit }
				props={ props }
			/>
		);
	};
}, 'withMasonryExtension' );

addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/masonry-extension-attributes', addAttribute );
addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/masonry-extension', withMasonryExtension );
