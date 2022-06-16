/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	isEqual,
	isEmpty
} from 'lodash';

import {
	BaseControl,
	Button,
	ButtonGroup,
	ExternalLink,
	SelectControl,
	TextControl,
	PanelBody
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

import moment from 'moment';

/**
 * Internal dependencies.
 */
import options from './../options.js';

import Notice from './../../../components/notice/index.js';

let hasSettingsPanel = [
	'postExcerpt',
	'date',
	'time'
];

const dateFormats = {
	'F j, Y': moment().format( 'MMMM d, Y' ),
	'Y-m-d': moment().format( 'Y-m-d' ),
	'm/d/Y': moment().format( 'm/d/Y' ),
	'd/m/Y': moment().format( 'd/m/Y' )
};

const timeFormats = {
	'g:i a': moment().format( 'h:m a' ),
	'g:i A': moment().format( 'h:m A' ),
	'H:i': moment().format( 'HH:m' )
};

const Fields = ({
	activeAttributes,
	attributes,
	changeAttributes,
	isInline = false,
	onChange,
	changeType,
	onRemove
}) => {
	hasSettingsPanel = applyFilters( 'otter.dynamicContent.hasSettingsPanel', hasSettingsPanel );

	const dynamicOptions = applyFilters( 'otter.dynamicContent.options', options );

	return (
		<Fragment>
			<PanelBody>
				<BaseControl
					label={ __( 'Data Type', 'otter-blocks' ) }
					id="o-dynamic-select"
				>
					<select
						value={ attributes.type || '' }
						onChange={ e => changeType( e.target.value ) }
						id="o-dynamic-select"
						className="components-select-control__input"
					>
						<option value="none">{ __( 'Select an option', 'otter-blocks' ) }</option>

						{ Object.keys( dynamicOptions ).map( i => {
							return (
								<optgroup key={ i } label={ dynamicOptions[i].label }>
									{ dynamicOptions[i].options.map( o => <option key={ o.value } value={ o.value } disabled={ o?.isDisabled }>{ o.label } { o?.isDisabled && __( '(Pro)', 'otter-blocks' ) }</option> ) }
								</optgroup>
							);
						}) }
					</select>
				</BaseControl>

				{ ( ! Boolean( window.themeisleGutenberg.hasPro ) ) && (
					<Notice
						notice={ <ExternalLink href={ window.themeisleGutenberg.upgradeLink }>{ __( 'Unlock more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
						variant="upsell"
					/>
				) }

				{ applyFilters( 'otter.dynamicContent.notices', '' ) }
			</PanelBody>

			{ hasSettingsPanel.includes( attributes.type ) && (
				<PanelBody
					title={ __( 'Settings', 'otter-blocks' ) }
					initialOpen={ false }
				>
					{ 'postExcerpt' === attributes.type && (
						<TextControl
							label={ __( 'Excerpt Length', 'otter-blocks' ) }
							type="number"
							value={ attributes.length || '' }
							onChange={ length => changeAttributes({ length }) }
						/>
					) }

					{ [ 'date' ].includes( attributes.type ) && (
						<Fragment>
							<SelectControl
								label={ __( 'Format', 'otter-blocks' ) }
								value={ attributes.dateFormat || 'default' }
								options={ [
									{
										label: __( 'Default', 'otter-blocks' ),
										value: 'default'
									},
									...Object.keys( dateFormats ).map( key => ({
										label: dateFormats[ key ],
										value: key
									}) ),
									{
										label: __( 'Custom', 'otter-blocks' ),
										value: 'custom'
									}
								] }
								onChange={ dateFormat => changeAttributes({ dateFormat }) }
							/>

							{ 'custom' === attributes.dateFormat && (
								<TextControl
									label={ __( 'Custom Format', 'otter-blocks' ) }
									help={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-blocks' ) }</ExternalLink> }
									type="text"
									value={ attributes.dateCustom || '' }
									onChange={ dateCustom => changeAttributes({ dateCustom }) }
								/>
							) }
						</Fragment>
					) }

					{ [ 'time' ].includes( attributes.type ) && (
						<Fragment>
							<SelectControl
								label={ __( 'Format', 'otter-blocks' ) }
								value={ attributes.timeFormat || 'default' }
								options={ [
									{
										label: __( 'Default', 'otter-blocks' ),
										value: 'default'
									},
									...Object.keys( timeFormats ).map( key => ({
										label: timeFormats[ key ],
										value: key
									}) ),
									{
										label: __( 'Custom', 'otter-blocks' ),
										value: 'custom'
									}
								] }
								onChange={ timeFormat => changeAttributes({ timeFormat }) }
							/>

							{ 'custom' === attributes.timeFormat && (
								<TextControl
									label={ __( 'Custom Format', 'otter-blocks' ) }
									help={ <ExternalLink target="_blank" href="https://wordpress.org/support/article/formatting-date-and-time/">{ __( 'Formatting Date and Time in WordPress', 'otter-blocks' ) }</ExternalLink> }
									type="text"
									value={ attributes.timeCustom || '' }
									onChange={ timeCustom => changeAttributes({ timeCustom }) }
								/>
							) }
						</Fragment>
					) }

					{ applyFilters( 'otter.dynamicContent.controls', '', attributes, changeAttributes ) }
				</PanelBody>
			) }

			<PanelBody
				title={ __( 'Advanced', 'otter-blocks' ) }
				initialOpen={ false }
			>
				<TextControl
					label={ __( 'Before', 'otter-blocks' ) }
					type="text"
					value={ attributes.before || '' }
					onChange={ before => changeAttributes({ before }) }
				/>

				<TextControl
					label={ __( 'After', 'otter-blocks' ) }
					type="text"
					value={ attributes.after || '' }
					onChange={ after => changeAttributes({ after }) }
				/>
			</PanelBody>

			<PanelBody>
				<ButtonGroup>
					<Button
						isPrimary
						variant="primary"
						disabled={ isEmpty( attributes ) || isEqual( attributes, activeAttributes ) }
						onClick={ onChange }
					>
						{ __( 'Apply', 'otter-blocks' ) }
					</Button>

					{ isInline && (
						<Button
							isDestructive
							variant="tertiary"
							onClick={ onRemove }
						>
							{ __( 'Delete', 'otter-blocks' ) }
						</Button>
					) }
				</ButtonGroup>
			</PanelBody>
		</Fragment>
	);
};

export default Fields;
