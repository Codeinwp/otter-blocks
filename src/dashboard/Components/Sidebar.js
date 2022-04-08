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
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

/**
 * Internal dependencies.
 */
import Infobox from './Infobox.js';

const Sidebar = ({
	setTab
}) => {
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
		<Fragment>
			{ Boolean( window.otterObj.hasPro ) ? (
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
			) : (
				<Infobox
					title={ __( 'Otter Pro', 'otter-blocks' ) }
				>
					<p>{ __( 'Upgrade to Otter Pro and get instant access to all pro features — including WooCommerce builder — and much more.', 'otter-blocks' ) }</p>

					<div className="otter-info-button-group">
						<Button
							variant="secondary"
							isSecondary
							onClick={ () => setTab( 'upsell' ) }
						>
							{ __( 'Learn More', 'otter-blocks' ) }
						</Button>

						<Button
							variant="primary"
							isPrimary
							target="_blank"
							href={ window.otterObj.upgradeLink }
						>
							{ __( 'Explore Otter Pro', 'otter-blocks' ) }
						</Button>
					</div>
				</Infobox>
			) }

			<Infobox
				title={ __( 'Useful links', 'otter-blocks' ) }
			>
				<ul className="otter-info-links">
					<li><a href={ window.otterObj.docsLink } target="_blank">{ __( 'Docs', 'otter-blocks' ) }</a></li>
					<li><a href="https://wordpress.org/support/plugin/otter-blocks" target="_blank">{ __( 'Support', 'otter-blocks' ) }</a></li>
					<li><a href="https://otter.nolt.io/" target="_blank">{ __( 'Feature request', 'otter-blocks' ) }</a></li>
					<li><a href="https://wordpress.org/support/plugin/otter-blocks/reviews/#new-post" target="_blank">{ __( 'Leave a review', 'otter-blocks' ) }</a></li>
				</ul>
			</Infobox>
		</Fragment>
	);
};

export default Sidebar;
