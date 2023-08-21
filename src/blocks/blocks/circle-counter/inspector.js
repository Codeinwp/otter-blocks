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
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption
} from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';

/**
 * Internal dependencies
*/
import { InspectorHeader } from '../../components';

/**
 *
 * @param {import('./types').CircleCounterInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const [ tab, setTab ] = useState( 'settings' ); // TODO: After #1801 is merged, use `useTabState` hook.

	const onPercentageChange = value => {
		if ( value === undefined ) {
			return;
		}
		value = clamp( value, 0, 100 );
		setAttributes({ percentage: value });
	};

	const onDurationChange = value => {
		if ( value === undefined ) {
			return;
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
						>

							<TextControl
								label={ __( 'Title', 'otter-blocks' ) }
								value={ attributes.title }
								onChange={ title => setAttributes({ title }) }
							/>

							<RangeControl
								label={ __( 'Percentage', 'otter-blocks' ) }
								help={ __( 'The value of the counter.', 'otter-blocks' ) }
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
								title={ __( 'Title', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<ToggleControl
									label={ __( 'Display the Title', 'otter-blocks' ) }
									checked={ 'hide' !== attributes.titleStyle }
									onChange={ () => setAttributes({ titleStyle: 'default' }) }
								/>

								{ 'hide' !== attributes.titleStyle && (
									<ToggleGroupControl
										label={ __( 'Position', 'otter-blocks' ) }
										value={ attributes.titleStyle }
										onChange={ titleStyle => setAttributes({ titleStyle }) }
										isBlock
									>
										<ToggleGroupControlOption value="default" label={ __( 'Top', 'otter-blocks' ) } />
										<ToggleGroupControlOption value="bottom" label={ __( 'Bottom', 'otter-blocks' ) } />
									</ToggleGroupControl>
								)}
							</PanelBody>
							<PanelColorSettings
								title={ __( 'Color', 'otter-blocks' ) }
								colorSettings={ [
									{
										value: attributes.titleColor,
										onChange: titleColor => setAttributes({ titleColor }),
										label: __( 'Title Color', 'otter-blocks' )
									},
									{
										value: attributes.progressColor,
										onChange: progressColor => setAttributes({ progressColor }),
										label: __( 'Progress Color', 'otter-blocks' )
									},
									{
										value: attributes.backgroundColor,
										onChange: backgroundColor => setAttributes({ backgroundColor }),
										label: __( 'Background Color', 'otter-blocks' )
									}
								] }
							/>
							<PanelBody
								title={ __( 'Dimensions and Motion', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<RangeControl
									label={ __( 'Height', 'otter-blocks' ) }
									help={ __( 'The height of the circle counter.', 'otter-blocks' ) }
									value={ attributes.height }
									onChange={ height => setAttributes({ height }) }
									min={ 20 }
									max={ 240 }
								/>

								<RangeControl
									label={ __( 'Circle Thickness', 'otter-blocks' ) }
									help={ __( 'Change the thickness (stroke width) of the circle.', 'otter-blocks' ) }
									value={ attributes.strokeWidth }
									onChange={ strokeWidth => setAttributes({ strokeWidth }) }
									initialPosition={ 10 }
									min={ 0 }
									max={ 20 }
								/>

								<RangeControl
									label={ __( 'Duration', 'otter-blocks' ) }
									help={ __( 'The duration of the animation.', 'otter-blocks' ) }
									value={ attributes.duration }
									onChange={ onDurationChange }
									min={ 0 }
									max={ 3 }
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Typography', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<RangeControl
									label={ __( 'Font Size Title', 'otter-blocks' ) }
									help={ __( 'Change the font size of the title.', 'otter-blocks' ) }
									value={ attributes.fontSizeTitle }
									onChange={ fontSizeTitle => setAttributes({ fontSizeTitle }) }
									initialPosition={ 37 }
									min={ 0 }
									max={ 100 }
								/>

								<RangeControl
									label={ __( 'Font Size Percent', 'otter-blocks' ) }
									help={ __( 'Change the font size of the inner text.', 'otter-blocks' ) }
									value={ attributes.fontSizePercent }
									onChange={ fontSizePercent => setAttributes({ fontSizePercent }) }
									initialPosition={ 27 }
									min={ 0 }
									max={ 80 }
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
