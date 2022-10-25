/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import IconPickerControl from '../../../components/icon-picker-control/index.js';

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

	const onDefaultContentColorChange = value => {
		setAttributes({ contentColor: value });
	};

	const onDefaultIconColorChange = value => {
		setAttributes({ iconColor: value });
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

				<ColorGradientControl
					label={ __( 'Content Color', 'otter-blocks' ) }
					colorValue={ attributes.contentColor }
					onColorChange={ onDefaultContentColorChange }
				/>

				{ 'image' !== attributes.library && (
					<ColorGradientControl
						label={ __( 'Icon Color', 'otter-blocks' ) }
						colorValue={ attributes.iconColor }
						onColorChange={ onDefaultIconColorChange }
					/>
				) }
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
