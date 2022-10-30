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
import { CountdownInspectorProps } from '../../../blocks/blocks/countdown/types';
import { objectCleaner } from '../../helpers/helper-functions';

const { Notice } = window.otterComponents;

const countdownMoveHelpMsgCountdown = ( mode: any ) => {
	switch ( mode ) {
	case 'timer':
		return __( 'A fixed amount of time for each browser session (Evergreen Countdown)', 'otter-blocks' );
	case 'interval':
		return __( 'The countdown will be active only between the Start Date and the End Date', 'otter-blocks' );
	default:
		return __( 'An universal deadline for all visitors', 'otter-blocks' );
	}
};

const onExpireHelpMsgCountdown = ( behaviour: any ) => {
	switch ( behaviour ) {
	case 'redirectLink':
		return __( 'Redirect the user to another URL, when the countdown reaches 0', 'otter-blocks' );
	case 'hide':
		return __( 'Hide when the countdown reaches 0', 'otter-blocks' );
	case 'restart':
		return 'The Countdown will restart when it reaches 0 and the page is refreshed';
	default:
		return __( 'The countdown remains visible when it reaches 0', 'otter-blocks' );
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
				label={ __( 'Countdown Type', 'otter-blocks' ) }
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

					setAttributes( attrs );
				}

				}
				options={[
					{
						label: __( 'Static', 'otter-blocks' ),
						value: ''
					},
					{
						label: __( 'Evergreen', 'otter-blocks' ),
						value: 'timer'
					},
					{
						label: __( 'Interval', 'otter-blocks' ),
						value: 'interval'
					}
				]}
				help={ countdownMoveHelpMsgCountdown( attributes.mode )}
			/>

			{ 'timer' === attributes.mode && (
				<Fragment>
					<TextControl
						type="number"
						label={__( 'Days', 'otter-blocks' )}
						value={ attributes?.timer?.days ?? '' }
						onChange={ ( days ) => {
							setAttributes({
								timer: objectCleaner({ ...attributes.timer, days })
							});
						}}
					/>
					<TextControl
						type="number"
						label={__( 'Hours', 'otter-blocks' )}
						value={ attributes?.timer?.hours ?? '' }
						onChange={ ( hours ) => {
							setAttributes({
								timer: objectCleaner({ ...attributes.timer, hours })
							});
						}}
					/>
					<TextControl
						type="number"
						label={__( 'Minutes', 'otter-blocks' )}
						value={ attributes?.timer?.minutes ?? '' }
						onChange={ ( minutes ) => {
							setAttributes({
								timer: objectCleaner({ ...attributes.timer, minutes })
							});
						}}
					/>
					<TextControl
						type="number"
						label={__( 'Seconds', 'otter-blocks' )}
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
						label={ __( 'Start Date', 'otter-blocks' ) }
					>
						<Dropdown
							position="bottom left"
							headerTitle={ __( 'Select the date for the deadline', 'otter-blocks' ) }
							renderToggle={ ({ onToggle, isOpen }) => (
								<>
									<Button
										onClick={ onToggle }
										isSecondary
										aria-expanded={ isOpen }
										className="o-extend-btn"
									>
										{ attributes.startInterval ? format( settings.formats.datetime, attributes.startInterval ) : __( 'Select Start Date', 'otter-blocks' ) }
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
						label={ __( 'End Date', 'otter-blocks' ) }
					>
						<Dropdown
							position="bottom left"
							headerTitle={ __( 'Select the date for the deadline', 'otter-blocks' ) }
							renderToggle={ ({ onToggle, isOpen }) => (
								<>
									<Button
										onClick={ onToggle }
										isSecondary
										aria-expanded={ isOpen }
										className="o-extend-btn"
									>
										{ attributes.endInterval ? format( settings.formats.datetime, attributes.endInterval ) : __( 'Select End Date', 'otter-blocks' ) }
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
					notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
					instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-blocks' ) }
				/>
			</Fragment>
		);
	}

	return (
		<Fragment>
			<SelectControl
				label={ __( 'On Expire', 'otter-blocks' ) }
				value={ attributes.behaviour }
				onChange={ behaviour => {
					if ( 'redirectLink' === behaviour ) {
						setAttributes({ behaviour, redirectLink: undefined });
					} else {
						setAttributes({ behaviour });
					}
				}}
				options={[
					{
						label: __( 'No action', 'otter-blocks' ),
						value: ''
					},
					{
						label: __( 'Hide the Countdown', 'otter-blocks' ),
						value: 'hide'
					},
					...( 'timer' === attributes.mode ? [{
						label: __( 'Restart the Countdown', 'otter-blocks' ),
						value: 'restart'
					}] : []),
					{
						label: __( 'Redirect to link', 'otter-blocks' ),
						value: 'redirectLink'
					}
				]}
				help={ onExpireHelpMsgCountdown( attributes.behaviour ) }
			/>

			{ 'redirectLink' === attributes.behaviour && (
				<TextControl
					label={ __( 'Redirect Link', 'otter-blocks' ) }
					value={ attributes.redirectLink ?? ''}
					onChange={ redirectLink => setAttributes({ redirectLink })}
				/>
			) }

			<ToggleControl
				label={ __( 'Hide/Show Blocks When the Countdown Ends', 'otter-blocks' ) }
				help={ __( 'Enable Hide/Show other blocks when the Countdown ends.', 'otter-blocks' ) }
				checked={ attributes.onEndAction !== undefined }
				onChange={ value => {
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
						{ __( 'Paste the following code in the block that you want to show up or hide (in the same page) when the countdown end. Select the block, go to Inspector > Advanced, and paste into the field "Additional CSS class"', 'otter-blocks' ) }
					</p>
					<p style={{ marginTop: '10px', marginBottom: '5px' }}>{ __( 'Show trigger', 'otter-blocks' ) }</p>
					<code style={{ display: 'block', padding: '10px' }}>
						{ `o-countdown-trigger-on-end-${ attributes.id?.split( '-' ).pop()} o-cntdn-bhv-show` }
					</code>
					<p style={{ marginTop: '10px', marginBottom: '5px' }}>{ __( 'Hide trigger', 'otter-blocks' ) }</p>
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
