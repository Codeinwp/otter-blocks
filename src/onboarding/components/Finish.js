/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

import {
	Button,
	TextareaControl
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { useState } from '@wordpress/element';

const { version } = window.otterOnboardingData;

const Finish = () => {
	const [ feedback, setFeedback ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );

	const { theme } = useSelect( select => {
		const { getCurrentTheme } = select( 'core' );

		const theme = getCurrentTheme()?.template || getCurrentTheme()?.stylesheet;

		return {
			theme
		};
	});

	const onFinish = ({ redirect = 'site' }) => {
		const url = 'site' === redirect ? window.otterOnboardingData.rootUrl : window.otterOnboardingData.dashboardUrl;

		if ( ! feedback ) {
			window.open( url, '_self' );
			return;
		}

		setIsLoading( true );

		fetch( 'https://api.themeisle.com/tracking/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json, */*;q=0.1',
				'Cache-Control': 'no-cache'
			},
			body: JSON.stringify({
				slug: 'otter-blocks',
				version,
				feedback,
				data: {
					'feedback-area': 'onboarding',
					theme
				}
			})
		}).then( r => {
			setIsLoading( false );
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
					src={ `${ window.otterOnboardingData.assetsPath }images/logo-alt.png` }
				/>

				<h1>{ __( 'Your website is ready!', 'otter-blocks' ) }</h1>
				<p>{ __( 'Thanks for using Otter to setup your theme. Otter adds a number of useful blocks and features to your site that enhance your FSE experience. We hope you will enjoy using it.', 'otter-blocks' ) }</p>

				<TextareaControl
					label={ __( 'What do you think about the onboarding experience?', 'otter-blocks' ) }
					placeholder={ __( 'Leave your feedback', 'otter-blocks' ) }
					value={ feedback }
					onChange={ setFeedback }
					hideLabelFromVision
				/>

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
						{ __( 'Back to dashboard', 'otter-blocks' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Finish;
