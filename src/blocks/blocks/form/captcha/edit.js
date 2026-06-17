/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

import api from '@wordpress/api';

import { useBlockProps } from '@wordpress/block-editor';

import {
	Placeholder as WPPlaceholder,
	SelectControl
} from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Inspector from './inspector.js';
import Placeholder from '../placeholder.js';

const PROVIDER_OPTIONS = {
	recaptcha: {
		label: __( 'Google reCaptcha', 'otter-blocks' ),
		siteKeyOption: 'themeisle_google_captcha_api_site_key',
		secretKeyOption: 'themeisle_google_captcha_api_secret_key'
	},
	turnstile: {
		label: __( 'Cloudflare Turnstile', 'otter-blocks' ),
		siteKeyOption: 'themeisle_cloudflare_turnstile_site_key',
		secretKeyOption: 'themeisle_cloudflare_turnstile_secret_key'
	}
};

/**
 * Form Captcha component
 * @param {import('./types').FormCaptchaProps} props
 * @return
 */
const Edit = ({
	attributes,
	setAttributes,
	isSelected
}) => {
	const provider = PROVIDER_OPTIONS[ attributes.provider ] ? attributes.provider : 'recaptcha';

	const [ loadingState, setLoadingState ] = useState({ captcha: 'init' });
	const [ siteKey, setSiteKey ] = useState( '' );
	const [ secretKey, setSecretKey ] = useState( '' );

	const setLoading = l => {
		setLoadingState( loading => ({ ...loading, ...l }) );
	};

	const { createNotice } = useDispatch( 'core/notices' );

	/**
	 * Recheck the API Keys when the provider changes.
	 */
	useEffect( () => {
		setLoading({ captcha: 'init' });
		setSiteKey( '' );
		setSecretKey( '' );
	}, [ provider ]);

	/**
	 * Check if the captcha API Keys are set.
	 */
	useEffect( () => {
		let controller = new AbortController();

		if ( 'init' === loadingState?.captcha ) {
			setLoading({ captcha: 'loading' });
			try {
				( new api.models.Settings() )?.fetch({ signal: controller.signal }).then( response => {
					controller = null;

					const currentSiteKey = response?.[ PROVIDER_OPTIONS[ provider ].siteKeyOption ];
					const currentSecretKey = response?.[ PROVIDER_OPTIONS[ provider ].secretKeyOption ];

					if ( '' !== currentSiteKey && '' !== currentSecretKey ) {
						setLoading({ captcha: 'done' });
					} else {
						setLoading({ captcha: 'missing' });
						setSiteKey( currentSiteKey );
						setSecretKey( currentSecretKey );
					}
				}).catch( e => {
					console.error( e );
					setLoading({ captcha: 'error' });
				});
			} catch ( e ) {
				console.warn( e.message );
				setLoading({ captcha: 'error' });
			}
		}

		return () => controller?.abort();
	}, [ loadingState.captcha, provider ]);

	/**
	 * Save API Keys in the Otter options.
	 */
	const saveCaptchaAPIKey = () => {
		setLoading({ captcha: 'loading' });
		try {
			const model = new api.models.Settings({
				[ PROVIDER_OPTIONS[ provider ].siteKeyOption ]: siteKey,
				[ PROVIDER_OPTIONS[ provider ].secretKeyOption ]: secretKey
			});

			model?.save?.()?.then( response => {
				if ( '' !== response[ PROVIDER_OPTIONS[ provider ].siteKeyOption ] && '' !== response[ PROVIDER_OPTIONS[ provider ].secretKeyOption ] ) {
					setLoading({ captcha: 'done' });
				} else {
					setLoading({ captcha: 'missing' });
				}

				setSiteKey( '' );
				setSecretKey( '' );

				createNotice(
					'info',
					'turnstile' === provider ? __( 'Cloudflare Turnstile keys have been saved.', 'otter-blocks' ) : __( 'Google reCaptcha API Keys have been saved.', 'otter-blocks' ),
					{
						isDismissible: true,
						type: 'snackbar'
					}
				).catch( e => {
					console.error( e );
					setLoading({ captcha: 'error' });
				});
			})?.catch( e => {
				console.error( e );
				setLoading({ captcha: 'error' });
			});
		} catch ( e ) {
			console.warn( e.message );
			setLoading({ captcha: 'error' });
		}
	};

	const blockProps = useBlockProps();

	// Quick provider switcher shown in the canvas while the block is selected.
	const providerSelect = isSelected && (
		<div style={{ width: '100%' }}>
			<SelectControl
				label={ __( 'Captcha Provider', 'otter-blocks' ) }
				value={ provider }
				options={ [
					{ label: __( 'Google reCaptcha', 'otter-blocks' ), value: 'recaptcha' },
					{ label: __( 'Cloudflare Turnstile', 'otter-blocks' ), value: 'turnstile' }
				] }
				onChange={ value => setAttributes({ provider: value }) }
			/>
		</div>
	);

	return (
		<Fragment>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			<div { ...blockProps }>
				{ 'done' === loadingState?.captcha ? (
					<WPPlaceholder
						icon="shield"
						label={ PROVIDER_OPTIONS[ provider ].label }
						className="otter-form-captcha"
					>
						{ providerSelect }
						{ __( 'A captcha challenge will be displayed here on the published form.', 'otter-blocks' ) }
					</WPPlaceholder>
				) : (
					<Placeholder
						className="otter-form-captcha"
						captchaProvider={ provider }
						loadingState={ loadingState }
						saveAPIKey={ saveCaptchaAPIKey }
						siteKey={ siteKey }
						secretKey={ secretKey }
						setSiteKey={ setSiteKey }
						setSecretKey={ setSecretKey }
					>
						{ providerSelect }
					</Placeholder>
				) }
			</div>
		</Fragment>
	);
};

export default Edit;
