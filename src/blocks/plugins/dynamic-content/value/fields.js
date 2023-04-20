/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';

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
	PanelBody,
	Spinner
} from '@wordpress/components';

import { Fragment, useEffect, useState } from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

import classnames from 'classnames';

import moment from 'moment';

/**
 * Internal dependencies.
 */
import options from './options.js';

import Notice from './../../../components/notice/index.js';

import { getQueryStringFromObject, setUtm } from '../../../helpers/helper-functions.js';

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
	const [ preview, setPreview ] = useState();
	const [ isLoading, setLoading ] = useState( false );

	useEffect( () => {
		const context = select( 'core/editor' ).getCurrentPostId();
		const { type } = attributes;

		if ( !! attributes.type && 'none' !== attributes.type ) {
			setLoading( true );
			apiFetch({ path: 'otter/v1/dynamic/preview/?' + getQueryStringFromObject({ context, type }) })
				.then( data => {
					setPreview( data );
				})
				.catch( () => {
					setPreview( undefined );
				})
				.finally( () => {
					setLoading( false );
				});
		} else {
			setPreview( undefined );
		}
	}, [ attributes.type ]);

	hasSettingsPanel = applyFilters( 'otter.dynamicContent.text.hasSettingsPanel', hasSettingsPanel );

	const dynamicOptions = applyFilters( 'otter.dynamicContent.text.options', options );

	return (
		<Fragment>
			<PanelBody>
				<p>{ __( 'Bind page elements with dynamic data from your website database.', 'otter-blocks' ) }</p>

				<ExternalLink
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.themeisle.com/article/1478-otter-blocks-documentation#dynamicvalues"
				>
					{ __( 'Learn more about Dynamic Values', 'otter-blocks' ) }
				</ExternalLink>

				<br /><br />

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

					{ 'postContent' === attributes.type && <p>{ __( 'Post Content can cause an infinite loop when used inside Post Content itself.', 'otter-blocks' ) }</p> }
				</BaseControl>

				{ ( preview !== undefined || isLoading ) && (
					<div className="o-dynamic-modal__preview">
						<div className={ classnames( 'o-dynamic-modal__preview__content', { 'is-loading': isLoading })}>
							{ isLoading ?
								<Spinner /> :
								preview || __( 'No preview available.', 'otter-blocks' )
							}
						</div>
						<div className="o-dynamic-modal__preview__description">{ __( 'Dynamic Value preview', 'otter-blocks' ) }</div>
					</div>
				)}

				{ ( ! Boolean( window.themeisleGutenberg.hasPro ) ) && (
					<Notice
						notice={ <ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'dynamictext' ) }>{ __( 'Unlock more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
						variant="upsell"
					/>
				) }

				{ applyFilters( 'otter.dynamicContent.text.notices', '' ) }
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

					{ applyFilters( 'otter.dynamicContent.text.controls', '', attributes, changeAttributes ) }
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

				<div className="o-fp-wrap">
					{ applyFilters( 'otter.feedback', '', 'dynamic-value' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>
		</Fragment>
	);
};

export default Fields;
