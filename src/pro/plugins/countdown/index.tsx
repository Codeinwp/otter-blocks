/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	BaseControl,
	Button,
	DateTimePicker,
	Dropdown,
	ToggleControl,
	SelectControl,
	TextControl
} from '@wordpress/components';

import {
	format,
	__experimentalGetSettings
} from '@wordpress/date';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import { objectCleaner } from '../../helpers/helper-functions';
import type { CountdownInspectorProps } from '../../../blocks/blocks/countdown/types';

const { Notice } = window.otterComponents;

const countdownMoveHelpMsgCountdown = ( mode: any ) => {
	switch ( mode ) {
	case 'timer':
		return __( 'A fixed amount of time for each browser session (Evergreen Countdown)', 'otter-pro' );
	case 'interval':
		return __( 'The countdown will be active only between the Start Date and the End Date', 'otter-pro' );
	default:
		return __( 'An universal deadline for all visitors', 'otter-pro' );
	}
};

const onExpireHelpMsgCountdown = ( behaviour: any ) => {
	switch ( behaviour ) {
	case 'redirectLink':
		return __( 'Redirect the user to another URL, when the countdown reaches 0', 'otter-pro' );
	case 'hide':
		return __( 'Hide when the countdown reaches 0', 'otter-pro' );
	case 'restart':
		return 'The Countdown will restart when it reaches 0 and the page is refreshed';
	default:
		return __( 'The countdown remains visible when it reaches 0', 'otter-pro' );
	}
};

const CountdownProFeaturesSettings = ( Template: React.FC<{}>, { attributes, setAttributes }: CountdownInspectorProps ) => {
	if ( ! Boolean( window?.otterPro?.isActive ) ) {
		return (
			<Fragment>
				{ Template }
			</Fragment>
		);
	}

	const settings = __experimentalGetSettings();

	return (
		<Fragment>
			<SelectControl
				label={ __( 'Countdown Type', 'otter-pro' ) }
				value={  attributes.mode }
				onChange={ value => {
					const attrs: any = {
						mode: value ? value : undefined
					};

					if ( ! value ) {
						attrs.date = undefined;
					}

					if ( 'timer' !== value ) {
						attrs.timer = undefined;
						if ( 'restart' === attributes.behaviour ) {
							attrs.behaviour = undefined;
						}
					}

					if ( 'interval' !== value ) {
						attrs.startInterval = undefined;
						attrs.endInterval = undefined;
					}

					window.oTrk?.set( `${attributes.id}_type`, { feature: 'countdown', featureComponent: 'countdown-type', featureValue: value, groupID: attributes.id });
					setAttributes( attrs );
				}

				}
				options={[
					{
						label: __( 'Static', 'otter-pro' ),
						value: ''
					},
					{
						label: __( 'Evergreen', 'otter-pro' ),
						value: 'timer'
					},
					{
						label: __( 'Interval', 'otter-pro' ),
						value: 'interval'
					}
				]}
				help={ countdownMoveHelpMsgCountdown( attributes.mode )}
			/>

			{ 'timer' === attributes.mode && (
				<Fragment>
					<TextControl
						type="number"
						label={__( 'Days', 'otter-pro' )}
						value={ attributes?.timer?.days ?? '' }
						onChange={ ( days ) => {
							setAttributes({
								timer: objectCleaner({ ...attributes.timer, days })
							});
						}}
					/>
					<TextControl
						type="number"
						label={__( 'Hours', 'otter-pro' )}
						value={ attributes?.timer?.hours ?? '' }
						onChange={ ( hours ) => {
							setAttributes({
								timer: objectCleaner({ ...attributes.timer, hours })
							});
						}}
					/>
					<TextControl
						type="number"
						label={__( 'Minutes', 'otter-pro' )}
						value={ attributes?.timer?.minutes ?? '' }
						onChange={ ( minutes ) => {
							setAttributes({
								timer: objectCleaner({ ...attributes.timer, minutes })
							});
						}}
					/>
					<TextControl
						type="number"
						label={__( 'Seconds', 'otter-pro' )}
						value={ attributes?.timer?.seconds ?? '' }
						onChange={ ( seconds ) => {
							setAttributes({
								timer: objectCleaner({ ...attributes.timer, seconds })
							});
						}}
					/>
				</Fragment>
			) }

			{ 'interval' === attributes.mode && (
				<Fragment>
					<BaseControl
						label={ __( 'Start Date', 'otter-pro' ) }
					>
						<Dropdown
							position="bottom left"
							headerTitle={ __( 'Select the date for the deadline', 'otter-pro' ) }
							renderToggle={ ({ onToggle, isOpen }) => (
								<>
									<Button
										onClick={ onToggle }
										isSecondary
										aria-expanded={ isOpen }
										className="o-extend-btn"
									>
										{ attributes.startInterval ? format( settings.formats.datetime, attributes.startInterval ) : __( 'Select Start Date', 'otter-pro' ) }
									</Button>
								</>
							) }
							renderContent={ () => (
								<DateTimePicker
									currentDate={ attributes.startInterval }
									onChange={ startInterval => setAttributes({ startInterval }) }
								/>
							) }
							className="o-extend"
						/>
					</BaseControl>

					<BaseControl
						label={ __( 'End Date', 'otter-pro' ) }
					>
						<Dropdown
							position="bottom left"
							headerTitle={ __( 'Select the date for the deadline', 'otter-pro' ) }
							renderToggle={ ({ onToggle, isOpen }) => (
								<>
									<Button
										onClick={ onToggle }
										isSecondary
										aria-expanded={ isOpen }
										className="o-extend-btn"
									>
										{ attributes.endInterval ? format( settings.formats.datetime, attributes.endInterval ) : __( 'Select End Date', 'otter-pro' ) }
									</Button>
								</>
							) }
							renderContent={ () => (
								<DateTimePicker
									currentDate={ attributes.endInterval }
									onChange={ endInterval => setAttributes({ endInterval }) }
								/>
							) }
							className="o-extend"
						/>
					</BaseControl>
				</Fragment>
			) }
		</Fragment>
	);
};

