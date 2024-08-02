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
import { stringToBox } from '../../../helpers/helper-functions.js';

/**
 * Timeline item inspector component.
 *
 * @param {import('../../types.js').TimelineItemInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes,
	currentSide,
	setSide
}) => {
	const [ tab, setTab ] = useTabSwitch( attributes.id, 'settings' );

	const changeIcon = value => {
		if ( 'image' === attributes.iconType && value?.url ) {
			return setAttributes({ icon: value.url });
		}

		if ( 'object' === typeof value ) {
			setAttributes({
				icon: value.name,
				iconPrefix: value.prefix
			});
		} else {
			setAttributes({ icon: value });
		}
	};

	const changeLibrary = value => {
		setAttributes({
			iconType: value,
			icon: undefined,
			iconPrefix: 'fab'
		});
	};

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
							<ToggleControl
								label={ __( 'Show Icon', 'otter-blocks' ) }
								checked={ attributes.hasIcon }
								onChange={ ( hasIcon ) => setAttributes({ hasIcon }) }
							/>
							{
								attributes.hasIcon && (
									<IconPickerControl
										label={ __( 'Icon Picker', 'otter-blocks' ) }
										library={ attributes.iconType }
										prefix={ attributes.iconPrefix }
										icon={ attributes.icon }
										changeLibrary={ changeLibrary }
										onChange={ changeIcon }
										allowImage
									/>
								)
							}

						</PanelBody>
					</Fragment>
				) }

				{ 'style' === tab && (
					<Fragment>
						<SyncColorPanel
							label={ __( 'Colors', 'otter-blocks' ) }
							isSynced={ attributes.isSynced ?? [] }
							initialOpen={ false }
							setAttributes={ setAttributes }
							options={ [
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
