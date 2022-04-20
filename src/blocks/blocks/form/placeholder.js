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
	loadingState,
	isSaving,
	saveAPIKey,
	siteKey,
	secretKey,
	setSiteKey,
	setSecretKey
}) => {
	if ( 'loading' === loadingState?.captcha ) {
		return (
			<Fragment>
				<br />
				<Placeholder>
					<div>
						<Spinner />
						{ __( 'Checking the API Keys for reCaptcha', 'otter-blocks' ) }
					</div>
				</Placeholder>
			</Fragment>
		);
	}

	const mask = secretKey && 0 < secretKey?.length - 13 ? Array( secretKey.length - 13  ).fill( '*' ).join( '' ) + secretKey.slice( -13 ) : secretKey;

	return (
		<Placeholder
			icon="admin-site"
			label={ __( 'Google reCaptcha', 'otter-blocks' ) }
			instructions={ __( 'A Google reCaptcha V2 API keys are required, please enter one below.', 'otter-blocks' ) }
			className={ className }

		>
			<div className="components-placeholder__actions" style={{ width: '100%' }}>
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
					value={ mask }
					className="components-placeholder__input"
					onChange={ setSecretKey }
				/>

				<Button
					isPrimary
					type="submit"
					onClick={ saveAPIKey }
					isBusy={ isSaving }
					disabled={ '' === siteKey || '' === secretKey }
				>
					{ __( 'Save', 'otter-blocks' ) }
				</Button>
			</div>

			<div className="components-placeholder__learn-more" style={{ margin: '10px 0px' }}>
				{ __( 'You need to activate reCaptcha API.', 'otter-blocks' ) } <ExternalLink href="http://www.google.com/recaptcha/admin">{ __( 'Need an API key? Get one here.', 'otter-blocks' ) }</ExternalLink>
			</div>
		</Placeholder>
	);

};

export default BlockPlaceholder;
