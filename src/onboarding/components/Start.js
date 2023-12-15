/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	ExternalLink
} from '@wordpress/components';

import { useDispatch } from '@wordpress/data';

const Start = () => {
	const { setWelcomeScreen } = useDispatch( 'otter/onboarding' );

	return (
		<div className="o-start">
			<div className="o-start__container">
				<img
					className="o-start__logo"
					src={ `${ window.otterOnboardingData.assetsPath }images/logo-alt.png` }
				/>

				<h1>{ __( 'Welcome to Theme Onboarding, by Otter.', 'otter-blocks' ) }</h1>
				<p>
					{ __( 'This process will guide you through a basic setup of your theme, so you can enjoy your new site right away. You can trigger this wizard manually at any time, from Appearance Menu.', 'otter-blocks' ) }

					<ExternalLink
						href="https://docs.themeisle.com/article/1975-fse-onboarding"
						target="_blank"
						rel="noopener noreferrer"
						aria-label={ __( 'Learn more about onboarding', 'otter-blocks' ) }
						style={ { marginLeft: '0.5em' } }
					>
						{ __( 'Learn more.', 'otter-blocks' ) }
					</ExternalLink>
				</p>

				<div className="o-start__actions">
					<Button
						variant="primary"
						onClick={ () => setWelcomeScreen( false ) }
					>
						{ __( 'Set up my theme', 'otter-blocks' ) }
					</Button>

					<Button
						variant="tertiary"
						href={ window.otterOnboardingData.dashboardUrl }
					>
						{ __( 'Back to dashboard', 'otter-blocks' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Start;
