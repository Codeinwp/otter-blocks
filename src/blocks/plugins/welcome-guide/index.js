/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	CheckboxControl,
	ExternalLink,
	Guide,
	TextControl
} from '@wordpress/components';

import {
	select,
	useDispatch,
	useSelect
} from '@wordpress/data';

import {
	Fragment,
	useEffect,
	useState
} from '@wordpress/element';

import { registerPlugin } from '@wordpress/plugins';

/**
 * Internal dependencies.
 */
import './editor.scss';
import useSettings from './../../helpers/use-settings.js';
import { setUtm } from '../../helpers/helper-functions.js';

const WelcomeGuide = () => {
	const [ getOption, updateOption, status ] = useSettings();

	const [ email, setEmail ] = useState( '' );
	const [ hasConsent, setConsent ] = useState( true );

	const {
		currentUser,
		site
	} = useSelect( select => {
		const { getCurrentUser, getUser } = select( 'core' );
		const { getSite } = select( 'core' );
		const user = getUser( getCurrentUser().id );

		return {
			currentUser: user,
			site: getSite()?.url || window.themeisleGutenberg?.rootUrl
		};
	});

	const { createNotice } = useDispatch( 'core/notices' );

	const { showOnboarding } = useDispatch( 'themeisle-gutenberg/data' );

	useEffect( () => {
		if ( '' === email && undefined !== currentUser ) {
			setEmail( currentUser.email );
		}
	}, [ currentUser ]);

	const onFinish = target => {
		showOnboarding( false );

		localStorage?.setItem( 'o-show-onboarding', 'false' );

		if ( Boolean( getOption( 'themeisle_blocks_settings_onboarding' ) ) ) {
			updateOption( 'themeisle_blocks_settings_onboarding', false );
		}

		if ( ! hasConsent || ! Array.from( target.target.classList ).includes( 'components-guide__finish-button' ) ) {
			return;
		}

		fetch( 'https://api.themeisle.com/tracking/subscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json, */*;q=0.1',
				'Cache-Control': 'no-cache'
			},
			body: JSON.stringify({
				slug: 'otter-blocks',
				site,
				email
			})
		})
			.then( r => r.json() )
			.then( ( response ) => {
				if ( 'success' === response.code ) {
					createNotice(
						'success',
						__( 'Thank you for subscribing!', 'otter-blocks' ),
						{
							isDismissible: true,
							type: 'snackbar'
						}
					);
				}
			})?.catch( ( error ) => {
				console.error( error );
			});
	};

	return (
		<Guide
			className="o-welcome-guide"
			finishButtonText={ hasConsent ? __( 'Subscribe & Finish', 'otter-blocks' ) : __( 'Finish', 'otter-blocks' ) }
			onFinish={ onFinish }
			pages={ [
				{
					image: <img src={ window.themeisleGutenberg.assetsPath + '/images/guide/welcome-logo.png' } />,
					content: (
						<Fragment>
							<h1 className="o-welcome-guide__heading">{ __( 'Welcome to Otter Blocks', 'otter-blocks' ) }</h1>
							<p className="o-welcome-guide__text">{ __( 'Otter is a lightweight, dynamic collection of page building blocks and templates for the WordPress Block Editor.', 'otter-blocks' ) }</p>
						</Fragment>
					)
				},
				{
					image: <img src={ window.themeisleGutenberg.assetsPath + '/images/guide/welcome-section.png' } />,
					content: (
						<Fragment>
							<h1 className="o-welcome-guide__heading">{ __( 'Create unique pages with the Section Block', 'otter-blocks' ) }</h1>
							<p className="o-welcome-guide__text">{ __( 'Section Block allows you to create responsive sections with up to 6 columns that have advanced customization options.', 'otter-blocks' ) }</p>
						</Fragment>
					)
				},
				{
					image: <img src={ window.themeisleGutenberg.assetsPath + '/images/guide/welcome-css.png' } />,
					content: (
						<Fragment>
							<h1 className="o-welcome-guide__heading">{ __( 'Extend each block with more powerful features', 'otter-blocks' ) }</h1>
							<p className="o-welcome-guide__text">{ __( 'Otter adds extra functionalities such as Custom CSS, Animations and Visibility Conditions to default and third party blocks.', 'otter-blocks' ) }</p>
						</Fragment>
					)
				},
				{
					image: <img src={ window.themeisleGutenberg.assetsPath + '/images/guide/welcome-pro.png' } />,
					content: (
						<Fragment>
							{ Boolean( window.themeisleGutenberg.hasPro ) ? (
								<Fragment>
									<h1 className="o-welcome-guide__heading">{ __( 'You are all setup to use Otter Pro', 'otter-blocks' ) }</h1>
									<p className="o-welcome-guide__text">
										{ __( 'With Otter PRO, you have access to our advanced features, like Dynamic Content and the Premium Blocks.', 'otter-blocks' ) }
										<ExternalLink href="https://docs.themeisle.com/article/1550-otter-pro-documentation" target="_blank">{ __( 'Learn more', 'otter-blocks' ) }</ExternalLink>
									</p>
								</Fragment>
							) : (
								<Fragment>
									<h1 className="o-welcome-guide__heading">{ __( 'Make Your Website Shine With Otter Pro', 'otter-blocks' ) }</h1>
									<p className="o-welcome-guide__text">
										{ __( 'Upgrade to Otter PRO and get access to our advanced features, like Dynamic Content and the Premium Blocks.', 'otter-blocks' ) }
										<ExternalLink href={ setUtm( window.themeisleGutenberg.upgradeLink, 'welcomeguide' ) } target="_blank">{ __( 'Learn more', 'otter-blocks' ) }</ExternalLink>
									</p>
								</Fragment>
							) }
						</Fragment>
					)
				},
				{
					image: <img src={ window.themeisleGutenberg.assetsPath + '/images/guide/welcome-finish.png' } />,
					content: (
						<Fragment>
							<h1 className="o-welcome-guide__heading">{ __( 'Thank you for chosing Otter!', 'otter-blocks' ) }</h1>

							<p className="o-welcome-guide__text">{ __( 'Join Otter\'s mailing list to get first access to product updates, tutorials and promotions.', 'otter-blocks' ) }</p>

							<TextControl
								aria-label={ __( 'Enter your email', 'otter-blocks' ) }
								type="email"
								value={ email }
								onChange={ setEmail }
								className="o-welcome-guide__input"
							/>

							<CheckboxControl
								label={ __( 'Yes, count me in!', 'otter-blocks' ) }
								checked={ hasConsent }
								onChange={ () => setConsent( ! hasConsent ) }
								className="o-welcome-guide__input"
							/>
						</Fragment>
					)
				}
			] }
		/>
	);
};

const Render = () => {
	const {
		isOnboardingVisible,
		isWelcomeActive
	} = useSelect( select => {
		const { isOnboardingVisible } = select( 'themeisle-gutenberg/data' );
		const { isFeatureActive } = select( 'core/edit-post' );

		return {
			isOnboardingVisible: isOnboardingVisible(),
			isWelcomeActive: isFeatureActive( 'welcomeGuide' )
		};
	});

	if ( isWelcomeActive || ! isOnboardingVisible ) {
		return null;
	}

	return (
		<WelcomeGuide/>
	);
};

if ( Boolean( window.themeisleGutenberg.isBlockEditor ) && select( 'core/editor' ) ) {
	registerPlugin( 'otter-welcome', {
		render: Render
	});
}
