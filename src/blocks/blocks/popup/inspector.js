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
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const ProFeatures = ({
	attributes,
	setAttributes
}) => {
	return (
		<Fragment>
			<ToggleControl
				label={ __( 'Close On Anchor Click', 'otter-blocks' ) }
				checked={ attributes.anchorClose }
				onChange={ () => setAttributes({ anchorClose: ! attributes.anchorClose }) }
			/>

			{ attributes.anchorClose && (
				<TextControl
					label={ __( 'Close Anchor', 'otter-blocks' ) }
					help={ __( 'You can use this anchor as an anchor link anywhere on the page to close the popup.', 'otter-blocks' ) }
					value={ attributes.closeAnchor }
					onChange={ value => setAttributes({ closeAnchor: value.replace( /[^a-zA-Z]/g, '' ) }) }
				/>
			) }

			{ 'onClick' !== attributes.trigger && (
				<ToggleControl
					label={ __( 'Dismiss for Recurring Visitors', 'otter-blocks' ) }
					checked={ attributes.recurringClose }
					onChange={ () => setAttributes({ recurringClose: ! attributes.recurringClose }) }
				/>
			) }

			{ ( attributes.recurringClose && 'onClick' !== attributes.trigger ) && (
				<RangeControl
					label={ __( 'Display Interval', 'otter-blocks' ) }
					help={ __( 'Number of days until the popup is shown again.', 'otter-blocks' ) }
					min={ 0 }
					max={ 100 }
					value={ attributes.recurringTime }
					onChange={ value => setAttributes({ recurringTime: Number( value ) }) }
				/>
			) }
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
		}
	];

	if ( Boolean( window.themeisleGutenberg.hasNeveSupport.hasNeve ) ) {
		triggerOptions = [
			{
				label: __( 'On Load', 'otter-blocks' ),
				value: 'onLoad'
			},
			{
				label: __( 'On Anchor Click', 'otter-blocks' ),
				value: 'onClick',
				disabled: ! Boolean( window.themeisleGutenberg.hasNeveSupport.hasNevePro )
			},
			{
				label: __( 'On Scroll', 'otter-blocks' ),
				value: 'onScroll',
				disabled: ! Boolean( window.themeisleGutenberg.hasNeveSupport.hasNevePro )
			},
			{
				label: __( 'On Exit', 'otter-blocks' ),
				value: 'onExit',
				disabled: ! Boolean( window.themeisleGutenberg.hasNeveSupport.hasNevePro )
			}
		];
	}

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Settings', 'otter-blocks' ) }
			>
				<SelectControl
					label={ __( 'Open Trigger', 'otter-blocks' ) }
					help={ ( Boolean( window.themeisleGutenberg.hasNeveSupport.hasNeve ) && ! Boolean( window.themeisleGutenberg.hasNeveSupport.hasNevePro ) ) && __( 'You need to have Neve Pro to activate Pro features.', 'otter-blocks' ) }
					options={ triggerOptions  }
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

				{ 'onClick' === attributes.trigger && (
					<TextControl
						label={ __( 'Anchor', 'otter-blocks' ) }
						help={ __( 'You can use this anchor as an anchor link anywhere on the page to open the popup.', 'otter-blocks' ) }
						value={ attributes.anchor }
						onChange={ value => setAttributes({ anchor: value.replace( /[^a-zA-Z]/g, '' ) }) }
					/>
				) }

				{ 'onScroll' === attributes.trigger && (
					<RangeControl
						label={ __( 'Scroll Distance', 'otter-blocks' ) }
						help={ __( 'Show the modal when this percentage of the page has been scrolled.', 'otter-blocks' ) }
						min={ 0 }
						max={ 100 }
						value={ attributes.scroll }
						onChange={ value => setAttributes({ scroll: Number( value ) }) }
					/>
				) }

				{ 'onExit' === attributes.trigger && (
					<p>{ __( 'Shows the modal when the user moves the mouse outside of the top of the window.', 'otter-blocks' ) }</p>
				) }

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

				{ ( Boolean( window.themeisleGutenberg.hasNeveSupport.hasNeve ) && ! Boolean( window.themeisleGutenberg.hasNeveSupport.hasNevePro ) ) && (
					<Fragment>
						<Disabled>
							<ProFeatures
								attributes={ attributes }
								setAttributes={ setAttributes }
							/>
						</Disabled>

						<ExternalLink href="https://themeisle.com/themes/neve/pricing">
							{ __( 'Extend Popup block functionalities with more options in Neve Pro.', 'otter-blocks' )  }
						</ExternalLink>
					</Fragment>
				) }

				{ Boolean( window.themeisleGutenberg.hasNeveSupport.isBoosterActive ) && (
					<ProFeatures
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
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

