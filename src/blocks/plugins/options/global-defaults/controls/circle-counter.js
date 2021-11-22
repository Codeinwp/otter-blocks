/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	RangeControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const CircleCounterControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>

			<RangeControl
				label={ __( 'Height', 'otter-blocks' ) }
				help={ __( 'The height of the progress bar.', 'otter-blocks' ) }
				value={ defaults.height }
				onChange={ height => changeConfig( blockName, {height}) }
				min={ 0 }
				max={ 100 }
				allowReset={true}
			/>

			<RangeControl
				label={ __( 'Circle Thickness', 'otter-blocks' ) }
				help={ __( 'Change the thickness (stroke width) of the circle.', 'otter-blocks' ) }
				value={ defaults.strokeWidth }
				onChange={ strokeWidth => changeConfig( blockName, {strokeWidth}) }
				min={ 0 }
				max={ 20 }
				allowReset={true}
			/>

			<RangeControl
				label={ __( 'Font Size Title', 'otter-blocks' ) }
				help={ __( 'Change the font size of the title.', 'otter-blocks' ) }
				value={ defaults.fontSizeTitle }
				onChange={ fontSizeTitle => changeConfig( blockName, {fontSizeTitle}) }
				min={ 0 }
				max={ 64 }
				allowReset={true}
			/>

			<RangeControl
				label={ __( 'Font Size Percent', 'otter-blocks' ) }
				help={ __( 'Change the font size of the inner text.', 'otter-blocks' ) }
				value={ defaults.fontSizePercent }
				onChange={ fontSizePercent => changeConfig( blockName, {fontSizePercent}) }
				min={ 0 }
				max={ 64 }
				allowReset={true}
			/>


			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: defaults.titleColor,
						onChange: titleColor => changeConfig( blockName, {titleColor}),
						label: __( 'Title', 'otter-blocks' )
					},
					{
						value: defaults.progressColor,
						onChange: progressColor => changeConfig( blockName, {progressColor}),
						label: __( 'Percentage', 'otter-blocks' )
					},
					{
						value: defaults.backgroundColor,
						onChange: backgroundColor => changeConfig( blockName, {backgroundColor}),
						label: __( 'Background', 'otter-blocks' )
					}
				] }
			>
				<ContrastChecker
					{ ...{
						textColor: defaults.activeTitleColor,
						backgroundColor: defaults.tabColor
					} }
				/>
			</PanelColorSettings>
		</Fragment>
	);
};

export default CircleCounterControl;
