/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	Placeholder,
	Spinner
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import ButtomItem from './block-item.js';
import AdvancedHeading from './controls/advanced-heading.js';
import ButtonGroup from './controls/button-group.js';
import Button from './controls/button.js';
import FontAwesomeIcons from './controls/font-awesome-icons.js';
import SectionColumns from './controls/section-columns.js';
import SectionColumn from './controls/section-column.js';

const GlobalDefaults = ({
	isAPILoaded,
	blockDefaults,
	changeConfig,
	resetConfig,
	saveConfig
}) => {
	const blocks = [
		{
			name: 'themeisle-blocks/advanced-heading',
			control: AdvancedHeading
		},
		{
			name: 'themeisle-blocks/button-group',
			control: ButtonGroup
		},
		{
			name: 'themeisle-blocks/button',
			control: Button
		},
		{
			name: 'themeisle-blocks/font-awesome-icons',
			control: FontAwesomeIcons
		},
		{
			name: 'themeisle-blocks/advanced-columns',
			control: SectionColumns
		},
		{
			name: 'themeisle-blocks/advanced-column',
			control: SectionColumn
		}
	];

	if ( ! isAPILoaded ) {
		return (
			<Placeholder>
				<Spinner/>
			</Placeholder>
		);
	}

	return (
		<PanelBody
			title={ __( 'Global Defaults', 'otter-blocks' ) }
			className="wp-block-themeisle-blocks-options-global-defaults"
		>
			{ __( 'With Global Defaults, you can set site-wide block defaults for Otter.', 'otter-blocks' ) }

			<div className="wp-block-themeisle-blocks-options-global-defaults-list">
				{ blocks.map( i => {
					const Controls = i.control;

					return (
						<ButtomItem
							blockName={ i.name }
							saveConfig={ saveConfig }
							resetConfig={ resetConfig }
						>
							<Controls
								blockName={ i.name }
								defaults={ blockDefaults[ i.name ] }
								changeConfig={ changeConfig }
							/>
						</ButtomItem>
					);
				}) }
			</div>
		</PanelBody>
	);
};

export default GlobalDefaults;
