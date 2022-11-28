/**
 * External dependencies
 */
import { registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import Edit from './edit.js';

const addAttribute = ( props ) => {
	if ( 'core/search' === props.name ) {
		props.attributes = assign( props.attributes, {
			isLive: {
				type: 'boolean',
				default: false
			},
			postTypes: {
				type: 'array'
			}
		});
	}

	return props;
};

const withLiveExtension = createHigherOrderComponent( BlockEdit => {
	return props => {
		if ( 'core/search' !== props.name ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<Edit
				BlockEdit={ BlockEdit }
				props={ props }
			/>
		);
	};
}, 'withLiveExtension' );

if ( ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) {
	addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/live-search-attributes', addAttribute );

	registerBlockVariation( 'core/search', {
		name: 'themeisle-gutenberg/live-search',
		title: __( 'Live Search', 'otter-blocks' ),
		description: __( 'this is a temporary description.', 'otter-blocks' ),
		category: 'themeisle-blocks',
		attributes: {
			buttonText: __( 'Search' ),
			label: __( 'Search' ),
			isLive: true
		}
	});
}

addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/live-search-extension', withLiveExtension );
