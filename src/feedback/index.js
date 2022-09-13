/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	useEffect,
	useState
} from '@wordpress/element';
import {
	Button,
	Modal,
	Spinner,
	TextareaControl
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal Dependencies
 */
import './style.scss';

const collectedInfo = [
	{
		name: __( 'Plugin version',  'otter-blocks' ),
		value: window.otterObj.version
	},
	{
		name: __( 'Current website', 'otter-blocks' ),
		value: window.otterObj.siteURL
	},
	{
		name: __( 'Uninstall reason', 'otter-blocks' ),
		value: __( 'Text from the above text area', 'otter-blocks' )
	}
];

const Feedback = ( text = __( 'Help us improve', 'otter-blocks' ) ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ feedback, setFeedback ] = useState( '' );
	const [ status, setStatus ] = useState( 'notSubmitted' );
	const [ showInfo, setShowInfo ] = useState( false );

	useEffect( () => {
		const info = document.querySelector( '.o-feedback-modal .info' );
		if ( ! info ) {
			return;
		}

		info.style.height = showInfo ? `${ info.querySelector( '.wrapper' ).clientHeight }px` : '0';
	}, [ showInfo ]);

	const sendFeedback = () => {
		setStatus( 'loading' );

		fetch( 'https://api.themeisle.com/tracking/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				slug: 'otter-blocks',
				version: window.otterObj.version,
				feedback,
				data: {
					site: window.otterObj.siteURL
				}
			})
		}).then( r => {
			setStatus( 'submitted' );
		});
	};

	const closeModal = () => {
		setIsOpen( false );
		setStatus( 'notSubmitted' );
	};

	return (
		<>
			<Button
				className="o-feedback"
				variant="link"
				isLink
				onClick={() => setIsOpen( ! isOpen )}
			>
				{ text }
			</Button>
			{ isOpen && (
				<Modal
					className={ classnames( 'o-feedback-modal', { 'no-header': 'submitted' === status }) }
					title={ __( 'Tell us about your experience', 'otter-blocks' ) }
					onRequestClose={ closeModal }
				>
					{ 'submitted' !== status ? (
						<>
							<TextareaControl
								placeholder={ __( 'Share your thoughts about Otter Blocks', 'otter-blocks' ) }
								value={ feedback }
								rows={7}
								cols={50}
								onChange={ value => setFeedback( value ) }
							/>
							<div className="info">
								<div className="wrapper">
									<p>{ __( 'We value privacy, that\'s why no email address or IP addresses are collected after you submit the survey. Below is a detailed view of all data that Themeisle will receive if you fill in this survey.', 'otter-blocks' ) }</p>
									{ collectedInfo.map( row => {
										return (
											<div className="info-row">
												<p><b>{ row.name }</b></p>
												<p>{ row.value }</p>
											</div>
										);
									}) }
								</div>
							</div>
							<div className="buttons-wrap">
								<Button
									className="toggle-info"
									variant="link"
									isLink
									onClick={() => setShowInfo( ! showInfo )}
								>
									{ __( 'What info do we collect?', 'otter-blocks' ) }
								</Button>
								<Button
									className="f-send"
									variant="primary"
									isPrimary
									disabled={ 'loading' === status }
									onClick={ () => sendFeedback() }
								>
									{ 'loading' === status ? <Spinner/> : __( 'Send feedback', 'otter-blocks' ) }
								</Button>
							</div>
						</>
					) : (
						<div className="finish-feedback">
							<img
								src={ window.otterObj.assetsPath + 'icons/finish-feedback.svg' }
							/>
							<p className="f-title">{ __( 'Thank you for your feedback', 'otter-blocks' ) }</p>
							<p className="f-description">{ __( 'Your feedback is highly appreciated and will help us to improve Otter Blocks.', 'otter-blocks' ) }</p>
							<Button
								className="f-done"
								variant="secondary"
								isSecondary
								onClick={ closeModal }
							>
								{ __( 'Done', 'otter-blocks' ) }
							</Button>
						</div>
					) }
				</Modal>
			) }
		</>
	);
};

addFilter( 'otter.feedback', 'themeisle-gutenberg/feedback-modal', Feedback );
