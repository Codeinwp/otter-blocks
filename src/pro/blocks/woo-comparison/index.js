/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	createBlock,
	getBlockTypes,
	registerBlockType
} from '@wordpress/blocks';

import { useBlockProps } from '@wordpress/block-editor';

import { Placeholder } from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';

const { name } = metadata;

const edit = ({
	clientId,
	attributes
}) => {
	const { replaceBlocks } = useDispatch( 'core/block-editor' );

	useEffect( () => {
		const blocks = getBlockTypes();

		if ( -1 !== blocks.findIndex( block => 'sparks/woo-comparison' === block.name ) ) {
			return replaceBlocks( clientId, [
				createBlock( 'sparks/woo-comparison', {
					...attributes
				})
			]);
		}
	}, []);

	return (
		<div { ...useBlockProps() }>
			<Placeholder>{ __( 'You need to install the latest version of Neve with Sparks for WooCommerce to use WooCommerce Comparison Table.', 'otter-blocks' ) }</Placeholder>
		</div>
	);
};

registerBlockType( name, {
	...metadata,
	title: __( 'WooCommerce Comparison Table', 'otter-blocks' ),
	description: __( 'A way to compare different WooCommerce products made on the website.', 'otter-blocks' ),
	icon: 'editor-table',
	keywords: [
		'woocommerce',
		'comparison',
		'table'
	],
	supports: {
		inserter: false
	},
	edit,
	save: () => null
});

