/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ExternalLink,
	Placeholder,
	Spinner,
	TextControl
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { googleMapIcon as icon } from '../../helpers/icons.js';

const BlockPlaceholder = ({
	api,
	error,
	isAPILoaded,
	isAPISaved,
	isSaving,
	changeAPI,
	saveAPIKey
}) => {
	if ( ! isAPILoaded ) {
		return (
			<Placeholder>
				<Spinner />
				{ __( 'Loading…', 'otter-blocks' ) }
			</Placeholder>
		);
	}

	if ( ! isAPISaved ) {
		return (
			<Placeholder
				icon={ icon }
				label={ __( 'Google Maps', 'otter-blocks' ) }
				instructions={ __( 'A Google Maps API key is required, please enter one below.', 'otter-blocks' ) }
			>
				<div className="components-placeholder__actions">
					<TextControl
						type="text"
						placeholder={ __( 'Google Maps API Key', 'otter-blocks' ) }
						value={ api }
						className={ classnames( 'components-placeholder__input', { 'is-invalid': error }) }
						onChange={ changeAPI }
					/>

					<Button
						isPrimary
						type="submit"
						onClick={ saveAPIKey }
						isBusy={ isSaving }
						disabled={ '' === api || error }
					>
						{ __( 'Save', 'otter-blocks' ) }
					</Button>
				</div>

				<div className="components-placeholder__learn-more">
					{ error && <p>{ __( 'The API key could not be validated.', 'otter-blocks' ) }</p> }

					<p>{ __( 'You need to activate Maps and Places API.', 'otter-blocks' ) } <ExternalLink href="https://developers.google.com/maps/documentation/javascript/get-api-key">{ __( 'Need an API key? Get one here.', 'otter-blocks' ) }</ExternalLink></p>
				</div>
			</Placeholder>
		);
	}
};

export default BlockPlaceholder;
