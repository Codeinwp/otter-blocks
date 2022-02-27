/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { hasBlockSupport } from '@wordpress/blocks';

import { PanelBody } from '@wordpress/components';

import { createHigherOrderComponent } from '@wordpress/compose';

import { InspectorControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
  * Internal dependencies.
  */
import './editor.scss';

import AnimationControls from './editor.js';
import './count/index.js';
import './typing/index.js';

const withInspectorControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const hasCustomClassName = hasBlockSupport(
			props.name,
			'customClassName',
			true
		);

		if ( hasCustomClassName && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PanelBody
							title={ __( 'Animations', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<AnimationControls
								clientId={ props.clientId }
								setAttributes={ props.setAttributes }
								attributes={ props.attributes }
							/>
						</PanelBody>
					</InspectorControls>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	};
}, 'withInspectorControl' );

addFilter(
	'editor.BlockEdit',
	'themeisle-custom-css/with-inspector-controls',
	withInspectorControls
);
