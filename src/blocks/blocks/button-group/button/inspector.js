/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import ControlPanelControl from '../../../components/control-panel-control/index.js';
import IconPickerControl from '../../../components/icon-picker-control/index.js';
import { ColorDropdownControl, InspectorHeader, ToogleGroupControl } from '../../../components/index.js';
import { objectOrNumberAsBox } from '../../../helpers/helper-functions.js';

/**
 *
 * @param {import('./types.js').ButtonGroupButtonInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const [ hover, setHover ] = useState( false );

	const changeLibrary = value => {
		setAttributes({
			library: value,
			icon: undefined,
			prefix: 'fab'
		});
	};

	const changeIcon = value => {
		if ( 'object' === typeof value ) {
			setAttributes({
				icon: value.name,
				prefix: value.prefix
			});
		} else {
			setAttributes({ icon: value });
		}
	};

	const HoverControl = () => {
		return (
			<Fragment>
				<ToogleGroupControl
					onChange={ value => setHover( value ) }
					value={ hover }
					options={[
						{
							value: false,
							label: __( 'Normal', 'otter-blocks' )
						},
						{
							value: true,
							label: __( 'Hover', 'otter-blocks' )
						}
					]}
				/>
				<br />
			</Fragment>
		);
	};

	const [ tab, setTab ] = useState( 'style' );

	return (
		<InspectorControls>
			<div>
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

				{
					'settings' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Link settings', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<TextControl
									label={ __( 'Button URL', 'otter-blocks' ) }
									value={ attributes.link }
									onChange={ link => setAttributes({ link })}
								/>
								<ToggleControl
									label={ __( 'Open in new window', 'otter-blocks' ) }
									checked={ attributes.newTab }
									onChange={ () => setAttributes({ newTab: ! Boolean( attributes.newTab ) })}
								/>
								<ToggleControl
									label={ __( 'Add Nofollow', 'otter-blocks' ) }
									checked={ attributes.noFollow }
									onChange={ () => setAttributes({ noFollow: ! Boolean( attributes.noFollow ) })}
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Icon Settings', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<SelectControl
									label={ __( 'Icon Position', 'otter-blocks' ) }
									value={ attributes.iconType }
									options={ [
										{ label: __( 'No Icon', 'otter-blocks' ), value: 'none' },
										{ label: __( 'Left', 'otter-blocks' ), value: 'left' },
										{ label: __( 'Right', 'otter-blocks' ), value: 'right' },
										{ label: __( 'Icon Only', 'otter-blocks' ), value: 'only' }
									] }
									onChange={ e => {
										const defaultIcon = 'none' !== e && attributes.icon === undefined ? { prefix: 'fas', icon: 'chevron-right' } : {};
										setAttributes({ iconType: e, ...defaultIcon });
									} }
								/>

								{ 'none' !== attributes.iconType && (
									<IconPickerControl
										label={ __( 'Icon Picker', 'otter-blocks' ) }
										library={ attributes.library }
										prefix={ attributes.prefix }
										icon={ attributes.icon }
										changeLibrary={ changeLibrary }
										onChange={ changeIcon }
									/>
								) }
							</PanelBody>
						</Fragment>
					)
				}

				{
					'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Colors', 'otter-blocks' ) }
							>
								<HoverControl/>

								{ ! hover ? (
									<Fragment key="without-hover">
										<ColorDropdownControl
											label={ __( 'Text', 'otter-blocks' ) }
											colorValue={ attributes.color }
											onColorChange={ color => setAttributes({ color }) }
											className="is-list is-first"
										/>

										<ColorDropdownControl
											label={ __( 'Background', 'otter-blocks' ) }
											colorValue={ attributes.background }
											gradientValue={ attributes.backgroundGradient }
											onColorChange={ background => setAttributes({ background: background })}
											onGradientChange={ backgroundGradient => setAttributes({ backgroundGradient })}
											className="is-list"
										/>

										<ColorDropdownControl
											label={ __( 'Border', 'otter-blocks' ) }
											colorValue={ attributes.border }
											onColorChange={ border => setAttributes({ border }) }
											className="is-list"
										/>
									</Fragment>
								) : (
									<Fragment key="with-hover">
										<ColorDropdownControl
											label={ __( 'Text', 'otter-blocks' ) }
											colorValue={ attributes.hoverColor }
											onColorChange={ hoverColor => setAttributes({ hoverColor }) }
											className="is-list is-first"
										/>

										<ColorDropdownControl
											label={ __( 'Background', 'otter-blocks' ) }
											colorValue={ attributes.hoverBackground }
											gradientValue={ attributes.hoverBackgroundGradient }
											onColorChange={ hoverBackground => setAttributes({ hoverBackground }) }
											onGradientChange={ hoverBackgroundGradient => setAttributes({ hoverBackgroundGradient }) }
											className="is-list"
										/>

										<ColorDropdownControl
											label={ __( 'Border', 'otter-blocks' ) }
											colorValue={ attributes.hoverBackground }
											onColorChange={ hoverBackground => setAttributes({ hoverBackground }) }
											className="is-list"
										/>
									</Fragment>
								) }
							</PanelBody>

							<PanelBody
								title={ __( 'Border & Box Shadow', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<BoxControl
									label={ __( 'Border Width', 'otter-blocks' ) }
									values={ objectOrNumberAsBox( attributes.borderSize ) }
									onChange={ e => setAttributes({ borderSize: e }) }
								/>

								<BoxControl
									label={ __( 'Border Radius', 'otter-blocks' ) }
									values={ objectOrNumberAsBox( attributes.borderRadius ) }
									onChange={ e => setAttributes({ borderRadius: e }) }
								/>

								<ControlPanelControl
									label={ __( 'Box Shadow', 'otter-blocks' ) }
									attributes={ attributes }
									setAttributes={ setAttributes }
									resetValues={ {
										boxShadow: false,
										boxShadowColor: undefined,
										boxShadowColorOpacity: 50,
										boxShadowBlur: 5,
										boxShadowSpread: 1,
										boxShadowHorizontal: 0,
										boxShadowVertical: 0,
										hoverBoxShadowColor: undefined,
										hoverBoxShadowColorOpacity: 50,
										hoverBoxShadowBlur: 5,
										hoverBoxShadowSpread: 1,
										hoverBoxShadowHorizontal: 0,
										hoverBoxShadowVertical: 0
									} }
									onClick={ () => setAttributes({ boxShadow: true }) }
								>
									<HoverControl/>

									{ ! hover ? (
										<Fragment key="without-hover">
											<ColorGradientControl
												label={ __( 'Shadow Color', 'otter-blocks' ) }
												colorValue={ attributes.boxShadowColor }
												onColorChange={ e => setAttributes({ boxShadowColor: e }) }
											/>

											<RangeControl
												label={ __( 'Opacity', 'otter-blocks' ) }
												value={ attributes.boxShadowColorOpacity }
												onChange={ e => setAttributes({ boxShadowColorOpacity: e }) }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Blur', 'otter-blocks' ) }
												value={ attributes.boxShadowBlur }
												onChange={ e => setAttributes({ boxShadowBlur: e }) }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Spread', 'otter-blocks' ) }
												value={ attributes.boxShadowSpread }
												onChange={ e => setAttributes({ boxShadowSpread: e }) }
												min={ -100 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Horizontal', 'otter-blocks' ) }
												value={ attributes.boxShadowHorizontal }
												onChange={ e => setAttributes({ boxShadowHorizontal: e }) }
												min={ -100 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Vertical', 'otter-blocks' ) }
												value={ attributes.boxShadowVertical }
												onChange={ e => setAttributes({ boxShadowVertical: e }) }
												min={ -100 }
												max={ 100 }
											/>
										</Fragment>
									) : (
										<Fragment key="with-hover">
											<ColorGradientControl
												label={ __( 'Shadow Color on Hover', 'otter-blocks' ) }
												colorValue={ attributes.hoverBoxShadowColor }
												onColorChange={ e => setAttributes({ hoverBoxShadowColor: e }) }
											/>

											<RangeControl
												label={ __( 'Opacity', 'otter-blocks' ) }
												value={ attributes.hoverBoxShadowColorOpacity }
												onChange={ e => setAttributes({ hoverBoxShadowColorOpacity: e }) }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Blur', 'otter-blocks' ) }
												value={ attributes.hoverBoxShadowBlur }
												onChange={ e => setAttributes({ hoverBoxShadowBlur: e }) }
												min={ 0 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Spread', 'otter-blocks' ) }
												value={ attributes.hoverBoxShadowSpread }
												onChange={ e => setAttributes({ hoverBoxShadowSpread: e }) }
												min={ -100 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Horizontal', 'otter-blocks' ) }
												value={ attributes.hoverBoxShadowHorizontal }
												onChange={ e => setAttributes({ hoverBoxShadowHorizontal: e }) }
												min={ -100 }
												max={ 100 }
											/>

											<RangeControl
												label={ __( 'Vertical', 'otter-blocks' ) }
												value={ attributes.hoverBoxShadowVertical }
												onChange={ e => setAttributes({ hoverBoxShadowVertical: e }) }
												min={ -100 }
												max={ 100 }
											/>
										</Fragment>
									) }
								</ControlPanelControl>
							</PanelBody>
						</Fragment>
					)
				}
			</div>
		</InspectorControls>
	);
};

export default Inspector;
