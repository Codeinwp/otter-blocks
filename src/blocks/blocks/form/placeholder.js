/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ExternalLink,
	Placeholder,
	Spinner,
	TextControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const BlockPlaceholder = ({
	className,
	isAPILoaded,
	isAPISaved,
	isSaving,
	saveAPIKey,
	siteKey,
	secretKey,
	setSiteKey,
	setSecretKey
}) => {
	if ( ! isAPILoaded ) {
		return (
			<Fragment>
				<br/>
				<Placeholder>
					<div>
						<Spinner/>
						{ __( 'Checking the API Keys for reCaptcha', 'otter-blocks' ) }
					</div>
				</Placeholder>
			</Fragment>
		);
	}

	if ( ! isAPISaved ) {
		return (
			<Placeholder
				icon="admin-site"
				label={ __( 'Google reCaptcha', 'otter-blocks' ) }
				instructions={ __( 'A Google reCaptcha V2 API keys are required, please enter one below.', 'otter-blocks' ) }
				className={ className }
			>
				<div className="components-placeholder__actions">
					<TextControl
						type="text"
						label={ __( 'Site Key', 'otter-blocks' ) }
						value={ siteKey }
						className="components-placeholder__input"
						onChange={ setSiteKey }
					/>

					<TextControl
						type="text"
						label={ __( 'Secret Key', 'otter-blocks' ) }
						value={ secretKey }
						className="components-placeholder__input"
						onChange={ setSecretKey }
					/>

					<Button
						isLarge
						isPrimary
						type="submit"
						onClick={ saveAPIKey }
						isBusy={ isSaving }
						disabled={ '' === siteKey || '' === secretKey }
					>
						{ __( 'Save', 'otter-blocks' ) }
					</Button>
				</div>

				<div className="components-placeholder__learn-more">
					{ __( 'You need to activate reCaptcha API.', 'otter-blocks' ) } <ExternalLink href="http://www.google.com/recaptcha/admin">{ __( 'Need an API key? Get one here.', 'otter-blocks' ) }</ExternalLink>
				</div>
			</Placeholder>
		);
	}
};

export default BlockPlaceholder;
