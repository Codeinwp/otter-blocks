/**
 * WordPress dependencies.
 */
import { assign } from 'lodash';

import { createHigherOrderComponent } from '@wordpress/compose';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Edit from './edit.js';

const addAttribute = props => {
	if ( 'core/image' === props.name ) {
		props.attributes = assign( props.attributes, {
			boxShadow: {
				type: 'boolean',
				default: false
			},
			boxShadowColor: {
				type: 'string',
				default: '#000000'
			},
			boxShadowColorOpacity: {
				type: 'number',
				default: 50
			},
			boxShadowBlur: {
				type: 'number',
				default: 5
			},
			boxShadowHorizontal: {
				type: 'number',
				default: 0
			},
			boxShadowVertical: {
				type: 'number',
				default: 0
			}
		});
	}

	return props;
};

const withImageExtension = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {
		if ( 'core/image' === props.name && props.attributes.url ) {
			return (
				<Edit
					BlockEdit={ BlockEdit }
					props={ props }
				/>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withImageExtension' );

addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/image-extension-attributes', addAttribute );
addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/image-extension', withImageExtension );