const CountdownProFeaturesEnd = ( Template: React.FC<{}>, {
	attributes,
	setAttributes
}: CountdownInspectorProps ) => {

	if ( ! Boolean( window?.otterPro?.isActive ) ) {
		return (
			<Fragment>
				{ Template }
				<Notice
					notice={ __( 'You need to activate Otter Pro.', 'otter-pro' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-pro' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<SelectControl
				label={ __( 'On Expire', 'otter-pro' ) }
				value={ attributes.behaviour }
				onChange={ behaviour => {
					window.oTrk?.set( `${attributes.id}_beh`, { feature: 'countdown', featureComponent: 'countdown-behaviour', featureValue: behaviour, groupID: attributes.id });
					if ( 'redirectLink' === behaviour ) {
						setAttributes({ behaviour, redirectLink: undefined });
					} else {
						setAttributes({ behaviour });
					}
				}}
				options={[
					{
						label: __( 'No action', 'otter-pro' ),
						value: ''
					},
					{
						label: __( 'Hide the Countdown', 'otter-pro' ),
						value: 'hide'
					},
					...( 'timer' === attributes.mode ? [{
						label: __( 'Restart the Countdown', 'otter-pro' ),
						value: 'restart'
					}] : []),
					{
						label: __( 'Redirect to link', 'otter-pro' ),
						value: 'redirectLink'
					}
				]}
				help={ onExpireHelpMsgCountdown( attributes.behaviour ) }
			/>

			{ 'redirectLink' === attributes.behaviour && (
				<TextControl
					label={ __( 'Redirect Link', 'otter-pro' ) }
					value={ attributes.redirectLink ?? ''}
					onChange={ redirectLink => setAttributes({ redirectLink })}
				/>
			) }

			<ToggleControl
				label={ __( 'Hide/Show Blocks When the Countdown Ends', 'otter-pro' ) }
				help={ __( 'Enable Hide/Show other blocks when the Countdown ends.', 'otter-pro' ) }
				checked={ attributes.onEndAction !== undefined }
				onChange={ value => {
					window.oTrk?.set( `${attributes.id}_hide`, { feature: 'countdown', featureComponent: 'countdown-hide', featureValue: value ? 'all' : 'none', groupID: attributes.id });
					if ( value ) {
						setAttributes({ onEndAction: 'all' });
					} else {
						setAttributes({ onEndAction: undefined });
					}
				}}
			/>

			{ attributes?.onEndAction && (
				<Fragment>
					<p>
						{ __( 'Paste the following code in the block that you want to show up or hide (in the same page) when the countdown end. Select the block, go to Inspector > Advanced, and paste into the field "Additional CSS class"', 'otter-pro' ) }
					</p>
					<p style={{ marginTop: '10px', marginBottom: '5px' }}>{ __( 'Show trigger', 'otter-pro' ) }</p>
					<code style={{ display: 'block', padding: '10px' }}>
						{ `o-countdown-trigger-on-end-${ attributes.id?.split( '-' ).pop()} o-cntdn-bhv-show` }
					</code>
					<p style={{ marginTop: '10px', marginBottom: '5px' }}>{ __( 'Hide trigger', 'otter-pro' ) }</p>
					<code style={{ display: 'block', padding: '10px' }}>
						{ `o-countdown-trigger-on-end-${ attributes.id?.split( '-' ).pop()} o-cntdn-bhv-hide` }
					</code>
				</Fragment>
			) }
		</Fragment>
	);
};

addFilter( 'otter.countdown.controls.settings', 'themeisle-gutenberg/countdown-controls', CountdownProFeaturesSettings );
addFilter( 'otter.countdown.controls.end', 'themeisle-gutenberg/countdown-controls', CountdownProFeaturesEnd );
