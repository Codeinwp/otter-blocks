/**
 * WordPress dependencies
 */
import {
	filter,
	every
} from 'lodash';

import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block',
			isMultiBlock: true,
			blocks: [ 'core/image' ],
			transform: ( attributes ) => {
				let { align } = attributes[ 0 ];

				align = every( attributes, [ 'align', align ]) ? align : undefined;

				const validImages = filter( attributes, ({ url }) => url );

				return createBlock( 'themeisle-blocks/slider', {
					images: validImages.map( ({ id, url, alt, caption }) => ({
						id,
						url,
						alt,
						caption
					}) ),
					align
				});
			}
		},
		{
			type: 'block',
			blocks: [ 'core/gallery' ],
			transform: ({ images, align }, innerBlocks ) => {
				if ( window.themeisleGutenberg?.isLegacyPre59 ) {
					return createBlock( 'themeisle-blocks/slider', {
						images: images.map( ({ id, url, alt, caption }) => ({
							id,
							url,
							alt,
							caption
						}) ),
						align
					});
				}
				return createBlock( 'themeisle-blocks/slider', {
					images: innerBlocks.map( ({ attributes }) => ({
						id: attributes.id,
						url: attributes.url,
						alt: attributes.alt,
						caption: attributes.caption
					}) ),
					align
				});
			}
		}
	],
	to: [
		{
			type: 'block',
			blocks: [ 'core/image' ],
			transform: ({ images, align }) => {
				if ( 0 < images.length ) {
					return images.map( ({ id, url, alt, caption }) => createBlock( 'core/image', {
						id,
						url,
						alt,
						caption,
						align
					}) );
				}

				return createBlock( 'core/image', { align });
			}
		},
		{
			type: 'block',
			blocks: [ 'core/gallery' ],
			transform: ({ images, align }) => {
				if ( window.themeisleGutenberg?.isLegacyPre59 ) {
					return createBlock( 'core/gallery', {
						images: images.map( ({ id, url, alt, caption }) => ({
							id,
							url,
							alt,
							caption
						}) ),
						align
					});
				}
				return createBlock(
					'core/gallery',
					{ align },
					images.map( ({ id, url, alt, caption }) => createBlock(
						'core/image',
						{
							id,
							url,
							alt,
							caption,
							align
						}
					) )
				);
			}
		}
	]
};

export default transforms;
