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
	PanelBody,
	ToggleControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import options from './options.js';

import Notice from '../../../components/notice/index.js';

const Fields = ({
	activeAttributes,
	attributes,
	changeAttributes,
	isInline = false,
	onChange,
	changeType,
	onRemove
}) => {
	const hasSettingsPanel = applyFilters( 'otter.dynamicContent.link.hasSettingsPanel', []);
	const dynamicOptions = applyFilters( 'otter.dynamicContent.link.options', options );

	return (
		<Fragment>
			<PanelBody>
				<p>{ __( 'Bind page elements with dynamic data from your website database.', 'otter-blocks' ) }</p>

				<ExternalLink
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.themeisle.com/article/1478-otter-blocks-documentation#dynamiclinks"
				>
					{ __( 'Learn more about Dynamic Links', 'otter-blocks' ) }
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

						{ dynamicOptions.map( i => {
							return (
								<option key={ i.value } value={ i.value } disabled={ i?.isDisabled }>{ i.label } { i?.isDisabled && __( '(Pro)', 'otter-blocks' ) }</option>
							);
						}) }
					</select>
				</BaseControl>

				<br />

				<ToggleControl
					label={ __( 'Open in a new tab', 'otter-blocks' ) }
					checked={ '_blank' === attributes.target || false }
					onChange={ () => changeAttributes({ target: '_blank' === attributes.target ? undefined : '_blank' }) }
				/>

				{ ( ! Boolean( window.themeisleGutenberg.hasPro ) ) && (
					<Notice
						notice={ <ExternalLink href={ window.themeisleGutenberg.upgradeLink }>{ __( 'Unlock more options with Otter Pro. ', 'otter-blocks' ) }</ExternalLink> }
						variant="upsell"
					/>
				) }

				{ applyFilters( 'otter.dynamicContent.link.notices', '' ) }
			</PanelBody>

			{ hasSettingsPanel.includes( attributes.type ) && (
				<PanelBody
					title={ __( 'Settings', 'otter-blocks' ) }
					initialOpen={ false }
				>
					{ applyFilters( 'otter.dynamicContent.link.controls', '', attributes, changeAttributes ) }
				</PanelBody>
			) }

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
					{ applyFilters( 'otter.feedback', 'dynamic-link' ) }
					{ applyFilters( 'otter.poweredBy', '' ) }
				</div>
			</PanelBody>
		</Fragment>
	);
};

export default Fields;
