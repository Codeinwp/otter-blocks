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

const { version } = window.otterObj;

const Finish = () => {
	const [ feedback, setFeedback ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );

	const {
		theme,
		siteURL
	} = useSelect( select => {
		const {
			getCurrentTheme,
			getSite
		} = select( 'core' );

		const theme = getCurrentTheme()?.template || getCurrentTheme()?.stylesheet;
		const siteURL = getSite()?.url;

		return {
			theme,
			siteURL
		};
	});

	const onFinish = () => {
		if ( ! feedback ) {
			window.open( siteURL, '_self' );
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
			window.open( siteURL, '_self' );
		})?.catch( () => {
			setIsLoading( false );
			window.open( siteURL, '_self' );
		});
	};

	return (
		<div className="o-finish">
			<div className="o-finish__container">
				<img
					className="o-finish__logo"
					src={ `${ window.otterObj.assetsPath }images/logo-alt.png` }
				/>

				<h1>{ __( 'Your website is ready to go!', 'otter-blocks' ) }</h1>
				<p>{ __( 'Thanks for using Otter to setup your website. Otter is free and provides a number of useful blocks and features that enhance your FSE experience. We hope you will enjoy using it.', 'otter-blocks' ) }</p>

				<TextareaControl
					label={ __( 'What do you think about Otter Onboarding?', 'otter-blocks' ) }
					placeholder={ __( 'Leave your feedback', 'otter-blocks' ) }
					value={ feedback }
					onChange={ setFeedback }
					hideLabelFromVision
				/>

				<Button
					variant="primary"
					isBusy={ isLoading }
					onClick={ onFinish }
				>
					{ __( 'Visit your website', 'otter-blocks' ) }
				</Button>
			</div>
		</div>
	);
};

export default Finish;