/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { PanelBody } from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { InspectorControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import ImageGrid from './../../components/image-grid/index.js';

const withGalleryExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {
		const onSelectImages = images => {
			props.setAttributes({
				images: images.map( image => ({
					id: image.id,
					url: image.url,
					alt: image.alt,
					caption: image.caption
				}) )
			});
		};

		if ( 'core/gallery' === props.name ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />

					{ !! props.attributes.images.length && (
						<InspectorControls>
							<PanelBody
								title={ __( 'Images', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<ImageGrid
									attributes={ props.attributes }
									onSelectImages={ onSelectImages }
								/>
							</PanelBody>
						</InspectorControls>
					) }
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withGalleryExtension' );

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/gallery-extension', withGalleryExtension );

