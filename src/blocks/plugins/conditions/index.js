/**
 * WordPress dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { assign } from 'lodash';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import './editor.scss';
import Edit from './edit.js';

const addAttribute = ( props ) => {
	props.attributes = assign( props.attributes, {
		otterConditions: {
			type: 'array',
			default: []
		}
	});

	return props;
};

const withConditions = createHigherOrderComponent( BlockEdit => {
	return ( props ) => {
		return (
			<Fragment>
				<BlockEdit { ...props } />
				<Edit { ...props } />
			</Fragment>
		);
	};
}, 'withMasonryExtension' );

const withConditionsIndicator = createHigherOrderComponent( BlockListBlock => {
	return ( props ) => {
		return (
			<BlockListBlock
				{ ...props }
				className={ classnames(
					{
						'otter-has-condition': props.attributes.otterConditions && Boolean( props.attributes.otterConditions.length )
					}
				) }
			/>
		);
	};
}, 'withMasonryExtension' );

if ( Boolean( window.themeisleGutenberg.hasModule.blockConditions ) ) {
	addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/conditions-register', addAttribute );
	addFilter( 'editor.BlockEdit', 'themeisle-gutenberg/conditions-inspector', withConditions );
	addFilter( 'editor.BlockListBlock', 'block-visibility/contextual-indicators', withConditionsIndicator );
}
