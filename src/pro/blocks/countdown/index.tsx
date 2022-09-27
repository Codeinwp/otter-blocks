/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	PanelBody,
	ToggleControl,
	RangeControl,
	Dropdown,
	Button,
	DateTimePicker,
	FontSizePicker,
	SelectControl,
	TextControl,
	BaseControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { addFilter } from '@wordpress/hooks';
import { CountdownInspectorProps } from '../../../blocks/blocks/countdown/types';
import { onExpireHelpMsgCountdown } from '../../../blocks/blocks/countdown/inspector';
const { Notice } = window.otterComponents;

const CountdownProFeatures = ( Template: React.FC<{}>, {
	attributes,
	setAttributes
}: CountdownInspectorProps ) => {

	if ( ! Boolean( window?.otterPro?.isActive ) ) {
		return (
			<Fragment>
				{/** @ts-ignore */}
				<Template>
					<Notice
						notice={ __( 'You need to activate Otter Pro.', 'otter-blocks' ) }
						instructions={ __( 'You need to activate your Otter Pro license to use Pro features of Sticky Extension.', 'otter-blocks' ) }
					/>
				</Template>
			</Fragment>
		);
	}

	return (
		<PanelBody
			title={ __( 'End Action', 'otter-blocks' ) }
			initialOpen={false}
		>
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

			{
				'redirectLink' === attributes.behaviour && (
					<TextControl
						label={ __( 'Redirect Link', 'otter-blocks' ) }
						value={ attributes.redirectLink ?? ''}
						onChange={ redirectLink => setAttributes({ redirectLink })}
					/>
				)
			}

			<ToggleControl
				label={ __( 'Enable Hide/Show other blocks when the Countdown ends.', 'otter-blocks' ) }
				checked={ attributes.onEndAction !== undefined }
				onChange={ value => {
					if ( value ) {
						setAttributes({ onEndAction: 'all' });
					} else {
						setAttributes({ onEndAction: undefined });
					}
				}}
			/>

			{
				attributes?.onEndAction && (
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
				)
			}

		</PanelBody>
	);
};

addFilter( 'otter.countdown.controls', 'themeisle-gutenberg/countdown-controls', CountdownProFeatures );
