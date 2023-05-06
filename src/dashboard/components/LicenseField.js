/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import {
	Button,
	ExternalLink,
	Icon
} from '@wordpress/components';

import { dispatch } from '@wordpress/data';

import {
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import Infobox from './Infobox.js';

const LicenseField = () => {
	const [ isLoading, setLoading ] = useState( false );

	const [ license, setLicense ] = useState( window.otterObj?.license );

	const [ licenseKey, setLicenseKey ] = useState( '' );

	const { createNotice } = dispatch( 'core/notices' );

	useEffect( () => {
		const statuses = [ 'valid', 'active_expired' ];

		if ( license.key && ( statuses.includes( license.valid ) ) ) {
			setLicenseKey( license.key );
		}
	}, [ license ]);

	const onSaveLicense = ( data ) => {
		setLoading( true );
		apiFetch({ path: 'otter/v1/toggle_license', method: 'POST', data }).then(
			res => {
				setLoading( false );
				createNotice(
					res.success ? 'success' : 'error',
					res.message,
					{
						isDismissible: true,
						type: 'snackbar'
					}
				);

				if ( res?.success && res.license && 'free' !== res.license.key ) {
					setLicense( res.license );
					setLicenseKey( res.license.key );
				} else {
					setLicense({});
					setLicenseKey( '' );
				}

				window.location.reload();
			}
		).catch( err => {
			setLoading( false );
			console.log( err );
		});
	};

	const isValid = 'valid' === license?.valid || 'valid' === license?.license;

	return (
		<Infobox
			title={ __( 'Otter Pro License', 'otter-blocks' ) }
		>
			<p>{ __( 'Enter your license from ThemeIsle purchase history in order to get plugin updates.', 'otter-blocks' ) }</p>

			{ Boolean( window.otterObj.hasNevePro ) && (
				<p>{ __( 'Neve Pro license can also be used to activate Otter Pro.', 'otter-blocks' ) }</p>
			) }

			<input
				type="text"
				value={ isValid ? '******************************' + licenseKey.slice( -5 ) : licenseKey }
				placeholder={ __( 'Enter license key', 'otter-blocks' ) }
				disabled={ isLoading || isValid }
				onChange={ e => setLicenseKey( e.target.value ) }
			/>

			<div className="otter-info-button-group is-single">
				<Button
					variant={ isValid ? 'secondary' : 'primary' }
					isPrimary={ ! isValid }
					isSecondary={ isValid }
					isBusy={ isLoading }
					disabled={ isLoading }
					onClick={ () => onSaveLicense({
						action: isValid ? 'deactivate' : 'activate',
						key: licenseKey
					}) }
				>
					{ isValid ? __( 'Deactivate', 'otter-blocks' ) : __( 'Activate', 'otter-blocks' ) }
				</Button>
			</div>

			{ isValid && (
				<div className="otter-license-footer">
					<p>
						<Icon icon="yes" />
						{ sprintf( __( 'Valid - Expires %s', 'otter-blocks' ), license.expiration ) }
					</p>
				</div>
			)}

			{ 'active_expired' === license?.valid && (
				<div className="otter-license-footer is-expired">
					<p>{ __( 'License Key has expired. In order to continue receiving support and software updates you must renew your license key.', 'otter-blocks' ) }</p>

					<p><ExternalLink href={ `${ window.otterObj.storeURL }?license=${ licenseKey }` }>{ __( 'Renew License', 'otter-blocks' ) }</ExternalLink></p>
				</div>
			)}

			{ ! isValid && <p className="otter-license-purchase-history"><ExternalLink href={ window.otterObj.purchaseHistoryURL }>{ __( 'Get license from Purchase History', 'otter-blocks' ) }</ExternalLink></p> }
		</Infobox>
	);
};

export default LicenseField;
