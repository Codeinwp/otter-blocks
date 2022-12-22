/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { createHigherOrderComponent } from '@wordpress/compose';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
  * Internal dependencies.
  */
import './editor.scss';

import AnimationControls from './editor.js';
import './count/index.js';
import './typing/index.js';

const excludedBlocks = [ 'themeisle-blocks/popup' ];

const withInspectorControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		const hasCustomClassName = hasBlockSupport(
			props.name,
			'customClassName',
			true
		);

		if ( hasCustomClassName && props.isSelected && ! excludedBlocks.includes( props.name ) ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />
					<AnimationControls
						clientId={ props.clientId }
						setAttributes={ props.setAttributes }
						attributes={ props.attributes }
					/>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

addFilter( 'editor.BlockEdit', 'themeisle-custom-css/with-inspector-controls', withInspectorControls );
