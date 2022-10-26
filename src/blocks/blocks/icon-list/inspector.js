/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings,
	ContrastChecker
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	FontSizePicker,
	__experimentalUnitControl as UnitControl,
	BaseControl
} from '@wordpress/components';

import {
	Fragment,
	lazy,
	Suspense,
	useState
} from '@wordpress/element';
import InspectorHeader from '../../components/inspector-header/index.js';
import { _px } from '../../helpers/helper-functions.js';
import ToogleGroupControl from '../../components/toogle-group-control/index.js';
import { alignCenter, alignLeft, alignRight } from '@wordpress/icons';
import ResponsiveControl from '../../components/responsive-control/index.js';
import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';

/**
 * Internal dependencies
 */
import IconPickerControl from '../../components/icon-picker-control/index.js';

/**
 *
 * @param {import('./types.js').IconsListInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const [ tab, setTab ] = useState( 'settings' );

	const { responsiveSetAttributes, responsiveGetAttributes } = useResponsiveAttributes( setAttributes );

	const changeLibrary = value => {
		setAttributes({
			defaultLibrary: value,
			defaultIcon: undefined,
			defaultPrefix: 'fas'
		});
	};

	const changeIcon = value => {
		if ( 'image' === attributes.defaultLibrary && value?.url ) {
			return setAttributes({ defaultIcon: value.url });
		}

		if ( 'object' === typeof value ) {
			setAttributes({
				defaultIcon: value.name,
				defaultPrefix: value.prefix
			});
		} else {
			setAttributes({ defaultIcon: value });
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

				{ 'settings' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Layout', 'otter-blocks' ) }
						>
							<ResponsiveControl
								label={ __( 'Alignment', 'otter-blocks' ) }
							>
								<ToogleGroupControl
									value={ responsiveGetAttributes([ attributes.horizontalAlign, attributes.alignmentTablet, attributes.alignmentMobile  ]) }
									onChange={ () => {} }
									options={[
										{
											icon: alignLeft,
											label: __( 'Left', 'otter-blocks' ),
											value: 'flex-start'
										},
										{
											icon: alignCenter,
											label: __( 'Center', 'otter-blocks' ),
											value: 'center'
										},
										{
											icon: alignRight,
											label: __( 'Right', 'otter-blocks' ),
											value: 'flex-end'
										}
									]}
								/>
							</ResponsiveControl>

						</PanelBody>
						<PanelBody
							title={ __( 'Icons', 'otter-blocks' ) }
						>
							<Suspense fallback={ <Placeholder><Spinner /></Placeholder> }>
								<IconPickerControl
									label={ __( 'Icon Picker', 'otter-blocks' ) }
									library={ attributes.defaultLibrary }
									prefix={ attributes.defaultPrefix }
									icon={ attributes.defaultIcon }
									changeLibrary={ changeLibrary }
									onChange={ changeIcon }
									allowImage
								/>
							</Suspense>
						</PanelBody>
					</Fragment>
				) }

				{ 'style' === tab && (
					<Fragment>
						<PanelColorSettings
							title={ __( 'Color', 'otter-blocks' ) }
							initialOpen={ true }
							colorSettings={ [
								{
									value: attributes.defaultIconColor,
									onChange: defaultIconColor => setAttributes({ defaultIconColor }),
									label: __( 'Icon', 'otter-blocks' )
								},
								{
									value: attributes.defaultIconColor,
									onChange: defaultIconColor => setAttributes({ defaultIconColor }),
									label: __( 'Text', 'otter-blocks' )
								}
							] }
						/>
						<PanelBody
							title={ __( 'Size', 'otter-blocks' ) }
						>
							<BaseControl
								label={ __( 'Font Size', 'otter-blocks' ) }
								__nextHasNoMarginBottom={ true }

								// help={ __( 'The size of the font size of the content and icon.', 'otter-blocks' ) }
							>
								<FontSizePicker
									value={ _px( attributes.defaultSize ) }
									onChange={ defaultSize => setAttributes({ defaultSize }) }
									fontSizes={[
										{
											name: 'Small',
											size: '12px',
											slug: 'small'
										},
										{
											name: 'Normal',
											size: '16px',
											slug: 'normal'
										},
										{
											name: 'Big',
											size: '26px',
											slug: 'big'
										}
									]}
									withReset={ true }
								/>
							</BaseControl>

							<BaseControl
								label={ __( 'Icon Size', 'otter-blocks' ) }
								__nextHasNoMarginBottom={ true }

								//help={ __( 'The size of the font size of the content and icon.', 'otter-blocks' ) }
							>
								<FontSizePicker
									value={ attributes.defaultIconSize }
									onChange={ defaultIconSize => setAttributes({ defaultIconSize }) }
									fontSizes={[
										{
											name: 'Small',
											size: '12px',
											slug: 'small'
										},
										{
											name: 'Normal',
											size: '16px',
											slug: 'normal'
										},
										{
											name: 'Big',
											size: '26px',
											slug: 'big'
										}
									]}
									withReset={ true }
								/>
							</BaseControl>
						</PanelBody>
						<PanelBody
							title={ __( 'Dimensions', 'otter-blocks' ) }
						>
							<UnitControl
								label={ __( 'Space between List items', 'otter-blocks' ) }
								value={ attributes.gap }
								onChange={ gap => setAttributes({ gap }) }
							/>

							<br/>

							<UnitControl
								label={ __( 'Space between Icon and Label', 'otter-blocks' ) }
								value={ attributes.gapIconLabel }
								onChange={ gapIconLabel => setAttributes({ gapIconLabel }) }
							/>
						</PanelBody>
					</Fragment>
				) }
			</div>
		</InspectorControls>
	);
};

export default Inspector;
