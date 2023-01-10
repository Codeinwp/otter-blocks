/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { registerBlockType } from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import {
	ExternalLink,
	Placeholder
} from '@wordpress/components';

/**
  * Internal dependencies
  */
import metadata from './block.json';
import { cartIcon as icon } from '../../helpers/icons.js';
import edit from './edit';

const { name } = metadata;

if ( ! Boolean( window.themeisleGutenberg.hasStripeAPI ) ) {
	registerBlockType( name, {
		...metadata,
		title: __( 'Stripe Checkout', 'otter-blocks' ),
		description: __( 'A Stripe Checkout to sell your products on your website without any hassle. Powered by Otter.', 'otter-blocks' ),
		icon,
		keywords: [
			'stripe',
			'checkout',
			'payment'
		],
		edit: () => {
			const blockProps = useBlockProps({
				className: 'is-placeholder'
			});

			return (
				<div { ...blockProps }>
					<Placeholder
						icon={ icon }
						label={ __( 'Stripe Checkout', 'otter-blocks' ) }
					>
						<p>
							{ __( 'You need to set your Stripe API keys in the Otter Dashboard.', 'otter-blocks' ) }
							{ ' ' }
							<ExternalLink href={ window.themeisleGutenberg.optionsPath }>{ __( 'Visit Dashboard', 'otter-blocks' ) }</ExternalLink>
						</p>
					</Placeholder>
				</div>
			);
		},
		save: () => null,
		supports: {
			html: false
		}
	});
} else {
	registerBlockType( name, {
		...metadata,
		title: __( 'Stripe Checkout', 'otter-blocks' ),
		description: __( 'A Stripe Checkout to sell your products on your website without any hassle. Powered by Otter.', 'otter-blocks' ),
		icon,
		keywords: [
			'stripe',
			'checkout',
			'payment'
		],
		edit,
		save: () => null,
		supports: {
			html: false
		}
	});
}
