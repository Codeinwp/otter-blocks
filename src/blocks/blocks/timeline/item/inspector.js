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
	ToggleControl,
	__experimentalBoxControl as BoxControl
} from '@wordpress/components';

import {
	Fragment
} from '@wordpress/element';

/**
 * Internal dependencies
*/
import { useTabSwitch } from '../../../helpers/block-utility.js';
import { IconPickerControl, InspectorHeader } from '../../../components/index.js';
import { stringToBox } from '../../../helpers/helper-functions.js';

/**
 * Timeline item inspector component.
 *
 * @param {import('../types.js').TimelineItemInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
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
						<PanelColorSettings
							title={ __( 'Colors', 'otter-blocks' ) }
							initialOpen={ false }
							colorSettings={ [
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
