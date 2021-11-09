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


const ProgressBarControl = ({
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
				label={ __( 'Border Radius', 'otter-blocks' ) }
				help={ __( 'Round the corners of the progress bar.', 'otter-blocks' ) }
				value={ defaults.borderRadius }
				onChange={ borderRadius => changeConfig( blockName, {borderRadius}) }
				initialPosition={ 5 }
				min={ 0 }
				max={ 35 }
				allowReset={true}
			/>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: defaults.barBackgroundColor,
						onChange: barBackgroundColor => changeConfig( blockName, {barBackgroundColor}),
						label: __( 'Bar', 'otter-blocks' )
					},
					{
						value: defaults.titleColor,
						onChange: titleColor => changeConfig( blockName, {titleColor}),
						label: __( 'Title', 'otter-blocks' )
					},
					{
						value: defaults.percentageColor,
						onChange: percentageColor => changeConfig( blockName, {percentageColor}),
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

export default ProgressBarControl;
