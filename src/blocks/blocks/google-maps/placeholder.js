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

const BlockPlaceholder = ({
	className,
	api,
	isAPILoaded,
	isAPISaved,
	isSaving,
	changeAPI,
	saveAPIKey
}) => {
	if ( ! isAPILoaded ) {
		return (
			<Placeholder>
				<Spinner/>
				{ __( 'Loading…', 'otter-blocks' ) }
			</Placeholder>
		);
	}

	if ( ! isAPISaved ) {
		return (
			<Placeholder
				icon="admin-site"
				label={ __( 'Google Maps', 'otter-blocks' ) }
				instructions={ __( 'A Google Maps API key is required, please enter one below.', 'otter-blocks' ) }
				className={ className }
			>
				<div className="components-placeholder__actions">
					<TextControl
						type="text"
						placeholder={ __( 'Google Maps API Key', 'otter-blocks' ) }
						value={ api }
						className="components-placeholder__input"
						onChange={ changeAPI }
					/>

					<Button
						isLarge
						isPrimary
						type="submit"
						onClick={ saveAPIKey }
						isBusy={ isSaving }
						disabled={ '' === api }
					>
						{ __( 'Save', 'otter-blocks' ) }
					</Button>
				</div>

				<div className="components-placeholder__learn-more">
					{ __( 'You need to activate Maps and Places API.', 'otter-blocks' ) } <ExternalLink href="https://developers.google.com/maps/documentation/javascript/get-api-key">{ __( 'Need an API key? Get one here.', 'otter-blocks' ) }</ExternalLink>
				</div>
			</Placeholder>
		);
	}
};

export default BlockPlaceholder;
