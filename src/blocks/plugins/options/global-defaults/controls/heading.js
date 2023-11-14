/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';

import {
	isObjectLike
} from 'lodash';

import { _px, compactObject } from '../../../../helpers/helper-functions';
import { useResponsiveAttributes } from '../../../../helpers/utility-hooks';
import { ControlPanelControl, ResponsiveControl } from '../../../../components';
import { makeBox } from '../../../copy-paste/utils';
import TypographySelectorControl from '../../../../components/typography-selector-control';

const Heading = ({
	blockName,
	defaults: attributes,
	changeConfig
}) => {

	const setAttributes = x => {
		changeConfig( blockName, x );
	};

	const { responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const oldPaddingDesktop = 'unlinked' === attributes.paddingType ? ({
		top: _px( attributes.paddingTop ) ?? '0px',
		bottom: _px( attributes.paddingBottom ) ?? '0px',
		right: _px( attributes.paddingRight ) ?? '0px',
		left: _px( attributes.paddingLeft ) ?? '0px'
	}) : ( isFinite( attributes.padding ) ? makeBox( _px( attributes.padding ) ) : {
		top: '0px',
		bottom: '0px',
		right: '0px',
		left: '0px'
	});

	const oldPaddingTablet = 'unlinked' === attributes.paddingTypeTablet ? ({
		top: _px( attributes.paddingTopTablet ) ?? '0px',
		bottom: _px( attributes.paddingBottomTablet ) ?? '0px',
		right: _px( attributes.paddingRightTablet ) ?? '0px',
		left: _px( attributes.paddingLeftTablet ) ?? '0px'
	}) : ( isFinite( attributes.paddingTablet ) ? makeBox( _px( attributes.paddingTablet ) ) : undefined );

	const oldPaddingMobile = 'unlinked' === attributes.paddingTypeMobile ?  ({
		top: _px( attributes.paddingTopMobile ) ?? '0px',
		bottom: _px( attributes.paddingBottomMobile ) ?? '0px',
		right: _px( attributes.paddingRightMobile ) ?? '0px',
		left: _px( attributes.paddingLeftMobile ) ?? '0px'
	}) : ( isFinite( attributes.paddingMobile ) ? makeBox( _px( attributes.paddingMobile ) ) : undefined );

	const oldMarginDesktop = undefined === attributes.marginType ?  ({
		top: _px( attributes.marginTop ) ?? '0px',
		bottom: _px( attributes.marginBottom ) ?? '25px'
	}) : ( isFinite( attributes.margin ) ? makeBox( _px( attributes.margin ) ) : undefined );

	const oldMarginTablet = undefined === attributes.marginTypeTablet ? ({
		top: _px( attributes.marginTopTablet ) ?? '0px',
		bottom: _px( attributes.marginBottomTablet ) ?? '0px'
	}) : ( isFinite( attributes.marginTablet ) ? makeBox( _px( attributes.marginTablet ) ) : undefined ) ;

	const oldMarginMobile = undefined === attributes.marginTypeMobile ?  ({
		top: _px( attributes.marginTopMobile ) ?? '0px',
		bottom: _px( attributes.marginBottomMobile ) ?? '0px'
	}) : ( isFinite( attributes.marginMobile ) ? makeBox( _px( attributes.marginMobile ) ) : undefined );

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Typography', 'otter-blocks' ) }
				initialOpen={ true }
			>
				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
				/>

				<TypographySelectorControl
					enableComponents={{
						fontFamily: true,
						appearance: true,
						lineHeight: true,
						letterCase: true,
						spacing: true,
						variant: true
					}}

					componentsValue={{
						fontSize: _px( responsiveGetAttributes([ attributes.fontSize, attributes.fontSizeTablet, attributes.fontSizeMobile  ]) ),
						fontFamily: attributes.fontFamily,
						lineHeight: attributes.lineHeight,
						appearance: attributes.fontStyle,
						letterCase: attributes.textTransform,
						spacing: attributes.letterSpacing,
						variant: attributes.fontVariant
					}}

					onChange={ ( values ) => {
						setAttributes({
							fontFamily: values.fontFamily,
							lineHeight: values.lineHeight,
							fontStyle: values.appearance,
							textTransform: values.letterCase,
							letterSpacing: values.spacing,
							[responsiveGetAttributes([ 'fontSize', 'fontSizeTablet', 'fontSizeMobile' ]) ?? 'fontSize']: values.fontSize,
							fontVariant: values.variant
						});
					} }

					onReset={ field => {
						if ( 'fontSize' === field ) {
							setAttributes({
								[responsiveGetAttributes([ 'fontSize', 'fontSizeTablet', 'fontSizeMobile' ])]: undefined
							});
						} else {
							setAttributes({
								[fieldMapping[field]]: undefined
							});
						}
					}}

					allowVariants={true}
				/>

			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: attributes.headingColor,
						onChange: headingColor => setAttributes({ headingColor }),
						label: __( 'Text', 'otter-blocks' ),
						isShownByDefault: true
					},
					{
						value: attributes.backgroundColor,
						onChange: backgroundColor => setAttributes({ backgroundColor }),
						label: __( 'Background', 'otter-blocks' ),
						isShownByDefault: true
					},
					{
						value: attributes.linkColor,
						onChange: linkColor => setAttributes({ linkColor }),
						label: __( 'Link', 'otter-blocks' ),
						isShownByDefault: false
					},
					{
						value: attributes.linkHoverColor,
						onChange: linkHoverColor => setAttributes({ linkHoverColor }),
						label: __( 'Link Hover', 'otter-blocks' ),
						isShownByDefault: false
					},
					{
						value: attributes.highlightColor,
						onChange: highlightColor => setAttributes({ highlightColor }),
						label: __( 'Highlight Text', 'otter-blocks' ),
						isShownByDefault: false
					},
					{
						value: attributes.highlightBackground,
						onChange: highlightBackground => setAttributes({ highlightBackground }),
						label: __( 'Highlight Background', 'otter-blocks' ),
						isShownByDefault: false
					}
				] }
			/>

			<PanelBody
				title={ __( 'Dimensions', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<ResponsiveControl
					label={ __( 'Screen Type', 'otter-blocks' ) }
				>
					<BoxControl
						label={ __( 'Padding', 'otter-blocks' ) }
						values={
							compactObject(
								responsiveGetAttributes([
									isObjectLike( attributes.padding ) ?  attributes.padding : oldPaddingDesktop,
									isObjectLike( attributes.paddingTablet ) ? attributes.paddingTablet : oldPaddingTablet,
									isObjectLike( attributes.paddingMobile ) ?  attributes.paddingMobile : oldPaddingMobile
								])
							) ?? makeBox( '0px' )
						}
						onChange={ value => {
							setAttributes({
								[ responsiveGetAttributes([ 'padding', 'paddingTablet', 'paddingMobile' ]) ?? 'padding' ]: value
							});
						} }
					/>

					<BoxControl
						label={ __( 'Margin', 'otter-blocks' ) }
						values={
							compactObject(
								responsiveGetAttributes([
									isObjectLike( attributes.margin ) ? attributes.margin : oldMarginDesktop,
									isObjectLike( attributes.marginTablet ) ? attributes.marginTablet : oldMarginTablet,
									isObjectLike( attributes.marginMobile ) ?  attributes.marginMobile : oldMarginMobile
								])
							) ?? {
								top: '0px',
								bottom: '25px'
							}
						}
						onChange={ value => {
							setAttributes({
								[ responsiveGetAttributes([ 'margin', 'marginTablet', 'marginMobile' ]) ?? 'margin' ]: value
							});
						} }
						sides={ [ 'top', 'bottom' ] }
					/>
				</ResponsiveControl>
			</PanelBody>

			<PanelBody
				title={ __( 'Shadow', 'otter-blocks' ) }
				initialOpen={ false }
				className="o-adv-h-panel"
			>
				<ToggleControl
					label={ __( 'Enable Text Shadow', 'otter-blocks' ) }
					checked={ attributes.textShadow }
					onChange={ textShadow => setAttributes({ textShadow }) }
				/>

				{ attributes.textShadow && (
					<Fragment>
						<ColorGradientControl
							label={ __( 'Color', 'otter-blocks' ) }
							colorValue={ attributes.textShadowColor }
							onColorChange={ textShadowColor => setAttributes({ textShadowColor }) }
						/>

						<ControlPanelControl
							label={ __( 'Shadow Properties', 'otter-blocks' ) }
						>
							<RangeControl
								label={ __( 'Opacity', 'otter-blocks' ) }
								value={ attributes.textShadowColorOpacity }
								onChange={ textShadowColorOpacity => setAttributes({ textShadowColorOpacity }) }
								min={ 0 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Blur', 'otter-blocks' ) }
								value={ attributes.textShadowBlur }
								onChange={ textShadowBlur => setAttributes({ textShadowBlur }) }
								min={ 0 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Horizontal', 'otter-blocks' ) }
								value={ attributes.textShadowHorizontal }
								onChange={ textShadowHorizontal => setAttributes({ textShadowHorizontal }) }
								min={ -100 }
								max={ 100 }
							/>

							<RangeControl
								label={ __( 'Vertical', 'otter-blocks' ) }
								value={ attributes.textShadowVertical }
								onChange={ textShadowVertical => setAttributes({ textShadowVertical }) }
								min={ -100 }
								max={ 100 }
							/>
						</ControlPanelControl>

					</Fragment>
				) }

			</PanelBody>
		</Fragment>
	);
};

export default Heading;
