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
	TextControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl,
	__experimentalAlignmentMatrixControl as AlignmentMatrixControl
} from '@wordpress/components';

import { Fragment, useState } from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import {
	BoxShadowControl,
	InspectorExtensions,
	InspectorHeader,
	Notice,
	ResponsiveControl
} from '../../../blocks/components/index.js';

import { removeBoxDefaultValues, setUtm } from '../../../blocks/helpers/helper-functions.js';
import { useResponsiveAttributes } from '../../../blocks/helpers/utility-hooks.js';
import { useTabSwitch } from '../../../blocks/helpers/block-utility.js';

/**
 *
 * @param {import('./types').PopupInspectorProps} param0
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const [ tab, setTab ] = useTabSwitch( attributes.id, 'settings' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

	const changeBoxShadow = data => {
		const boxShadow = { ...attributes.boxShadow };
		Object.entries( data ).map( ([ key, val ] = data ) => {
			boxShadow[key] = val;
		});

		setAttributes({ boxShadow });
	};

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
			</Fragment>
		);
	};

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
							title={ __( 'Modal Settings', 'otter-blocks' )}
							initialOpen={ true }
						>
							<TextControl
								label={ __( 'Anchor', 'otter-blocks' ) }
								help={ __( 'You can use this anchor as an anchor link anywhere on the page to open the popup.', 'otter-blocks' ) }
								value={ attributes.anchor }
								onChange={ anchor => setAttributes({ anchor }) }
							/>
							<ToggleControl
								label={ __( 'Close On Anchor Click', 'otter-blocks' ) }
								checked={ attributes.anchorClose }
								onChange={ () => setAttributes({ anchorClose: ! attributes.anchorClose }) }
							/>

							{ attributes.anchorClose && (
								<TextControl
									label={ __( 'Close Anchor', 'otter-blocks' ) }
									help={ __( 'You can use this anchor as an anchor link anywhere on the page to close the popup.', 'otter-blocks' ) }
									value={ attributes.closeAnchor }
									onChange={ closeAnchor => setAttributes({ closeAnchor }) }
								/>
							) }
						</PanelBody>

						<PanelBody
							title={ __( 'Modal Position', 'otter-blocks' )}
							initialOpen={ false }
						>
							<ResponsiveControl
								label={ __( 'Screen Type', 'otter-blocks' ) }
							>
								<div className="o-position-picker">
									<AlignmentMatrixControl
										value={ responsiveGetAttributes([
											`${	attributes.verticalPosition ?? 'center' } ${ attributes.horizontalPosition ?? 'center' }`,
											`${	attributes.verticalPositionTablet ?? 'center' } ${ attributes.horizontalPositionTablet ?? 'center' }`,
											`${	attributes.verticalPositionMobile ?? 'center' } ${ attributes.horizontalPositionMobile ?? 'center' }`
										]) }
										onChange={ value => {
											const [ vertical, horizontal ] = value.split( ' ' );
											responsiveSetAttributes( Boolean( vertical ) && 'center' !== vertical ? vertical : undefined, [ 'verticalPosition', 'verticalPositionTablet', 'verticalPositionMobile' ]);
											responsiveSetAttributes( Boolean( horizontal ) && 'center' !== horizontal ? horizontal : undefined, [ 'horizontalPosition', 'horizontalPositionTablet', 'horizontalPositionMobile' ]);
										}}
									/>
								</div>

							</ResponsiveControl>
						</PanelBody>
						<InspectorExtensions />
					</Fragment>
				)}

				{ 'style' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Dimensions', 'otter-blocks' ) }
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

							<SelectControl
								label={ __( 'Height', 'otter-blocks' ) }
								options={ [
									{
										label: __( 'Fit Content', 'otter-blocks' ),
										value: 'none'
									},
									{
										label: __( 'Custom', 'otter-blocks' ),
										value: 'custom'
									}
								] }
								value={ attributes.heightMode }
								onChange={ value => setAttributes({ heightMode: 'none' !== value ? value : undefined })}
							/>

							{
								'custom' === attributes.heightMode && (
									<ResponsiveControl
										label={ __( 'Custom Height', 'otter-blocks' ) }
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
								)
							}

							<ResponsiveControl>
								<BoxControl
									label={ __( 'Padding', 'otter-blocks' ) }
									values={ responsiveGetAttributes([
										attributes.padding,
										attributes.paddingTablet,
										attributes.paddingMobile
									]) ?? { top: '20px', bottom: '20px', left: '20px', right: '20px' } }
									onChange={ value => {
										responsiveSetAttributes(
											removeBoxDefaultValues( value, { top: '20px', bottom: '20px', left: '20px', right: '20px' }),
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
									label: __( 'Background', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.closeColor,
									onChange: closeColor => setAttributes({ closeColor }),
									label: __( 'Close Button', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.overlayColor,
									onChange: overlayColor => setAttributes({ overlayColor }),
									label: __( 'Overlay', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.borderColor,
									onChange: borderColor => setAttributes({ borderColor }),
									label: __( 'Border', 'otter-blocks' ),
									isShownByDefault: false
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
							<BoxControl
								label={ __( 'Width', 'otter-blocks' ) }
								values={ attributes.borderWidth ?? { top: '0px', bottom: '0px', left: '0px', right: '0px' } }
								onChange={ value => {
									setAttributes({
										borderWidth: removeBoxDefaultValues( value, { top: '0px', bottom: '0px', left: '0px', right: '0px' })
									});
								}}
							/>

							<BoxControl
								id="o-border-raduis-box"
								label={ __( 'Radius', 'otter-blocks' ) }
								values={ attributes.borderRadius ?? { top: '0px', bottom: '0px', left: '0px', right: '0px' } }
								onChange={ value => {
									setAttributes({
										borderRadius: removeBoxDefaultValues( value, { top: '0px', bottom: '0px', left: '0px', right: '0px' })
									});
								}}
							/>

							<BoxShadowControl
								boxShadow={ attributes.boxShadow }
								onChange={ changeBoxShadow }
							/>
						</PanelBody>
					</Fragment>
				) }
			</div>
		</InspectorControls>
	);
};

export default Inspector;

