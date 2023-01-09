// @ts-check

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	__experimentalBoxControl as BoxControl,
	BaseControl,
	FontSizePicker,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import {
	positionCenter,
	positionLeft,
	positionRight,
	stretchFullWidth,
	alignNone,
	alignLeft,
	alignCenter,
	alignRight,
	justifySpaceBetween,
	alignJustify,
	menu
} from '@wordpress/icons';

import { Fragment, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import GoogleFontsControl from '../../../components/google-fonts-control/index.js';
import SizingControl from '../../../components/sizing-control/index.js';
import ResponsiveControl from '../../../components/responsive-control';
import ToogleGroupControl from '../../../components/toogle-group-control/index.js';
import { useResponsiveAttributes } from '../../../helpers/utility-hooks.js';
import { InspectorHeader } from '../../../components/index.js';
import { makeBox } from '../../../plugins/copy-paste/utils';
import { getChoice, _i, _px } from '../../../helpers/helper-functions.js';

/**
 *
 * @param {import('./types.js').ButtonGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const presets = {
		'XS': {
			padding: {
				top: '5px',
				bottom: '5px',
				right: '14px',
				left: '14px'
			},
			fontSize: '14px'
		},
		'S': {
			padding: {
				top: '10px',
				bottom: '10px',
				right: '20px',
				left: '20px'
			},
			fontSize: '15px'
		},
		'M': {
			padding: {
				top: '15px',
				bottom: '15px',
				right: '30px',
				left: '30px'
			},
			fontSize: '16px'
		},
		'L': {
			padding: {
				top: '20px',
				bottom: '20px',
				right: '40px',
				left: '40px'
			},
			fontSize: '18px'
		},
		'XL': {
			padding: {
				top: '25px',
				bottom: '25px',
				right: '50px',
				left: '50px'
			},
			fontSize: '20px'
		}
	};

	const isEqualToPreset = ( padding, fontSize, presetName ) => {
		return (
			fontSize === presets[presetName].fontSize &&

			padding?.top === presets[presetName]?.padding?.top &&
			padding?.bottom === presets[presetName]?.padding?.bottom &&
			padding?.left === presets[presetName]?.padding?.left &&
			padding?.right === presets[presetName]?.padding?.right
		);
	};

	const makeBoxFromSplitAxis = ( vertical, horizontal ) => {
		return {
			top: vertical,
			bottom: vertical,
			right: horizontal,
			left: horizontal
		};
	};

	const [ tab, setTab ] = useState( 'settings' );

	const [ proxyStore, setProxyStore ] = useState({
		padding: makeBoxFromSplitAxis(
			attributes.paddingTopBottom,
			attributes.paddingLeftRight
		),
		paddingTablet: attributes.paddingTablet,
		paddingMobile: attributes.paddingMobile,
		align: attributes.align
	});

	const [ storeChanged, setStoreChanged ] = useState( false );

	const updateStore = attr => setProxyStore({
		padding: makeBoxFromSplitAxis(
			attributes.paddingTopBottom,
			attributes.paddingLeftRight
		),
		paddingTablet: attributes.paddingTablet,
		paddingMobile: attributes.paddingMobile,
		align: attributes.align,
		...attr
	});

	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( updateStore );

	useEffect( () => {
		if ( storeChanged ) {
			setAttributes({
				paddingTopBottom: proxyStore?.padding?.top,
				paddingLeftRight: proxyStore?.padding?.right,
				paddingTablet: proxyStore?.paddingTablet,
				paddingMobile: proxyStore?.paddingMobile,
				align: proxyStore?.align
			});
			setStoreChanged( false );
		}

	}, [ proxyStore.padding, proxyStore.paddingTablet, proxyStore.paddingMobile, storeChanged ]);


	const changeFontFamily = value => {
		if ( ! value ) {
			setAttributes({
				fontFamily: undefined,
				fontVariant: undefined,
				fontStyle: undefined
			});
		} else {
			setAttributes({
				fontFamily: value,
				fontVariant: 'normal',
				fontStyle: 'normal'
			});
		}
	};

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
								title={ __( 'Layout', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<ResponsiveControl
									label={ __( 'Alignment', 'otter-blocks' ) }
									className="buttons-alignment-control"
								>
									<ToogleGroupControl
										value={ responsiveGetAttributes([ attributes.align?.desktop, attributes.align?.tablet, attributes.align?.mobile ]) ?? 'left' }
										options={[
											{
												icon: alignLeft,
												label: __( 'Left', 'otter-blocks' ),
												value: 'left'
											},
											{
												icon: alignCenter,
												label: __( 'Center', 'otter-blocks' ),
												value: 'center'
											},
											{
												icon: alignRight,
												label: __( 'Right', 'otter-blocks' ),
												value: 'right'
											},
											{
												icon: menu,
												label: __( 'Full', 'otter-blocks' ),
												value: 'full'
											}
										]}
										onChange={ value => {
											responsiveSetAttributes( value, [ 'align.desktop', 'align.tablet', 'align.mobile' ], attributes.align ?? {});
											setStoreChanged( true );
										} }
										hasIcon
									/>
								</ResponsiveControl>

								<BaseControl
									label={ __( 'Button Size', 'otter-blocks' ) }
								>
									<ToogleGroupControl

										value={
											( () => {
												const padding = responsiveGetAttributes([
													makeBoxFromSplitAxis(
														_px( attributes.paddingTopBottom ),
														_px( attributes.paddingLeftRight )
													),
													attributes.paddingTablet,
													attributes.paddingMobile
												]);

												const { fontSize } = attributes;
												return getChoice([
													[ isEqualToPreset( padding, fontSize, 'XS' ), 'XS' ],
													[ isEqualToPreset( padding, fontSize, 'S' ), 'S' ],
													[ isEqualToPreset( padding, fontSize, 'M' ), 'M' ],
													[ isEqualToPreset( padding, fontSize, 'L' ), 'L' ],
													[ isEqualToPreset( padding, fontSize, 'XL' ), 'XL' ],
													[ 'custom' ]
												]);
											})()
										}
										options={[
											{
												label: __( 'XS', 'otter-blocks' ),
												value: 'XS'
											},
											{
												label: __( 'S', 'otter-blocks' ),
												value: 'S'
											},
											{
												label: __( 'M', 'otter-blocks' ),
												value: 'M'
											},
											{
												label: __( 'L', 'otter-blocks' ),
												value: 'L'
											},
											{
												label: __( 'XL', 'otter-blocks' ),
												value: 'XL'
											},
											{
												label: __( 'C', 'otter-blocks' ),
												value: 'custom'
											}
										]}
										onChange={ value => {
											if ( 'custom' === value ) {
												return;
											}

											console.log( presets[value]);

											responsiveSetAttributes( presets[value].padding, [ 'padding', 'paddingTablet', 'paddingMobile' ]);
											setAttributes({ fontSize: presets[value].fontSize });
											setStoreChanged( true );
										} }
									/>
								</BaseControl>

								<SelectControl
									label={ __( 'Collapse On', 'otter-blocks' ) }
									value={ attributes.collapse }
									options={ [
										{ label: __( 'None', 'otter-blocks' ), value: 'collapse-none' },
										{ label: __( 'Desktop', 'otter-blocks' ), value: 'collapse-desktop' },
										{ label: __( 'Tablet', 'otter-blocks' ), value: 'collapse-tablet' },
										{ label: __( 'Mobile', 'otter-blocks' ), value: 'collapse-mobile' }
									] }
									onChange={ e => setAttributes({ collapse: e }) }
								/>
							</PanelBody>

						</Fragment>
					)
				}

				{
					'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Dimensions', 'otter-blocks' ) }
							>
								<ResponsiveControl
									label={ __( 'Screen Type', 'otter-blocks' ) }
								>
									<BoxControl
										label={ __( 'Padding', 'otter-blocks' ) }
										values={
											responsiveGetAttributes([
												makeBoxFromSplitAxis(
													attributes.paddingTopBottom,
													attributes.paddingLeftRight
												),
												attributes.paddingTablet,
												attributes.paddingMobile
											])
										}

										onChange={ value => {
											responsiveSetAttributes( value, [ 'padding', 'paddingTablet', 'paddingMobile' ]);
											setStoreChanged( true );
										} }
										splitOnAxis={ true }
									/>

								</ResponsiveControl>

								<UnitControl
									label={ __( 'Spacing', 'otter-blocks' ) }
									value={ _px( attributes.spacing ) }
									onChange={ e => setAttributes({ spacing: e }) }
									step={ 0.1 }
								/>


							</PanelBody>

							<PanelBody
								title={ __( 'Typography', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<BaseControl
									label={ __( 'Font Size', 'otter-blocks' ) }
								>
									<FontSizePicker
										value={ attributes.fontSize }
										fontSizes={ [
											{
												name: __( 'Extra Small', 'otter-blocks' ),
												slug: 'extra-small',
												size: 14
											},
											{
												name: __( 'Small', 'otter-blocks' ),
												slug: 'small',
												size: 16
											},
											{
												name: __( 'Medium', 'otter-blocks' ),
												slug: 'medium',
												size: 18
											},
											{
												name: __( 'Large', 'otter-blocks' ),
												slug: 'large',
												size: 24
											},
											{
												name: __( 'Extra Large', 'otter-blocks' ),
												slug: 'extra-large',
												size: 28
											}
										] }
										onChange={ fontSize => setAttributes({ fontSize }) }
									/>

								</BaseControl>

								<GoogleFontsControl
									label={ __( 'Font Family', 'otter-blocks' ) }
									value={ attributes.fontFamily }
									onChangeFontFamily={ changeFontFamily }
									valueVariant={ attributes.fontVariant }
									onChangeFontVariant={ e => setAttributes({ fontVariant: e }) }
									valueStyle={ attributes.fontStyle }
									onChangeFontStyle={ e => setAttributes({ fontStyle: e }) }
									valueTransform={ attributes.textTransform }
									onChangeTextTransform={ e => setAttributes({ textTransform: e }) }
								/>

								<RangeControl
									label={ __( 'Line Height', 'otter-blocks' ) }
									value={ attributes.lineHeight }
									onChange={ e => setAttributes({ lineHeight: e }) }
									step={ 0.1 }
									min={ 0 }
									max={ 200 }
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
