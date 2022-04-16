/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	RangeControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import LicenseNotice from '../../components/license-notice/index.js';

const applyTriggerOptions = () => {
	return [
		{
			label: __( 'On Load', 'otter-blocks' ),
			value: 'onLoad'
		},
		{
			label: __( 'On Anchor Click', 'otter-blocks' ),
			value: 'onClick',
			disabled: ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) )
		},
		{
			label: __( 'On Scroll', 'otter-blocks' ),
			value: 'onScroll',
			disabled: ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) )
		},
		{
			label: __( 'On Exit', 'otter-blocks' ),
			value: 'onExit',
			disabled: ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) )
		}
	];
};

const PopupControls = (
	Controls,
	attributes,
	setAttributes
) => {
	if ( ! Boolean( window.otterPro.isActive ) ) {
		return (
			<Fragment>
				{ Controls }

				<LicenseNotice
					notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Popup Block.', 'otter-blocks' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			{ 'onClick' === attributes.trigger && (
				<TextControl
					label={ __( 'Anchor', 'otter-blocks' ) }
					help={ __( 'You can use this anchor as an anchor link anywhere on the page to open the popup.', 'otter-blocks' ) }
					value={ attributes.anchor }
					onChange={ value => setAttributes({ anchor: value.replace( /[^a-zA-Z]/g, '' ) }) }
				/>
			) }

			{ ( ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) ) ) && (
				<LicenseNotice
					notice={ __( 'Otter Pro license has expired.', 'otter-blocks' ) }
					instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Popup Block.', 'otter-blocks' ) }
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

			{ Controls }

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

addFilter( 'otter.popupBlock.triggers', 'themeisle-gutenberg/popup-block-triggers', applyTriggerOptions );
addFilter( 'otter.popupBlock.controls', 'themeisle-gutenberg/popup-block-controls', PopupControls );
