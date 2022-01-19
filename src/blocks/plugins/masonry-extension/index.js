/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { assign } from 'lodash';

import { registerBlockVariation } from '@wordpress/blocks';

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
	return ( props ) => {

		// We need to omit the uploading state of the images, because it can result in duplicated images
		const imagesUploading = props.attributes?.images?.some(
			( img ) => ! img.id && 0 === img.url?.indexOf( 'blob:' )
		);

		if ( 'core/gallery' === props.name && ! imagesUploading ) {
			console.log( 'Add masonry' );
			return (
				<Edit
					props={ props }
				>
					<BlockEdit { ...props } />
				</Edit>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withMasonryExtension' );

addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/masonry-extension-attributes', addAttribute );
addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/masonry-extension', withMasonryExtension );

registerBlockVariation( 'core/gallery', {
	name: 'themeisle-gutenberg/masonry',
	title: __( 'Masonry', 'otter-blocks' ),
	description: __( 'Display multiple images in a rich masonry layout.', 'otter-blocks' ),
	category: 'themeisle-blocks',
	attributes: {
		isMasonry: true
	}
});
