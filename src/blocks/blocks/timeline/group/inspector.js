/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	__experimentalUnitControl as UnitControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useTabSwitch } from '../../../helpers/block-utility.js';
import { InspectorHeader } from '../../../components/index.js';
import { stringToBox } from '../../../helpers/helper-functions.js';

/**
 *	Timeline parent inspector component.
 *
 * @param {import('../types').TimelineGroupInspectorProps} props
 * @return
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const [ tab, setTab ] = useTabSwitch( attributes.id, 'settings' );

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

			<div>
				{ 'settings' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Settings', 'otter-blocks' ) }
						>
							<SelectControl
								label={ __( 'Timeline Alignment', 'otter-blocks' ) }
								value={ attributes.containersAlignment }
								options={[
									{
										label: __( 'Alternative', 'otter-blocks' ),
										value: 'alternative'
									},
									{
										label: __( 'Reverse Alternative', 'otter-blocks' ),
										value: 'reverse-alternative'
									},
									{
										label: __( 'Left Side', 'otter-blocks' ),
										value: 'left'
									},
									{
										label: __( 'Right Side', 'otter-blocks' ),
										value: 'right'
									}
								]}
								onChange={ ( value ) => setAttributes({ containersAlignment: value }) }
							/>
						</PanelBody>
					</Fragment>
				) }

				{ 'style' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Dimensions', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<UnitControl
								label={ __( 'Icon Size', 'otter-blocks' ) }
								value={ attributes.iconSize ?? '20px' }
								onChange={ ( value ) => setAttributes({ iconSize: value }) }
								max={ 100 }
							/>
							<UnitControl
								label={ __( 'Vertical Line Width', 'otter-blocks' ) }
								value={ attributes.verticalLineWidth ?? '6px' }
								onChange={ ( value ) => setAttributes({ verticalLineWidth: value }) }
								max={ 100 }
							/>
						</PanelBody>
						<PanelColorSettings
							title={ __( 'Colors', 'otter-blocks' ) }
							initialOpen={ false }
							colorSettings={ [
								{
									value: attributes.verticalLineColor,
									onChange: verticalLineColor => setAttributes({ verticalLineColor }),
									label: __( 'Vertical Line', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.iconColor,
									onChange: iconColor => setAttributes({ iconColor }),
									label: __( 'Icon', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.containerBorderColor,
									onChange: containerBorderColor => setAttributes({ containerBorderColor }),
									label: __( 'Border', 'otter-blocks' ),
									isShownByDefault: false
								},
								{
									value: attributes.containerBackgroundColor,
									onChange: containerBackgroundColor => setAttributes({ containerBackgroundColor }),
									label: __( 'Background', 'otter-blocks' ),
									isShownByDefault: false
								}
							] }
						/>
						<PanelBody
							title={ __( 'Container', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BoxControl
								label={ __( 'Padding', 'otter-blocks' ) }
								values={ attributes.containerPadding ?? stringToBox( '20px' ) }
								onChange={ ( value ) => setAttributes({ containerPadding: value }) }
							/>
							<BoxControl
								label={ __( 'Border Width', 'otter-blocks' ) }
								values={ attributes.containerBorder ?? stringToBox( '0px' ) }
								onChange={ ( value ) => setAttributes({ containerBorder: value }) }
							/>
							<BoxControl
								label={ __( 'Border Radius', 'otter-blocks' ) }
								values={ attributes.containerRadius ?? stringToBox( '8px' ) }
								onChange={ ( value ) => setAttributes({ containerRadius: value }) }
								id="o-border-raduis-box"
							/>
						</PanelBody>
					</Fragment>
				) }
			</div>
		</InspectorControls>
	);
};

export default Inspector;
