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
import './editor.scss';
import ButtonVariant = Button.ButtonVariant;


const { version, assetsPath } = window.themeisleGutenberg ? window.themeisleGutenberg : window.otterObj;
const finishIcon = assetsPath + ( '/' === assetsPath[ assetsPath.length - 1 ] ? '' : '/' ) + 'icons/finish-feedback.svg';

const collectedInfo = [
	{
		name: __( 'Plugin version',  'otter-blocks' ),
		value: version
	},
	{
		name: __( 'Feedback', 'otter-blocks' ),
		value: __( 'Text from the above text area', 'otter-blocks' )
	}
];

/**
 * Displays a button that opens a modal for sending feedback
 *
 * @param source The area from where the feedback is given
 * @param text Text to display inside the button
 * @param variant Variant of the button
 * @returns
 */
const Feedback = (
	source: string,
	text = __( 'Help us improve', 'otter-blocks' ),
	variant:ButtonVariant = 'link'
): JSX.Element => {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ feedback, setFeedback ] = useState( '' );
	const [ status, setStatus ] = useState( 'notSubmitted' );
	const [ showInfo, setShowInfo ] = useState( false );

	useEffect( () => {
		const info = document.querySelector( '.o-feedback-modal .info' ) as HTMLElement;
		if ( ! info ) {
			return;
		}

		info.style.height = showInfo ? `${ info.querySelector( '.wrapper' ).clientHeight }px` : '0';
	}, [ showInfo ]);

	useEffect( () => {
		if ( 'emptyFeedback' === status && 5 < feedback.length ) {
			setStatus( 'notSubmitted' );
		}
	}, [ feedback ]);

	const sendFeedback = () => {
		if ( 5 >= feedback.length ) {
			setStatus( 'emptyFeedback' );
			return;
		}

		setStatus( 'loading' );
		fetch( 'https://api.themeisle.com/tracking/feedback', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				slug: 'otter-blocks',
				version: version,
				feedback,
				data: {
					'feedback-area': source
				}
			})
		}).then( r => {
			if ( ! r.ok ) {
				setStatus( 'error' );
				return;
			}

			setStatus( 'submitted' );
		});
	};

	const closeModal = () => {
		setIsOpen( false );
		setStatus( 'notSubmitted' );
	};

	const helpTextByStatus = {
		'error': __( 'There has been an error. Your feedback couldn\'t be sent.' ),
		'emptyFeedback': __( 'Please provide a feedback before submitting the form.', 'otter-blocks' )
	};

	return (
		<>
			<Button
				id="o-feedback"
				variant={ variant }
				isLink={ 'link' === variant }
				isSecondary={ 'secondary' === variant }
				isPrimary={ 'primary' === variant }
				onClick={() => setIsOpen( ! isOpen )}
			>
				{ text }
			</Button>
			{ isOpen && (
				<Modal
					className={ classnames( 'o-feedback-modal', { 'no-header': 'submitted' === status }) }
					title={ __( 'What\'s one thing you need in Otter?', 'otter-blocks' ) }
					onRequestClose={ closeModal }
					shouldCloseOnClickOutside={ false }
				>
					{ 'submitted' !== status ? (
						<>
							<TextareaControl
								className={ classnames({
									'invalid': 'emptyFeedback' === status,
									'f-error': 'error' === status
								}) }
								placeholder={ __( 'Tell us how can we help you better with Otter Blocks', 'otter-blocks' ) }
								value={ feedback }
								rows={7}
								cols={50}
								onChange={ value => setFeedback( value ) }
								help={ helpTextByStatus[status] || false }
								autoFocus
							/>
							<div className="info">
								<div className="wrapper">
									<p>{ __( 'We value privacy, that\'s why no domain name, email address or IP addresses are collected after you submit the survey. Below is a detailed view of all data that Themeisle will receive if you fill in this survey.', 'otter-blocks' ) }</p>
									{ collectedInfo.map( ( row, index ) => {
										return (
											<div className="info-row" key={ index }>
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
									aria-expanded={ showInfo }
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
								src={ finishIcon }
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
