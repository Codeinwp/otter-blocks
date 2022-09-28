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

const Accordion = ({
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
					onChange={ value => changeConfig( blockName, { gap: value }) }
				/>
			</PanelBody>

			<PanelColorSettings
				title={ __( 'Color', 'otter-blocks' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						value: defaults.titleColor,
						onChange: value => changeConfig( blockName, { titleColor: value }),
						label: __( 'Title', 'otter-blocks' )
					},
					{
						value: defaults.activeTitleColor,
						onChange: value => changeConfig( blockName, { activeTitleColor: value }),
						label: __( 'Active tab title', 'otter-blocks' )
					},
					{
						value: defaults.titleBackground,
						onChange: value => changeConfig( blockName, { titleBackground: value }),
						label: __( 'Title Background', 'otter-blocks' )
					},
					{
						value: defaults.activeTitleBackground,
						onChange: value => changeConfig( blockName, { activeTitleBackground: value }),
						label: __( 'Active tab title Background', 'otter-blocks' )
					},
					{
						value: defaults.contentBackground,
						onChange: value => changeConfig( blockName, { contentBackground: value }),
						label: __( 'Content background', 'otter-blocks' )
					},
					{
						value: defaults.borderColor,
						onChange: value => changeConfig( blockName, { borderColor: value }),
						label: __( 'Border', 'otter-blocks' )
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

export default Accordion;
