/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	BaseControl,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import ControlPanelControl from '../../../components/control-panel-control/index.js';
import IconPickerControl from '../../../components/icon-picker-control/index.js';
import { ColorDropdownControl, InspectorHeader, SyncControlDropdown, ToogleGroupControl } from '../../../components/index.js';
import { changeActiveStyle, getActiveStyle, objectOrNumberAsBox } from '../../../helpers/helper-functions.js';
import AutoDisableSyncAttr from '../../../components/auto-disable-sync-attr/index';
import { uniq } from 'lodash';

const styles = [
	{
		label: __( 'Fill', 'otter-blocks' ),
		value: 'fill',
		isDefault: true
	},
	{
		label: __( 'Outline', 'otter-blocks' ),
		value: 'outline'
	},
	{
		label: __( 'Plain', 'otter-blocks' ),
		value: 'plain'
	}
];

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

	/**
	 * A proxy store for edge case scenario: making all shadow settings to look like a single option in UI.
	 */
	const [ proxyStore, setProxyStore ] = useState({
		isSynced: uniq(
			attributes.isSynced
				?.map( x => x.includes( 'boxShadow' ) ? 'shadow' : x )
				?.map( x => x.includes( 'hoverBoxShadow' ) ? 'shadowHover' : x )
		)
	});

	const [ storeChanged, setStoreChanged ] = useState( false );

	useEffect( () => {
		if ( storeChanged ) {
			let { isSynced } = attributes;


			isSynced = isSynced?.filter( x => ! ( x.includes( 'boxShadow' ) || x.includes( 'hoverBoxShadow' ) ) );
			if ( proxyStore.isSynced?.some( x => 'shadow' === x ) ) {
				isSynced = uniq(
					[ ...isSynced,
						'boxShadow',
						'boxShadowColor',
						'boxShadowColorOpacity',
						'boxShadowBlur',
						'boxShadowSpread',
						'boxShadowHorizontal',
						'boxShadowVertical' ]
				);
			}
			if ( proxyStore.isSynced?.some( x => 'shadowHover' === x ) ) {
				isSynced = uniq(
					[ ...isSynced,
						'hoverBoxShadowColor',
						'hoverBoxShadowColorOpacity',
						'hoverBoxShadowBlur',
						'hoverBoxShadowSpread',
						'hoverBoxShadowHorizontal',
						'hoverBoxShadowVertical' ]
				);
			}

			setAttributes({ isSynced });
			setStoreChanged( false );
		}
	}, [ proxyStore, storeChanged ]);

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

	const [ tab, setTab ] = useState( 'settings' );

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
								title={ __( 'Icon settings', 'otter-blocks' ) }
								initialOpen={ false }
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
								title={ __( 'Style variations', 'otter-blocks' ) }
							>

								<p>
									{ __( 'Select a style', 'otter-blocks' ) }
								</p>
								<ToogleGroupControl

									value={ getActiveStyle( styles, attributes?.className ) }
									options={ styles }
									onChange={ value => {
										const classes = changeActiveStyle( attributes?.className, styles, value );
										setAttributes({ className: classes });
									} }
								/>

							</PanelBody>
							<PanelBody
								title={ __( 'Colors', 'otter-blocks' ) }
							>
								<SyncControlDropdown
									isSynced={attributes.isSynced}
									options={[
										{
											label: __( 'Color', 'otter-blocks' ),
											value: 'color'
										},
										{
											label: __( 'Background', 'otter-blocks' ),
											value: 'background'
										},
										{
											label: __( 'Border', 'otter-blocks' ),
											value: 'border'
										},
										{
											label: __( 'Hover Color', 'otter-blocks' ),
											value: 'hoverColor'
										},
										{
											label: __( 'Hover Background', 'otter-blocks' ),
											value: 'hoverBackground'
										},
										{
											label: __( 'Hover Border', 'otter-blocks' ),
											value: 'hoverBorder'
										}
									]}
									setAttributes={setAttributes}
								/>

								<HoverControl/>

								{ ! hover ? (
									<Fragment key="without-hover">
										<AutoDisableSyncAttr attr='color' attributes={attributes}>
											<ColorDropdownControl
												label={ __( 'Text', 'otter-blocks' ) }
												colorValue={ attributes.color }
												onColorChange={ color => setAttributes({ color }) }
												className="is-list is-first"
											/>
										</AutoDisableSyncAttr>

										<AutoDisableSyncAttr attr='background' attributes={attributes}>
											<ColorDropdownControl
												label={ __( 'Background', 'otter-blocks' ) }
												colorValue={ attributes.background }
												gradientValue={ attributes.backgroundGradient }
												onColorChange={ background => setAttributes({ background: background })}
												onGradientChange={ backgroundGradient => setAttributes({ backgroundGradient })}
												className="is-list"
											/>
										</AutoDisableSyncAttr>

										<AutoDisableSyncAttr attr='border' attributes={attributes}>
											<ColorDropdownControl
												label={ __( 'Border', 'otter-blocks' ) }
												colorValue={ attributes.border }
												onColorChange={ border => setAttributes({ border }) }
												className="is-list"
											/>
										</AutoDisableSyncAttr>
									</Fragment>
								) : (
									<Fragment key="with-hover">
										<AutoDisableSyncAttr attr='hoverColor' attributes={attributes}>
											<ColorDropdownControl
												label={ __( 'Text', 'otter-blocks' ) }
												colorValue={ attributes.hoverColor }
												onColorChange={ hoverColor => setAttributes({ hoverColor }) }
												className="is-list is-first"
											/>
										</AutoDisableSyncAttr>

										<AutoDisableSyncAttr attr='hoverBackground' attributes={attributes}>
											<ColorDropdownControl
												label={ __( 'Background', 'otter-blocks' ) }
												colorValue={ attributes.hoverBackground }
												gradientValue={ attributes.hoverBackgroundGradient }
												onColorChange={ hoverBackground => setAttributes({ hoverBackground }) }
												onGradientChange={ hoverBackgroundGradient => setAttributes({ hoverBackgroundGradient }) }
												className="is-list"
											/>
										</AutoDisableSyncAttr>

										<AutoDisableSyncAttr attr='hoverBorder' attributes={attributes}>
											<ColorDropdownControl
												label={ __( 'Border', 'otter-blocks' ) }
												colorValue={ attributes.hoverBorder }
												onColorChange={ hoverBorder => setAttributes({ hoverBorder }) }
												className="is-list"
											/>
										</AutoDisableSyncAttr>

									</Fragment>
								) }
							</PanelBody>

							<PanelBody
								title={ __( 'Border & Box Shadow', 'otter-blocks' ) }
								initialOpen={ false }
							>
								<SyncControlDropdown
									isSynced={proxyStore.isSynced}
									options={[
										{
											label: __( 'Border Width', 'otter-blocks' ),
											value: 'borderSize'
										},
										{
											label: __( 'Border Radius', 'otter-blocks' ),
											value: 'borderRadius'
										},
										{
											label: __( 'Shadow', 'otter-blocks' ),
											value: 'shadow'
										},
										{
											label: __( 'Shadow Hover', 'otter-blocks' ),
											value: 'shadowHover'
										}
									]}
									setAttributes={value => {
										setProxyStore( value );
										setStoreChanged( true );
									}
									}
								/>

								<AutoDisableSyncAttr attr='borderSize' attributes={attributes}>
									<BoxControl
										label={ __( 'Border Width', 'otter-blocks' ) }
										values={ objectOrNumberAsBox( attributes.borderSize ) }
										onChange={ e => setAttributes({ borderSize: e }) }
									/>
								</AutoDisableSyncAttr>

								<AutoDisableSyncAttr attr='borderRadius' attributes={attributes}>
									<BoxControl
										label={ __( 'Border Radius', 'otter-blocks' ) }
										values={ objectOrNumberAsBox( attributes.borderRadius ) }
										onChange={ e => setAttributes({ borderRadius: e }) }
									/>
								</AutoDisableSyncAttr>

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
											<AutoDisableSyncAttr attr='boxShadowColor' attributes={attributes}>
												<ColorGradientControl
													label={ __( 'Shadow Color', 'otter-blocks' ) }
													colorValue={ attributes.boxShadowColor }
													onColorChange={ e => setAttributes({ boxShadowColor: e }) }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='boxShadowColorOpacity' attributes={attributes}>
												<RangeControl
													label={ __( 'Opacity', 'otter-blocks' ) }
													value={ attributes.boxShadowColorOpacity }
													onChange={ e => setAttributes({ boxShadowColorOpacity: e }) }
													min={ 0 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='boxShadowBlur' attributes={attributes}>
												<RangeControl
													label={ __( 'Blur', 'otter-blocks' ) }
													value={ attributes.boxShadowBlur }
													onChange={ e => setAttributes({ boxShadowBlur: e }) }
													min={ 0 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='boxShadowSpread' attributes={attributes}>
												<RangeControl
													label={ __( 'Spread', 'otter-blocks' ) }
													value={ attributes.boxShadowSpread }
													onChange={ e => setAttributes({ boxShadowSpread: e }) }
													min={ -100 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='boxShadowHorizontal' attributes={attributes}>
												<RangeControl
													label={ __( 'Horizontal', 'otter-blocks' ) }
													value={ attributes.boxShadowHorizontal }
													onChange={ e => setAttributes({ boxShadowHorizontal: e }) }
													min={ -100 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='boxShadowVertical' attributes={attributes}>
												<RangeControl
													label={ __( 'Vertical', 'otter-blocks' ) }
													value={ attributes.boxShadowVertical }
													onChange={ e => setAttributes({ boxShadowVertical: e }) }
													min={ -100 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>
										</Fragment>
									) : (
										<Fragment key="with-hover">
											<AutoDisableSyncAttr attr='hoverBoxShadowColor' attributes={attributes}>

												<ColorGradientControl
													label={ __( 'Shadow Color on Hover', 'otter-blocks' ) }
													colorValue={ attributes.hoverBoxShadowColor }
													onColorChange={ e => setAttributes({ hoverBoxShadowColor: e }) }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='hoverBoxShadowColorOpacity' attributes={attributes}>
												<RangeControl
													label={ __( 'Opacity', 'otter-blocks' ) }
													value={ attributes.hoverBoxShadowColorOpacity }
													onChange={ e => setAttributes({ hoverBoxShadowColorOpacity: e }) }
													min={ 0 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='hoverBoxShadowBlur' attributes={attributes}>
												<RangeControl
													label={ __( 'Blur', 'otter-blocks' ) }
													value={ attributes.hoverBoxShadowBlur }
													onChange={ e => setAttributes({ hoverBoxShadowBlur: e }) }
													min={ 0 }
													max={ 100 }
												/>

											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='boxShadowVertical' attributes={attributes}>
												<RangeControl
													label={ __( 'hoverBoxShadowSpread', 'otter-blocks' ) }
													value={ attributes.hoverBoxShadowSpread }
													onChange={ e => setAttributes({ hoverBoxShadowSpread: e }) }
													min={ -100 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='hoverBoxShadowHorizontal' attributes={attributes}>
												<RangeControl
													label={ __( 'Horizontal', 'otter-blocks' ) }
													value={ attributes.hoverBoxShadowHorizontal }
													onChange={ e => setAttributes({ hoverBoxShadowHorizontal: e }) }
													min={ -100 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>

											<AutoDisableSyncAttr attr='hoverBoxShadowVertical' attributes={attributes}>
												<RangeControl
													label={ __( 'Vertical', 'otter-blocks' ) }
													value={ attributes.hoverBoxShadowVertical }
													onChange={ e => setAttributes({ hoverBoxShadowVertical: e }) }
													min={ -100 }
													max={ 100 }
												/>
											</AutoDisableSyncAttr>
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
