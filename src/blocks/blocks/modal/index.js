/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

import { Placeholder } from '@wordpress/components';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import save from './save.js';
import { popupIcon as icon } from '../../helpers/icons';

const { name } = metadata;

if ( ! Boolean( window.themeisleGutenberg.hasPro ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Modal (PRO)', 'otter-blocks' ),
		description: __( 'Display your content in beautiful Modal with many customization options. Powered by Otter.', 'otter-blocks' ),
		icon,
		keywords: [
			'modal',
			'lightbox'
		],
		edit: () => {
			const instructions = sprintf(
				// translators: %1$s is the title of the block that requires Otter Pro activation.
				__( 'You need to activate your Otter Pro to use %1$s block.', 'otter-blocks' ),
				metadata.title
			);

			return (
				<div { ...useBlockProps() }>
					<Placeholder
						icon={ icon }
						label={ metadata.title }
						instructions={ instructions }
						className="o-license-warning"
					/>
				</div>
			);
		},
		save,
		example: {
			attributes: {}
		}
	});
}
