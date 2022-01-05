/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls,
	MediaPlaceholder
} from '@wordpress/block-editor';

import {
	PanelBody,
	Placeholder,
	ToggleControl,
	Spinner
} from '@wordpress/components';

import {
	lazy,
	Suspense
} from '@wordpress/element';

/**
 * Internal dependencies
 */
const IconPickerControl = lazy( () => import( '../../../components/icon-picker-control/index.js' ) );

const Inspector = ({
	attributes,
	setAttributes
}) => {
	const changeIcon = value => {
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
				{
					( attributes.isImage ) ? (
						<MediaPlaceholder
							labels={ {
								title: __( 'Media Image', 'otter-blocks' )
							} }
							accept="image/*"
							allowedTypes={ [ 'image' ] }
							value={ attributes.image }
							onSelect={ value => setAttributes({ image: pick( value, [ 'id', 'alt', 'url' ]) }) }
						/>
					) : (
						<Suspense fallback={ <Placeholder><Spinner /></Placeholder> }>
							<IconPickerControl
								label={ __( 'Icon Picker', 'otter-blocks' ) }
								library={ attributes.library }
								prefix={ attributes.prefix }
								icon={ attributes.icon }
								changeLibrary={ changeLibrary }
								onChange={ changeIcon }
							/>
						</Suspense>
					)
				}

				<ToggleControl
					label={ __( 'Use images instead of icons.', 'otter-blocks' ) }
					checked={ attributes.isImage }
					onChange={ isImage => setAttributes({ isImage })}
				/>

				<ColorGradientControl
					label={ __( 'Content Color', 'otter-blocks' ) }
					colorValue={ attributes.contentColor }
					onColorChange={ onDefaultContentColorChange }
				/>

				<ColorGradientControl
					label={ __( 'Icon Color', 'otter-blocks' ) }
					colorValue={ attributes.iconColor }
					onColorChange={ onDefaultIconColorChange }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;
