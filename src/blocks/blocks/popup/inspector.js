/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	__experimentalColorGradientControl as ColorGradientControl,
	InspectorControls
} from '@wordpress/block-editor';

import {
	Disabled,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Notice from '../../components/notice/index.js';
import { setUtm } from '../../helpers/helper-functions.js';

/**
 *
 * @param {import('./types').PopupInspectorProps} props
 * @returns
 */
const ProFeatures = () => {
	return (
		<Fragment>
			<Disabled>
				<ToggleControl
					label={ __( 'Close On Anchor Click', 'otter-blocks' ) }
					checked={ false }
					onChange={ () => {} }
				/>

				<ToggleControl
					label={ __( 'Dismiss for Recurring Visitors', 'otter-blocks' ) }
					checked={ false }
					onChange={ () => {} }
				/>
			</Disabled>

			<Notice
				notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'popupblock' )}>{ __( 'Get more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
				variant="upsell"
			/>
		</Fragment>
	);
};

const Inspector = ({
	attributes,
	setAttributes
}) => {
	let triggerOptions = [
		{
			label: __( 'On Load', 'otter-blocks' ),
			value: 'onLoad'
		},
		{
			label: __( 'On Anchor Click (Pro)', 'otter-blocks' ),
			value: 'onClick',
			disabled: true
		},
		{
			label: __( 'On Scroll (Pro)', 'otter-blocks' ),
			value: 'onScroll',
			disabled: true
		},
		{
			label: __( 'On Exit (Pro)', 'otter-blocks' ),
			value: 'onExit',
			disabled: true
		}
	];

	triggerOptions = applyFilters( 'otter.popupBlock.triggers', triggerOptions );

	const Controls = () => {
		return (
			<Fragment>
				<ToggleControl
					label={ __( 'Show Close Button', 'otter-blocks' ) }
					checked={ attributes.showClose }
					onChange={ () => setAttributes({ showClose: ! attributes.showClose }) }
				/>

				<ToggleControl
					label={ __( 'Close on Click Outside', 'otter-blocks' ) }
					checked={ attributes.outsideClose }
					onChange={ () => setAttributes({ outsideClose: ! attributes.outsideClose }) }
				/>

				{ ! Boolean( window.themeisleGutenberg.hasPro ) && <ProFeatures /> }
			</Fragment>
		);
	};

	return (
		<InspectorControls>
			{ applyFilters( 'otter.feedback', '', 'popup-block', __( 'Help us improve this block', 'otter-blocks' ) ) }
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'Open Trigger', 'otter-blocks' ) }
					help={ ! Boolean( window.themeisleGutenberg.hasPro ) && __( 'You need to have Otter Pro to activate Pro features.', 'otter-blocks' ) }
					options={ triggerOptions }
					value={ attributes.trigger }
					onChange={ trigger => setAttributes({ trigger }) }
				/>

				{ ( undefined === attributes.trigger || 'onLoad' === attributes.trigger ) && (
					<RangeControl
						label={ __( 'Trigger Delay', 'otter-blocks' ) }
						help={ __( 'How much time to wait before showing the popup. Leave it empty to open instantly', 'otter-blocks' ) }
						min={ 0 }
						max={ 100 }
						value={ attributes.wait }
						onChange={ value => setAttributes({ wait: Number( value ) }) }
					/>
				) }

				<ToggleControl
					label={ __( 'Disable Page Scrolling', 'otter-blocks' ) }
					checked={ attributes.lockScrolling }
					onChange={ () => setAttributes({ lockScrolling: ! attributes.lockScrolling }) }
				/>

				{ applyFilters( 'otter.popupBlock.controls', <Controls />, attributes, setAttributes ) }
			</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Minimum Width', 'otter-blocks' ) }
					step={ 0.1 }
					min={ 100 }
					max={ 1000 }
					value={ attributes.minWidth }
					allowReset
					onChange={ value => setAttributes({ minWidth: Number( value ) }) }
				/>

				<RangeControl
					label={ __( 'Maximum Width', 'otter-blocks' ) }
					step={ 0.1 }
					min={ 100 }
					max={ 1000 }
					value={ attributes.maxWidth }
					allowReset
					onChange={ value => setAttributes({ maxWidth: Number( value ) }) }
				/>

				<ColorGradientControl
					label={ __( 'Background', 'otter-blocks' ) }
					colorValue={ attributes.backgroundColor }
					onColorChange={ backgroundColor => setAttributes({ backgroundColor }) }
				/>

				{ attributes.showClose && (
					<ColorGradientControl
						label={ __( 'Close Button', 'otter-blocks' ) }
						colorValue={ attributes.closeColor }
						onColorChange={ closeColor => setAttributes({ closeColor }) }
					/>
				) }

				<ColorGradientControl
					label={ __( 'Overlay', 'otter-blocks' ) }
					colorValue={ attributes.overlayColor }
					onColorChange={ overlayColor => setAttributes({ overlayColor }) }
				/>

				<RangeControl
					label={ __( 'Overlay Opacity', 'otter-blocks' ) }
					value={ attributes.overlayOpacity }
					onChange={ value => setAttributes({ overlayOpacity: Number( value ) }) }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Inspector;

