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

			<p>{ __( 'Extend Popup block functionalities with more options in Otter Pro.', 'otter-blocks' ) }</p>

			<ExternalLink href={ window.themeisleGutenberg.upgradeLink }>
				{ __( 'Get Otter Pro', 'otter-blocks' ) }
			</ExternalLink>
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
			label: __( 'On Anchor Click', 'otter-blocks' ),
			value: 'onClick',
			disabled: true
		},
		{
			label: __( 'On Scroll', 'otter-blocks' ),
			value: 'onScroll',
			disabled: true
		},
		{
			label: __( 'On Exit', 'otter-blocks' ),
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
						label={ __( 'Wait Time', 'otter-blocks' ) }
						help={ __( 'How much time to wait before showing the popup. Leave it empty to open instantly', 'otter-blocks' ) }
						min={ 0 }
						max={ 100 }
						value={ attributes.wait }
						onChange={ value => setAttributes({ wait: Number( value ) }) }
					/>
				) }

				{/* { ! Boolean( window.themeisleGutenberg.hasPro ) && <Controls /> } */}

				{ applyFilters( 'otter.popupBlock.controls', <Controls />, attributes, setAttributes ) }
			</PanelBody>

			<PanelBody
				title={ __( 'Style', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<RangeControl
					label={ __( 'Minimum Width', 'otter-blocks' ) }
					min={ 100 }
					max={ 1000 }
					value={ attributes.minWidth }
					onChange={ value => setAttributes({ minWidth: Number( value ) }) }
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

