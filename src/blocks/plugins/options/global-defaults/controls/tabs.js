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


const TabsControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>

			<RangeControl
				label={ __( 'Border Width', 'otter-blocks' ) }
				value={ defaults.borderWidth }
				onChange={ borderWidth => changeConfig( blockName, {borderWidth}) }
				min={ 0 }
				max={ 5 }
				allowReset={true}
			/>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: defaults.activeTitleColor,
						onChange: activeTitleColor => changeConfig( blockName, {activeTitleColor}),
						label: __( 'Active Title Color', 'otter-blocks' )
					},
					{
						value: defaults.tabColor,
						onChange: tabColor => changeConfig( blockName, {tabColor}),
						label: __( 'Background', 'otter-blocks' )
					},
					{
						value: defaults.borderColor,
						onChange: borderColor => changeConfig( blockName, {borderColor}),
						label: __( 'Border Color', 'otter-blocks' )
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

export default TabsControl;
