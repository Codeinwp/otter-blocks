/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	ContrastChecker,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	SelectControl,
	PanelBody
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */


const AccordionControl = ({
	blockName,
	defaults,
	changeConfig
}) => {

	return (
		<Fragment>
			<PanelBody
				title={ __( 'Setting', 'otter-blocks' )}
			>
				<SelectControl
					label={ __( 'Gap', 'otter-blocks' ) }
					value={ defaults.gap }
					options={ [
						{ label: __( 'No Gap', 'otter-blocks' ), value: '' },
						{ label: __( 'Narrow (5px)', 'otter-blocks' ), value: 'narrow' },
						{ label: __( 'Wide (10px)', 'otter-blocks' ), value: 'wide' },
						{ label: __( 'Wider (20px)', 'otter-blocks' ), value: 'wider' }
					] }
					onChange={ gap => changeConfig( blockName, {gap}) }
				/>
			</PanelBody>

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
						value: defaults.titleBackground,
						onChange: titleBackground => changeConfig( blockName, {titleBackground}),
						label: __( 'Title Background', 'otter-blocks' )
					},
					{
						value: defaults.contentBackground,
						onChange: contentBackground => changeConfig( blockName, {contentBackground}),
						label: __( 'Content Background', 'otter-blocks' )
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
						textColor: defaults.titleColor,
						backgroundColor: defaults.titleBackground
					} }
				/>
			</PanelColorSettings>
		</Fragment>
	);
};

export default AccordionControl;
