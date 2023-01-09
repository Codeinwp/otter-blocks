/**
 * WordPress dependencies.
 */
import classnames from 'classnames';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { assign } from 'lodash';

import { __experimentalToolsPanelItem as ToolsPanelItem } from '@wordpress/components';

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

const BlockConditions = ( el, props ) => {
	return (
		<Fragment>
			{ el }

			<ToolsPanelItem
				hasValue={ () => undefined !== props.attributes.otterConditions && Boolean( props.attributes.otterConditions?.length ) }
				label={ __( 'Visibility Conditions', 'otter-blocks' ) }
				onDeselect={ () => props.setAttributes({ otterConditions: undefined }) }
				isShownByDefault={ false }
			>
				<Edit { ...props } />
			</ToolsPanelItem>
		</Fragment>
	);
};

const withConditionsIndicator = createHigherOrderComponent( BlockListBlock => {
	return props => {
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
}, 'withConditionsIndicator' );

if ( Boolean( window.themeisleGutenberg.hasModule.blockConditions ) ) {
	addFilter( 'blocks.registerBlockType', 'themeisle-gutenberg/conditions-register', addAttribute );
	addFilter( 'otter.blockTools', 'themeisle-gutenberg/conditions-inspector', BlockConditions, 3 );
	addFilter( 'editor.BlockListBlock', 'themeisle-gutenberg/contextual-indicators', withConditionsIndicator );
}
