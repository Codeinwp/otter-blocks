/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { IconPickerControl } from '../../../components/index.js';

/**
 *
 * @param {import('./types.js').IconsListItemInspectorProps} props
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {
	const changeIcon = value => {
		if ( 'image' === attributes.library && value?.url ) {
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
			library: value,
			icon: undefined,
			iconPrefix: 'fab'
		});
	};

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<IconPickerControl
					label={ __( 'Icon Picker', 'otter-blocks' ) }
					library={ attributes.library }
					prefix={ attributes.iconPrefix }
					icon={ attributes.icon }
					changeLibrary={ changeLibrary }
					onChange={ changeIcon }
					allowImage
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ true }
				colorSettings={ [
					{
						value: attributes.contentColor,
						onChange: contentColor => setAttributes({ contentColor }),
						label: __( 'Content Color', 'otter-blocks' ),
						isShownByDefault: true
					},
					...( 'image' !== attributes.library ? [
						{
							value: attributes.iconColor,
							onChange: iconColor => setAttributes({ iconColor }),
							label: __( 'Icon Color', 'otter-blocks' ),
							isShownByDefault: true
						}
					] : [])
				] }
			/>
		</InspectorControls>
	);
};

export default Inspector;
