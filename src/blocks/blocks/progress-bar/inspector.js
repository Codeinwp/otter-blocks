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
	SelectControl,
	TextControl
} from '@wordpress/components';

const Inspector = ({
	attributes,
	setAttributes,
	onHeightChange,
	heightMode,
	setHeightMode
}) => {
	const onTitleChange = value => {
		setAttributes({ title: value });
	};

	const onPercentageChange = value => {
		if ( value === undefined ) {
			return ;
		}
		value = clamp( value, 0, 100 );
		setAttributes({ percentage: value });
	};

	const onBorderRadiusChange = value => {
		setAttributes({ borderRadius: value });
	};

	const selectTitleStyle = value => {
		setAttributes({ titleStyle: value });
	};

	const selectPercentagePosition = value => {
		if ( heightMode.isAutomatic ) {
			heightMode.percentagePosition = value;
			setHeightMode({
				...heightMode
			});
		}

		setAttributes({ percentagePosition: value });
	};

	const onBackgroundColorChange = value => {
		setAttributes({ backgroundColor: value });
	};

	const onBarBackgroundColorChange = value => {
		setAttributes({ barBackgroundColor: value });
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

	const onPerncetageColorChange = value => {
		setAttributes({ percentageColor: value });
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<TextControl
					label={ __( 'Title', 'otter-blocks' ) }
					value={ attributes.title }
					onChange={ onTitleChange }
				/>

				<RangeControl
					label={ __( 'Percentage', 'otter-blocks' ) }
					help={ __( 'The value of the progress bar.', 'otter-blocks' ) }
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

				{ 30 <= attributes.height && (
					<SelectControl
						label={ __( 'Title Style', 'otter-blocks' ) }
						value={ attributes.titleStyle }
						options={ [
							{ label: __( 'Default', 'otter-blocks' ), value: 'default' },
							{ label: __( 'Highlight', 'otter-blocks' ), value: 'highlight' },
							{ label: __( 'Outer', 'otter-blocks' ), value: 'outer' }
						] }
						onChange={ selectTitleStyle }
					/>
				) }

				<SelectControl
					label={ __( 'Show Percentage', 'otter-blocks' ) }
					value={ attributes.percentagePosition }
					options={ [
						{ label: __( 'Default', 'otter-blocks' ), value: 'default' },
						{ label: __( 'Append', 'otter-blocks' ), value: 'append' },
						{ label: __( 'Tooltip', 'otter-blocks' ), value: 'tooltip' },
						{ label: __( 'Outer', 'otter-blocks' ), value: 'outer' },
						{ label: __( 'Hide', 'otter-blocks' ), value: 'hide' }
					] }
					onChange={ selectPercentagePosition }
				/>
		   		</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Height', 'otter-blocks' ) }
					help={ __( 'The height of the progress bar.', 'otter-blocks' ) }
					value={ attributes.height }
					onChange={ onHeightChange }
					min={ 0 }
					max={ 100 }
				/>

				<RangeControl
					label={ __( 'Border Radius', 'otter-blocks' ) }
					help={ __( 'Round the corners of the progress bar.', 'otter-blocks' ) }
					value={ attributes.borderRadius }
					onChange={ onBorderRadiusChange }
					initialPosition={ 5 }
					min={ 0 }
					max={ 35 }
				/>

				<ColorGradientControl
					label={ __( 'Progress Color', 'otter-blocks' ) }
					colorValue={ attributes.barBackgroundColor }
					onColorChange={ onBarBackgroundColorChange }
				/>

				<ColorGradientControl
					label={ __( 'Title Color', 'otter-blocks' ) }
					colorValue={ attributes.titleColor }
					onColorChange={ onTitleColorChange }
				/>

				<ColorGradientControl
					label={ __( 'Percentage Color', 'otter-blocks' ) }
					colorValue={ attributes.percentageColor }
					onColorChange={ onPerncetageColorChange }
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
