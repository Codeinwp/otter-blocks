/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import { clamp } from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes,
	onHeightChange
}) => {

	const onPercentageChange = value => {
		if ( value === undefined ) {
			return ;
		}
		value = clamp( value, 0, 100 );
		setAttributes({ percentage: value });
	};

	const selectTitleStyle = value => {
		setAttributes({ titleStyle: value });
	};

	const onStrokeWidthChange = value => {
		setAttributes({ strokeWidth: value });
	};

	const onBackgroundColorChange = value => {
		setAttributes({ backgroundColor: value });
	};

	const onProgressColorChange = value => {
		setAttributes({ progressColor: value });
	};

	const onDurationChange = value => {
		if ( value === undefined ) {
			return ;
		}

		value = clamp( value, 0, 3 );
		setAttributes({ duration: value });
	};

	const onTitleColorChange = value => {
		setAttributes({ titleColor: value });
	};

	const onFontSizePercentChange = value => {
		setAttributes({ fontSizePercent: value });
	};

	const onFontSizeTitleChange = value => {
		setAttributes({ fontSizeTitle: value });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<RangeControl
					label={ __( 'Percentage', 'otter-blocks' ) }
					help={ __( 'The value of the counter.', 'otter-blocks' ) }
					value={ attributes.percentage }
					onChange={ onPercentageChange }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Duration', 'otter-blocks' ) }
					help={ __( 'The duration of the animation.', 'otter-blocks' ) }
					value={ attributes.duration }
					onChange={ onDurationChange }
					min={ 0 }
					max={ 3 }
					step={ 0.1 }
				/>

				<SelectControl
					label={ __( 'Title Style', 'otter-blocks' ) }
					value={ attributes.titleStyle }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: 'default' },
						{ label: __( 'Hide', 'otter-blocks' ), value: 'hide' },
						{ label: __( 'Bottom', 'otter-blocks' ), value: 'bottom' }
					] }
					onChange={ selectTitleStyle }
				/>
	   		</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
			>
				<RangeControl
					label={ __( 'Height', 'otter-blocks' ) }
					help={ __( 'The height of the circle counter.', 'otter-blocks' ) }
					value={ attributes.height }
					onChange={ onHeightChange }
					min={ 0 }
					max={ 240 }
				/>

				<RangeControl
					label={ __( 'Circle Thickness', 'otter-blocks' ) }
					help={ __( 'Change the thickness (stroke width) of the circle.', 'otter-blocks' ) }
					value={ attributes.strokeWidth }
					onChange={ onStrokeWidthChange }
					initialPosition={ 10 }
					min={ 0 }
					max={ 20 }
				/>

				<RangeControl
					label={ __( 'Font Size Title', 'otter-blocks' ) }
					help={ __( 'Change the font size of the title.', 'otter-blocks' ) }
					value={ attributes.fontSizeTitle }
					onChange={ onFontSizeTitleChange }
					initialPosition={ 37 }
					min={ 0 }
					max={ Math.round( attributes.height  * 0.60 ) }
				/>

				<RangeControl
					label={ __( 'Font Size Percent', 'otter-blocks' ) }
					help={ __( 'Change the font size of the inner text.', 'otter-blocks' ) }
					value={ attributes.fontSizePercent }
					onChange={ onFontSizePercentChange }
					initialPosition={ 27 }
					min={ 0 }
					max={ Math.round( attributes.height  * 0.27 ) }
				/>

				{ ( 'hide' !== attributes.titleStyle ) && (
					<ColorGradientControl
						label={ __( 'Title Color', 'otter-blocks' ) }
						colorValue={ attributes.titleColor }
						onColorChange={ onTitleColorChange }
					/>
				) }

				<ColorGradientControl
					label={ __( 'Progress Color', 'otter-blocks' ) }
					colorValue={ attributes.progressColor }
					onColorChange={ onProgressColorChange }
				/>

				<ColorGradientControl
					label={ __( 'Background Color', 'otter-blocks' ) }
					colorValue={ attributes.backgroundColor }
					onColorChange={ onBackgroundColorChange }
				/>
			</PanelBody>
	   </InspectorControls>
	);
};

export default Inspector;
