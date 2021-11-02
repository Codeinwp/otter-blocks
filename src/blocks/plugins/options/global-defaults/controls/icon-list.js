/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	Placeholder,
	Spinner
} from '@wordpress/components';

import {
	__experimentalColorGradientControl as ColorGradientControl
} from '@wordpress/block-editor';

import {
	lazy,
	Suspense
} from '@wordpress/element';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */

const IconPickerControl = lazy( () => import( '../../../../components/icon-picker-control/index.js' ) );

const IconListControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	const changeLibrary = value => {
		changeConfig( blockName, {
			defaultLibrary: value,
			defaultIcon: undefined,
			defaultPrefix: 'fas'
		});
	};

	const changeIcon = value => {
		if ( 'object' === typeof value ) {
			changeConfig( blockName, {
				defaultIcon: value.name,
				defaultPrefix: value.prefix
			});
		} else {
			changeConfig( blockName, { defaultIcon: value });
		}
	};

	return (
		<Fragment>

			<Suspense fallback={ <Placeholder><Spinner /></Placeholder> }>
				<IconPickerControl
					label={ __( 'Icon Picker', 'otter-blocks' ) }
					library={ defaults.defaultLibrary }
					prefix={ defaults.defaultPrefix }
					icon={ defaults.defaultIcon }
					changeLibrary={ changeLibrary }
					onChange={ changeIcon }
				/>
			</Suspense>

			<RangeControl
				label={ __( 'Font Size', 'otter-blocks' ) }
				help={ __( 'The size of the font size of the content and icon.', 'otter-blocks' ) }
				value={ defaults.defaultSize }
				onChange={ defaultSize => changeConfig( blockName, {defaultSize}) }
				min={ 0 }
				max={ 60 }
			/>

			<RangeControl
				label={ __( 'Gap', 'otter-blocks' ) }
				help={ __( 'The distance between the items.', 'otter-blocks' ) }
				value={ defaults.gap }
				onChange={ gap => changeConfig( blockName, {gap}) }
				min={ 0 }
				max={ 60 }
			/>

			<ColorGradientControl
				label={ __( 'Content Color', 'otter-blocks' ) }
				colorValue={ defaults.defaultContentColor }
				onColorChange={ defaultContentColor => changeConfig( blockName, {defaultContentColor}) }
			/>

			<ColorGradientControl
				label={ __( 'Icon Color', 'otter-blocks' ) }
				colorValue={ defaults.defaultIconColor }
				onColorChange={ defaultIconColor => changeConfig( blockName, {defaultIconColor}) }
			/>
		</Fragment>
	);
};

export default IconListControl;
