/**
 * WordPress dependencies.
 */
import {
	__,
	sprintf
} from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';

import { Button } from '@wordpress/components';

import { dispatch } from '@wordpress/data';

import { format } from '@wordpress/date';

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
		if ( license.key ) {
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

				if ( res?.success && res.license ) {
					setLicense( res.license );
					setLicenseKey( res.license.key );
				}
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

			<input
				type="password"
				value={ licenseKey }
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
					<p>{ sprintf( __( 'Valid - Expires %s', 'otter-blocks' ), format( 'F Y', license.expires ) ) }</p>
				</div>
			)}
		</Infobox>
	);
};

export default LicenseField;
