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
import IconListControl from './controls/icon-list.js';
import TabsControl from './controls/tabs.js';
import AccordionControl from './controls/accordion.js';
import ProgressBarControl from './controls/progress-bar.js';
import ReviewControl from './controls/review.js';
import CircleCounterControl from './controls/circle-counter.js';
import SliderControl from './controls/slider.js';
import LeafletMapControl from './controls/leaflet-map.js';
import GoogleMapControl from './controls/google-map.js';
import LottieControl from './controls/lottie.js';
import PopupControl from './controls/popup.js';

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
		},
		{
			name: 'themeisle-blocks/icon-list',
			control: IconListControl
		},
		{
			name: 'themeisle-blocks/tabs',
			control: TabsControl
		},
		{
			name: 'themeisle-blocks/accordion',
			control: AccordionControl
		},
		{
			name: 'themeisle-blocks/progress-bar',
			control: ProgressBarControl
		},
		{
			name: 'themeisle-blocks/circle-counter',
			control: CircleCounterControl
		},
		{
			name: 'themeisle-blocks/slider',
			control: SliderControl
		},
		{
			name: 'themeisle-blocks/leaflet-map',
			control: LeafletMapControl
		},
		{
			name: 'themeisle-blocks/google-map',
			control: GoogleMapControl
		},
		{
			name: 'themeisle-blocks/lottie',
			control: LottieControl
		},
		{
			name: 'themeisle-blocks/popup',
			control: PopupControl
		},
		{
			name: 'themeisle-blocks/review',
			control: ReviewControl
		}
	];

	if ( ! isAPILoaded ) {
		return (
			<Placeholder>
				<Spinner />
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
							key={ i.name }
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
