/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	max,
	isNumber
} from 'lodash';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitContol
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	ClearButton,
	ImageGrid,
	InspectorExtensions,
	InspectorHeader,
	ResponsiveControl
} from '../../components/index.js';

import { useResponsiveAttributes } from '../../helpers/utility-hooks.js';
import { _px } from '../../helpers/helper-functions.js';
import { getMaxPerView } from './edit.js';

/**
 *
 * @param {import('./types.js').SliderInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	onSelectImages,
	changePerView
}) => {
	const [ tab, setTab ] = useState( 'settings' );

	const {
		responsiveSetAttributes,
		responsiveGetAttributes
	} = useResponsiveAttributes( setAttributes );

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

			{ 'settings' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Slides', 'otter-blocks' ) }
					>
						{ attributes.images.length && (
							<Fragment>
								<RangeControl
									label={ __( 'Slides Per Page', 'otter-blocks' ) }
									help={ __( 'A number of visible slides.', 'otter-blocks' ) }
									value={ attributes.perView }
									onChange={ changePerView }
									min={ 1 }
									max={ getMaxPerView( attributes?.images?.length ) }
								/>

								{ 1 < attributes.perView && (
									<Fragment>
										<RangeControl
											label={ __( 'Gap', 'otter-blocks' ) }
											help={ __( 'A size of the space between slides.', 'otter-blocks' ) }
											value={ attributes.gap }
											onChange={ value => setAttributes({ gap: Number( value ) }) }
											min={ 0 }
											max={ 100 }
										/>

										<RangeControl
											label={ __( 'Peek', 'otter-blocks' ) }
											help={ __( 'The value of the future slides which have to be visible in the current slide.', 'otter-blocks' ) }
											value={ attributes.peek }
											onChange={ value => setAttributes({ peek: Number( value ) }) }
											min={ 0 }
											max={ 100 }
										/>
									</Fragment>
								) }

								<ToggleControl
									label={ __( 'Hide Arrows', 'otter-blocks' ) }
									help={ __( 'Hide navigation arrows.', 'otter-blocks' ) }
									checked={ attributes.hideArrows }
									onChange={ () => setAttributes({ hideArrows: ! attributes.hideArrows }) }
								/>

								<ToggleControl
									label={ __( 'Hide Pagination', 'otter-blocks' ) }
									help={ __( 'Hide navigation bullets.', 'otter-blocks' ) }
									checked={ attributes.hideBullets }
									onChange={ () => setAttributes({ hideBullets: ! attributes.hideBullets }) }
								/>
							</Fragment>
						) }
					</PanelBody>

					<PanelBody
						title={ __( 'Images', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<ImageGrid
							attributes={ attributes }
							onSelectImages={ onSelectImages }
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Autoplay', 'otter-blocks' ) }
						initialOpen={ false }
					>
						{ attributes.images.length && (
							<Fragment>
								<ToggleControl
									label={ __( 'Autoplay', 'otter-blocks' ) }
									help={ __( 'Autoplay slider in the front.', 'otter-blocks' ) }
									checked={ attributes.autoplay }
									onChange={ () => setAttributes({ autoplay: ! attributes.autoplay }) }
								/>

								{ attributes.autoplay && (
									<RangeControl
										label={ __( 'Delay', 'otter-blocks' ) }
										help={ __( 'Delay in slide change (in seconds).', 'otter-blocks' ) }
										value={ attributes.delay }
										onChange={ delay => setAttributes({ delay }) }
										min={ 1 }
										max={ 10 }
										allowReset
									/>
								) }
							</Fragment>
						) }
					</PanelBody>

					<InspectorExtensions/>
				</Fragment>
			) }

			{ 'style' === tab && (
				<Fragment>
					<PanelBody
						title={ __( 'Dimensions and Motion', 'otter-blocks' ) }
					>
						{ attributes.images.length && (
							<Fragment>
								<ResponsiveControl
									label={ __( 'Height', 'otter-blocks' ) }
								>
									<UnitContol
										value={ responsiveGetAttributes([ _px( attributes.height ), attributes.heightTablet, attributes.heightMobile ]) }
										onChange={ value => responsiveSetAttributes( value, [ 'height', 'heightTablet', 'heightMobile' ]) }
									/>

									<ClearButton
										values={[ 'height', 'heightTablet', 'heightMobile' ]}
										setAttributes={ setAttributes }
									/>
								</ResponsiveControl>

								<UnitContol
									label={ __( 'Width', 'otter-blocks' ) }
									value={ attributes.width }
									onChange={ width => setAttributes({ width }) }
								/>

								<SelectControl
									label={ __( 'Transition', 'otter-blocks' ) }
									value={ attributes.transition || 'ease' }
									options={[
										{
											label: __( 'Linear', 'otter-blocks' ),
											value: 'linear'
										},
										{
											label: __( 'Ease', 'otter-blocks' ),
											value: 'ease'
										},
										{
											label: __( 'Ease In', 'otter-blocks' ),
											value: 'ease-in'
										},
										{
											label: __( 'Ease In Out', 'otter-blocks' ),
											value: 'ease-in-out'
										},
										{
											label: __( 'Bounce', 'otter-blocks' ),
											value: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
										}
									]}
									onChange={ value => setAttributes({ transition: 'ease' !== value ? value : undefined })  }
								/>
							</Fragment>
						) }
					</PanelBody>

					<PanelColorSettings
						title={ __( 'Color', 'otter-blocks' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: attributes.arrowsColor,
								onChange: arrowsColor => setAttributes({ arrowsColor }),
								label: __( 'Arrows', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.arrowsBackgroundColor,
								onChange: arrowsBackgroundColor => setAttributes({ arrowsBackgroundColor }),
								label: __( 'Arrows Background', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.paginationColor,
								onChange: paginationColor => setAttributes({ paginationColor }),
								label: __( 'Pagination', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.paginationActiveColor,
								onChange: paginationActiveColor => setAttributes({ paginationActiveColor }),
								label: __( 'Pagination Active', 'otter-blocks' ),
								isShownByDefault: false
							},
							{
								value: attributes.borderColor ?? ( attributes.borderWidth ? '#000000' : undefined ),
								onChange: borderColor => setAttributes({ borderColor }),
								label: __( 'Border', 'otter-blocks' ),
								isShownByDefault: false
							}
						] }
					/>

					<PanelBody
						title={ __( 'Border', 'otter-blocks' ) }
						initialOpen={ false }
					>
						<UnitContol
							label={ __( 'Width', 'otter-blocks' ) }
							value={ attributes.borderWidth }
							onChange={ borderWidth => setAttributes({ borderWidth }) }
						/>

						<ClearButton
							values={[ 'borderWidth' ]}
							setAttributes={ setAttributes }
						/>

						<br/>

						<UnitContol
							label={ __( 'Radius', 'otter-blocks' ) }
							value={ attributes.borderRadius }
							onChange={ borderRadius => setAttributes({ borderRadius }) }
						/>

						<ClearButton
							values={[ 'borderRadius' ]}
							setAttributes={ setAttributes }
						/>
					</PanelBody>
				</Fragment>
			) }
		</InspectorControls>
	);
};

export default Inspector;
