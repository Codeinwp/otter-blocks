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

const WelcomeGuide = () => {
	const [ getOption, updateOption, status ] = useSettings();

	const [ email, setEmail ] = useState( '' );
	const [ hasConsent, setConsent ] = useState( false );

	const currentUser = useSelect( select => {
		const { getCurrentUser, getUser } = select( 'core' );
		const user = getUser( getCurrentUser().id );
		return user;
	});

	const { createNotice } = useDispatch( 'core/notices' );

	const { showOnboarding } = useDispatch( 'themeisle-gutenberg/data' );

	useEffect( () => ( '' === email && undefined !== currentUser ) && setEmail( currentUser.email ), [ currentUser ]);

	const onFinish = target => {
		showOnboarding( false );

		if ( Boolean( getOption( 'themeisle_blocks_settings_onboarding' ) ) ) {
			updateOption( 'themeisle_blocks_settings_onboarding', false );
		}

		if ( ! hasConsent || ! Array.from( target.target.classList ).includes( 'components-guide__finish-button' ) ) {
			return;
		}

		fetch( 'https://api.themeisle.com/tracking/subscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				slug: 'otter-blocks',
				site: wp.data.select( 'core' ).getSite()?.url,
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
							<p className="o-welcome-guide__text">{ __( 'Section Block alllows you to create responsive sections with up to 6 columns that have advanced customization options.', 'otter-blocks' ) }</p>
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
							<h1 className="o-welcome-guide__heading">{ __( 'Make Your Website Shine With Otter Pro', 'otter-blocks' ) }</h1>
							<p className="o-welcome-guide__text">
								{ __( 'Upgrade to Otter PRO and get access to our advanced features, like Dynamic Content and the Premium Blocks.', 'otter-blocks' ) }
								<ExternalLink href={ window.themeisleGutenberg.upgradeLink } target="_blank">{ __( 'Learn more', 'otter-blocks' ) }</ExternalLink>
							</p>
						</Fragment>
					)
				},
				{
					image: <img src={ window.themeisleGutenberg.assetsPath + '/images/guide/welcome-finish.png' } />,
					content: (
						<Fragment>
							<h1 className="o-welcome-guide__heading">{ __( 'Thank you for chosing Otter!', 'otter-blocks' ) }</h1>
							<p className="o-welcome-guide__text">{ __( 'Joing Otter mailing list to first get information on latest features, tutorials and more.', 'otter-blocks' ) }</p>
							<p className="o-welcome-guide__text">{ __( 'You also get 10% discount on Otter PRO Subscription when you join our mail list.', 'otter-blocks' ) }</p>

							<TextControl
								aria-label={ __( 'Enter your email', 'otter-blocks' ) }
								type="email"
								value={ email }
								onChange={ setEmail }
								className="o-welcome-guide__input"
							/>

							<CheckboxControl
								label={ __( 'Send me information about new features, deals or recommendations by mail.', 'otter-blocks' ) }
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

registerPlugin( 'otter-welcome', {
	render: Render
});
