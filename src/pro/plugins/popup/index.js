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

const { Notice } = window.otterComponents;

const applyTriggerOptions = () => {
	return [
		{
			label: __( 'On Load', 'otter-pro' ),
			value: 'onLoad'
		},
		{
			label: __( 'On Anchor Click', 'otter-pro' ),
			value: 'onClick',
			disabled: ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) )
		},
		{
			label: __( 'On Scroll', 'otter-pro' ),
			value: 'onScroll',
			disabled: ! ( Boolean( window.otterPro.isActive ) && ! Boolean( window.otterPro.isExpired ) )
		},
		{
			label: __( 'On Exit', 'otter-pro' ),
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

				<Notice
					notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Popup Block.', 'otter-pro' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			{ 'onClick' === attributes.trigger && (
				<TextControl
					label={ __( 'Anchor', 'otter-pro' ) }
					help={ __( 'You can use this anchor as an anchor link anywhere on the page to open the popup.', 'otter-pro' ) }
					value={ attributes.anchor }
					onChange={ anchor => setAttributes({ anchor }) }
				/>
			) }

			{ Boolean( window.otterPro.isExpired ) && (
				<Notice
					notice={ __( 'Otter Pro license has expired.', 'otter-pro' ) }
					instructions={ __( 'You need to renew your Otter Pro license in order to continue using Pro features of Popup Block.', 'otter-pro' ) }
				/>
			) }

			{ 'onScroll' === attributes.trigger && (
				<RangeControl
					label={ __( 'Scroll Distance', 'otter-pro' ) }
					help={ __( 'Show the modal when this percentage of the page has been scrolled.', 'otter-pro' ) }
					min={ 0 }
					max={ 100 }
					value={ attributes.scroll }
					onChange={ value => setAttributes({ scroll: value !== undefined ? Number( value ) : value }) }
					allowReset
					initialPosition={0}
				/>
			) }

			{ 'onExit' === attributes.trigger && (
				<p>{ __( 'Shows the modal when the user moves the mouse outside of the top of the window.', 'otter-pro' ) }</p>
			) }

			{ Controls }

			<ToggleControl
				label={ __( 'Close On Anchor Click', 'otter-pro' ) }
				checked={ attributes.anchorClose }
				onChange={ () => setAttributes({ anchorClose: ! attributes.anchorClose }) }
			/>

			{ attributes.anchorClose && (
				<TextControl
					label={ __( 'Close Anchor', 'otter-pro' ) }
					help={ __( 'You can use this anchor as an anchor link anywhere on the page to close the popup.', 'otter-pro' ) }
					value={ attributes.closeAnchor }
					onChange={ closeAnchor => setAttributes({ closeAnchor }) }
				/>
			) }

			{ 'onClick' !== attributes.trigger && (
				<ToggleControl
					label={ __( 'Dismiss for Recurring Visitors', 'otter-pro' ) }
					checked={ attributes.recurringClose }
					onChange={ () => setAttributes({ recurringClose: ! attributes.recurringClose }) }
				/>
			) }

			{ ( attributes.recurringClose && 'onClick' !== attributes.trigger ) && (
				<RangeControl
					label={ __( 'Display Interval', 'otter-pro' ) }
					help={ __( 'Number of days until the popup is shown again. Leave it empty for one-time display', 'otter-pro' ) }
					min={ 0 }
					max={ 100 }
					value={ attributes.recurringTime }
					onChange={ value => setAttributes({ recurringTime: value !== undefined ? Number( value ) : value }) }
					allowReset
				/>
			) }
		</Fragment>
	);
};

addFilter( 'otter.popupBlock.triggers', 'themeisle-gutenberg/popup-block-triggers', applyTriggerOptions );
addFilter( 'otter.popupBlock.controls', 'themeisle-gutenberg/popup-block-controls', PopupControls );
