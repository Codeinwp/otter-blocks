/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ExternalLink,
	Flex,
	FlexBlock,
	FlexItem,
	Placeholder,
	Spinner,
	TextControl
} from '@wordpress/components';

import { Fragment } from '@wordpress/element';

const BlockPlaceholder = ({
	className,
	captchaProvider = 'recaptcha',
	loadingState,
	isSaving,
	saveAPIKey,
	siteKey,
	secretKey,
	setSiteKey,
	setSecretKey,
	children
}) => {
	const providerLabels = {
		recaptcha: {
			name: __( 'Google reCaptcha', 'otter-blocks' ),
			instructions: __( 'Google reCaptcha V2 API keys are required, please enter them below.', 'otter-blocks' ),
			learnMore: 'https://www.google.com/recaptcha/admin',
			learnMoreText: __( 'Need an API key? Get one here.', 'otter-blocks' ),
			activateText: __( 'You need to activate reCaptcha API.', 'otter-blocks' )
		},
		turnstile: {
			name: __( 'Cloudflare Turnstile', 'otter-blocks' ),
			instructions: __( 'Cloudflare Turnstile API keys are required, please enter them below.', 'otter-blocks' ),
			learnMore: 'https://developers.cloudflare.com/turnstile/get-started/',
			learnMoreText: __( 'Learn more.', 'otter-blocks' ),
			activateText: __( 'You need to activate Turnstile.', 'otter-blocks' )
		}
	};

	const provider = providerLabels[ captchaProvider ] || providerLabels.recaptcha;

	if ( 'loading' === loadingState?.captcha ) {
		return (
			<Fragment>
				<br />
				<Placeholder>
					<div>
						<Spinner />
						{ __( 'Checking the API Keys for', 'otter-blocks' ) } { provider.name }
					</div>
				</Placeholder>
			</Fragment>
		);
	}

	const mask = secretKey && 0 < secretKey?.length - 13 ? Array( secretKey.length - 13  ).fill( '*' ).join( '' ) + secretKey.slice( -13 ) : secretKey;

	return (
		<Placeholder
			icon="admin-site"
			label={ provider.name }
			instructions={ provider.instructions }
			className={ className }

		>
			{ children }

			<Flex
				className="components-placeholder__actions"
				align="flex-end"
				gap={ 4 }
				style={{ width: '100%' }}
			>
				<FlexBlock>
					<TextControl
						type="text"
						label={ __( 'Site Key', 'otter-blocks' ) }
						value={ siteKey }
						onChange={ setSiteKey }
						__nextHasNoMarginBottom
					/>
				</FlexBlock>

				<FlexBlock>
					<TextControl
						type="text"
						label={ __( 'Secret Key', 'otter-blocks' ) }
						value={ mask }
						onChange={ setSecretKey }
						__nextHasNoMarginBottom
					/>
				</FlexBlock>

				<FlexItem>
					<Button
						isPrimary
						type="submit"
						onClick={ saveAPIKey }
						isBusy={ isSaving }
						disabled={ '' === siteKey || '' === secretKey }
					>
						{ __( 'Save', 'otter-blocks' ) }
					</Button>
				</FlexItem>
			</Flex>

			<div className="components-placeholder__learn-more" style={{ margin: '10px 0px' }}>
				{ provider.activateText } <ExternalLink href={ provider.learnMore }>{ provider.learnMoreText }</ExternalLink>
			</div>
		</Placeholder>
	);

};

export default BlockPlaceholder;
