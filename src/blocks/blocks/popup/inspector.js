/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	Disabled,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import { Fragment, useState } from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Notice from '../../components/notice/index.js';
import { buildResponsiveGetAttributes, buildResponsiveSetAttributes, removeBoxDefaultValues, setUtm } from '../../helpers/helper-functions.js';
import InspectorHeader from '../../components/inspector-header/index.js';
import ResponsiveControl from '../../components/responsive-control/index.js';
import { useSelect } from '@wordpress/data';

/**
 *
 * @param {import('./types').PopupInspectorProps} props
 * @returns
 */
const ProFeatures = () => {
	return (
		<Fragment>
			<Disabled>
				<ToggleControl
					label={ __( 'Close On Anchor Click', 'otter-blocks' ) }
					checked={ false }
					onChange={ () => {} }
				/>

				<ToggleControl
					label={ __( 'Dismiss for Recurring Visitors', 'otter-blocks' ) }
					checked={ false }
					onChange={ () => {} }
				/>
			</Disabled>

			<Notice
				notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'popupblock' )}>{ __( 'Get more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
				variant="upsell"
			/>
		</Fragment>
	);
};

/**
 *
 * @param {import('./types').PopupInspectorProps} param0
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const [ tab, setTab ] = useState( 'settings' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			responsiveSetAttributes: buildResponsiveSetAttributes( setAttributes, view ),
			responsiveGetAttributes: buildResponsiveGetAttributes( view )
		};
	}, []);

	let triggerOptions = [
		{
			label: __( 'On Load', 'otter-blocks' ),
			value: 'onLoad'
		},
		{
			label: __( 'On Anchor Click (Pro)', 'otter-blocks' ),
			value: 'onClick',
			disabled: true
		},
		{
			label: __( 'On Scroll (Pro)', 'otter-blocks' ),
			value: 'onScroll',
			disabled: true
		},
		{
			label: __( 'On Exit (Pro)', 'otter-blocks' ),
			value: 'onExit',
			disabled: true
		}
	];

	triggerOptions = applyFilters( 'otter.popupBlock.triggers', triggerOptions );

	const Controls = () => {
		return (
			<Fragment>
				<ToggleControl
					label={ __( 'Show Close Button', 'otter-blocks' ) }
					checked={ attributes.showClose }
					onChange={ () => setAttributes({ showClose: ! attributes.showClose }) }
				/>

				<ToggleControl
					label={ __( 'Close on Click Outside', 'otter-blocks' ) }
					checked={ attributes.outsideClose }
					onChange={ () => setAttributes({ outsideClose: ! attributes.outsideClose }) }
				/>

				{ ! Boolean( window.themeisleGutenberg.hasPro ) && <ProFeatures /> }
			</Fragment>
		);
	};

	console.log( attributes );

	return (
		<InspectorControls>
			{ applyFilters( 'otter.feedback', '', 'popup-block', __( 'Help us improve this block', 'otter-blocks' ) ) }

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
				{ 'settings' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Popup settings', 'otter-blocks' ) }
						>
							<SelectControl
								label={ __( 'Open Trigger', 'otter-blocks' ) }
								help={ ! Boolean( window.themeisleGutenberg.hasPro ) && __( 'You need to have Otter Pro to activate Pro features.', 'otter-blocks' ) }
								options={ triggerOptions }
								value={ attributes.trigger }
								onChange={ trigger => setAttributes({ trigger }) }
							/>

							{ ( undefined === attributes.trigger || 'onLoad' === attributes.trigger ) && (
								<RangeControl
									label={ __( 'Trigger Time', 'otter-blocks' ) }
									help={ __( 'How much time to wait before showing the popup. Leave it empty to open instantly', 'otter-blocks' ) }
									min={ 0 }
									max={ 100 }
									value={ attributes.wait }
									onChange={ value => setAttributes({ wait: Number( value ) }) }
								/>
							) }

							{ applyFilters( 'otter.popupBlock.controls', <Controls />, attributes, setAttributes ) }
						</PanelBody>
					</Fragment>
				)}

				{
					'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Dimensions', 'otter-blocks' ) }
							>
								<ResponsiveControl>
									<UnitControl
										label={ __( 'Width', 'otter-blocks' ) }
										value={ responsiveGetAttributes([
											attributes.width,
											attributes.widthTablet,
											attributes.widthMobile
										]) }
										setAttributes={ value => {
											responsiveSetAttributes( value, [ 'width', 'widthTablet', 'widthMobile' ]);
										}}
									/>
								</ResponsiveControl>

								<ResponsiveControl>
									<UnitControl
										label={ __( 'Height', 'otter-blocks' ) }
										value={ responsiveGetAttributes([
											attributes.height,
											attributes.heightTablet,
											attributes.heightMobile
										]) }
										setAttributes={ value => {
											responsiveSetAttributes( value, [ 'height', 'heightTablet', 'heightMobile' ]);
										}}
									/>
								</ResponsiveControl>

								<ResponsiveControl>
									<BoxControl
										label={ __( 'Padding', 'otter-blocks' ) }
										values={ responsiveGetAttributes([
											attributes.padding,
											attributes.paddingTablet,
											attributes.paddingMobile
										]) }
										onChange={ value => {
											setAttributes({
												padding: removeBoxDefaultValues( value, { top: '0px', bottom: '0px', left: '0px', right: '0px' })
											});
											responsiveSetAttributes(
												removeBoxDefaultValues( value, { top: '0px', bottom: '0px', left: '0px', right: '0px' }),
												[ 'padding', 'paddingTablet', 'paddingMobile' ]
											);
										}}
									/>
								</ResponsiveControl>


							</PanelBody>
							<PanelColorSettings
								title={ __( 'Color', 'otter-blocks' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: attributes.backgroundColor,
										onChange: backgroundColor => setAttributes({ backgroundColor }),
										label: __( 'Background', 'otter-blocks' )
									},
									{
										value: attributes.closeColor,
										onChange: closeColor => setAttributes({ closeColor }),
										label: __( 'Close Button', 'otter-blocks' )
									},
									{
										value: attributes.overlayColor,
										onChange: overlayColor => setAttributes({ overlayColor }),
										label: __( 'Overlay', 'otter-blocks' )
									}
								] }
							/>
							<PanelBody
								title={ __( 'Overlay', 'otter-blocks' ) }
							>
								<RangeControl
									label={ __( 'Overlay Opacity', 'otter-blocks' ) }
									value={ attributes.overlayOpacity }
									onChange={ value => setAttributes({ overlayOpacity: Number( value ) }) }
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Close Button', 'otter-blocks' ) }
							>
								<ToggleControl
									label={ __( 'Show Close Button', 'otter-blocks' ) }
									checked={ attributes.showClose }
									onChange={ () => setAttributes({ showClose: ! attributes.showClose }) }
								/>
								<SelectControl
									label={ __( 'Position', 'otter-blocks' ) }
									options={ [
										{
											label: __( 'Inside', 'otter-blocks' ),
											value: 'none'
										},
										{
											label: __( 'Outside', 'otter-blocks' ),
											value: 'outside'
										}
									] }
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Border', 'otter-blocks' ) }
							>
								<SelectControl
									label={ __( 'Style', 'otter-blocks' ) }
									value={ attributes.borderStyle ?? 'hidden'}
									onChange={ value => setAttributes({ borderStyle: 'hidden' === value ? undefined : value })}
									options={ [
										{
											label: __( 'Hidden', 'otter-blocks' ),
											value: 'hidden'
										},
										{
											label: __( 'Solid', 'otter-blocks' ),
											value: 'solid'
										},
										{
											label: __( 'Double', 'otter-blocks' ),
											value: 'double'
										},
										{
											label: __( 'Outside', 'otter-blocks' ),
											value: 'outside'
										},
										{
											label: __( 'Ridge', 'otter-blocks' ),
											value: 'ridge'
										},
										{
											label: __( 'Ridge', 'otter-blocks' ),
											value: 'dashed'
										}
									] }
								/>

								{
									attributes?.borderStyle && 'hidden' !== attributes?.borderStyle && (
										<BoxControl
											label={ __( 'Width', 'otter-blocks' ) }
											values={ attributes.borderWidth }
											onChange={ value => {
												setAttributes({
													borderWidth: removeBoxDefaultValues( value, { top: '0px', bottom: '0px', left: '0px', right: '0px' })
												});
											}}
										/>
									)
								}

								<BoxControl
									label={ __( 'Border Radius', 'otter-blocks' ) }
									values={ attributes.borderRadius }
									onChange={ value => {
										setAttributes({
											borderRadius: removeBoxDefaultValues( value, { top: '0px', bottom: '0px', left: '0px', right: '0px' })
										});
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

