/**
 * External dependencies
 */
import {
	alignCenter,
	alignLeft,
	alignRight
} from '@wordpress/icons';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	isEmpty,
	isNumber,
	pick
} from 'lodash';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	BaseControl,
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
	__experimentalBoxControl as BoxControl,
	__experimentalBorderBoxControl as BorderBoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	FontSizePicker,
	Spinner
} from '@wordpress/components';

import {
	Fragment,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
*/
import { useTabSwitch } from '../../../helpers/block-utility.js';
import { IconPickerControl, InspectorHeader, SyncColorPanel } from '../../../components/index.js';

/**
 *
 * @param {import('../../types.js').TimelineGroupInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	currentSide,
	setSide
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
								value={ attributes.iconSize }
								onChange={ ( value ) => setAttributes({ iconSize: value }) }
								max={ 100 }
							/>
							<UnitControl
								label={ __( 'Vertical Line Width', 'otter-blocks' ) }
								value={ attributes.verticalLineWidth }
								onChange={ ( value ) => setAttributes({ verticalLineWidth: value }) }
								max={ 100 }
							/>
						</PanelBody>
						<SyncColorPanel
							label={ __( 'Colors', 'otter-blocks' ) }
							isSynced={ attributes.isSynced ?? [] }
							initialOpen={ false }
							setAttributes={ setAttributes }
							options={ [
								{
									value: attributes.verticalLineColor,
									label: __( 'Vertical Line', 'otter-blocks' ),
									slug: 'verticalLineColor'
								},
								{
									value: attributes.iconColor,
									label: __( 'Icon', 'otter-blocks' ),
									slug: 'iconColor'
								},
								{
									value: attributes.containerBorderColor,
									label: __( 'Border', 'otter-blocks' ),
									slug: 'containerBorderColor'
								},
								{
									value: attributes.containerBackgroundColor,
									label: __( 'Background', 'otter-blocks' ),
									slug: 'containerBackgroundColor'
								}
							] }
						/>
						<PanelBody
							title={ __( 'Container', 'otter-blocks' ) }
							initialOpen={ false }
						>
							<BoxControl
								label={ __( 'Padding', 'otter-blocks' ) }
								values={ attributes.containerPadding }
								onChange={ ( value ) => setAttributes({ containerPadding: value }) }
							/>
							<BoxControl
								label={ __( 'Border Width', 'otter-blocks' ) }
								values={ attributes.containerRadius }
								onChange={ ( value ) => setAttributes({ containerRadius: value }) }
								sides={[ 'horizontal' | 'vertical' ]}
							/>
							<BoxControl
								label={ __( 'Border Radius', 'otter-blocks' ) }
								values={ attributes.containerRadius }
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
