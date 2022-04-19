/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	RangeControl,
	ToggleControl
} from '@wordpress/components';

import { InspectorControls } from '@wordpress/block-editor';

import { Fragment } from '@wordpress/element';

const Edit = ({
	BlockEdit,
	props
}) => {
	const toggleMasonry = () => {
		const isMasonry = ! props.attributes.isMasonry;
		props.setAttributes({ isMasonry });
	};

	const changeMargin = value => {
		props.setAttributes({ margin: value });
	};

	return (
		<Fragment>
			<InspectorControls>
				<PanelBody
					title={ __( 'Masonry', 'otter-blocks' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Masonry Layout', 'otter-blocks' ) }
						help={ __( 'Toggle on to transform your boring gallery to an exciting masonry layout. It should be noted that the masonry layout only works in the frontend.', 'otter-blocks' ) }
						checked={ props.attributes.isMasonry }
						onChange={ toggleMasonry }
					/>

					{ props.attributes.isMasonry && (
						<RangeControl
							label={ __( 'Margin', 'otter-blocks' ) }
							value={ props.attributes.margin }
							onChange={ changeMargin }
							min={ 0 }
							max={ 20 }
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<BlockEdit { ...props } />
		</Fragment>
	);
};

export default Edit;
