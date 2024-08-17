/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	CheckboxControl,
	TextControl
} from '@wordpress/components';

import {
	useDispatch,
	useSelect
} from '@wordpress/data';

import { useState } from '@wordpress/element';

import { create } from '@wordpress/preferences-persistence';

const Finish = () => {
	const [ hasConsent, setConsent ] = useState( true );
	const [ email, setEmail ] = useState( window.otterOnboardingData?.userEmail );
	const [ isLoading, setIsLoading ] = useState( false );

	const {
		hasUserOptedin,
		currentTheme
	} = useSelect( select => {
		const { get } = select( 'core/preferences' );
		const { getCurrentTheme } = select( 'core' );

		return {
			hasUserOptedin: get( 'themeisle/otter-blocks', 'onboarding-optin' ),
			currentTheme: getCurrentTheme()?.template || getCurrentTheme()?.stylesheet
		};
	}, []);

	const persistenceLayer = create();

	const {
		set,
		setPersistenceLayer
	} = useDispatch( 'core/preferences' );

	setPersistenceLayer( persistenceLayer );

	const onFinish = ({ redirect = 'site' }) => {
		const url = 'site' === redirect ? window.otterOnboardingData.rootUrl : window.otterOnboardingData.dashboardUrl;

		if ( ! email || ! hasConsent ) {
			window.open( url, '_self' );
			return;
		}

		setIsLoading( true );

		fetch( 'https://api.themeisle.com/tracking/subscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json, */*;q=0.1',
				'Cache-Control': 'no-cache'
			},
			body: JSON.stringify({
				slug: currentTheme,
				site: window.otterOnboardingData.rootUrl,
				email
			})
		}).then( r => {
			setIsLoading( false );
			set( 'themeisle/otter-blocks', 'onboarding-optin', true );
			window.open( url, '_self' );
		})?.catch( () => {
			setIsLoading( false );
			window.open( url, '_self' );
		});
	};

	return (
		<div className="o-finish">
			<div className="o-finish__container">
				<img
					className="o-finish__logo"
					src={ window.otterOnboardingData?.logo || `${ window.otterOnboardingData.assetsPath }images/logo-alt.png` }
				/>

				<h1>{ __( 'Your website is ready!', 'otter-blocks' ) }</h1>
				<p>{ __( 'Thanks for using Otter to setup your theme. Otter adds a number of useful blocks and features to your site that enhance your FSE experience. We hope you will enjoy using it.', 'otter-blocks' ) }</p>

				{ ! hasUserOptedin && (
					<>
						<CheckboxControl
							label={ __( 'Stay connected for news, Tips and updates', 'otter-blocks' ) }
							checked={ hasConsent }
							onChange={ setConsent }
						/>

						{ hasConsent && (
							<TextControl
								label={ __( 'Email', 'otter-blocks' ) }
								placeholder={ __( 'Your email address', 'otter-blocks' ) }
								hideLabelFromVision={ true }
								value={ email }
								onChange={ setEmail }
							/>
						) }
					</>
				) }

				<div className="o-finish__actions">
					<Button
						variant="primary"
						isBusy={ isLoading }
						onClick={ onFinish }
					>
						{ __( 'Visit your website', 'otter-blocks' ) }
					</Button>

					<Button
						variant="tertiary"
						onClick={ () => onFinish({ redirect: 'dashboard' }) }
					>
						{ __( 'Go to dashboard', 'otter-blocks' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Finish;
