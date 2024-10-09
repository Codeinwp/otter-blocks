/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ExternalLink
} from '@wordpress/components';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

// Install theme.
const InstallTheme = ( slug ) => {
	return new Promise( ( resolve ) => {
		wp.updates.ajax( 'install-theme', {
			slug,
			success: () => {
				resolve({ success: true });
			},
			error: ( err ) => {
				resolve({ success: false, code: err.errorCode });
			}
		});
	});
};

// Activate theme.
const activateTheme = ( url ) => {
	return new Promise( ( resolve ) => {
		jQuery
			.get( url )
			.done( () => {
				resolve({ success: true });
			})
			.fail( () => {
				resolve({ success: false });
			});
	});
};


const NeveSidebarUpsell = () => {

	const [ isShowNeveUpsell, setShowNeveUpsell ] = useState( false );
	const [ isNeveInstalled, setNeveInstalled ] = useState( window.otterObj?.neveInstalled );
	const [ showStatus, setShowStatus ] = useState( false );
	const [ progress, setProgress ] = useState( null );

	useEffect( () => {
		if ( Boolean( isNeveInstalled ) ) {
			setShowNeveUpsell( true );
		}
	}, [ isNeveInstalled ]);

	const ThemeInstallActivateRequest = async( e ) => {
		e.preventDefault();
		setShowStatus( true );
		setProgress( 'installing' );
		await InstallTheme( 'neve' );

		setProgress( 'activating' );
		await activateTheme( window.otterObj?.neveThemeActivationUrl );

		setProgress( 'done' );
	};

	const installThemeRequestStatus = () => {
		if ( 'done' === progress ) {
			return (
				<div className={'done'}>
					<p> { __( 'Awesome! You are all set!', 'otter-blocks' ) }</p>
					<Button icon={'external'} isPrimary href={window.otterObj?.neveDashboardUrl} target="_blank">
						{ __( 'Go to Neve dashboard', 'otter-blocks' ) }
					</Button>
				</div>
			);
		}
		if ( progress ) {
			return (
				<p className="otter-neve-progress">
					<span className="dashicons dashicons-update spin"/>
					<span>
						{ 'installing' === progress && __( 'Installing', 'otter-blocks' ) }
						{ 'activating' === progress && __( 'Activating', 'otter-blocks' ) }
					&hellip;
					</span>
				</p>
			);
		}
	};

	return (
		<Fragment>
			{( ! isShowNeveUpsell &&
				<div className="otter-nv-sidebar-upsell">
					<div className="otter-nv-sidebar-left">
						<div className="otter-nv-sidebar-heading">
							<img src={ window.otterObj.assetsPath + 'images/neve-logo.png' } alt=""/>
							<h2>{ __( '- Experience lightning fast performance!', 'otter-blocks' ) }</h2>
						</div>
						<div className="otter-nv-sidebar-text">
							<p>
								<strong>{ __( 'Fast, Flexible, and Free:', 'otter-blocks' ) }</strong> { __( 'Whether you\'re managing a blog, an online store, or a business website, Neve ensures top-tier responsiveness and SEO optimization. Install now and experience the difference today.', 'otter-blocks' ) }
							</p>
						</div>
						<div className="otter-nv-sidebar-active-website">
							<div>
								<span>300,000+</span>
								{ __( 'Active websites', 'otter-blocks' ) }
							</div>
							<div>
								<span>1050+</span>
								<img src={ window.otterObj.assetsPath + 'images/star.png' } width = '57' alt=""/>
							</div>
						</div>
						<div className="otter-nv-sidebar-action">
							{( ! showStatus && 'done' !== progress ) && (
								<Button variant="primary" onClick={ThemeInstallActivateRequest}>{ __( 'Install & Activate Neve Theme', 'otter-blocks' ) }</Button>
							)}
							{( showStatus || 'done' === progress ) && installThemeRequestStatus()}
							{( ! showStatus && 'done' !== progress ) && ( <Button icon={'external'} iconPosition={'right'} variant="secondary" href={window.otterObj?.neveThemePreviewUrl} target="_blank">{ __( 'Theme Preview', 'otter-blocks' ) }</Button>
							)}
						</div>
					</div>
					<div className="otter-nv-sidebar-right">
						<img src={ window.otterObj.assetsPath + 'images/neve-upsell-img.png' } alt=""/>
					</div>
				</div>
			)}
		</Fragment>
	);
};

export default NeveSidebarUpsell;
