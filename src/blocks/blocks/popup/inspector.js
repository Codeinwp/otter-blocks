/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	InspectorControls,
	PanelColorSettings
} from '@wordpress/block-editor';

import {
	Disabled,
	ExternalLink,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalBoxControl as BoxControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

import { Fragment, useState } from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import Notice from '../../components/notice/index.js';
import { setUtm } from '../../helpers/helper-functions.js';
import InspectorHeader from '../../components/inspector-header/index.js';
import ResponsiveControl from '../../components/responsive-control/index.js';

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

/**
 *
 * @param {import('./types').PopupInspectorProps} param0
 * @returns
 */
const Inspector = ({
	attributes,
	setAttributes
}) => {

	const [ tab, setTab ] = useState( 'settings' );

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

			<InspectorHeader
				value={ tab }
				options={[
					{
						label: __( 'Settings', 'otter-blocks' ),
						value: 'settings'
					},
					{
						label: __( 'Style', 'otter-blocks' ),
						value: 'style'
					}
				]}
				onChange={ setTab }
			/>

			<div>
				{ 'settings' === tab && (
					<Fragment>
						<PanelBody
							title={ __( 'Popup settings', 'otter-blocks' ) }
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
									label={ __( 'Trigger Time', 'otter-blocks' ) }
									help={ __( 'How much time to wait before showing the popup. Leave it empty to open instantly', 'otter-blocks' ) }
									min={ 0 }
									max={ 100 }
									value={ attributes.wait }
									onChange={ value => setAttributes({ wait: Number( value ) }) }
								/>
							) }

							{ applyFilters( 'otter.popupBlock.controls', <Controls />, attributes, setAttributes ) }
						</PanelBody>
					</Fragment>
				)}

				{
					'style' === tab && (
						<Fragment>
							<PanelBody
								title={ __( 'Dimensions', 'otter-blocks' ) }
							>
								<ResponsiveControl>
									<UnitControl
										label={ __( 'Width', 'otter-blocks' ) }
										value={ '80%' }
									/>
								</ResponsiveControl>

								<ResponsiveControl>
									<UnitControl
										label={ __( 'Height', 'otter-blocks' ) }
										value={ '80%' }
									/>
								</ResponsiveControl>


							</PanelBody>
							<PanelColorSettings
								title={ __( 'Color', 'otter-blocks' ) }
								initialOpen={ false }
								colorSettings={ [
									{
										value: attributes.backgroundColor,
										onChange: backgroundColor => setAttributes({ backgroundColor }),
										label: __( 'Background', 'otter-blocks' )
									},
									{
										value: attributes.closeColor,
										onChange: closeColor => setAttributes({ closeColor }),
										label: __( 'Close Button', 'otter-blocks' )
									},
									{
										value: attributes.overlayColor,
										onChange: overlayColor => setAttributes({ overlayColor }),
										label: __( 'Overlay', 'otter-blocks' )
									}
								] }
							/>
							<PanelBody
								title={ __( 'Overlay', 'otter-blocks' ) }
							>
								<RangeControl
									label={ __( 'Overlay Opacity', 'otter-blocks' ) }
									value={ attributes.overlayOpacity }
									onChange={ value => setAttributes({ overlayOpacity: Number( value ) }) }
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Close Button', 'otter-blocks' ) }
							>
								<ToggleControl
									label={ __( 'Show Close Button', 'otter-blocks' ) }
									checked={ attributes.showClose }
									onChange={ () => setAttributes({ showClose: ! attributes.showClose }) }
								/>
								<SelectControl
									label={ __( 'Position', 'otter-blocks' ) }
									options={ [
										{
											label: __( 'Inside', 'otter-blocks' ),
											value: 'none'
										},
										{
											label: __( 'Outside', 'otter-blocks' ),
											value: 'outside'
										}
									] }
								/>
							</PanelBody>
							<PanelBody
								title={ __( 'Border', 'otter-blocks' ) }
							>
								<BoxControl
									label={ __( 'Width', 'otter-blocks' ) }
									value={{}}
								/>
								<BoxControl
									label={ __( 'Border Radius', 'otter-blocks' ) }
									value={{}}
								/>
							</PanelBody>
						</Fragment>
					)
				}
			</div>
		</InspectorControls>
	);
};

export default Inspector;

