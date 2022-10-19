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
	__experimentalUnitControl as UnitControl,
	__experimentalAlignmentMatrixControl as AlignmentMatrixControl
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
		responsiveGetAttributes,
		view
	} = useSelect( select => {
		const { getView } = select( 'themeisle-gutenberg/data' );
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) ? select( 'core/edit-post' ) : false;
		const view = __experimentalGetPreviewDeviceType ? __experimentalGetPreviewDeviceType() : getView();

		return {
			view: view,
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
									label={ __( 'Trigger Time (seconds)', 'otter-blocks' ) }
									help={ __( 'How much time to wait before showing the popup.', 'otter-blocks' ) }
									min={ 0 }
									max={ 100 }
									value={ attributes.wait ?? 0 }
									onChange={ value => setAttributes({ wait: Number( value ) }) }
									allowReset
								/>
							) }
						</PanelBody>
						<PanelBody
							title={ __( 'Popup Position', 'otter-blocks' )}
						>
							<ResponsiveControl
								label={ __( 'Screen Type', 'otter-blocks' ) }
							>
								<div className="o-position-picker">
									<AlignmentMatrixControl
										value={ responsiveGetAttributes([
											`${attributes.verticalPosition ?? 'center'} ${attributes.horizontalPosition ?? 'center' }`,
											`${attributes.verticalPositionTablet ?? 'center'} ${attributes.horizontalPositionTablet ?? 'center' }`,
											`${attributes.verticalPositionMobile ?? 'center'} ${attributes.horizontalPositionMobile ?? 'center' }`
										]) }
										onChange={ value => {
											const [ vertical, horizontal ] = value.split( ' ' );

											switch ( view ) {
											case 'Desktop':
												setAttributes({
													verticalPosition: Boolean( vertical ) && 'center' !== vertical ? vertical : undefined,
													horizontalPosition: Boolean( horizontal ) && 'center' !== horizontal ? horizontal : undefined
												});
												break;
											case 'Tablet':
												setAttributes({
													verticalPositionTabelt: Boolean( vertical ) && 'center' !== vertical ? vertical : undefined,
													horizontalPositionTablet: Boolean( horizontal ) && 'center' !== horizontal ? horizontal : undefined
												});
												break;
											case 'Mobile':
												setAttributes({
													verticalPositionMobile: Boolean( vertical ) && 'center' !== vertical ? vertical : undefined,
													horizontalPositionMobile: Boolean( horizontal ) && 'center' !== horizontal ? horizontal : undefined
												});
												break;
											}
										}}
									/>
								</div>

							</ResponsiveControl>

						</PanelBody>
						<PanelBody
							title={ __( 'Frequency and Close settings', 'otter-blocks' )}
						>
							{ applyFilters( 'otter.popupBlock.controls', <Controls />, attributes, setAttributes ) }
						</PanelBody>
					</Fragment>
				)}

				{
					'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Dimensions', 'otter-blocks' ) }
								initialOpen={ true }
							>
								<ResponsiveControl
									label={ __( 'Width', 'otter-blocks' ) }
								>
									<UnitControl

										value={ responsiveGetAttributes([
											attributes.width,
											attributes.widthTablet,
											attributes.widthMobile
										]) ?? '500px' }
										onChange={ value => {
											responsiveSetAttributes( value, [ 'width', 'widthTablet', 'widthMobile' ]);
										}}
									/>
								</ResponsiveControl>

								<ResponsiveControl
									label={ __( 'Height', 'otter-blocks' ) }
								>
									<UnitControl
										value={ responsiveGetAttributes([
											attributes.height,
											attributes.heightTablet,
											attributes.heightMobile
										]) ?? '400px' }
										onChange={ value => {
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
										]) ?? { top: '0px', bottom: '0px', left: '0px', right: '0px' } }
										onChange={ value => {
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
								initialOpen={ true }
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
								initialOpen={ false }
							>
								<RangeControl
									label={ __( 'Overlay Opacity', 'otter-blocks' ) }
									value={ attributes.overlayOpacity }
									initialPosition={ 100 }
									onChange={ value => setAttributes({ overlayOpacity: value !== undefined ? Number( value ) : undefined }) }
									allowReset
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Close Button', 'otter-blocks' ) }
								initialOpen={ false }
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
									value={ attributes.closeButtonType }
									onChange={ value => setAttributes({ closeButtonType: 'none' !== value ? value : undefined })}
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Border', 'otter-blocks' ) }
								initialOpen={ false }
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
									id="o-brd-raduis-box"
									label={ __( 'Border Radius', 'otter-blocks' ) }
									values={ attributes.borderRadius ?? { top: '0px', bottom: '0px', left: '0px', right: '0px' } }
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

