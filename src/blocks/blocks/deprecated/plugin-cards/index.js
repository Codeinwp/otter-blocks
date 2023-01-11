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

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Plugin Card', 'otter-blocks' ),
	description: __( 'Plugin Card block lets you display plugins data in your blog posts. Powered by Otter.', 'otter-blocks' ),
	icon: 'admin-plugins',
	keywords: [
		'plugin',
		'card',
		'orbitfox'
	],
	edit: () => {
		return (
			<div { ...useBlockProps() }>
				<Placeholder>
					{ __( 'This block has been deprecated. Please switch to a different plugin for a Plugin Card. For the time being, it will keep working on the frontend.', 'otter-blocks' ) }
					<br />
					<ExternalLink href="https://wordpress.org/plugins/wp-plugin-info-card/">{ __( 'We recommend WP Plugin Info Card.', 'otter-blocks' ) }</ExternalLink>
				</Placeholder>
			</div>
		);
	},
	save: () => null
});
