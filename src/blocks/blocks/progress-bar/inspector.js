/**
 * External dependencies
 */
import { clamp } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';


import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	BaseControl,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	FontSizePicker
} from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { InspectorHeader } from '../../components';
import { useTabSwitch } from '../../helpers/block-utility';


const defaultFontSizes = [
	{
		name: __( 'Small', 'otter-blocks' ),
		size: '0.875em',
		slug: 'small'
	},
	{
		name: __( 'Medium', 'otter-blocks' ),
		size: '1em',
		slug: 'medium'
	},
	{
		name: __( 'Large', 'otter-blocks' ),
		size: '1.125em',
		slug: 'large'
	},
	{
		name: __( 'XL', 'otter-blocks' ),
		size: '1.25em',
		slug: 'xl'
	}
];

/**
 *
 * @param {import('./types').ProgressBarInspectorProps} props
 * @return
 */
const Inspector = ({
	attributes,
	setAttributes,
	onHeightChange,
	heightMode,
	setHeightMode
}) => {

	const [ tab, setTab ] = useTabSwitch( attributes.id, 'settings' );

	const onPercentageChange = value => {
		if ( value === undefined ) {
			return ;
		}
		value = clamp( value, 0, 100 );
		setAttributes({ percentage: value });
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

	const onDurationChange = value => {
		if ( value === undefined ) {
			return ;
		}
		value = clamp( value, 0, 3 );
		setAttributes({ duration: value });
	};

	return (
		<InspectorControls>
			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			<div>
				{
					'settings' === tab && (
						<PanelBody
							title={ __( 'Options', 'otter-blocks' ) }
							initialOpen={ true }
						>
							<TextControl
								label={ __( 'Title', 'otter-blocks' ) }
								value={ attributes.title }
								onChange={ title => setAttributes({ title }) }
							/>

							<RangeControl
								label={ __( 'Percentage', 'otter-blocks' ) }
								help={ __( 'The value of the progress bar.', 'otter-blocks' ) }
								value={ attributes.percentage }
								onChange={ onPercentageChange }
								min={ 0 }
								max={ 100 }
							/>
						</PanelBody>
					)
				}
				{
					'style' === tab && (
						<Fragment>


							<PanelBody
								title={ __( 'Title and Percentage', 'otter-blocks' ) }
								initialOpen={ false }
							>
								{ 30 <= attributes.height && (
									<SelectControl
										label={ __( 'Title Style', 'otter-blocks' ) }
										value={ attributes.titleStyle }
										options={ [
											{ label: __( 'Default', 'otter-blocks' ), value: 'default' },
											{ label: __( 'Highlight', 'otter-blocks' ), value: 'highlight' },
											{ label: __( 'Outer', 'otter-blocks' ), value: 'outer' }
										] }
										onChange={ titleStyle => setAttributes({ titleStyle }) }
									/>
								) }

								<SelectControl
									label={ __( 'Percentage Style', 'otter-blocks' ) }
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

								{
									( ( 'outer' === attributes.titleStyle ) || ( 'tooltip' === attributes.percentagePosition && 'outer' === attributes.percentagePosition ) ) && (
										<BaseControl
											label={ __( 'Outer Text Font Size', 'otter-blocks' ) }
										>
											<FontSizePicker
												fontSizes={ defaultFontSizes }
												withReset
												value={ attributes.titleFontSize }
												onChange={ titleFontSize => setAttributes({ titleFontSize }) }
											/>
										</BaseControl>
									)
								}
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Color', 'otter-blocks' ) }
								colorSettings={ [
									{
										value: attributes.titleColor,
										onChange: titleColor => setAttributes({ titleColor }),
										label: __( 'Title', 'otter-blocks' )
									},
									{
										value: attributes.barBackgroundColor,
										onChange: barBackgroundColor => setAttributes({ barBackgroundColor }),
										label: __( 'Progress', 'otter-blocks' )
									},
									{
										value: attributes.percentageColor,
										onChange: percentageColor => setAttributes({ percentageColor }),
										label: __( 'Percentage', 'otter-blocks' )
									},
									{
										value: attributes.backgroundColor,
										onChange: backgroundColor => setAttributes({ backgroundColor }),
										label: __( 'Background', 'otter-blocks' )
									}
								] }
							>

							</PanelColorSettings>
							<PanelBody
								title={ __( 'Dimensions and Motion', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<RangeControl
									label={ __( 'Duration', 'otter-blocks' ) }
									help={ __( 'The duration of the animation.', 'otter-blocks' ) }
									value={ attributes.duration }
									onChange={ onDurationChange }
									min={ 0 }
									max={ 3 }
									step={ 0.1 }
								/>

								<RangeControl
									label={ __( 'Height', 'otter-blocks' ) }
									help={ __( 'The height of the progress bar.', 'otter-blocks' ) }
									value={ attributes.height }
									onChange={ onHeightChange }
									step={ 0.1 }
									min={ 5 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Border Radius', 'otter-blocks' ) }
									help={ __( 'Round the corners of the progress bar.', 'otter-blocks' ) }
									value={ attributes.borderRadius }
									onChange={ borderRadius => setAttributes({ borderRadius }) }
									step={ 0.1 }
									initialPosition={ 5 }
									min={ 0 }
									max={ 35 }
								/>
							</PanelBody>
						</Fragment>
					)
				}
			</div>


		</InspectorControls>
	);
};

export default Inspector;
