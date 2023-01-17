// @ts-check

import { uniq } from 'lodash';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import { InspectorControls } from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	__experimentalBoxControl as BoxControl,
	BaseControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import {
	alignLeft,
	alignCenter,
	alignRight,
	menu,
	settings
} from '@wordpress/icons';

import { Fragment, useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ResponsiveControl from '../../../components/responsive-control';
import ToogleGroupControl from '../../../components/toogle-group-control/index.js';
import { useResponsiveAttributes } from '../../../helpers/utility-hooks.js';
import { InspectorHeader, SyncControlDropdown } from '../../../components/index.js';
import { getChoice, _i, _px } from '../../../helpers/helper-functions.js';
import TypographySelectorControl from '../../../components/typography-selector-control/index';
import AutoDisableSyncAttr from '../../../components/auto-disable-sync-attr';

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

	const [ tab, setTab ] = useState( 'style' );

	const [ proxyStore, setProxyStore ] = useState({
		padding: makeBoxFromSplitAxis(
			attributes.paddingTopBottom,
			attributes.paddingLeftRight
		),
		paddingTablet: attributes.paddingTablet,
		paddingMobile: attributes.paddingMobile,
		align: attributes.align,
		isSynced: uniq( attributes?.isSynced?.map( x => {
			if ( 'paddingTopBottom' === x || 'paddingLeftRight' === x ) {
				return 'padding';
			}
			return x;
		}) )
	});


	/**
	 * Reusing `paddingTopBottom` and `paddingLeftRight` introduce some edge cases when handling the update and Global CSS.
	 * By using a proxy, we can treat them as `padding` in Components and handle the update in a unified matter.
	 *
	 * This method is very useful when attributes are split. We might use it in the future for more complex components like BorderBoxControl.
	 */
	const [ storeChanged, setStoreChanged ] = useState( false );

	const updateStore = attr => setProxyStore({
		padding: makeBoxFromSplitAxis(
			attributes.paddingTopBottom,
			attributes.paddingLeftRight
		),
		paddingTablet: attributes.paddingTablet,
		paddingMobile: attributes.paddingMobile,
		align: attributes.align,
		isSynced: attributes.isSynced,
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
				align: proxyStore?.align,
				isSynced: uniq( proxyStore?.isSynced?.map( x => {
					if ( 'padding' === x ) {
						return [ 'paddingTopBottom', 'paddingLeftRight' ];
					}
					return x;
				}).flat() )
			});
			setStoreChanged( false );
		}

	}, [ proxyStore.padding, proxyStore.paddingTablet, proxyStore.paddingMobile, storeChanged ]);

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
												label: __( '', 'otter-blocks' ),
												value: 'custom',
												icon: settings
											}
										]}
										onChange={ value => {
											if ( 'custom' === value ) {
												setTab( 'style' );
												return;
											}

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

								<SyncControlDropdown
									isSynced={proxyStore.isSynced}
									options={[
										{
											label: __( 'Padding', 'otter-blocks' ),
											value: responsiveGetAttributes([ 'padding', 'paddingTablet', 'paddingMobile' ])
										},
										{
											label: __( 'Spacing', 'otter-blocks' ),
											value: 'spacing'
										}
									]}
									setAttributes={ attrs => {
										updateStore( attrs );
										setStoreChanged( true );
									} }
								/>


								<ResponsiveControl
									label={ __( 'Screen Type', 'otter-blocks' ) }
								>
									<AutoDisableSyncAttr attr={responsiveGetAttributes([ 'padding', 'paddingTablet', 'paddingMobile' ])} attributes={proxyStore}>
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
												]) ?? makeBoxFromSplitAxis( '15px', '20px' )
											}

											onChange={ value => {
												responsiveSetAttributes( value, [ 'padding', 'paddingTablet', 'paddingMobile' ]);
												setStoreChanged( true );
											} }
											splitOnAxis={ true }
										/>
									</AutoDisableSyncAttr>
								</ResponsiveControl>

								<AutoDisableSyncAttr attr='spacing' attributes={attributes}>
									<UnitControl
										label={ __( 'Spacing', 'otter-blocks' ) }
										value={ _px( attributes.spacing ) }
										onChange={ e => setAttributes({ spacing: e }) }
										step={ 0.1 }
									/>
								</AutoDisableSyncAttr>


							</PanelBody>

							<PanelBody
								title={ __( 'Typography', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<SyncControlDropdown
									isSynced={attributes.isSynced}
									options={[
										{
											label: __( 'Font Size', 'otter-blocks' ),
											value: 'fontSize'
										},
										{
											label: __( 'Font Family', 'otter-blocks' ),
											value: 'fontFamily'
										},
										{
											label: __( 'Appearance', 'otter-blocks' ),
											value: 'fontVariant'
										},
										{
											label: __( 'Letter Case', 'otter-blocks' ),
											value: 'fontStyle'
										},
										{
											label: __( 'Line Height', 'otter-blocks' ),
											value: 'lineHeight'
										}
									]}
									setAttributes={setAttributes}
								/>

								<TypographySelectorControl
									enableComponents={{
										fontFamily: true,
										appearance: true,
										lineHeight: true,
										letterCase: true
									}}

									componentsValue={{
										fontSize: attributes.fontSize,
										fontFamily: attributes.fontFamily,
										lineHeight: attributes.lineHeight,
										appearance: attributes.fontVariant,
										letterCase: attributes.fontStyle
									}}

									onChange={ values => {
										setAttributes({
											fontSize: values.fontSize,
											fontFamily: values.fontFamily,
											lineHeight: values.lineHeight,
											fontVariant: values.appearance,
											fontStyle: values.letterCase
										});
									} }

									showAsDisable={{
										fontSize: attributes.isSynced?.includes( 'fontSize' ),
										fontFamily: attributes.isSynced?.includes( 'fontFamily' ),
										appearance: attributes.isSynced?.includes( 'fontVariant' ),
										lineHeight: attributes.isSynced?.includes( 'lineHeight' ),
										letterCase: attributes.isSynced?.includes( 'fontStyle' )
									}}
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
