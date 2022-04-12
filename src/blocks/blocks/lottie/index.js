/**
 * External dependencies
 */
import { video as icon } from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorAdvancedControls } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit.js';
import save from './save.js';

const { name } = metadata;

registerBlockType( name, {
	...metadata,
	title: __( 'Lottie Animation', 'otter-blocks' ),
	description: __( 'Add Lottie animations to your WordPress.', 'otter-blocks' ),
	icon,
	keywords: [
		'media',
		'lottie',
		'animation'
	],
	edit,
	save
});

const lottieAdvancedControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		const { attributes, setAttributes, isSelected } = props;
		return (
			<Fragment>
				<BlockEdit {...props} />
				{ isSelected && ( 'themeisle-blocks/lottie' === props.name ) &&
				<InspectorAdvancedControls>
					<TextControl
						label={ __( 'Aria Label', 'otter-blocks' ) }
						help={ __( 'Describe the purpose of this animation on the page.', 'otter-blocks' ) }
						value={ attributes.ariaLabel }
						onChange={ value => setAttributes({ ariaLabel: value })}
					/>
				</InspectorAdvancedControls>
				}
			</Fragment>
		);
	};
}, 'coverAdvancedControls' );

addFilter(
	'editor.BlockEdit',
	'themeisle-blocks/lottie',
	lottieAdvancedControls
);
